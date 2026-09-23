<?php

use App\Http\Controllers\Api\RastreamentoController;
use App\Http\Middleware\TokenRastreamento;
use Illuminate\Support\Facades\Route;

// Prefixo /tutoriais/api (bootstrap/app.php). Documentação: docs/API.md.
Route::prefix('v1')->middleware([TokenRastreamento::class, 'throttle:120,1'])->group(function () {
    Route::post('posicoes', [RastreamentoController::class, 'posicoes'])->name('api.posicoes');
    Route::get('estimativas', [RastreamentoController::class, 'estimativas'])->name('api.estimativas');
});
