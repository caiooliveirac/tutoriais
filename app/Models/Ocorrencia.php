<?php

namespace App\Models;

use App\Enums\Intercorrencia;
use App\Enums\Risco;
use App\Enums\StatusOcorrencia;
use App\Enums\TipoRecurso;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $protocolo
 * @property StatusOcorrencia $status
 * @property CarbonImmutable $aberta_em
 * @property Risco|null $risco
 * @property TipoRecurso|null $tipo_recurso
 * @property Intercorrencia|null $intercorrencia
 * @property CarbonImmutable|null $solicitado_envio_em
 * @property CarbonImmutable|null $despachada_em
 * @property bool $unidade_desvinculada
 * @property int|null $travada_por
 */
#[Table('ocorrencias')]
#[Guarded(['id'])]
class Ocorrencia extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return [
            'status' => StatusOcorrencia::class,
            'risco' => Risco::class,
            'tipo_recurso' => TipoRecurso::class,
            'intercorrencia' => Intercorrencia::class,
            'aberta_em' => 'datetime',
            'solicitado_envio_em' => 'datetime',
            'despachada_em' => 'datetime',
            'travada_em' => 'datetime',
            'unidade_desvinculada' => 'boolean',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function tarm(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tarm_id');
    }

    /** @return BelongsTo<User, $this> */
    public function medico(): BelongsTo
    {
        return $this->belongsTo(User::class, 'medico_id');
    }

    /** @return BelongsTo<User, $this> */
    public function travadaPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'travada_por');
    }

    /** @return BelongsTo<Unidade, $this> */
    public function unidade(): BelongsTo
    {
        return $this->belongsTo(Unidade::class);
    }

    /** @return BelongsTo<Hospital, $this> */
    public function hospital(): BelongsTo
    {
        return $this->belongsTo(Hospital::class);
    }

    /** @return HasMany<Vitima, $this> */
    public function vitimas(): HasMany
    {
        return $this->hasMany(Vitima::class);
    }

    /** @return HasMany<EventoOcorrencia, $this> */
    public function eventos(): HasMany
    {
        return $this->hasMany(EventoOcorrencia::class)->orderBy('created_at');
    }
}
