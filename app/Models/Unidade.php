<?php

namespace App\Models;

use App\Enums\TipoRecurso;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $codigo
 * @property TipoRecurso $tipo
 * @property bool $baixada
 * @property float|null $lat
 * @property float|null $lng
 * @property CarbonImmutable|null $posicao_em
 * @property Base|null $base
 */
#[Table('unidades')]
#[Fillable(['codigo', 'tipo', 'base_id', 'baixada', 'lat', 'lng', 'posicao_em'])]
class Unidade extends Model
{
    /** Posição mais velha que isso é ignorada: vale a coordenada da base. */
    public const POSICAO_VALIDA_MINUTOS = 10;

    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return [
            'tipo' => TipoRecurso::class,
            'baixada' => 'boolean',
            'lat' => 'float',
            'lng' => 'float',
            'posicao_em' => 'datetime',
        ];
    }

    /** @return BelongsTo<Base, $this> */
    public function base(): BelongsTo
    {
        return $this->belongsTo(Base::class);
    }

    public function temPosicaoRecente(): bool
    {
        return $this->posicao_em !== null
            && $this->posicao_em->gt(now()->subMinutes(self::POSICAO_VALIDA_MINUTOS));
    }
}
