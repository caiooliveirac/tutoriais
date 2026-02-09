import { Scenario } from '../../types/scenarios';

export const destinacaoScenario: Scenario = {
    id: 'destinacao',
    title: 'Escolha de Destino (Vaga Zero)',
    description: 'Define o hospital de destino após regulação.',
    setup: (actions) => {
        actions.findHospital();
    },
    steps: [
        {
            id: 'dest-1',
            title: 'Vaga Confirmada',
            content: 'A regulação conseguiu contato com a unidade hospitalar. O status mudou para "REGULADO" e o destino aparece na coluna de status.'
        },
        {
            id: 'dest-2',
            title: 'Comunicação',
            content: 'Informe a equipe da USA/USB o destino aceito e passe o quadro clínico resumido para a recepção do hospital.'
        }
    ]
};
