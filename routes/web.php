<?php

use App\Enums\Area;
use App\Http\Controllers\AtendimentoController;
use App\Http\Controllers\PainelController;
use Illuminate\Support\Facades\Route;

// O app vive em mnrs.com.br/tutoriais: todas as rotas carregam o prefixo,
// para que as URLs geradas (inclusive pelo Wayfinder) já saiam corretas.
Route::prefix('tutoriais')->group(function () {
    Route::get('/', fn () => to_route('dashboard'))->name('home');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');

        foreach (Area::cases() as $area) {
            Route::get($area->value, PainelController::class)
                ->defaults('area', $area->value)
                ->middleware("area:{$area->value}")
                ->name("area.{$area->value}");
        }

        Route::middleware('area:atendimento')->prefix('atendimento')->name('atendimento.')->group(function () {
            Route::middleware('throttle:180,1')->group(function () {
                Route::get('sugerir', [AtendimentoController::class, 'sugerir'])->name('sugerir');
                Route::get('lugar', [AtendimentoController::class, 'lugar'])->name('lugar');
                Route::get('arredores', [AtendimentoController::class, 'arredores'])->name('arredores');
                Route::get('referencia', [AtendimentoController::class, 'referencia'])->name('referencia');
                Route::get('bairros', [AtendimentoController::class, 'bairros'])->name('bairros');
                Route::get('estimativas', [AtendimentoController::class, 'estimativas'])->name('estimativas');
            });
            Route::post('ocorrencias', [AtendimentoController::class, 'store'])->name('ocorrencias.store');
        });
    });

    require __DIR__.'/settings.php';
});
