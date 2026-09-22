<?php

namespace App\Enums;

enum TipoEvento: string
{
    case Aberta = 'aberta';
    case Triada = 'triada';
    case DecisaoMedica = 'decisao_medica';
    case Despachada = 'despachada';
    case RetornoEquipe = 'retorno_equipe';
    case ProcurandoRecurso = 'procurando_recurso';
    case Regulada = 'regulada';
    case Intercorrencia = 'intercorrencia';
    case Cancelada = 'cancelada';
    case Finalizada = 'finalizada';
    case FichaAberta = 'ficha_aberta';
}
