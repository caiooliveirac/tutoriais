<?php

namespace App\Models;

use App\Enums\TipoRecurso;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $codigo
 * @property TipoRecurso $tipo
 */
#[Table('unidades')]
#[Fillable(['codigo', 'tipo', 'base', 'baixada'])]
class Unidade extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return [
            'tipo' => TipoRecurso::class,
            'baixada' => 'boolean',
        ];
    }
}
