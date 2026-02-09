import { Scenario } from '../../types/scenarios';

export const problemaMecanicoScenario: Scenario = {
    id: 'problema-mecanico',
    title: 'Problema Mecânico (VTR Baixada)',
    description: 'Ambulância sofre pane durante o deslocamento.',
    setup: (actions) => {
        actions.triggerMechanicalFailure();
    },
    steps: [
        {
            id: 'pane-1',
            title: 'Alerta de Pane',
            content: 'A viatura reportou falha mecânica. O sistema removeu a equipe da ocorrência e retornou o status para "PROCURANDO RECURSO".'
        },
        {
            id: 'pane-2',
            title: 'Prioridade',
            content: 'Esta ocorrência voltou para a fila de pendências. É necessário enviar uma nova unidade imediatamente se o paciente for grave.'
        },
        {
            id: 'pane-3',
            title: 'Logística',
            content: 'A unidade quebrada deve entrar em manutenção (Oficina) e ficará indisponível no sistema até o reparo.'
        }
    ]
};
