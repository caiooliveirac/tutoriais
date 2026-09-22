<?php

namespace App\Enums;

enum Intercorrencia: string
{
    case Evasao = 'evasao';
    case Recusa = 'recusa';
    case ProblemaMecanico = 'problema_mecanico';
    case Piora = 'piora';
    case Qta = 'qta';

    public function titulo(): string
    {
        return match ($this) {
            self::Evasao => 'Evasão de paciente',
            self::Recusa => 'Recusa de atendimento',
            self::ProblemaMecanico => 'Problema mecânico (VTR baixada)',
            self::Piora => 'Piora do quadro clínico',
            self::Qta => 'QTA',
        };
    }

    /** A intercorrência tira a unidade da ocorrência (círculo vermelho com X). */
    public function desvinculaUnidade(): bool
    {
        return in_array($this, [self::Evasao, self::ProblemaMecanico, self::Qta], true);
    }
}
