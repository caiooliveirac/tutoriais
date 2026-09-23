<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $nome
 * @property float $lat
 * @property float $lng
 */
#[Table('bases')]
#[Fillable(['nome', 'lat', 'lng', 'fonte_coordenada'])]
class Base extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return ['lat' => 'float', 'lng' => 'float'];
    }

    /** @return HasMany<Unidade, $this> */
    public function unidades(): HasMany
    {
        return $this->hasMany(Unidade::class);
    }
}
