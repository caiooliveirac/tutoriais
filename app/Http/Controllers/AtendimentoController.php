<?php

namespace App\Http\Controllers;

use App\Actions\Ocorrencia\AbrirOcorrencia;
use App\Http\Requests\AbrirOcorrenciaRequest;
use App\Models\User;
use App\Services\EstimativaChegada;
use App\Services\Mapas\Localizador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

/**
 * Apoio à tela do TARM: achar o local mesmo com endereço mal digitado,
 * conferir pelo que há em volta, estimar a chegada e abrir o chamado.
 */
class AtendimentoController extends Controller
{
    private const COORDENADAS = [
        'lat' => ['required', 'numeric', 'between:-13.2,-12.6'],
        'lng' => ['required', 'numeric', 'between:-38.8,-38.1'],
    ];

    public function sugerir(Request $request, Localizador $localizador): JsonResponse
    {
        $dados = $request->validate([
            'q' => ['required', 'string', 'min:3', 'max:200'],
            'sessao' => ['nullable', 'string', 'max:64'],
        ]);

        return $this->ouAviso(fn () => $localizador->sugerir($dados['q'], $dados['sessao'] ?? ''), 'Busca de endereço indisponível; marque o local no mapa.');
    }

    public function lugar(Request $request, Localizador $localizador): JsonResponse
    {
        $dados = $request->validate([
            'id' => ['required', 'string', 'max:300'],
            'sessao' => ['nullable', 'string', 'max:64'],
        ]);

        return $this->ouAviso(fn () => $localizador->lugar($dados['id'], $dados['sessao'] ?? ''), 'Não foi possível abrir esse endereço; marque o local no mapa.');
    }

    public function arredores(Request $request, Localizador $localizador): JsonResponse
    {
        $dados = $request->validate(self::COORDENADAS);

        return response()->json($localizador->arredores((float) $dados['lat'], (float) $dados['lng']));
    }

    public function ruas(Request $request, Localizador $localizador): JsonResponse
    {
        $dados = $request->validate(self::COORDENADAS);

        return $this->ouAviso(fn () => $localizador->ruas((float) $dados['lat'], (float) $dados['lng']), 'Ruas próximas indisponíveis (servidor de mapas lento). Tente de novo em instantes.');
    }

    public function referencia(Request $request, Localizador $localizador): JsonResponse
    {
        $dados = $request->validate([
            'q' => ['required', 'string', 'min:3', 'max:200'],
            'lat' => ['nullable', 'numeric', 'between:-13.2,-12.6'],
            'lng' => ['nullable', 'numeric', 'between:-38.8,-38.1'],
        ]);

        return $this->ouAviso(
            fn () => $localizador->buscarReferencia($dados['q'], isset($dados['lat']) ? (float) $dados['lat'] : null, isset($dados['lng']) ? (float) $dados['lng'] : null),
            'Busca de referência indisponível.',
        );
    }

    public function bairros(Request $request, Localizador $localizador): JsonResponse
    {
        $dados = $request->validate(['q' => ['required', 'string', 'min:2', 'max:80']]);

        return response()->json($localizador->bairrosParecidos($dados['q']));
    }

    public function estimativas(Request $request, EstimativaChegada $estimativa): JsonResponse
    {
        $dados = $request->validate(self::COORDENADAS);

        return response()->json($estimativa->ate((float) $dados['lat'], (float) $dados['lng']));
    }

    public function store(AbrirOcorrenciaRequest $request, AbrirOcorrencia $abrir): RedirectResponse
    {
        /** @var User $tarm */
        $tarm = $request->user();
        $ocorrencia = $abrir->executar($tarm, $request->validated(), $request->ip());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Ocorrência {$ocorrencia->protocolo} aberta."]);

        return back();
    }

    private function ouAviso(callable $busca, string $aviso): JsonResponse
    {
        try {
            return response()->json($busca());
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => $aviso], 503);
        }
    }
}
