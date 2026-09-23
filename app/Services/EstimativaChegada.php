<?php

namespace App\Services;

use App\Enums\StatusOcorrencia;
use App\Enums\TipoRecurso;
use App\Models\Base;
use App\Models\Ocorrencia;
use App\Models\Unidade;
use Illuminate\Support\Collection;

/**
 * Quem chega primeiro a um ponto: tempo de cada base e ranking das unidades
 * livres. Unidade com posição recente (API de rastreamento) sai de onde está;
 * sem posição, sai da base.
 */
class EstimativaChegada
{
    public function __construct(private Roteamento $roteamento) {}

    /**
     * @return array{
     *     fonte: string,
     *     bases: list<array{nome: string, lat: float, lng: float, minutos: int, km: float, livres: list<string>}>,
     *     unidades: list<array{codigo: string, tipo: string, base: string, origem: string, lat: float, lng: float, minutos: int, km: float}>
     * }
     */
    public function ate(float $lat, float $lng, ?TipoRecurso $tipo = null): array
    {
        $bases = Base::orderBy('nome')->get();
        $livres = $this->unidadesLivres($tipo);
        $emMovimento = $livres->filter(fn (Unidade $u) => $u->temPosicaoRecente())->values();

        $origens = [
            ...$bases->map(fn (Base $b) => [$b->lat, $b->lng])->all(),
            ...$emMovimento->map(fn (Unidade $u) => [(float) $u->lat, (float) $u->lng])->all(),
        ];
        $rota = $this->roteamento->ate($origens, [$lat, $lng]);
        $trechos = $rota['trechos'];

        $porBase = [];
        foreach ($bases->values() as $i => $base) {
            $porBase[$base->id] = $trechos[$i];
        }
        $porUnidade = [];
        foreach ($emMovimento as $i => $unidade) {
            $porUnidade[$unidade->id] = $trechos[$bases->count() + $i];
        }

        $unidades = $livres->filter(fn (Unidade $u) => $u->base !== null)
            ->map(function (Unidade $u) use ($porBase, $porUnidade) {
                $naRua = isset($porUnidade[$u->id]);
                $trecho = $naRua ? $porUnidade[$u->id] : $porBase[$u->base->id];

                return [
                    'codigo' => $u->codigo,
                    'tipo' => $u->tipo->label(),
                    'base' => $u->base->nome,
                    'origem' => $naRua ? 'posicao' : 'base',
                    'lat' => $naRua ? (float) $u->lat : $u->base->lat,
                    'lng' => $naRua ? (float) $u->lng : $u->base->lng,
                    ...$this->formatar($trecho),
                ];
            })
            ->sortBy('minutos')->values()->all();

        $bases = $bases->map(fn (Base $b) => [
            'nome' => $b->nome,
            'lat' => $b->lat,
            'lng' => $b->lng,
            ...$this->formatar($porBase[$b->id]),
            'livres' => array_values($livres->where('base_id', $b->id)->map(fn (Unidade $u) => $u->codigo)->all()),
        ])->sortBy('minutos')->values()->all();

        return [
            'fonte' => $rota['fonte'],
            'bases' => array_values($bases),
            'unidades' => array_values($unidades),
        ];
    }

    /**
     * Livre = não baixada e sem ocorrência em andamento (ou desvinculada dela).
     *
     * @return Collection<int, Unidade>
     */
    private function unidadesLivres(?TipoRecurso $tipo): Collection
    {
        $empenhadas = Ocorrencia::whereIn('status', StatusOcorrencia::regulacao())
            ->where('unidade_desvinculada', false)
            ->whereNotNull('unidade_id')
            ->pluck('unidade_id');

        return Unidade::with('base')
            ->where('baixada', false)
            ->whereNotIn('id', $empenhadas)
            ->when($tipo, fn ($q) => $q->where('tipo', $tipo))
            ->get();
    }

    /**
     * @param  array{segundos: float, metros: float}  $trecho
     * @return array{minutos: int, km: float}
     */
    private function formatar(array $trecho): array
    {
        return [
            'minutos' => (int) ceil($trecho['segundos'] / 60),
            'km' => round($trecho['metros'] / 1000, 1),
        ];
    }
}
