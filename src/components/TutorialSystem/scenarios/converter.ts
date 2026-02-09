import { TutorialStep } from '../types';
import { triagemInicialSteps } from './triagemFlow';
import { recusaFlow } from './recusaFlow';
import { qtaFlow } from './qtaFlow';
import { pioraFlow } from './pioraFlow';

export function mapTutorialFlow(flowId: string): TutorialStep[] {
  switch (flowId) {
    case 'piora_apoio':
      return pioraFlow.steps;
    case 'triagem_inicial':
      return triagemInicialSteps;
    case 'recusa_atendimento':
      return recusaFlow;
    case 'qta_fluxo':
      return qtaFlow;
    case 'triagem_pilares':
      return [
        {
          id: 'triagem-1',
          targetElementId: 'btn-gerar-ocorrencia',
          text: 'O tempo resposta começa aqui. Crie a ocorrência.',
          position: 'top',
          actionRequired: 'click'
        },
        {
          id: 'triagem-2',
          targetElementId: 'triagem-queixa',
          text: 'Identifique a gravidade baseada na queixa principal (Pilar 1 da Triagem).',
          position: 'bottom',
          actionRequired: 'next'
        },
        {
          id: 'triagem-3',
          targetElementId: 'triagem-risco',
          text: 'Classifique o risco para definir a prioridade do atendimento.',
          position: 'right',
          actionRequired: 'next'
        },
        {
          id: 'triagem-4',
          targetElementId: 'triagem-status',
          text: 'Verifique o status da ocorrência e o horário do solicitado.',
          position: 'left',
          actionRequired: 'next'
        }
      ];
    default:
      return [];
  }
}
