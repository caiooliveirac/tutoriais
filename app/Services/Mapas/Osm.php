<?php

namespace App\Services\Mapas;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

/**
 * OpenStreetMap: Nominatim (endereço ↔ coordenada) e Overpass (ruas e
 * pontos de referência em volta). Gratuito; políticas de uso pedem pouco
 * volume e User-Agent identificável — por isso as respostas vão para cache.
 */
class Osm
{
    /** Tipos do OSM em português, do jeito que o solicitante fala. */
    private const TIPOS = [
        'school' => 'escola', 'kindergarten' => 'creche', 'university' => 'faculdade', 'college' => 'faculdade',
        'place_of_worship' => 'igreja', 'fuel' => 'posto de combustível', 'pharmacy' => 'farmácia',
        'chemist' => 'farmácia', 'supermarket' => 'supermercado', 'convenience' => 'mercadinho',
        'marketplace' => 'feira', 'hospital' => 'hospital', 'clinic' => 'posto de saúde', 'doctors' => 'clínica',
        'bank' => 'banco', 'atm' => 'caixa eletrônico', 'restaurant' => 'restaurante', 'fast_food' => 'lanchonete',
        'bar' => 'bar', 'pub' => 'bar', 'cafe' => 'café', 'bakery' => 'padaria', 'butcher' => 'açougue',
        'car_repair' => 'oficina', 'police' => 'polícia', 'fire_station' => 'bombeiros', 'bus_station' => 'rodoviária',
        'park' => 'praça', 'playground' => 'parquinho', 'pitch' => 'campo/quadra', 'sports_centre' => 'ginásio',
        'hairdresser' => 'salão', 'mall' => 'shopping', 'community_centre' => 'associação', 'townhall' => 'prefeitura',
        'variety_store' => 'loja de variedades', 'clothes' => 'loja de roupas', 'beauty' => 'salão de beleza',
        'dentist' => 'dentista', 'hotel' => 'hotel', 'bus_stop' => 'ponto de ônibus', 'platform' => 'ponto de ônibus',
        'station' => 'estação', 'stop_position' => 'ponto de ônibus', 'car_wash' => 'lava-jato', 'hardware' => 'material de construção',
        'mobile_phone' => 'loja de celular', 'optician' => 'ótica', 'ice_cream' => 'sorveteria', 'post_office' => 'correios',
        'social_facility' => 'assistência social', 'nightclub' => 'boate', 'stadium' => 'estádio', 'library' => 'biblioteca',
        'greengrocer' => 'hortifruti', 'bicycle' => 'bicicletaria', 'car' => 'concessionária', 'motorcycle' => 'loja de motos',
        'laundry' => 'lavanderia', 'pet' => 'pet shop', 'veterinary' => 'veterinário', 'government' => 'órgão público',
    ];

    /** "amenity=place_of_worship" → "igreja". */
    public static function traduzirTipo(string $tag): string
    {
        $valor = str_contains($tag, '=') ? explode('=', $tag, 2)[1] : $tag;

        return self::TIPOS[$valor] ?? str_replace('_', ' ', $valor);
    }

    /**
     * @return list<array{id: string, principal: string, secundario: string, lat: float, lng: float, bairro: ?string, logradouro: ?string, numero: ?string}>
     */
    public function sugerir(string $texto): array
    {
        $r = $this->nominatim()->get(config('services.nominatim.url').'/search', [
            'q' => $texto.', Salvador, Bahia',
            'format' => 'jsonv2',
            'addressdetails' => 1,
            'limit' => 6,
            'countrycodes' => 'br',
            'viewbox' => implode(',', [Geo::OESTE, Geo::NORTE, Geo::LESTE, Geo::SUL]),
            'bounded' => 1,
            'accept-language' => 'pt-BR',
        ])->throw()->json();

        return array_values(array_map(function (array $r) {
            $partes = explode(', ', (string) $r['display_name']);

            return [
                'id' => 'osm:'.$r['osm_type'].$r['osm_id'],
                'principal' => $partes[0],
                'secundario' => implode(', ', array_slice($partes, 1, 2)),
                'lat' => (float) $r['lat'],
                'lng' => (float) $r['lon'],
                'bairro' => $r['address']['suburb'] ?? $r['address']['neighbourhood'] ?? $r['address']['city_district'] ?? null,
                'logradouro' => $r['address']['road'] ?? null,
                'numero' => $r['address']['house_number'] ?? null,
            ];
        }, $r));
    }

    /**
     * @return array{endereco: ?string, bairro: ?string}
     */
    public function enderecoDoPonto(float $lat, float $lng): array
    {
        $r = $this->nominatim()->get(config('services.nominatim.url').'/reverse', [
            'lat' => $lat, 'lon' => $lng, 'format' => 'jsonv2', 'addressdetails' => 1, 'zoom' => 18, 'accept-language' => 'pt-BR',
        ])->throw()->json();

        return [
            'endereco' => isset($r['display_name']) ? implode(', ', array_slice(explode(', ', $r['display_name']), 0, 3)) : null,
            'bairro' => $r['address']['suburb'] ?? $r['address']['neighbourhood'] ?? null,
        ];
    }

    /**
     * Ruas com nome em volta do ponto, com o traçado para destacar no mapa.
     *
     * @return list<array{nome: string, metros: int, trechos: list<list<array{0: float, 1: float}>>}>
     */
    public function ruas(float $lat, float $lng): array
    {
        $ruas = [];
        foreach ($this->overpass(<<<OVERPASS
            [out:json][timeout:6];
            way(around:250,{$lat},{$lng})[highway~"^(trunk|primary|secondary|tertiary|residential|unclassified|living_street|pedestrian|service|footway|steps)$"][name];
            out tags geom;
            OVERPASS) as $e) {
            $trecho = array_values(array_map(fn (array $p) => [(float) $p['lat'], (float) $p['lon']], $e['geometry'] ?? []));
            if ($trecho === [] || ! isset($e['tags']['name'])) {
                continue;
            }
            $metros = min(array_map(fn (array $p) => Geo::metros($lat, $lng, $p[0], $p[1]), $trecho));
            $nome = (string) $e['tags']['name'];
            $ruas[$nome] ??= ['nome' => $nome, 'metros' => $metros, 'trechos' => []];
            $ruas[$nome]['metros'] = min($ruas[$nome]['metros'], $metros);
            $ruas[$nome]['trechos'][] = $trecho;
        }

        return array_values(collect($ruas)->sortBy('metros')->take(8)->all());
    }

    /**
     * Lugares com nome em volta (usado quando não há Google).
     *
     * @return list<array{nome: string, tipo: string, lat: float, lng: float, metros: int}>
     */
    public function referencias(float $lat, float $lng): array
    {
        $referencias = [];
        foreach ($this->overpass(<<<OVERPASS
            [out:json][timeout:6];
            nwr(around:350,{$lat},{$lng})[name][~"^(amenity|shop|leisure|tourism|healthcare)$"~"."];
            out tags center 40;
            OVERPASS) as $e) {
            $p = $e['center'] ?? $e;
            if (! isset($p['lat'], $p['lon'], $e['tags']['name'])) {
                continue;
            }
            $tags = $e['tags'];
            $referencias[] = [
                'nome' => (string) $tags['name'],
                'tipo' => self::traduzirTipo((string) ($tags['amenity'] ?? $tags['shop'] ?? $tags['leisure'] ?? $tags['tourism'] ?? $tags['healthcare'] ?? '')),
                'lat' => (float) $p['lat'],
                'lng' => (float) $p['lon'],
                'metros' => Geo::metros($lat, $lng, (float) $p['lat'], (float) $p['lon']),
            ];
        }

        usort($referencias, fn (array $a, array $b) => $a['metros'] <=> $b['metros']);

        return array_slice($referencias, 0, 12);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function overpass(string $consulta): array
    {
        return Http::withUserAgent(config('services.nominatim.user_agent'))
            ->timeout(7)
            ->asForm()
            ->post(config('services.overpass.url'), ['data' => $consulta])
            ->throw()
            ->json('elements', []);
    }

    private function nominatim(): PendingRequest
    {
        return Http::withUserAgent(config('services.nominatim.user_agent'))->timeout(5);
    }
}
