<?php

use App\Enums\Area;
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
    });

    require __DIR__.'/settings.php';
});
