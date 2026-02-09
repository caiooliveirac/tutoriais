import { TutorialStep } from '../types';

export const pioraFlowData: { id: string; title: string; description: string; steps: TutorialStep[] } = {
    id: 'piora_apoio',
    title: 'Piora Clínica e Solicitação de Apoio',
    description: 'Procedimento quando uma Unidade Básica (USB) identifica gravidade maior que a esperada e requer suporte avançado (USA).',
    steps: [
        {
            id: 'intro',
            targetElementId: 'regulatory-list', // Fallback
            text: 'Neste cenário, uma USB (Básica) está em atendimento de um paciente que, inicialmente classificado como Verde/Amarelo, apresentou piora súbita.',
            position: 'center',
            actionRequired: 'next',
            stepType: 'system'
        },
        {
            id: 'select-occurrence',
            targetElementId: 'regulacao-protocol-3', 
            text: 'Identifique a ocorrência da PM 42 (Protocolo 0672). Clique para abrir os detalhes e monitorar o atendimento.',
            position: 'right',
            actionRequired: 'click',
            stepType: 'system'
        },
        {
            id: 'analyze-vitals',
            targetElementId: 'regulacao-hma-data', // Using HMA or vitals container ID if available
            text: 'Avalie os novos dados vitais inseridos pela equipe. Choque, IRpA ou Rebaixamento indicam instabilidade. Passe o mouse sobre o relato.',
            position: 'left',
            actionRequired: 'next',
            stepType: 'behavioral'
        },
        {
            id: 'reclassify-risk',
            targetElementId: 'btn-classificacao-risco',
            text: 'O paciente instabilizou. É responsabilidade sua atualizar a Classificação de Risco imediatamente.',
            position: 'top',
            actionRequired: 'click',
            stepType: 'system'
        },
        {
            id: 'change-red',
            targetElementId: 'btn-risco-VERMELHO',
            text: 'Selecione VERMELHO - EMERGÊNCIA para priorizar a gestão de vaga.',
            position: 'right',
            actionRequired: 'click',
            stepType: 'system'
        },
        {
            id: 'click-support',
            targetElementId: 'btn-solicitar-apoio',
            text: 'Se perceber que não resolverá só fornecendo orientações a essa USB, acione o apoio.',
            position: 'top',
            actionRequired: 'click',
            stepType: 'system'
        },
        {
            id: 'select-usa',
            targetElementId: 'btn-apoio-usa',
            text: 'Selecione a USA (Unidade de Suporte Avançado).',
            position: 'right',
            actionRequired: 'click',
            stepType: 'system'
        },
        {
            id: 'nurse-communication',
            targetElementId: 'history-timeline',
            text: 'COMUNICAÇÃO CRÍTICA: Vá imediatamente à Enfermeira Reguladora. Informe: "A PM 42 pediu apoio. Pedi avançada e reclassifiquei para Vermelho."',
            position: 'center',
            actionRequired: 'next',
            stepType: 'behavioral'
        }
    ]
};

export const pioraFlow = { steps: pioraFlowData.steps };
