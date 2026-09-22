<?php

namespace App\Http\Middleware;

use App\Enums\Area;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasArea
{
    public function handle(Request $request, Closure $next, string $area): Response
    {
        abort_unless($request->user()?->temArea(Area::from($area)), 403);

        return $next($request);
    }
}
