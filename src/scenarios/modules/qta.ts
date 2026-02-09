import { Scenario } from '../../types/scenarios';

export const qtaScenario: Scenario = {
    id: 'qta',
    title: 'Perda de Contato (QTA Equipe)',
    description: 'Simula a perda de vínculo/rádio com a viatura.',
    setup: (actions) => {
        actions.triggerQTA();
    },
    steps: [
        {
            id: 'qta-1',
            title: 'QTA da Equipe',
            content: 'O sistema perdeu a validação da equipe em campo. Observe o ícone "Bola Vermelha com X" substituindo o código da viatura na Regulação.'
        },
        {
            id: 'qta-2',
            title: 'Significado',
            content: 'Isso indica que o rádio da viatura não está respondendo ou a equipe foi desvinculada manualmente sem finalizar a ocorrência.'
        },
        {
            id: 'qta-3',
            title: 'Ação Necessária',
            content: 'Tentar comunicação via rádio ou telefone corporativo com a tripulação imediatamente para restabelecer o vínculo.'
        }
    ]
};
