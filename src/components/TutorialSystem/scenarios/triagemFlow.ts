import { TutorialStep } from '../types';

export const triagemInicialSteps: TutorialStep[] = [
  {
    id: 'triagem-init-1',
    targetElementId: 'protocol-cell-0',
    text: "Vamos começar. Clique no número do protocolo para abrir a ocorrência.",
    position: 'right',
    actionRequired: 'click',
    stepType: 'system'
  },
  {
    id: 'triagem-init-2',
    targetElementId: 'tarm-data-box',
    text: "Confira os dados. O TARM está na linha e vai te passar a ligação. Dica: Se o endereço já está verde, não repita. Foque na queixa.",
    position: 'right',
    actionRequired: 'next',
    stepType: 'behavioral'
  },
  {
    id: 'triagem-init-3',
    // No target specific for "talking", so we keep pointing to the box or maybe center screen, but 'tarm-data-box' works as context
    targetElementId: 'tarm-data-box',
    text: "Ao atender: 'Médico falando'. Pergunte: 'O que está acontecendo AGORA?'. Corte histórias longas educadamente.",
    position: 'right',
    actionRequired: 'next',
    stepType: 'behavioral'
  },
  {
    id: 'triagem-init-4',
    targetElementId: 'tipo-ocorrencia-select', // Need to ensure IDs are added in TriagemPanel
    text: "Defina o Tipo e o Motivo. Isso gera estatísticas cruciais.",
    position: 'left',
    actionRequired: 'next',
    stepType: 'system'
  },
  {
    id: 'triagem-init-5',
    targetElementId: 'hma-textarea',
    text: "No HMA, seja conciso. Registre o que motiva sua decisão (Sinais Vitais, sintomas chave).",
    position: 'left',
    actionRequired: 'next',
    stepType: 'behavioral'
  },
  {
    id: 'triagem-init-6',
    targetElementId: 'decisao-medica-select',
    text: "Selecione 'ENVIO DE UNIDADE MÓVEL' (ou a decisão pertinente). Isso habilita a escolha da viatura.",
    position: 'top',
    actionRequired: 'next',
    stepType: 'system'
  },
  {
    id: 'triagem-init-7',
    targetElementId: 'risk-classifier',
    text: "Agora classifique a cor. Vermelho ou Amarelo para envio imediato. Verde ou Azul geralmente são orientações.",
    position: 'left',
    actionRequired: 'next',
    stepType: 'behavioral'
  },
  {
    id: 'triagem-init-8',
    targetElementId: 'btn-inserir-informacoes',
    text: "Para finalizar e enviar para a regulação de frota, clique em SALVAR.",
    position: 'top',
    actionRequired: 'click',
    stepType: 'system'
  }
];
