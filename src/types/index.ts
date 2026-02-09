export type RiscoType = 'vermelho' | 'amarelo' | 'verde' | 'azul' | 'neutro' | 'preto' | 'hora_marcada';

export interface TriagemData {
  id: string;
  protocolo: string;
  statusIcon: 'check' | 'open'; 
  isLocked?: boolean; 
  dataHora: string;
  data: string;
  hora: string;
  telefone: string;
  telefoneIdentificado?: string;
  paciente?: string;
  idade?: string;
  sexo?: string;
  endereco?: string;
  pontoReferencia?: string;
  hma?: string;
  medico: string;
  tarm: string;
  cidade: string;
  bairro: string;
  solicitante: string;
  queixa: string;
  tipoUnidade?: string;
  risco: RiscoType;
  statusBadge: 'AGUARDANDO_TRIAGEM' | 'SOLICITADO_ENVIO' | 'CANCELADO';
  solicitadoHora?: string;
  tipoOcorrencia?: string;
  motivo?: string;
  detalhamento?: string;
  decisaoMedica?: string;
  unidadeSolicitada?: string;
}

export interface RegulacaoData {
  id: string;
  protocolo: string;
  statusIcon: 'open' | 'check';
  isLocked?: boolean; 
  isQTA?: boolean; // New property for QTA state
  isUnitReleased?: boolean; // Unit released manually
  activeEvent?: {
      type: 'evasion' | 'refusal' | 'mechanical_failure' | 'worsening' | 'qta';
      message: string;
      title: string;
  };
  data: string;
  hora: string;
  cidade: string;
  bairro: string;
  medico: string;
  queixa: string;
  equipeId: string;
  equipeTime: string;
  risco: RiscoType;
  statusType: 'AGUARDANDO_RETORNO' | 'PROCURANDO_RECURSO' | 'REGULADO';
  statusText?: string;
  // Extended Details for Simulation Realism
  solicitante?: string;
  telefone?: string;
  paciente?: string;
  idade?: string;
  sexo?: string;
  endereco?: string;
  pontoReferencia?: string;
  hma?: string; // Histórico da Moléstia Atual
  relatoEquipe?: string;
  sinaisVitais?: {
    pa: string;
    fc: string;
    fr: string;
    temp: string;
    spo2: string;
    hgt: string;
    glasgow?: string;
  };
}
