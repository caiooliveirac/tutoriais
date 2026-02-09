import { novaOcorrenciaScenario } from './modules/novaOcorrencia';
import { evasaoScenario } from './modules/evasao';
import { qtaScenario } from './modules/qta';
import { recusaScenario } from './modules/recusa';
import { problemaMecanicoScenario } from './modules/problemaMecanico';
import { destinacaoScenario } from './modules/destinacao';
import { pioraScenario } from './modules/piora';
import { Scenario } from '../types/scenarios';

export {
    novaOcorrenciaScenario,
    evasaoScenario,
    qtaScenario,
    recusaScenario,
    problemaMecanicoScenario,
    destinacaoScenario,
    pioraScenario
};

export const scenarios: Scenario[] = [
  novaOcorrenciaScenario,
  evasaoScenario,
  // qtaScenario, // Deactivated
  recusaScenario,
  problemaMecanicoScenario,
  destinacaoScenario,
  pioraScenario
];
