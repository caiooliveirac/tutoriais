<?php

namespace App\Enums;

/**
 * Cada área é uma aba/tela do sistema. Um usuário vê as áreas
 * de todos os perfis que possui.
 */
enum Area: string
{
    case Atendimento = 'atendimento';
    case Triagem = 'triagem';
    case Despacho = 'despacho';
    case Plantao = 'plantao';
    case Bi = 'bi';

    public function label(): string
    {
        return match ($this) {
            self::Atendimento => 'Atendimento',
            self::Triagem => 'Triagem e Regulação',
            self::Despacho => 'Despacho',
            self::Plantao => 'Painel do plantão',
            self::Bi => 'BI',
        };
    }

    /**
     * @return list<Perfil>
     */
    public function perfis(): array
    {
        return match ($this) {
            self::Atendimento => [Perfil::Tarm],
            self::Triagem => [Perfil::MedicoRegulador],
            self::Despacho => [Perfil::EnfermeiroRegulador, Perfil::RadioOperador],
            self::Plantao => [Perfil::ChefePlantao],
            self::Bi => [Perfil::Administrativo],
        };
    }
}
