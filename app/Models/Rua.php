<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * Rua de Salvador (OSM). Um registro por nome e bairro; `trechos` guarda
 * as linhas de todos os pedaços para desenhar no mapa.
 *
 * @property int $id
 * @property string $nome
 * @property string $som
 * @property string|null $bairro
 * @property float $lat
 * @property float $lng
 * @property list<list<array{0: float, 1: float}>> $trechos
 * @property int $homonimos
 */
#[Table('ruas')]
#[Guarded(['id'])]
class Rua extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return ['lat' => 'float', 'lng' => 'float', 'trechos' => 'array', 'homonimos' => 'integer'];
    }
}
