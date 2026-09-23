<?php

namespace App\Services\Mapas;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Google Maps Platform, lado do servidor (chave GOOGLE_MAPS_API_KEY):
 * Places API (New) para autocompletar, detalhar e achar referências, e
 * Geocoding API para o endereço de um ponto. O Places tolera erro de
 * digitação muito melhor que o Nominatim.
 */
class GoogleMaps
{
    /** Tipos de lugar que servem de referência para quem liga. */
    private const REFERENCIAS = [
        'pharmacy', 'supermarket', 'school', 'church', 'hospital', 'bus_station',
        'gas_station', 'bank', 'bakery', 'police', 'park', 'shopping_mall',
        'restaurant', 'university', 'convenience_store',
    ];

    /**
     * @return list<array{id: string, principal: string, secundario: string}>
     */
    public function sugerir(string $texto, string $sessao): array
    {
        $r = $this->http()->post('https://places.googleapis.com/v1/places:autocomplete', [
            'input' => $texto,
            'sessionToken' => $sessao,
            'languageCode' => 'pt-BR',
            'includedRegionCodes' => ['br'],
            'locationRestriction' => ['rectangle' => [
                'low' => ['latitude' => Geo::SUL, 'longitude' => Geo::OESTE],
                'high' => ['latitude' => Geo::NORTE, 'longitude' => Geo::LESTE],
            ]],
        ])->throw()->json('suggestions', []);

        return array_values(array_filter(array_map(function (array $s) {
            $p = $s['placePrediction'] ?? null;

            return $p === null ? null : [
                'id' => $p['placeId'],
                'principal' => $p['structuredFormat']['mainText']['text'] ?? $p['text']['text'],
                'secundario' => $p['structuredFormat']['secondaryText']['text'] ?? '',
            ];
        }, $r)));
    }

    /**
     * @return array{rotulo: string, logradouro: ?string, numero: ?string, bairro: ?string, lat: float, lng: float}
     */
    public function lugar(string $id, string $sessao): array
    {
        return Cache::remember("gmaps:lugar:{$id}", now()->addDay(), function () use ($id, $sessao) {
            $p = $this->http()
                ->withHeaders(['X-Goog-FieldMask' => 'formattedAddress,location,addressComponents,displayName'])
                ->get('https://places.googleapis.com/v1/places/'.rawurlencode($id), [
                    'sessionToken' => $sessao,
                    'languageCode' => 'pt-BR',
                ])->throw()->json();

            $componentes = $p['addressComponents'] ?? [];

            return [
                'rotulo' => (string) ($p['formattedAddress'] ?? $p['displayName']['text']),
                'logradouro' => self::componente($componentes, ['route'], 'longText') ?? ($p['displayName']['text'] ?? null),
                'numero' => self::componente($componentes, ['street_number'], 'longText'),
                'bairro' => self::componente($componentes, ['sublocality_level_1', 'sublocality'], 'longText'),
                'lat' => (float) $p['location']['latitude'],
                'lng' => (float) $p['location']['longitude'],
            ];
        });
    }

    /**
     * @return array{endereco: ?string, bairro: ?string}
     */
    public function enderecoDoPonto(float $lat, float $lng): array
    {
        $r = $this->http()->get('https://maps.googleapis.com/maps/api/geocode/json', [
            'latlng' => "{$lat},{$lng}",
            'language' => 'pt-BR',
            'key' => config('services.google_maps.chave_servidor'),
        ])->throw()->json('results', []);

        $bairro = null;
        foreach ($r as $resultado) {
            $bairro ??= self::componente($resultado['address_components'] ?? [], ['sublocality_level_1', 'sublocality'], 'long_name');
        }

        return ['endereco' => isset($r[0]['formatted_address']) ? (string) $r[0]['formatted_address'] : null, 'bairro' => $bairro];
    }

    /**
     * @return list<array{nome: string, tipo: string, lat: float, lng: float, metros: int}>
     */
    public function referencias(float $lat, float $lng): array
    {
        $r = $this->http()
            ->withHeaders(['X-Goog-FieldMask' => 'places.displayName,places.location,places.primaryTypeDisplayName'])
            ->post('https://places.googleapis.com/v1/places:searchNearby', [
                'includedTypes' => self::REFERENCIAS,
                'maxResultCount' => 12,
                'rankPreference' => 'DISTANCE',
                'languageCode' => 'pt-BR',
                'locationRestriction' => ['circle' => ['center' => ['latitude' => $lat, 'longitude' => $lng], 'radius' => 400]],
            ])->throw()->json('places', []);

        return array_values(array_map(fn (array $p) => [
            'nome' => (string) $p['displayName']['text'],
            'tipo' => (string) ($p['primaryTypeDisplayName']['text'] ?? ''),
            'lat' => (float) $p['location']['latitude'],
            'lng' => (float) $p['location']['longitude'],
            'metros' => Geo::metros($lat, $lng, (float) $p['location']['latitude'], (float) $p['location']['longitude']),
        ], $r));
    }

    /**
     * Busca livre ("hospital roberto santos", "igreja universal do cabula").
     *
     * @return list<array{nome: string, endereco: string, lat: float, lng: float}>
     */
    public function buscarLugar(string $texto, ?float $lat, ?float $lng): array
    {
        $centro = $lat !== null && $lng !== null ? [$lat, $lng, 2000.0] : [-12.95, -38.46, 20000.0];

        $r = $this->http()
            ->withHeaders(['X-Goog-FieldMask' => 'places.displayName,places.formattedAddress,places.location'])
            ->post('https://places.googleapis.com/v1/places:searchText', [
                'textQuery' => $texto,
                'languageCode' => 'pt-BR',
                'regionCode' => 'br',
                'maxResultCount' => 6,
                'locationBias' => ['circle' => ['center' => ['latitude' => $centro[0], 'longitude' => $centro[1]], 'radius' => $centro[2]]],
            ])->throw()->json('places', []);

        return array_values(array_map(fn (array $p) => [
            'nome' => (string) $p['displayName']['text'],
            'endereco' => (string) ($p['formattedAddress'] ?? ''),
            'lat' => (float) $p['location']['latitude'],
            'lng' => (float) $p['location']['longitude'],
        ], $r));
    }

    /**
     * Primeiro componente de endereço com algum dos tipos pedidos.
     *
     * @param  array<int, array<string, mixed>>  $componentes
     * @param  list<string>  $tipos
     */
    private static function componente(array $componentes, array $tipos, string $campo): ?string
    {
        foreach ($componentes as $c) {
            if (array_intersect($tipos, (array) ($c['types'] ?? [])) !== [] && isset($c[$campo])) {
                return (string) $c[$campo];
            }
        }

        return null;
    }

    private function http(): PendingRequest
    {
        return Http::timeout(5)->withHeaders([
            'X-Goog-Api-Key' => (string) config('services.google_maps.chave_servidor'),
        ]);
    }
}
