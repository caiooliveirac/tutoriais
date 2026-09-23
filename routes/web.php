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
            Route::get('geocodificar', [AtendimentoController::class, 'geocodificar'])
                ->middleware('throttle:60,1')->name('geocodificar');
            Route::get('estimativas', [AtendimentoController::class, 'estimativas'])
                ->middleware('throttle:60,1')->name('estimativas');
            Route::post('ocorrencias', [AtendimentoController::class, 'store'])->name('ocorrencias.store');
        });
    });

    require __DIR__.'/settings.php';
});
