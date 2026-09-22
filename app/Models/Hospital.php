<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $nome
 * @property string|null $sigla
 */
#[Table('hospitais')]
#[Fillable(['nome', 'sigla'])]
class Hospital extends Model
{
    protected $dateFormat = 'Y-m-d H:i:s.u';
}
