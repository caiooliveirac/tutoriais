<?php

namespace App\Models;

use App\Enums\TipoEvento;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Append-only: o banco recusa UPDATE/DELETE (ver migration).
 */
#[Table('eventos_ocorrencia')]
#[Fillable(['tipo', 'descricao', 'antes', 'depois', 'user_id', 'perfil', 'ip', 'created_at'])]
class EventoOcorrencia extends Model
{
    public const UPDATED_AT = null;

    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return [
            'tipo' => TipoEvento::class,
            'antes' => 'array',
            'depois' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
