import React, { useEffect, useMemo, useState } from 'react';
import { TriagemData } from '../../types';

interface TriagemPanelProps {
  data: TriagemData;
  onSave: (payload: { hma: string; tipoOcorrencia: string; motivo: string; detalhamento: string; risco: TriagemData['risco']; decisaoMedica: string; unidadeSolicitada: string }) => void;
  onBack: () => void;
}

export function TriagemPanel({ data, onSave, onBack }: TriagemPanelProps) {
  const tipos = ['CLÍNICO', 'CAUSAS EXTERNAS', 'GINECO/OBSTÉTRICO', 'PEDIÁTRICO', 'CIRÚRGICO', 'TRANSFERÊNCIAS'];

  const motivosPorTipo: Record<string, string[]> = useMemo(() => ({
    'CLÍNICO': ['DOR TORÁCICA', 'DISPNEIA', 'MAL SÚBITO', 'SÍNCOPE', 'CRISE CONVULSIVA'],
    'CAUSAS EXTERNAS': ['ACIDENTE DE TRÂNSITO', 'QUEDA', 'AGRESSÃO', 'ACIDENTE DE TRABALHO', 'QUEIMADURA'],
    'GINECO/OBSTÉTRICO': ['TRABALHO DE PARTO', 'SANGRAMENTO', 'DOR PÉLVICA', 'HIPERTENSÃO GESTACIONAL'],
    'PEDIÁTRICO': ['FEBRE', 'DIFICULDADE RESPIRATÓRIA', 'TRAUMA', 'VÔMITOS'],
    'CIRÚRGICO': ['ABDOME AGUDO', 'HÉRNIA ENCARCERADA', 'COLECISTITE', 'OBSTRUÇÃO INTESTINAL'],
    'TRANSFERÊNCIAS': ['TRANSFERÊNCIA INTER-HOSPITALAR', 'LEITO UTI', 'REGULAÇÃO DE VAGA']
  }), []);

  const [tipoOcorrencia, setTipoOcorrencia] = useState('');
  const [motivo, setMotivo] = useState('');
  const [detalhamento, setDetalhamento] = useState('');
  const [risco, setRisco] = useState<TriagemData['risco']>('neutro');
  const [hma, setHma] = useState('');
  const [decisaoMedica, setDecisaoMedica] = useState('');
  const [unidadesDisponiveis, setUnidadesDisponiveis] = useState<string[]>(["USA - UNIDADE DE SUPORTE AVANÇADO", "USB - UNIDADE DE SUPORTE BÁSICO", "MOTOLÂNCIA", "HELICÓPTERO", "VIR - VEÍCULO DE INTERVENÇÃO RÁPIDA", "AMBULANCHA"]);
  const [unidadeSelecionada, setUnidadeSelecionada] = useState('');

  useEffect(() => {
    setTipoOcorrencia(data.tipoOcorrencia || '');
    setMotivo(data.motivo || '');
    setDetalhamento(data.detalhamento || '');
    setRisco(data.risco || 'neutro');
    setHma(data.hma || '');
    setDecisaoMedica(data.decisaoMedica || '');
    setUnidadeSelecionada(data.unidadeSolicitada || '');
  }, [data]);

  useEffect(() => {
    if (tipoOcorrencia && motivo && !motivosPorTipo[tipoOcorrencia]?.includes(motivo)) {
      setMotivo('');
    }
  }, [tipoOcorrencia, motivo, motivosPorTipo]);

  const statusLabel = data.statusBadge === 'SOLICITADO_ENVIO'
    ? `SOLICITADO ENVIO ${data.solicitadoHora ? `• ${data.solicitadoHora}` : ''}`
    : 'AGUARDANDO TRIAGEM';

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700 uppercase">Preenchimento de HMA</div>
        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${data.statusBadge === 'SOLICITADO_ENVIO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipo de ocorrência</label>
            <select
              id="tipo-ocorrencia-select"
              value={tipoOcorrencia}
              onChange={(e) => setTipoOcorrencia(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
            >
              <option value="">Selecione</option>
              {tipos.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Motivo</label>
            <select
              id="motivo-select"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
              disabled={!tipoOcorrencia}
            >
              <option value="">Selecione</option>
              {(motivosPorTipo[tipoOcorrencia] || []).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Detalhamento</label>
            <select
              value={detalhamento}
              onChange={(e) => setDetalhamento(e.target.value)}
              className="w-full border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
            >
              <option value="">(Opcional)</option>
              <option value="SEM DETALHAMENTO">SEM DETALHAMENTO</option>
              <option value="COMORBIDADES">COMORBIDADES</option>
              <option value="USO DE MEDICAÇÃO">USO DE MEDICAÇÃO</option>
              <option value="EQUIPE SOLICITA APOIO">EQUIPE SOLICITA APOIO</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Classificação de risco</label>
            <div className="flex items-center gap-2" id="risk-classifier">
              <div className={`w-3 h-3 rounded-full border border-black/20 ${
                risco === 'vermelho' ? 'bg-red-500' :
                risco === 'amarelo' ? 'bg-yellow-400' :
                risco === 'verde' ? 'bg-green-500' :
                risco === 'azul' ? 'bg-blue-500' :
                risco === 'preto' ? 'bg-black' :
                risco === 'hora_marcada' ? 'bg-sky-300' :
                'bg-slate-300'
              }`} />
              <select
                value={risco}
                onChange={(e) => setRisco(e.target.value as TriagemData['risco'])}
                className="flex-1 border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
              >
                <option value="azul">Azul</option>
                <option value="verde">Verde</option>
                <option value="amarelo">Amarelo</option>
                <option value="vermelho">Vermelho</option>
                <option value="preto">Preto</option>
                <option value="hora_marcada">Hora Marcada</option>
              </select>
            </div>
          </div>
        </div>

        <label className="block text-xs font-bold text-slate-700 mb-1">HMA / Histórico da Moléstia Atual</label>
        <textarea
          id="hma-textarea"
          value={hma}
          onChange={(e) => setHma(e.target.value)}
          rows={10}
          className="w-full border border-slate-300 rounded p-3 text-[11px] uppercase text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
          placeholder="Descreva o histórico da ocorrência..."
        />
        <p className="text-[10px] text-slate-500 mt-2">
          Use um texto objetivo com o que foi colhido pelo TARM.
        </p>

        <div className="mt-4">
          <label className="block text-[11px] font-bold text-slate-700 mb-1">Decisão médica</label>
          <select
            id="decisao-medica-select"
            value={decisaoMedica}
            onChange={(e) => setDecisaoMedica(e.target.value)}
            className="w-full border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
          >
            <option value="">Selecione</option>
            <option value="ENVIO DE UNIDADE MÓVEL">ENVIO DE UNIDADE MÓVEL</option>
            <option value="ORIENTAÇÃO MÉDICA">ORIENTAÇÃO MÉDICA</option>
            <option value="ORIENTO IDA PARA UNIDADE DE EMERGÊNCIA POR MEIOS PRÓPRIOS">ORIENTO IDA PARA UNIDADE DE EMERGÊNCIA POR MEIOS PRÓPRIOS</option>
            <option value="3 OU MAIS TENTATIVAS DE CONTATO SEM RETORNO">3 OU MAIS TENTATIVAS DE CONTATO SEM RETORNO</option>
            <option value="CANCELADO PELO SOLICITANTE">CANCELADO PELO SOLICITANTE</option>
            <option value="RECUSA DE ATENDIMENTO DURANTE A REGULAÇÃO">RECUSA DE ATENDIMENTO DURANTE A REGULAÇÃO</option>
            <option value="REMOVIDO POR TERCEIROS">REMOVIDO POR TERCEIROS</option>
            <option value="PACIENTE EVADIU-SE DO LOCAL">PACIENTE EVADIU-SE DO LOCAL</option>
            <option value="APOIO NÃO PERTINENTE">APOIO NÃO PERTINENTE</option>
            <option value="REGULAÇÃO VIA CER">REGULAÇÃO VIA CER</option>
          </select>
        </div>

        {decisaoMedica === 'ENVIO DE UNIDADE MÓVEL' && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Unidades disponíveis</label>
              <select
                size={6}
                className="w-full border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
                onDoubleClick={(e) => {
                  const value = (e.target as HTMLOptionElement).value;
                  if (!value) return;
                  setUnidadesDisponiveis((prev) => prev.filter(u => u !== value));
                  setUnidadeSelecionada(value);
                }}
              >
                {unidadesDisponiveis.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Dê duplo clique para selecionar.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Unidade solicitada</label>
              <select
                size={6}
                className="w-full border border-slate-300 rounded px-2 py-2 text-[11px] uppercase text-slate-700 bg-white"
                onDoubleClick={() => {
                  if (!unidadeSelecionada) return;
                  setUnidadesDisponiveis((prev) => [unidadeSelecionada, ...prev]);
                  setUnidadeSelecionada('');
                }}
              >
                {unidadeSelecionada ? (
                  <option value={unidadeSelecionada}>{unidadeSelecionada}</option>
                ) : (
                  <option value="">(vazio)</option>
                )}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Duplo clique para remover.</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between">
        <button
          onClick={onBack}
          className="bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2 rounded border border-slate-300 uppercase"
        >
          Voltar
        </button>
        <button
          id="btn-inserir-informacoes"
          onClick={() => onSave({ hma, tipoOcorrencia, motivo, detalhamento, risco, decisaoMedica, unidadeSolicitada: unidadeSelecionada })}
          className="bg-[#1e2a4a] hover:bg-[#151d33] text-white text-xs font-bold px-4 py-2 rounded shadow-sm border-b-2 border-[#0f1526] uppercase"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}
