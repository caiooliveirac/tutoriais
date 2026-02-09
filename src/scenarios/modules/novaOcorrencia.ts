import { Scenario } from '../../types/scenarios';

export const novaOcorrenciaScenario: Scenario = {
  id: 'nova-ocorrencia',
  title: 'Nova Ocorrência',
  description: 'Simula a chegada de uma nova ficha enviada pelo TARM.',
  setup: (actions) => {
    actions.addOccurrence();
  },
  steps: [
    {
      id: 'step-1',
      title: 'Chegada da Ficha',
      content: 'Uma nova ocorrência acabou de aparecer no topo da tabela de Triagem. Observe que ela inicia com status "AGUARDANDO TRIAGEM" (Roxo).'
    },
    {
      id: 'step-2',
      title: 'Análise Inicial',
      content: 'Leitura rápida: Identifique a QUEIXA PRINCIPAL (ex: Queda de Moto) e o RISCO atribuído pelo TARM ou pelo sistema preliminarmente.'
    },
    {
      id: 'step-3',
      title: 'Assumindo o Caso',
      content: 'Em um cenário real, você clicaria na ocorrência para abrir os detalhes e iniciar a regulação médica. Por enquanto, monitore se ela muda de cor ou se novos dados chegam.'
    }
  ]
};
