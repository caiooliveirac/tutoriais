<?php

namespace App\Http\Controllers;

use App\Enums\Area;
use App\Enums\StatusOcorrencia;
use App\Http\Resources\LinhaOcorrencia;
use App\Models\Ocorrencia;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * Telas de cada área: montam as tabelas de ocorrências que a área enxerga.
 */
class PainelController extends Controller
{
    public function __invoke(Request $request, string $area): Response
    {
        $area = Area::from($area);

        $tabelas = match ($area) {
            Area::Atendimento => ['chamados'],
            Area::Triagem => ['triagem', 'regulacao'],
            Area::Despacho => ['despacho', 'regulacao'],
            Area::Plantao => ['triagem', 'despacho', 'regulacao', 'encerradas'],
            Area::Bi => [],
        };

        return Inertia::render('area', [
            'slug' => $area->value,
            'titulo' => $area->label(),
            'tabelas' => collect($tabelas)->mapWithKeys(fn (string $tabela) => [
                $tabela => LinhaOcorrencia::collection($this->consulta($tabela, $request)->get())->resolve(),
            ]),
        ]);
    }

    /**
     * @return Builder<Ocorrencia>
     */
    private function consulta(string $tabela, Request $request): Builder
    {
        $query = Ocorrencia::query()->with(['tarm', 'medico', 'unidade', 'hospital', 'travadaPor']);

        return match ($tabela) {
            'chamados' => $query->where('tarm_id', $request->user()->id)
                ->where('aberta_em', '>=', now()->subHours(12))
                ->latest('aberta_em'),
            'triagem' => $query->whereIn('status', StatusOcorrencia::triagem())
                ->latest('aberta_em'),
            // fila de despacho: mais grave primeiro, depois quem espera há mais tempo
            'despacho' => $query->where('status', StatusOcorrencia::SolicitadoEnvio)
                ->orderByRaw("FIELD(risco, 'vermelho', 'amarelo', 'verde', 'azul', 'hora_marcada', 'preto')")
                ->oldest('solicitado_envio_em'),
            'regulacao' => $query->whereIn('status', StatusOcorrencia::regulacao())
                ->latest('aberta_em'),
            'encerradas' => $query->whereIn('status', [StatusOcorrencia::Finalizada, StatusOcorrencia::EncerradoSemEnvio, StatusOcorrencia::Cancelado])
                ->where('aberta_em', '>=', now()->subHours(12))
                ->latest('aberta_em'),
            default => throw new InvalidArgumentException("Tabela desconhecida: {$tabela}"),
        };
    }
}
