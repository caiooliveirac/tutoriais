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

    public static function metros(float $lat1, float $lng1, float $lat2, float $lng2): int
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $h = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return (int) round(2 * 6371000 * asin(sqrt($h)));
    }
}
