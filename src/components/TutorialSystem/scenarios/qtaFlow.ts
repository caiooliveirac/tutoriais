import { TutorialStep } from '../types';

export const qtaFlow: TutorialStep[] = [
  {
    id: 'qta-1',
    targetElementId: 'regulacao-protocol-5',
    text: "Situação: A equipe SM 01 (Protocolo 0660) informa via rádio que está no local mas não visualiza a vítima. Localize e abra a ocorrência.",
    position: 'right',
    actionRequired: 'click',
    stepType: 'system'
  },
  {
    id: 'qta-2',
    targetElementId: 'regulacao-hma-data', // Focus on address/ref check
    text: "Confira o endereço e o Ponto de Referência no sistema. Confirme estes dados com a equipe via rádio.",
    position: 'right',
    actionRequired: 'next',
    stepType: 'behavioral',
    disableBackdrop: true
  },
  {
    id: 'qta-3',
    // No specific target, just behavioral instruction
    text: "A equipe mantém a negativa de visualização. O próximo passo obrigatório é tentar contato com o solicitante.",
    position: 'center',
    actionRequired: 'next',
    stepType: 'behavioral',
    disableBackdrop: true
  },
  {
    id: 'qta-4',
    targetElementId: 'btn-ligar-regulacao',
    text: "Clique em LIGAR. Se atender, peça detalhes visuais (roupa, cor da casa). Se não atender, insista mais 2 vezes.",
    position: 'bottom',
    actionRequired: 'next',
    stepType: 'system'
  },
  {
    id: 'qta-5',
    targetElementId: 'tarm-data-box', // General area
    text: "Sem sucesso no contato? Oriente a equipe a aguardar 5 minutos no local com o giroflex ligado (protocolo de visibilidade).",
    position: 'right',
    actionRequired: 'next',
    stepType: 'behavioral',
    disableBackdrop: true
  },
  {
    id: 'qta-6',
    targetElementId: 'btn-intercorrencia-chamado',
    text: "Após os 5 minutos sem contato ou visualização, encerre a ocorrência. Clique em INTERCORRÊNCIA e selecione 'QTA' ou 'PACIENTE EVADIU'.",
    position: 'left',
    actionRequired: 'click',
    stepType: 'system'
  }
];
