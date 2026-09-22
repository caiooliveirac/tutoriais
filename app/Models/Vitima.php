<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

#[Table('vitimas')]
#[Fillable(['nome', 'idade', 'sexo', 'sinais_vitais'])]
class Vitima extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';

    protected function casts(): array
    {
        return ['sinais_vitais' => 'array'];
    }
}
