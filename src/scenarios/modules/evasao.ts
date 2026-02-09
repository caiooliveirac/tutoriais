import { Scenario } from '../../types/scenarios';

export const evasaoScenario: Scenario = {
  id: 'evasao',
  title: 'Evasão de Paciente',
  description: 'A equipe chega ao local, mas o paciente não está mais lá.',
  setup: (actions) => {
    actions.triggerEvasion();
  },
  steps: [
    {
      id: 'evasao-1',
      title: 'Alerta da Equipe',
      content: 'A equipe informou via rádio que ao chegar no local da ocorrência, não encontrou a vítima.'
    },
    {
      id: 'evasao-2',
      title: 'Atualização de Status',
      content: 'Note que o status da ocorrência na tabela de Regulação mudou para "AGUARDANDO RETORNO" (Amarelo) e o ícone voltou a ser um quadrado vazio. Isso indica pendência.'
    },
    {
      id: 'evasao-3',
      title: 'Procedimento',
      content: 'Deve-se tentar contato telefônico com o solicitante. Caso confirmado que o paciente foi embora por meios próprios, a ocorrência deve ser finalizada como "QJ" (QTA por Evasão).'
    }
  ]
};
