<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Tempo e distância por rua de várias origens até um destino, numa chamada
 * só (OSRM /table). Se o OSRM não responder, estima em linha reta — a tela
 * mostra a fonte para o TARM saber qual número está vendo.
 */
class Roteamento
{
    public const FONTE_OSRM = 'osrm';

    public const FONTE_LINHA_RETA = 'linha_reta';

    /** Estimativa sem rota: distância reta × sinuosidade, a 30 km/h urbanos. */
    private const SINUOSIDADE = 1.4;

    private const KMH = 30;

    /**
     * @param  list<array{0: float, 1: float}>  $origens  [lat, lng]
     * @param  array{0: float, 1: float}  $destino  [lat, lng]
     * @return array{fonte: string, trechos: list<array{segundos: float, metros: float}>}
     */
    public function ate(array $origens, array $destino): array
    {
        if ($origens === []) {
            return ['fonte' => self::FONTE_OSRM, 'trechos' => []];
        }

        try {
            return ['fonte' => self::FONTE_OSRM, 'trechos' => $this->osrm($origens, $destino)];
        } catch (Throwable $e) {
            Log::warning('OSRM indisponível, usando linha reta', ['erro' => $e->getMessage()]);

            return ['fonte' => self::FONTE_LINHA_RETA, 'trechos' => array_map(
                fn (array $origem) => $this->linhaReta($origem, $destino),
                $origens,
            )];
        }
    }

    /**
     * @param  list<array{0: float, 1: float}>  $origens
     * @param  array{0: float, 1: float}  $destino
     * @return list<array{segundos: float, metros: float}>
     */
    private function osrm(array $origens, array $destino): array
    {
        $pontos = collect([...$origens, $destino])
            ->map(fn (array $p) => sprintf('%.6f,%.6f', $p[1], $p[0])) // OSRM usa lng,lat
            ->implode(';');

        $resposta = Http::timeout(6)
            ->get(config('services.osrm.url')."/table/v1/driving/{$pontos}", [
                'destinations' => count($origens),
                'annotations' => 'duration,distance',
            ])
            ->throw()
            ->json();

        return array_map(fn (int $i) => [
            'segundos' => (float) $resposta['durations'][$i][0],
            'metros' => (float) $resposta['distances'][$i][0],
        ], array_keys($origens));
    }

    /**
     * @param  array{0: float, 1: float}  $a
     * @param  array{0: float, 1: float}  $b
     * @return array{segundos: float, metros: float}
     */
    private function linhaReta(array $a, array $b): array
    {
        $raio = 6371000;
        $dLat = deg2rad($b[0] - $a[0]);
        $dLng = deg2rad($b[1] - $a[1]);
        $h = sin($dLat / 2) ** 2 + cos(deg2rad($a[0])) * cos(deg2rad($b[0])) * sin($dLng / 2) ** 2;
        $metros = 2 * $raio * asin(sqrt($h)) * self::SINUOSIDADE;

        return ['segundos' => $metros / (self::KMH / 3.6), 'metros' => $metros];
    }
}
