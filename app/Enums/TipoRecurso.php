<?php

namespace App\Enums;

enum TipoRecurso: string
{
    case Usa = 'usa';
    case Usb = 'usb';
    case Moto = 'moto';

    public function label(): string
    {
        return match ($this) {
            self::Usa => 'USA',
            self::Usb => 'USB',
            self::Moto => 'Motolância',
        };
    }
}
