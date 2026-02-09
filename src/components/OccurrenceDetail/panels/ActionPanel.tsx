import React, { useState } from 'react';
import { X, Search, AlertTriangle, UserPlus, CheckSquare } from 'lucide-react';
import { RegulacaoData, RiscoType } from '../../../types';
import { LigarModal } from '../modals/LigarModal';
import { VitimaModal, VitimaFormData } from '../modals/VitimaModal';
import { RecursoModal } from '../modals/RecursoModal';
import { IntercorrenciaModal } from '../modals/IntercorrenciaModal';
import { ApoioModal } from '../modals/ApoioModal';
import { InfoModal } from '../modals/InfoModal';
import { RiscoModal } from '../modals/RiscoModal';
import { DECISION_OPTIONS, HOSPITALS_SALVADOR, INTERCORRENCIA_OPTIONS } from '../constants';
import { HeaderTabs } from '../ui/HeaderTabs';
import { ActionGrid } from '../ui/ActionGrid';
import { BottomNav } from '../ui/BottomNav';

interface ActionPanelProps {
    onReleaseUnit?: () => void;
    onClose?: () => void;
    data?: RegulacaoData;
    onUpdateOccurrence?: (id: string, updates: Partial<RegulacaoData>) => void;
    onRemoveOccurrence?: (id: string) => void;
}

export function ActionPanel({ onReleaseUnit, onClose, data, onUpdateOccurrence, onRemoveOccurrence }: ActionPanelProps) {
  const [modalState, setModalState] = useState<{
      type: 'LIGAR' | 'VITIMA' | 'APOIO' | 'INFORMACOES' | 'INTERCORRENCIA' | 'RECURSO' | 'RISCO' | null;
  }>({ type: null });
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [resourceAttempts, setResourceAttempts] = useState<{
      id: number;
      hospital: string;
      obs: string;
      status: 'pending' | 'accepted' | 'refused';
  }[]>([]); 

  const [vitimaInitialData, setVitimaInitialData] = useState<Partial<VitimaFormData> | undefined>(undefined);

  const [historyLogs, setHistoryLogs] = useState<{ date: string; user: string; msg: string }[]>([]);

  const showPatientReport = data?.statusType === 'PROCURANDO_RECURSO' || data?.statusType === 'REGULADO' || data?.statusText?.includes('Regulado');

  React.useEffect(() => {
    if (data?.protocolo === '202602080673' && historyLogs.length === 0) {
        setHistoryLogs([
            {
                date: '08/02/2026 14:15:22',
                user: 'SISTEMA',
                msg: 'VAGA CONFIRMADA - HOSPITAL GERAL ROBERTO SANTOS. ACEITE: DR. ANTONIO BASTOS (COORD. EMERGÊNCIA).'
            }
        ]);
    }
  }, [data, historyLogs.length]);

  const handleLigar = () => {
      setModalState({ type: 'LIGAR' });
      setTimeout(() => {
          setModalState({ type: null });
      }, 3000);
  };

  const handleRegular = () => {
      setVitimaInitialData({
          nome: data?.paciente || '',
          nomeSocial: '', 
          cpf: '',
          sexo: data?.sexo || 'MASCULINO',
          idade: data?.idade || '',
          comorbidades: '', 
          pa: data?.sinaisVitais?.pa || '',
          fc: data?.sinaisVitais?.fc || '',
          fr: data?.sinaisVitais?.fr || '',
          temp: data?.sinaisVitais?.temp || '',
          spo2: data?.sinaisVitais?.spo2 || '',
          hgt: data?.sinaisVitais?.hgt || '',
          glasgow: data?.sinaisVitais?.glasgow || '',
          relato: data?.relatoEquipe || '',
          decisao: DECISION_OPTIONS[0],
          hospitalDestino: HOSPITALS_SALVADOR[0],
          intercorrenciaNaoEnvio: INTERCORRENCIA_OPTIONS[0],
          motivoNaoEnvio: ''
      });
      setModalState({ type: 'VITIMA' });
  };

  const handleLiberar = () => {
      if(onReleaseUnit) {
          onReleaseUnit();
          setToastMessage("Unidade liberada com sucesso!");
          setTimeout(() => setToastMessage(null), 3000);
      }
  };

  const handleSaveVitima = (formData: VitimaFormData) => {
      setModalState({ type: null });
      
      const isSending = formData.decisao === DECISION_OPTIONS[0];
      const details = isSending
        ? `REGULADO PARA: ${formData.hospitalDestino}` 
        : `NÃO REMOVIDO: ${formData.intercorrenciaNaoEnvio}`;
      
      const baseUpdates: Partial<RegulacaoData> = {
          paciente: formData.nome,
          idade: formData.idade,
          sexo: formData.sexo,
          sinaisVitais: {
              pa: formData.pa,
              fc: formData.fc,
              fr: formData.fr,
              temp: formData.temp,
              spo2: formData.spo2,
              hgt: formData.hgt,
              glasgow: formData.glasgow
          },
          relatoEquipe: formData.relato
      };

      if (isSending) {
           baseUpdates.statusType = 'REGULADO';
           baseUpdates.statusText = `Regulado para ${formData.hospitalDestino}`;
      }

      if (onUpdateOccurrence && data?.id) {
          onUpdateOccurrence(data.id, baseUpdates);
      }

      setHistoryLogs(prev => [
          ...prev, 
          { date: new Date().toLocaleTimeString(), user: 'EQUIPE NO LOCAL', msg: `PACIENTE AVALIADO. RELATO: ${formData.relato.substring(0, 50)}... (${details})` }
      ]);
      setToastMessage("Vítima inserida e dados enviados à regulação.");
      setTimeout(() => setToastMessage(null), 3000);
  };

  const saveIntercorrencia = (selectedType: string) => {
      const newLog = {
          date: new Date().toLocaleString('pt-BR'),
          user: 'SISTEMA',
          msg: `INTERCORRÊNCIA REGISTRADA: ${selectedType}`
      };
      
      const isFinishType = [
          "PACIENTE EVADIU", 
          "PACIENTE RECUSOU REMOÇÃO", 
          "PACIENTE RECUSOU ATENDIMENTO", 
          "CANCELADO PELO SOLICITANTE"
      ].includes(selectedType);

      if (isFinishType && onRemoveOccurrence && data?.id) {
           onRemoveOccurrence(data.id);
           setToastMessage("Ocorrência finalizada por intercorrência.");
      } else {
           setHistoryLogs(prev => [...prev, newLog]);
           setModalState({ type: null });
           setToastMessage("Intercorrência registrada com sucesso.");
           setTimeout(() => setToastMessage(null), 3000);
      }
  };

  const handleSaveRecurso = (data: { hospital: string; observacao: string }) => {
        const newLog = {
            date: new Date().toLocaleString('pt-BR'),
            user: 'SISTEMA',
            msg: `RECURSO CONTACTADO: ${data.hospital}. OBS: ${data.observacao.toUpperCase() || 'SEM OBSERVAÇÕES'}`
        };
        
        setHistoryLogs(prev => [...prev, newLog]);
        setResourceAttempts(prev => [
            { id: Date.now(), hospital: data.hospital, obs: data.observacao, status: 'pending' },
            ...prev
        ]);

        setModalState({ type: null });
        setToastMessage("Busca de recurso registrada.");
        setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveRisk = (newRisk: string) => {
        if (onUpdateOccurrence && data?.id) {
            onUpdateOccurrence(data.id, { risco: newRisk.toLowerCase() as RiscoType }); 
            setToastMessage(`Classificação de risco atualizada para ${newRisk}`);
        }
        setModalState({ type: null });
  };

  const handleSaveInfo = (text: string) => {
      const newLog = {
          date: new Date().toLocaleString('pt-BR'),
          user: 'USUÁRIO TREINAMENTO',
          msg: text.toUpperCase()
      };
      setHistoryLogs(prev => [...prev, newLog]);
      setModalState({ type: null });
      setToastMessage("Informações registradas no histórico.");
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmApoio = (type: string) => {
      setModalState({ type: null });
      setToastMessage(`Solicitação de apoio enviada à frota (${type})`);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResourceAction = (attemptId: number, action: 'accepted' | 'refused', hospitalName: string) => {
        setResourceAttempts(prev => prev.map(p => p.id === attemptId ? { ...p, status: action } : p));
        
        if (action === 'accepted') {
             const baseUpdates: Partial<RegulacaoData> = {
                statusType: 'REGULADO',
                statusText: `Regulado para ${hospitalName}`
             };
             if (onUpdateOccurrence && data?.id) {
                onUpdateOccurrence(data.id, baseUpdates);
                setToastMessage(`Vaga confirmada em ${hospitalName}! Status atualizado.`);
             }
        }
  };
  
  const getRiscoBall = () => {
    const map: Record<string, string> = { 
        'vermelho': 'bg-red-500', 
        'amarelo': 'bg-yellow-400', 
        'verde': 'bg-green-500'
    };
    return map[data?.risco || 'amarelo'] || 'bg-yellow-400';
  }

  return (
    <div className="bg-white h-full flex flex-col font-sans relative">
      
      {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded shadow-lg z-[60] animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              {toastMessage}
          </div>
      )}

      <HeaderTabs data={data} />
      
      <div className="flex justify-end px-4 py-2 bg-white border-b border-slate-100">
        <button 
            id="btn-intercorrencia-chamado"
            onClick={() => setModalState({ type: 'INTERCORRENCIA' })}
            className="bg-black text-white text-[10px] font-bold px-4 py-2 uppercase rounded cursor-pointer hover:bg-slate-900 transition-colors border-2 border-slate-700 shadow-sm flex items-center gap-2"
        >
            <AlertTriangle size={14} className="text-yellow-400" />    
            Intercorrência
        </button>
      </div>

      {!showPatientReport ? (
        <div className="flex-1 p-4 bg-white overflow-y-auto flex flex-col">

            <ActionGrid 
                onCall={handleLigar}
                onRelease={handleLiberar}
                onChangeUnit={() => {}} // Placeholder logic
                onInsertVictim={() => { setVitimaInitialData(undefined); setModalState({ type: 'VITIMA' }); }}
            />

            <div className="flex-1 w-full mt-4 mb-4 overflow-y-auto min-h-[120px] max-h-[200px] border border-slate-300 bg-white p-2 shadow-inner">
                {historyLogs.length === 0 && (
                    <p className="text-slate-400 text-xs italic">Nenhum registro de histórico.</p>
                )}
                <div className="space-y-1 flex flex-col font-mono text-xs text-slate-900">
                    {historyLogs.map((log, idx) => (
                        <div key={idx} className="border-b border-dotted border-slate-200 pb-1 mb-1 last:border-0">
                            <span className="font-bold mr-2 text-slate-700">[{log.date} {log.user}]:</span>
                            <span>{log.msg}</span>
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav 
              onInfo={() => setModalState({ type: 'INFORMACOES' })}
              onSupport={() => setModalState({ type: 'APOIO' })}
              onBack={() => onClose && onClose()}
            />
      </div>
      ) : (
          <div className="flex-1 p-6 bg-[#f8f9fa] overflow-y-auto font-sans text-slate-800">
             
             {/* Report content */}

             <div className="bg-white p-1 mb-4">
                 <div className="grid grid-cols-[100px_1fr_100px_1fr] gap-x-2 gap-y-1 text-xs mb-4">
                     <span className="font-bold">Nome</span>
                     <span>{data?.paciente || 'NÃO INFORMADO'}</span>
                     <span className="font-bold text-right pr-2">Sexo</span>
                     <span>{data?.sexo && data.sexo.substring(0,1) || 'M'}</span>

                     <span className="font-bold">Nome Social</span>
                     <span>-</span>
                     <span className="font-bold text-right pr-2">Idade</span>
                     <span>{data?.idade || '42 anos'}</span>

                     <span></span>
                     <span></span>
                     <span className="font-bold text-right pr-2">CPF</span>
                     <span>-</span>
                 </div>

                 <div className="grid grid-cols-8 gap-2 bg-slate-50 p-2 border border-slate-100 mb-6 text-center">
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">Pressão Sistólica (mmhg)</span>
                         <span className="text-sm">{data?.sinaisVitais?.pa?.split('x')[0] || '120'}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">Pressão Diastólica (mmhg)</span>
                         <span className="text-sm">{data?.sinaisVitais?.pa?.split('x')[1] || '80'}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">Pulso (bpm)</span>
                         <span className="text-sm">{data?.sinaisVitais?.fc || '80'}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">FR (bpm)</span>
                         <span className="text-sm">{data?.sinaisVitais?.fr || '16'}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">TEMP (°c)</span>
                         <span className="text-sm">{data?.sinaisVitais?.temp || '36.5'}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">SPO: (%)</span>
                         <span className="text-sm">{data?.sinaisVitais?.spo2 || '98'}</span>
                     </div>
                     <div className="flex flex-col">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">HGT (g/dl)</span>
                         <span className="text-sm">{data?.sinaisVitais?.hgt || '90'}</span>
                     </div>
                     <div className="flex flex-col" id="glasgow-cell">
                         <span className="text-[10px] font-bold leading-tight h-8 flex items-center justify-center">Glasgow</span>
                         <span className="text-sm font-bold bg-yellow-100 rounded px-1">{data?.sinaisVitais?.glasgow || '15'}</span>
                     </div>
                 </div>

                 <div className="mb-4">
                     <span className="font-bold text-xs block mb-1">RELATO:</span>
                     <div className="text-[11px] leading-snug uppercase text-slate-700 bg-slate-50 p-2 border border-slate-100">
                        {data?.relatoEquipe || data?.hma || 'EQUIPE NO LOCAL RELATA QUE ENCONTROU PACIENTE CONSCIENTE E ORIENTADO. MANTÉM QUADRO ESTÁVEL.'}
                     </div>
                 </div>

                 <div className="grid grid-cols-4 gap-4 text-[11px] mb-6">
                     <div>
                         <span className="block font-bold">TIPO DE OCORRÊNCIA:</span>
                         <span>Clínico</span>
                     </div>
                     <div>
                         <span className="block font-bold">MOTIVO:</span>
                         <span>{data?.queixa || 'Mal Súbito'}</span>
                     </div>
                     <div>
                         <span className="block font-bold">DETALHAMENTO:</span>
                         <span>-</span>
                     </div>
                     <div>
                         <span className="block font-bold">CLASSIFICAÇÃO DE RISCO:</span>
                         <div className="flex items-center gap-1">
                             <div className={`w-3 h-3 rounded-full ${getRiscoBall()}`}></div>
                             <span>{data?.risco || 'Amarelo'}</span>
                         </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 text-[11px] mb-6">
                     <div>
                         <span className="block font-bold">DECISÃO MÉDICA:</span>
                         {data?.statusText?.includes('Regulado') ? (
                             <span>Regulado para {data?.statusText?.split('para')[1] || 'Unidade Hospitalar'}</span>
                         ) : (
                             <span>Aguardando Recurso / Regulação</span>
                         )}
                     </div>
                     <div>
                         <span className="block font-bold">HOSPITAL DE DESTINO:</span>
                         <span>{data?.statusText?.includes('Regulado') ? (data?.statusText?.split('para ')[1]?.split('(')[0] || 'A DEFINIR') : 'A DEFINIR'}</span>
                     </div>
                 </div>
                 
                 {data?.statusType === 'PROCURANDO_RECURSO' && (
                    <div className="flex flex-col mb-6">
                        
                        {resourceAttempts.length > 0 && (
                            <div className="flex flex-col gap-2 mb-3">
                                {resourceAttempts.map(attempt => (
                                    <div key={attempt.id} className="bg-blue-50 border border-blue-200 rounded p-2 text-xs flex justify-between items-center group shadow-sm transition-all">
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800">{attempt.hospital}</div>
                                            <div className="text-slate-500 italic max-w-[300px] truncate" title={attempt.obs}>{attempt.obs || 'Sem observações'}</div>
                                        </div>
                                        <div className="flex gap-2 items-center pl-4 border-l border-blue-100 ml-2">
                                            {attempt.status === 'pending' ? (
                                                <>
                                                    <button 
                                                        onClick={() => handleResourceAction(attempt.id, 'refused', attempt.hospital)}
                                                        className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm transition-colors"
                                                        title="Negada"
                                                    >
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleResourceAction(attempt.id, 'accepted', attempt.hospital)}
                                                        className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded flex items-center justify-center text-white font-bold text-[10px] shadow-sm transition-colors"
                                                        title="Aceitou"
                                                    >
                                                        <CheckSquare size={12} strokeWidth={3} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${attempt.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {attempt.status === 'accepted' ? 'ACEITO' : 'NEGADO'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-center items-center gap-2">
                            <button 
                                onClick={() => setModalState({ type: 'RECURSO' })}
                                className="bg-black hover:bg-zinc-800 text-white text-[10px] font-bold py-2 px-3 rounded shadow transition-all flex items-center justify-center gap-1.5 w-[140px]"
                            >
                                <Search size={14} />
                                <span className="leading-tight">PROCURAR RECURSO</span>
                            </button>

                            <button 
                                onClick={() => setModalState({ type: 'INTERCORRENCIA' })}
                                className="bg-black hover:bg-zinc-800 text-white text-[10px] font-bold py-2 px-3 rounded shadow transition-all flex items-center justify-center gap-1.5 w-[140px]"
                            >
                                <AlertTriangle size={14} />
                                <span>INTERCORRÊNCIAS</span>
                            </button>

                            <button 
                                onClick={handleRegular}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold py-2 px-3 rounded shadow transition-all flex items-center justify-center gap-1.5 animate-pulse w-[140px]"
                            >
                                <UserPlus size={14} />
                                <span>REGULAR</span>
                            </button>
                        </div>
                    </div>
                 )}

                                 <BottomNav 
                                     onInfo={() => setModalState({ type: 'INFORMACOES' })}
                                     onSupport={() => setModalState({ type: 'APOIO' })}
                                     onRisk={() => setModalState({ type: 'RISCO' })}
                                     onBack={() => onClose && onClose()}
                                 />

          </div>
        </div>
      )}

      
      <LigarModal 
        isOpen={modalState.type === 'LIGAR'} 
        onClose={() => setModalState({ type: null })} 
      />

      <VitimaModal
        key={modalState.type === 'VITIMA' ? 'opened' : 'closed'}
        isOpen={modalState.type === 'VITIMA'}
        onClose={() => setModalState({ type: null })}
        onSave={handleSaveVitima}
        initialData={vitimaInitialData}
      />

      <ApoioModal 
        isOpen={modalState.type === 'APOIO'}
        onClose={() => setModalState({ type: null })}
        onConfirm={handleConfirmApoio}
      />

      <IntercorrenciaModal
        isOpen={modalState.type === 'INTERCORRENCIA'}
        onClose={() => setModalState({ type: null })}
        onSave={saveIntercorrencia}
      />

      <InfoModal
        isOpen={modalState.type === 'INFORMACOES'}
        onClose={() => setModalState({ type: null })}
        onSave={handleSaveInfo}
      />

      <RecursoModal
        isOpen={modalState.type === 'RECURSO'}
        onClose={() => setModalState({ type: null })}
        onSave={handleSaveRecurso}
      />

      <RiscoModal
        isOpen={modalState.type === 'RISCO'}
        onClose={() => setModalState({ type: null })}
        onSave={handleSaveRisk}
        currentRisk={data?.risco}
      />

    </div>
  );
}
