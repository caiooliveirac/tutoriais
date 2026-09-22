<?php

namespace App\Enums;

enum Perfil: string
{
    case Tarm = 'tarm';
    case RadioOperador = 'radio_operador';
    case EnfermeiroRegulador = 'enfermeiro_regulador';
    case MedicoRegulador = 'medico_regulador';
    case ChefePlantao = 'chefe_plantao';
    case Administrativo = 'administrativo';

    public function label(): string
    {
        return match ($this) {
            self::Tarm => 'TARM',
            self::RadioOperador => 'Rádio-operador',
            self::EnfermeiroRegulador => 'Enfermeiro regulador',
            self::MedicoRegulador => 'Médico regulador',
            self::ChefePlantao => 'Chefe de plantão',
            self::Administrativo => 'Administrativo',
        };
    }
}
