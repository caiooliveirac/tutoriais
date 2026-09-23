<?php

namespace App\Http\Controllers;

use App\Actions\Ocorrencia\AbrirOcorrencia;
use App\Http\Requests\AbrirOcorrenciaRequest;
use App\Models\User;
use App\Services\EstimativaChegada;
use App\Services\Geocodificador;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Throwable;

/**
 * Apoio à tela do TARM: busca de endereço, estimativa de chegada e abertura.
 */
class AtendimentoController extends Controller
{
    public function geocodificar(Request $request, Geocodificador $geocodificador): JsonResponse
    {
        $request->validate(['q' => ['required', 'string', 'min:4', 'max:200']]);

        try {
            return response()->json($geocodificador->buscar($request->string('q')->toString()));
        } catch (Throwable) {
            return response()->json(['message' => 'Busca de endereço indisponível; marque o local no mapa.'], 503);
        }
    }

    public function estimativas(Request $request, EstimativaChegada $estimativa): JsonResponse
    {
        $dados = $request->validate([
            'lat' => ['required', 'numeric', 'between:-13.2,-12.6'],
            'lng' => ['required', 'numeric', 'between:-38.8,-38.1'],
        ]);

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
}
