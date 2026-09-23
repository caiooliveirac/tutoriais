<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Integrações de rastreamento se autenticam com
 * `Authorization: Bearer <RASTREAMENTO_TOKEN>`. Sem token configurado,
 * a API fica fechada.
 */
class TokenRastreamento
{
    public function handle(Request $request, Closure $next): Response
    {
        $esperado = config('services.rastreamento.token');

        abort_unless(
            is_string($esperado) && $esperado !== '' && hash_equals($esperado, (string) $request->bearerToken()),
            401,
            'Token de rastreamento inválido.',
        );

        return $next($request);
    }
}
