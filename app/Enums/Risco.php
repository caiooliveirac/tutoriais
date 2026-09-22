<?php

namespace App\Enums;

enum Risco: string
{
    case Vermelho = 'vermelho';
    case Amarelo = 'amarelo';
    case Verde = 'verde';
    case Azul = 'azul';
    case Preto = 'preto';
    case HoraMarcada = 'hora_marcada';

    /** Ordem de prioridade na fila (menor = mais urgente). */
    public function prioridade(): int
    {
        return match ($this) {
            self::Vermelho => 1,
            self::Amarelo => 2,
            self::Verde => 3,
            self::Azul => 4,
            self::HoraMarcada => 5,
            self::Preto => 6,
        };
    }
}
