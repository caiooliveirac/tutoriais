<?php

namespace App\Http\Resources;

use App\Models\Ocorrencia;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Uma linha das tabelas do painel. Horários já no fuso da central.
 *
 * @mixin Ocorrencia
 */
class LinhaOcorrencia extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'protocolo' => $this->protocolo,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'data' => $this->local($this->aberta_em, 'd/m'),
            'hora' => $this->local($this->aberta_em, 'H:i:s'),
            'telefone' => $this->telefone,
            'solicitante' => $this->solicitante,
            'cidade' => $this->cidade,
            'bairro' => $this->bairro,
            'queixa' => $this->queixa,
            'tarm' => $this->tarm->name,
            'medico' => $this->medico?->name,
            'risco' => $this->risco?->value,
            'decisao_medica' => $this->decisao_medica,
            'tipo_recurso' => $this->tipo_recurso?->label(),
            'solicitado_envio_hora' => $this->local($this->solicitado_envio_em, 'H:i'),
            'unidade' => $this->unidade?->codigo,
            'despachada_hora' => $this->local($this->despachada_em, 'H:i'),
            'despachante' => $this->despachante?->name,
            'unidade_desvinculada' => $this->unidade_desvinculada,
            'hospital' => $this->hospital->sigla ?? $this->hospital?->nome,
            'intercorrencia' => $this->intercorrencia?->titulo(),
            'travada_por' => $this->travadaPor?->name,
        ];
    }

    private function local(?CarbonInterface $momento, string $formato): ?string
    {
        return $momento?->setTimezone('America/Bahia')->format($formato);
    }
}
