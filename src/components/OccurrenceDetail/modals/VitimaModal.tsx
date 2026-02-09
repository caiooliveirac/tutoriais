import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { HOSPITALS_SALVADOR, DECISION_OPTIONS, INTERCORRENCIA_OPTIONS } from '../constants';

export interface VitimaFormData {
    nome: string;
    nomeSocial: string;
    cpf: string;
    sexo: string;
    idade: string;
    comorbidades: string;
    pa: string;
    fc: string;
    fr: string;
    temp: string;
    spo2: string;
    hgt: string;
    glasgow: string;
    relato: string;
    decisao: string;
    hospitalDestino: string;
    intercorrenciaNaoEnvio: string;
    motivoNaoEnvio: string;
}

interface VitimaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: VitimaFormData) => void;
    initialData?: Partial<VitimaFormData>;
}

export function VitimaModal({ isOpen, onClose, onSave, initialData }: VitimaModalProps) {
    const [form, setForm] = useState<VitimaFormData>(() => ({
        nome: '',
        nomeSocial: '',
        cpf: '',
        sexo: 'MASCULINO',
        idade: '',
        comorbidades: '',
        pa: '',
        fc: '',
        fr: '',
        temp: '',
        spo2: '',
        hgt: '',
        glasgow: '',
        relato: '',
        decisao: DECISION_OPTIONS[0],
        hospitalDestino: HOSPITALS_SALVADOR[0],
        intercorrenciaNaoEnvio: INTERCORRENCIA_OPTIONS[0],
        motivoNaoEnvio: '',
        ...initialData
    }));

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Inserir Vítima">
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            
            {/* 1. DADOS PESSOAIS */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block border-b pb-1">Identificação</span> 
                <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                        <input 
                            value={form.nome} 
                            onChange={e => handleChange('nome', e.target.value)}
                            type="text" 
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900" 
                            placeholder="Nome do Paciente" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nome Social</label>
                         <input 
                            value={form.nomeSocial} 
                            onChange={e => handleChange('nomeSocial', e.target.value)}
                            type="text" 
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900" 
                            placeholder="Nome Social (opcional)" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_1fr_100px] gap-4 mb-2">
                     <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                        <input 
                            value={form.cpf} 
                            onChange={e => handleChange('cpf', e.target.value)}
                            type="text" 
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900" 
                            placeholder="000.000.000-00" 
                        />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-700 mb-1">Sexo</label>
                         <select 
                            value={form.sexo} 
                            onChange={e => handleChange('sexo', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        >
                             <option value="MASCULINO">MASCULINO</option>
                             <option value="FEMININO">FEMININO</option>
                         </select>
                     </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-700 mb-1">Idade</label>
                         <input 
                            value={form.idade} 
                            onChange={e => handleChange('idade', e.target.value)}
                            type="text" 
                            className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900" 
                            placeholder="Ex: 42" 
                        />
                     </div>
                </div>
            </div>

            {/* 2. SINAIS VITAIS */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded mb-4">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block border-b pb-1">Sinais Vitais</span> 
                 <div className="grid grid-cols-4 gap-2">
                    {[
                        { k: 'pa', l: 'PA' }, { k: 'fc', l: 'FC' }, { k: 'fr', l: 'FR' }, { k: 'temp', l: 'Temp' },
                        { k: 'spo2', l: 'SPO2' }, { k: 'hgt', l: 'HGT' }, { k: 'glasgow', l: 'Glasgow' }
                    ].map(f => (
                         <div key={f.k}>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">{f.l}</label>
                            <input 
                                value={form[f.k as keyof VitimaFormData]} 
                                onChange={e => handleChange(f.k, e.target.value)}
                                type="text" 
                                className="w-full border border-slate-300 rounded p-1 text-xs text-center font-mono text-slate-900" 
                            />
                         </div>
                    ))}
                 </div>
            </div>

            {/* 3. RELATO */}
            <label className="block text-xs font-bold text-slate-700 mb-1">Relato da Equipe (Saber)</label>
            <textarea 
                value={form.relato}
                onChange={e => handleChange('relato', e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs mb-4 min-h-[80px] text-slate-900 resize-none"
                placeholder="Descreva o quadro clínico encontrado, condutas realizadas e evolução..."
            />

            {/* 4. DECISÃO */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded mb-4">
                <div className="flex items-center gap-4 mb-4">
                    <label className="font-bold text-sm text-slate-800 shrink-0">Decisão da Equipe:</label>
                    <select 
                        value={form.decisao}
                        onChange={e => handleChange('decisao', e.target.value)} 
                        className="flex-1 border border-slate-300 rounded p-1.5 text-sm font-bold text-slate-900"
                    >
                        {DECISION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                {/* CONDITIONAL FIELDS */}
                {form.decisao === 'ENVIAR PARA UNIDADE DE SAÚDE' ? (
                     <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Unidade de Destino (Regulação)</label>
                        <select 
                             value={form.hospitalDestino}
                             onChange={e => handleChange('hospitalDestino', e.target.value)}
                             className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                        >
                            {HOSPITALS_SALVADOR.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                     </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-700 mb-1">Motivo / Justificativa</label>
                             <input 
                                value={form.motivoNaoEnvio}
                                onChange={e => handleChange('motivoNaoEnvio', e.target.value)}
                                type="text" 
                                className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900" 
                                placeholder="Digite o motivo..."
                             />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Intercorrência</label>
                             <select 
                                 value={form.intercorrenciaNaoEnvio}
                                 onChange={e => handleChange('intercorrenciaNaoEnvio', e.target.value)}
                                 className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                            >
                                {INTERCORRENCIA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-2 pt-2">
                  <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-200 bg-slate-100 rounded text-xs font-bold border border-slate-300">
                      CANCELAR
                  </button>
                  <button onClick={() => onSave(form)} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 shadow-sm font-bold text-xs uppercase tracking-wide">
                      Salvar Dados
                  </button>
            </div>

          </div>
      </Modal>
    );
}
