<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * Endereço digitado pelo TARM → coordenadas, restrito a Salvador (Nominatim/OSM).
 */
class Geocodificador
{
    /** Caixa de Salvador: oeste, norte, leste, sul. */
    private const SALVADOR = '-38.70,-12.73,-38.25,-13.02';

    /**
     * @return list<array{rotulo: string, logradouro: ?string, numero: ?string, bairro: ?string, lat: float, lng: float}>
     */
    public function buscar(string $endereco): array
    {
        $endereco = trim($endereco);

        return Cache::remember('geo:'.md5(mb_strtolower($endereco)), now()->addDay(), function () use ($endereco) {
            $resposta = Http::withUserAgent(config('services.nominatim.user_agent'))
                ->timeout(5)
                ->get(config('services.nominatim.url').'/search', [
                    'q' => $endereco.', Salvador, Bahia',
                    'format' => 'jsonv2',
                    'addressdetails' => 1,
                    'limit' => 5,
                    'countrycodes' => 'br',
                    'viewbox' => self::SALVADOR,
                    'bounded' => 1,
                    'accept-language' => 'pt-BR',
                ])
                ->throw()
                ->json();

            return array_values(array_map(fn (array $r) => [
                'rotulo' => implode(', ', array_slice(explode(', ', $r['display_name']), 0, 3)),
                'logradouro' => $r['address']['road'] ?? null,
                'numero' => $r['address']['house_number'] ?? null,
                'bairro' => $r['address']['suburb'] ?? $r['address']['neighbourhood'] ?? $r['address']['city_district'] ?? null,
                'lat' => (float) $r['lat'],
                'lng' => (float) $r['lon'],
            ], $resposta));
        });
    }
}
