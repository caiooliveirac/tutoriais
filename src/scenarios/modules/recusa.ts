import { Scenario } from '../../types/scenarios';

export const recusaScenario: Scenario = {
    id: 'recusa',
    title: 'Recusa de Atendimento',
    description: 'Paciente recusa ser removido pela ambulância no local.',
    setup: (actions) => {
        actions.triggerRefusal();
    },
    steps: [
        {
            id: 'recusa-1',
            title: 'Notificação',
            content: 'A equipe informou "Recusa de Atendimento". Note o status atualizado na tabela de Regulação.'
        },
        {
            id: 'recusa-2',
            title: 'Documentação',
            content: 'O médico regulador deve solicitar que a equipe colha a assinatura do termo de recusa. Caso o paciente se negue a assinar, testemunhas devem ser arroladas.'
        },
        {
            id: 'recusa-3',
            title: 'Desfecho',
            content: 'A ocorrência será finalizada como "Dispensa no Local" ou "Recusa", dependendo do protocolo local.'
        }
    ]
};
