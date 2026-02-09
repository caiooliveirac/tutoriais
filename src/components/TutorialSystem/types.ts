export type TutorialAction = 'click' | 'next';
export type TutorialPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type TutorialStepType = 'behavioral' | 'system';

export interface TutorialStep {
  id: string;
  targetElementId?: string;
  text: string;
  position: TutorialPosition;
  actionRequired: TutorialAction;
  stepType?: TutorialStepType;
  disableBackdrop?: boolean;
}
