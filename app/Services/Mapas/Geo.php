<?php

namespace App\Services\Mapas;

/** Contas de geografia usadas pelos clientes de mapa. */
final class Geo
{
    /** Caixa de Salvador. */
    public const SUL = -13.02;

    public const NORTE = -12.73;

    public const OESTE = -38.70;

    public const LESTE = -38.25;

    /**
     * Ponto dentro do polígono (contagem de cruzamentos). Aceita as bordas em
     * qualquer ordem e vários anéis (ilhas, buracos).
     *
     * @param  array{0: float, 1: float}  $ponto  [lat, lng]
     * @param  list<list<array{0: float, 1: float}>>  $bordas
     */
    public static function dentro(array $ponto, array $bordas): bool
    {
        [$y, $x] = $ponto;
        $dentro = false;
        foreach ($bordas as $linha) {
            for ($i = 0, $n = count($linha); $i < $n - 1; $i++) {
                [$y1, $x1] = $linha[$i];
                [$y2, $x2] = $linha[$i + 1];
                if (($y1 > $y) !== ($y2 > $y) && $x < ($x2 - $x1) * ($y - $y1) / ($y2 - $y1) + $x1) {
                    $dentro = ! $dentro;
                }
            }
        }

        return $dentro;
    }

    public static function metros(float $lat1, float $lng1, float $lat2, float $lng2): int
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $h = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return (int) round(2 * 6371000 * asin(sqrt($h)));
    }
}
