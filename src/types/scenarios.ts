import { TriagemData, RegulacaoData } from './index';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetId?: string; // ID of DOM element to highlight
  actionRequired?: string; // Optional: Wait for this action to proceed
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  // Function to execute when this scenario starts (e.g. inject data)
  setup?: (actions: SimulationActions) => void;
}

// Interface defining the actions available to simulation scenarios
export interface SimulationActions {
  addOccurrence: () => void;
  lockRandomOccurrence: () => void;
  triggerEvasion: () => void;
  triggerQTA: () => void;
  findHospital: () => void;
  unlockOccurrence: (id: string) => void;
  triggerRefusal: () => void;
  triggerMechanicalFailure: () => void;
  triggerWorsening: () => void;
}
