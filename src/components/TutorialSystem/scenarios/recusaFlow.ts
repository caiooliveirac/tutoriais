import { TutorialStep } from '../types';

export const recusaFlow: TutorialStep[] = [
  {
    id: 'recusa-1',
    targetElementId: 'regulacao-protocol-2', // Directly targeting the first active regulation row which usually has ID 2 in mock data
    text: "Situação: A equipe informa via rádio que o paciente recusa remoção. Localize a ocorrência com status 'REGULADO' (Verde) e abra.",
    position: 'right',
    actionRequired: 'click',
    stepType: 'system'
  },
  {
    id: 'recusa-2',
    targetElementId: 'regulacao-hma-data',
    text: "Antes de agir, confira a HMA e verifique se o paciente tinha queixa grave que justifique insistência.",
    position: 'right',
    actionRequired: 'next',
    stepType: 'behavioral'
  },
  {
    id: 'recusa-3',
    // No specific target element for just talking
    text: "Situação: Paciente recusa remoção. Ligue e fale DIRETAMENTE com ele em linha gravada. Não aceite apenas o recado da equipe.",
    position: 'center',
    actionRequired: 'next',
    stepType: 'behavioral',
    disableBackdrop: true
  },
  {
    id: 'recusa-4',
    targetElementId: 'glasgow-cell', 
    text: "Na linha: Avalie a consciencia. O Glasgow está 15? O paciente está LÚCIDO e ORIENTADO (sabe dia, hora, local)? Se estiver confuso, a recusa NÃO É VÁLIDA e deve ser conduzido mesmo contra a vontade.",
    position: 'left',
    actionRequired: 'next',
    stepType: 'behavioral'
  },
  {
    id: 'recusa-5',
    targetElementId: 'regulacao-hma-data',
    text: "Explique os riscos CLARAMENTE: 'Se o senhor não for, pode ter uma sequela permanente'. Certifique-se que ele verbalizou o entendimento.",
    position: 'right',
    actionRequired: 'next',
    stepType: 'behavioral',
    disableBackdrop: true
  },
  {
    id: 'recusa-6',
    targetElementId: 'btn-intercorrencia-chamado',
    text: "Se mantida a recusa: Oriente a equipe a preencher o termo. No sistema, clique em 'INTERCORRÊNCIA' para encerrar o chamado por recusa.",
    position: 'left',
    actionRequired: 'click', 
    stepType: 'system'
  }
];
