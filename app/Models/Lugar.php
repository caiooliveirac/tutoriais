<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Lugar com nome em Salvador (OSM): comércio, escola, igreja, posto...
 * Serve de ponto de referência para o solicitante.
 *
 * @property int $id
 * @property string $nome
 * @property string $som
 * @property string $tipo
 * @property string|null $bairro
 * @property float $lat
 * @property float $lng
 * @property int $homonimos
 */
#[Table('lugares')]
#[Guarded(['id'])]
class Lugar extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['lat' => 'float', 'lng' => 'float', 'homonimos' => 'integer'];
    }
}
