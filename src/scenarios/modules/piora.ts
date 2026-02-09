import { Scenario } from '../../types/scenarios';

export const pioraScenario: Scenario = {
    id: 'piora',
    title: 'Piora Clínica (Reclassificação)',
    description: 'O quadro do paciente evolui negativamente.',
    setup: (actions) => {
        actions.triggerWorsening();
    },
    steps: [
        {
            id: 'piora-1',
            title: 'Mudança de Risco',
            content: 'Atenção! Uma ocorrência mudou de cor para VERMELHO. Isso indica piora reportada pelo solicitante ou pela equipe.'
        },
        {
            id: 'piora-2',
            title: 'Reavaliação',
            content: 'Reveja os recursos alocados. Se houver uma USB a caminho, considere enviar uma USA (UTI Móvel) em apoio.'
        }
    ]
};
