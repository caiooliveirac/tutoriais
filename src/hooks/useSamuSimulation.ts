import { useRef, useState } from 'react';
import { TriagemData, RegulacaoData } from '../types';

const initialTriagem: TriagemData[] = [
  {
    id: '1', protocolo: '202602080682', statusIcon: 'open', isLocked: false, dataHora: '08/02/2026 14:11:20',
    data: '08/02/2026', hora: '14:11:20', telefone: '(71) 99999-1234', medico: 'DR. MARCOS GOMES',
    tarm: 'ANA PAULA', cidade: 'Salvador', bairro: 'tororo', solicitante: 'JULIANA SILVA',
    queixa: 'teve alta hoje // teve vomito //', tipoUnidade: '', risco: 'neutro', statusBadge: 'AGUARDANDO_TRIAGEM',
    paciente: 'LEONARDO ALVES', idade: '19 anos', sexo: 'MASCULINO',
    endereco: 'RUA DO TORORÓ, CASA 18', pontoReferencia: 'PRÓXIMO AO CAMPO',
    telefoneIdentificado: '(71) 99999-1234'
  },
  {
    id: '2', protocolo: '202602080671', statusIcon: 'check', dataHora: '08/02/2026 14:02:34',
    data: '08/02/2026', hora: '14:02:34', telefone: '(71) 98888-5678', medico: 'DR. JOÃO PEREIRA',
    tarm: 'CARLOS SOUZA', cidade: 'Salvador', bairro: 'PLATAFORMA', solicitante: 'FERNANDA LIMA',
    queixa: 'surto', tipoUnidade: 'USB - Unidade de Suporte Básico', risco: 'amarelo',
    statusBadge: 'SOLICITADO_ENVIO', solicitadoHora: '14:14:18',
    paciente: 'RODRIGO LIMA', idade: '28 anos', sexo: 'MASCULINO',
    endereco: 'RUA NOVA DA PLATAFORMA, 210', pontoReferencia: 'EM FRENTE AO MERCADO',
    telefoneIdentificado: '(71) 98888-5678',
    hma: 'SOLICITANTE RELATA PACIENTE COM SURTO AGUDO, AGITADO E GRITANDO. SEM RELATO DE TRAUMA. NEGA USO DE MEDICAÇÃO. NECESSITA AVALIAÇÃO NO LOCAL.'
  },
  {
    id: '3', protocolo: '202602080535', statusIcon: 'open', dataHora: '08/02/2026 11:54:10',
    data: '08/02/2026', hora: '11:54:10', telefone: '(71) 97777-9999', medico: 'DR. ROBERTO ALMEIDA',
    tarm: 'MARIA OLIVEIRA', cidade: 'Salvador', bairro: 'VALERIA', solicitante: 'DR. RICARDO',
    queixa: 'TC CRANIO', tipoUnidade: '', risco: 'neutro', statusBadge: 'AGUARDANDO_TRIAGEM',
    paciente: 'MARTA SOUZA', idade: '47 anos', sexo: 'FEMININO',
    endereco: 'RUA DA VALÉRIA, 455', pontoReferencia: 'PRÓXIMO AO POSTO',
    telefoneIdentificado: '(71) 97777-9999'
  }
];

const initialRegulacao: RegulacaoData[] = [
  {
    id: '1', protocolo: '202602080684', statusIcon: 'open', data: '08/02/2026', hora: '14:13:21',
    cidade: 'Salvador', bairro: 'BAIXA DE QUINTAS', medico: 'DR. JOÃO PEREIRA', queixa: 'SOFREU AGRESSAO',
    equipeId: 'PM 43', equipeTime: '14:17:43', risco: 'amarelo', statusType: 'AGUARDANDO_RETORNO',
    solicitante: 'CABO MARCIO (PM)', telefone: '(71) 98888-1111', paciente: 'CARLOS ALBERTO JUNIOR', idade: '32 anos', sexo: 'MASCULINO',
    endereco: 'VIA EXPRESSA, PROXIMO AO VIADUTO', pontoReferencia: 'EM FRENTE AO SUPERMERCADO',
    hma: 'SOLICITANTE INFORMA VÍTIMA DE AGRESSÃO FÍSICA POR POPULARES. CONSCIENTE, COM SANGRAMENTO IMPORTANTE EM FACE E ESCORIAÇÕES EM MMSS. NEGA PERDA DE CONSCIÊNCIA.',
    sinaisVitais: { pa: '130x80', fc: '98', fr: '20', temp: '36.8', spo2: '98', hgt: '99', glasgow: '15' }
  },
  {
    id: '2', protocolo: '202602080673', statusIcon: 'open', data: '08/02/2026', hora: '14:04:19',
    cidade: 'Salvador', bairro: 'FAZENDA GRANDE 3', medico: 'DRA. CAMILA RODRIGUES', queixa: 'AVC ISQUÊMICO EM JANELA',
    equipeId: 'CZ 51', equipeTime: '14:08:40', risco: 'vermelho', statusType: 'REGULADO', statusText: 'Regulado para HOSPITAL GERAL ROBERTO SANTOS',
    solicitante: 'MARIA CLARA (FILHA)', telefone: '(71) 99111-2222', paciente: 'JOSEFA MARIA DE JESUS', idade: '74 anos', sexo: 'FEMININO',
    endereco: 'RUA DOUTOR EDSON, CASA 12-B', pontoReferencia: 'AO LADO DA IGREJA BATISTA',
    hma: 'PACIENTE APRESENTOU SUBITAMENTE DESVIO DE RIMA E PERDA DE FORÇA EM HEMICORPO DIREITO HÁ 30 MINUTOS. FALA PASTOSA. HIPERTENSA EM USO IRREGULAR DE MEDICAÇÃO.',
    relatoEquipe: 'USA CZ 51 NO LOCAL: PACIENTE VIGIL, DISÁRTRICA, COM HEMIPARESIA COMPLETA À DIREITA (FORÇA GRAU 1). PA 190x110 mmHg, FC 92 bpm, T 36.6C, HGT 145 mg/dL. SINAIS TÍPICOS DE AVC ISQUÊMICO. INICIADO ACESSO VENOSO E MONITORIZAÇÃO. ENCAMINHAMENTO IMEDIATO DEVIDO À JANELA TERAPÊUTICA.',
    sinaisVitais: { pa: '190x110', fc: '92', fr: '22', temp: '36.6', spo2: '94', hgt: '145', glasgow: '13' }
  },
  {
    id: '3', protocolo: '202602080672', statusIcon: 'check', data: '08/02/2026', hora: '14:03:05',
    cidade: 'Salvador', bairro: 'PARQUE BELA VISTA', medico: 'DRA. JULIANA MARTINS', queixa: 'QUEDA DA PROPRIA ALTURA - TCE',
    equipeId: 'PM 42', equipeTime: '14:19:31', risco: 'amarelo', statusType: 'REGULADO', statusText: 'Regulado para HOSPITAL GERAL DO ESTADO',
    solicitante: 'JOAO VITOR (NETO)', telefone: '(71) 98777-3333', paciente: 'LUCAS OLIVEIRA', idade: '72 anos', sexo: 'MASCULINO',
    endereco: 'AVENIDA ACM, EDF. EMPRESARIAL, SALA 405', pontoReferencia: 'PROXIMO AO DETRAN',
    hma: 'PACIENTE IDOSO SOFREU QUEDA DA PRÓPRIA ALTURA APÓS TONTURA SÚBITA. BATEU A CABEÇA NO CHÃO (REGIÃO OCCIPITAL). APRESENTOU EMATOMA GRANDE NO LOCAL. NO MOMENTO SONOLENTO, MAS RESPONDE.',
    relatoEquipe: 'EQUIPE PM 42 NO LOCAL. PACIENTE VÍTIMA DE QPA + TCE LEVE. APRESENTA HEMATOMA SUBGALEAL EXTENSO EM REGIÃO OCCIPITAL DIREITA. REFLEXOS LENTIFICADOS. GLASGOW 14 (CONFUSO). NECESSITA AVALIAÇÃO NEUROCIRÚRGICA.',
    sinaisVitais: { pa: '150x90', fc: '68', fr: '18', temp: '36.5', spo2: '96', hgt: '110', glasgow: '14' }
  },
  {
    id: '4', protocolo: '202602080663', statusIcon: 'check', data: '08/02/2026', hora: '13:52:26',
    cidade: 'Salvador', bairro: 'Itapuã', medico: 'DRA. JULIANA MARTINS', queixa: 'dor e desconforto abdominal',
    equipeId: 'IT 31', equipeTime: '14:03:47', risco: 'amarelo', statusType: 'PROCURANDO_RECURSO',
    solicitante: 'JULIANA (MÃE)', telefone: '(71) 99666-4444', paciente: 'ENZO GABRIEL', idade: '8 anos', sexo: 'MASCULINO',
    endereco: 'RUA DAS DUNAS, COND. PRAIA DO SOL', pontoReferencia: 'DEPOIS DO FAROL',
    hma: 'CRIANÇA COM DOR ABDOMINAL INTENSA HÁ 2 HORAS, LOCALIZADA EM FOSSA ILIACA DIREITA. APRESENTOU 2 EPISODIOS DE VOMITO. FEBRIL (38.5C).',
    relatoEquipe: 'USB IT 31 NO LOCAL. MENOR EM LEITO MATERNO, FÁCIES DE DOR. DB POSITIVO EM FID. FEBRIL AO TOQUE. NÃO ACEITA DIETA. SUSPEITA DE APENDICITE AGUDA. SOLICITADO REGULAÇÃO PARA CIRURGIA PEDIÁTRICA.',
    sinaisVitais: { pa: '100x60', fc: '110', fr: '24', temp: '38.5', spo2: '98', hgt: '92', glasgow: '15' }
  },
  {
    id: '5', protocolo: '202602080660', statusIcon: 'open', data: '08/02/2026', hora: '13:44:34',
    cidade: 'Salvador', bairro: 'IAPI', medico: 'DR. PEDRO SAULO', queixa: 'DIABETICA E HIPERTENSA PASSANDO MAL',
    equipeId: 'SM 01', equipeTime: '14:01:22', risco: 'vermelho', statusType: 'AGUARDANDO_RETORNO',
    solicitante: 'ROBERTO (VIZINHO)', telefone: '(71) 98888-5555', paciente: 'MARIA DO CARMO', idade: '62 anos', sexo: 'FEMININO',
    endereco: 'LADEIRA DO IAPI, BECO 3', pontoReferencia: 'EM FRENTE A ESCOLA MUNICIPAL',
    hma: 'PACIENTE DIABETICA INSULINODEPENDENTE, ENCONTRADA SONOLENTA, SUDOREICA E PÁLIDA. GLICEMIA CAPILAR "HI" (ALTA). RESPIRAÇÃO RUIDOSA.',
    sinaisVitais: { pa: '160x90', fc: '105', fr: '28', temp: '37.0', spo2: '92', hgt: 'HI', glasgow: '10' }
  }
];

export function useSamuSimulation() {
  const [triagemData, setTriagemData] = useState<TriagemData[]>(initialTriagem);
  const [regulacaoData, setRegulacaoData] = useState<RegulacaoData[]>(initialRegulacao);

  const baseProtocol = '20260208';
  const maxSuffix = initialTriagem.reduce((max, item) => {
    const suffix = Number(item.protocolo.slice(-4));
    return Number.isNaN(suffix) ? max : Math.max(max, suffix);
  }, 0);
  const nextProtocolRef = useRef(maxSuffix + 1);
  const templateIndexRef = useRef(0);
  const triagemTemplates: Omit<TriagemData, 'id' | 'protocolo' | 'dataHora' | 'data' | 'hora' | 'statusIcon' | 'statusBadge' | 'risco'>[] = [
    {
      telefone: '(71) 95555-1234',
      telefoneIdentificado: '(71) 95555-1234',
      medico: '---',
      tarm: 'ANA PAULA',
      cidade: 'Salvador',
      bairro: 'ITAPUÃ',
      solicitante: 'PAULA MORAES',
      queixa: 'DOR TORÁCICA',
      tipoUnidade: '',
      paciente: 'JOÃO HENRIQUE',
      idade: '54 anos',
      sexo: 'MASCULINO',
      endereco: 'AV. DORIVAL CAYMMI, 1200',
      pontoReferencia: 'PRÓXIMO AO FAROL'
    },
    {
      telefone: '(71) 96666-7788',
      telefoneIdentificado: '(71) 96666-7788',
      medico: '---',
      tarm: 'CARLOS SOUZA',
      cidade: 'Salvador',
      bairro: 'BROTAS',
      solicitante: 'MARIA LÚCIA',
      queixa: 'CRISE CONVULSIVA',
      tipoUnidade: '',
      paciente: 'LUIZ FERNANDO',
      idade: '22 anos',
      sexo: 'MASCULINO',
      endereco: 'RUA ALAMEDA DAS FLORES, 58',
      pontoReferencia: 'EM FRENTE À PRAÇA'
    },
    {
      telefone: '(71) 97777-1212',
      telefoneIdentificado: '(71) 97777-1212',
      medico: '---',
      tarm: 'MARIA OLIVEIRA',
      cidade: 'Salvador',
      bairro: 'CABULA',
      solicitante: 'ROBERTA ALMEIDA',
      queixa: 'QUEDA DA PRÓPRIA ALTURA',
      tipoUnidade: '',
      paciente: 'ELZA MARQUES',
      idade: '71 anos',
      sexo: 'FEMININO',
      endereco: 'RUA SILVEIRA MARTINS, 400',
      pontoReferencia: 'PRÓXIMO AO HOSPITAL'
    },
    {
      telefone: '(71) 98888-3030',
      telefoneIdentificado: '(71) 98888-3030',
      medico: '---',
      tarm: 'ANA PAULA',
      cidade: 'Salvador',
      bairro: 'RIO VERMELHO',
      solicitante: 'DANIELA FREITAS',
      queixa: 'DIFICULDADE RESPIRATÓRIA',
      tipoUnidade: '',
      paciente: 'MATEUS LIMA',
      idade: '7 anos',
      sexo: 'MASCULINO',
      endereco: 'RUA DA PACIÊNCIA, 90',
      pontoReferencia: 'PRÓXIMO AO MERCADO'
    },
    {
      telefone: '(71) 93333-4545',
      telefoneIdentificado: '(71) 93333-4545',
      medico: '---',
      tarm: 'CARLOS SOUZA',
      cidade: 'Salvador',
      bairro: 'SÃO CRISTÓVÃO',
      solicitante: 'VIVIANE SOARES',
      queixa: 'DOR ABDOMINAL INTENSA',
      tipoUnidade: '',
      paciente: 'RICARDO SANTOS',
      idade: '35 anos',
      sexo: 'MASCULINO',
      endereco: 'RUA DO AEROPORTO, 215',
      pontoReferencia: 'PRÓXIMO AO TERMINAL'
    }
  ];

  const addOccurrence = () => {
    const nextSuffix = nextProtocolRef.current++;
    const suffixStr = String(nextSuffix).padStart(4, '0');
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR');
    const template = triagemTemplates[templateIndexRef.current % triagemTemplates.length];
    templateIndexRef.current += 1;

    const newOcc: TriagemData = {
        id: String(nextSuffix),
        protocolo: `${baseProtocol}${suffixStr}`,
        statusIcon: 'open',
        dataHora: `${date} ${time}`,
        data: date,
        hora: time,
        risco: 'neutro',
        statusBadge: 'AGUARDANDO_TRIAGEM',
        ...template
    };
    setTriagemData((prev) => [newOcc, ...prev]);
  };

  const lockRandomOccurrence = () => {
      // Find first unlocked, or random? User just said "Bloquear". Let's lock the first available unlocked one in Triagem as demo.
      setTriagemData((current) => {
          const idx = current.findIndex(d => !d.isLocked && d.statusBadge !== 'CANCELADO');
          if (idx !== -1) {
              const newData = [...current];
              newData[idx] = { ...newData[idx], isLocked: true };
              return newData;
          }
          return current;
      });
  };

  const triggerQTA = () => {
    // Deprecated / Removed as per user request ("Perda de contato não existirá mais")
    // Keeping function signature to avoid breaking TS scenarios temporarily but it does nothing active.
    console.log("QTA Scenario is deprecated.");
  };

  const cancelLastOccurrence = () => {
      // Legacy "Cancel" logic if needed, but "QTA" button replaced it visually in requests?
      // User said "O botão QTA, agora, passará a trocar...". 
      // I will keep this generic cancel function if I need it later or rename the prop passed to controls.
      // But the BUTTON "QTA" on the controls runs the `triggerQTA` logic now.
      // I'll leave this here but unused by the "QTA" button.
     setTriagemData((current) => {
        const idx = current.findIndex(d => d.statusBadge !== 'CANCELADO');
        if (idx !== -1) {
            const newData = [...current];
            newData[idx] = { ...newData[idx], statusBadge: 'CANCELADO' };
            return newData;
        }
        return current;
      });
  };

  const triggerEvasion = () => {
      setRegulacaoData((current) => {
        const candidates = current.filter(d => d.statusType !== 'REGULADO' && !d.isQTA && !d.activeEvent);
        if (candidates.length > 0) {
             const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
             const idx = current.findIndex(c => c.id === randomCandidate.id);
             if (idx === -1) return current;

            const newData = [...current];
            newData[idx] = { 
                ...newData[idx], 
                statusIcon: 'open', 
                statusType: 'AGUARDANDO_RETORNO',
                isQTA: true, // "bolinha vermelha com x" (Unidade desvinculada)
                activeEvent: {
                    type: 'evasion',
                    title: 'Evasão de Paciente',
                    message: `A equipe informa que o paciente não se encontra no local (Evasão).`
                }
            }; 
            return newData;
        } else {
             alert("Nenhuma ocorrência elegível para este cenário no momento (todas finalizadas, QTA ou com evento ativo).");
        }
        return current;
      });
  };

  const findHospital = () => {
      setRegulacaoData((current) => {
        const candidates = current.filter(d => d.statusType === 'PROCURANDO_RECURSO');
        if (candidates.length > 0) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            const idx = current.findIndex(c => c.id === randomCandidate.id);

            const newData = [...current];
            newData[idx] = { 
                ...newData[idx], 
                statusType: 'REGULADO', 
                statusText: 'Regulado para HOSPITAL SUBÚRBIO',
                statusIcon: 'check',
                risco: 'verde' 
            };
            return newData;
        }
        return current;
      });
  };

  const triggerRefusal = () => {
      setRegulacaoData((current) => {
        const candidates = current.filter(d => d.statusType !== 'REGULADO' && !d.isQTA && !d.activeEvent);
        if (candidates.length > 0) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            const idx = current.findIndex(c => c.id === randomCandidate.id);
            if (idx === -1) return current;
            
            const newData = [...current];
            newData[idx] = { 
                ...newData[idx], 
                statusIcon: 'open', 
                statusType: 'AGUARDANDO_RETORNO',
                // Refusal keeps team assigned to sign the document
                activeEvent: {
                    type: 'refusal',
                    title: 'Recusa de Atendimento',
                    message: `Paciente recusou transporte ou atendimento pela equipe.`
                }
            }; 
            return newData;
        } else {
             alert("Nenhuma ocorrência elegível para este cenário no momento (todas finalizadas, QTA ou com evento ativo).");
        }
        return current;
      });
  };

  const triggerMechanicalFailure = () => {
      setRegulacaoData((current) => {
        // "Ocorrência não vai mudar para procurando recurso. Continua como estava antes."
        // "Pode sim tirar a unidade que estava, colocando a bola vermelha com x branco"
        const candidates = current.filter(d => d.equipeId && d.statusType !== 'REGULADO' && !d.isQTA && !d.activeEvent);
        if (candidates.length > 0) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            const idx = current.findIndex(c => c.id === randomCandidate.id);
            if (idx === -1) return current;

            const newData = [...current];
            newData[idx] = { 
                ...newData[idx], 
                // Don't change statusType or statusText as per request
                isQTA: true, // Red X indicating unit lost/unlinked
                activeEvent: {
                    type: 'mechanical_failure',
                    title: 'Problema Mecânico (VTR Baixada)',
                    message: `A Viatura ${current[idx].equipeId} sofreu uma pane e está indisponível.`
                }
            }; 
            return newData;
        } else {
             alert("Nenhuma ocorrência elegível para este cenário no momento (sem VTR atribuída ou com evento ativo).");
        }
        return current;
      });
  };

  const triggerWorsening = () => {
      setRegulacaoData((current) => {
        const candidates = current.filter(d => (d.risco === 'verde' || d.risco === 'amarelo') && d.statusType !== 'REGULADO' && !d.activeEvent);
        if (candidates.length > 0) {
            const randomCandidate = candidates[Math.floor(Math.random() * candidates.length)];
            const idx = current.findIndex(c => c.id === randomCandidate.id);
            if (idx === -1) return current;

            const newData = [...current];
            newData[idx] = { 
                ...newData[idx], 
                // Only trigger warning, do NOT change color automatically
                // risco: 'vermelho', <-- Removed
                queixa: newData[idx].queixa + ' (PIORA CLÍNICA)',
                activeEvent: {
                    type: 'worsening',
                    title: 'Piora do Quadro Clínico',
                    message: `Solicitante ou equipe reportou piora significativa.`
                }
            }; 
            return newData;
        } else {
             alert("Nenhuma ocorrência Verde ou Amarela disponível para este cenário no momento.");
        }
        return current;
      });
  };

  // Functions for Unlocking
  const getLockedOccurrences = () => {
      return triagemData.filter(t => t.isLocked);
  };

  const unlockOccurrence = (id: string) => {
      setTriagemData((current) => {
          return current.map(item => {
              if (item.id === id) {
                 return { ...item, isLocked: false };
              }
              return item;
          });
      });
  };

  const clearActiveEvent = (id: string) => {
      setRegulacaoData((current) => {
          return current.map(item => {
              if (item.id === id) {
                  const newItem = { ...item };
                  delete newItem.activeEvent;
                  // If it was QTA, we might want to keep isQTA flag or clear it? 
                  // Usually user acknowledges the event, but the state might persist (e.g. Mechanical Failure -> Team removed).
                  // The prompt says "ele sumir assim que o modal for lido". So we clear the marker.
                  return newItem;
              }
              return item;
          });
      });
  };

  const updateOccurrence = (id: string, updates: Partial<RegulacaoData>) => {
    setRegulacaoData(current => 
      current.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const updateTriagemOccurrence = (id: string, updates: Partial<TriagemData>) => {
    setTriagemData(current => 
      current.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const removeTriagemOccurrence = (id: string) => {
    setTriagemData(prev => prev.filter(item => item.id !== id));
  };

  const releaseUnit = (id: string) => {
    setRegulacaoData((current) => 
        current.map(item => {
            if (item.id === id) {
                return { ...item, isUnitReleased: true, equipeId: '---', equipeTime: '--:--' };
            }
            return item;
        })
    );
  };

  const removeOccurrence = (id: string) => {
    setRegulacaoData(prev => prev.filter(item => item.id !== id));
  };

  return {
    triagemData,
    regulacaoData,
    addOccurrence,
    lockRandomOccurrence,
    cancelLastOccurrence,
    triggerEvasion,
    triggerQTA,
    findHospital,
    getLockedOccurrences,
    unlockOccurrence,
    releaseUnit,
    updateOccurrence,
    updateTriagemOccurrence,
    removeTriagemOccurrence,
    removeOccurrence,
    triggerRefusal,
    triggerMechanicalFailure,
    triggerWorsening,
    clearActiveEvent
  };
}
