<?php

namespace App\Enums;

/**
 * Ciclo de vida da ocorrência (herdado do mock, ver docs/DOMINIO.md).
 *
 * AGUARDANDO_TRIAGEM → SOLICITADO_ENVIO → AGUARDANDO_RETORNO
 *   → PROCURANDO_RECURSO → REGULADO → FINALIZADA
 * Saídas laterais: CANCELADO (a qualquer momento antes de finalizar) e
 * ENCERRADO_SEM_ENVIO (decisão médica diferente de enviar unidade).
 */
enum StatusOcorrencia: string
{
    case AguardandoTriagem = 'aguardando_triagem';
    case SolicitadoEnvio = 'solicitado_envio';
    case AguardandoRetorno = 'aguardando_retorno';
    case ProcurandoRecurso = 'procurando_recurso';
    case Regulado = 'regulado';
    case Finalizada = 'finalizada';
    case EncerradoSemEnvio = 'encerrado_sem_envio';
    case Cancelado = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::AguardandoTriagem => 'Aguardando triagem',
            self::SolicitadoEnvio => 'Solicitado envio',
            self::AguardandoRetorno => 'Aguardando retorno da equipe',
            self::ProcurandoRecurso => 'Procurando recurso',
            self::Regulado => 'Regulado',
            self::Finalizada => 'Finalizada',
            self::EncerradoSemEnvio => 'Encerrado sem envio',
            self::Cancelado => 'Cancelado',
        };
    }

    /**
     * @return list<self>
     */
    public static function triagem(): array
    {
        return [self::AguardandoTriagem, self::SolicitadoEnvio];
    }

    /**
     * @return list<self>
     */
    public static function regulacao(): array
    {
        return [self::AguardandoRetorno, self::ProcurandoRecurso, self::Regulado];
    }
}
