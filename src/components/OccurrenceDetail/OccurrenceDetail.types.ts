import { RegulacaoData } from '../../types';

export type OccurrenceViewMode = 'ACTION' | 'CLINICAL' | 'HISTORY';

export interface OccurrenceDetailProps {
  viewMode: OccurrenceViewMode;
  onClose?: () => void;
  data?: RegulacaoData; 
  onReleaseUnit?: (id: string) => void;
  onUpdateOccurrence?: (id: string, updates: Partial<RegulacaoData>) => void;
  onRemoveOccurrence?: (id: string) => void;
}
