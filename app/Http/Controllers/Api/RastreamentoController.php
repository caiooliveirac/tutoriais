<?php

namespace App\Http\Controllers\Api;

use App\Enums\TipoRecurso;
use App\Http\Controllers\Controller;
use App\Models\Unidade;
use App\Services\EstimativaChegada;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * API para sistemas externos (AVL/GPS das viaturas). Documentação: docs/API.md.
 */
class RastreamentoController extends Controller
{
    /**
     * POST /tutoriais/api/v1/posicoes — lote de posições das unidades.
     */
    public function posicoes(Request $request): JsonResponse
    {
        $dados = $request->validate([
            'posicoes' => ['required', 'array', 'min:1', 'max:500'],
            'posicoes.*.codigo' => ['required', 'string', 'exists:unidades,codigo'],
            'posicoes.*.lat' => ['required', 'numeric', 'between:-90,90'],
            'posicoes.*.lng' => ['required', 'numeric', 'between:-180,180'],
            'posicoes.*.registrada_em' => ['nullable', 'date'],
        ]);

        $atualizadas = 0;
        foreach ($dados['posicoes'] as $p) {
            $quando = isset($p['registrada_em']) ? Carbon::parse($p['registrada_em']) : now();

            // Ignora posição mais antiga que a já gravada (lotes fora de ordem).
            $atualizadas += Unidade::where('codigo', $p['codigo'])
                ->where(fn ($q) => $q->whereNull('posicao_em')->orWhere('posicao_em', '<', $quando))
                ->update(['lat' => $p['lat'], 'lng' => $p['lng'], 'posicao_em' => $quando]);
        }

        return response()->json(['recebidas' => count($dados['posicoes']), 'atualizadas' => $atualizadas]);
    }

    /**
     * GET /tutoriais/api/v1/estimativas?lat=&lng=&tipo= — quem chega primeiro.
     */
    public function estimativas(Request $request, EstimativaChegada $estimativa): JsonResponse
    {
        $dados = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'tipo' => ['nullable', Rule::enum(TipoRecurso::class)],
        ]);

        return response()->json($estimativa->ate(
            (float) $dados['lat'],
            (float) $dados['lng'],
            isset($dados['tipo']) ? TipoRecurso::from($dados['tipo']) : null,
        ));
    }
}
