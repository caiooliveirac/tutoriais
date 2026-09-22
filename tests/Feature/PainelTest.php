<?php

use App\Enums\StatusOcorrencia;
use App\Models\EventoOcorrencia;
use App\Models\Ocorrencia;
use App\Models\User;
use Database\Seeders\LabSeeder;
use Illuminate\Database\QueryException;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(fn () => $this->seed(LabSeeder::class));

test('plantão LAB cobre todas as etapas da ocorrência', function () {
    foreach (StatusOcorrencia::cases() as $status) {
        expect(Ocorrencia::where('status', $status)->exists())->toBeTrue("sem ocorrência em {$status->value}");
    }
    expect(Ocorrencia::whereNotNull('intercorrencia')->count())->toBe(5)
        ->and(Ocorrencia::whereNotNull('travada_por')->count())->toBe(1);
});

test('despacho lista as solicitações com a mais grave primeiro', function () {
    $enf = User::where('email', 'enf@samu.test')->first();

    $this->actingAs($enf)->get('/tutoriais/despacho')
        ->assertInertia(fn (Assert $page) => $page
            ->component('area')
            ->has('tabelas.despacho', 5)
            ->where('tabelas.despacho.0.risco', 'vermelho')
            ->where('tabelas.despacho.4.risco', 'verde')
            ->has('tabelas.regulacao'));
});

test('tarm vê só os próprios chamados', function () {
    $tarm = User::where('email', 'tarm@samu.test')->first();

    $this->actingAs($tarm)->get('/tutoriais/atendimento')
        ->assertInertia(fn (Assert $page) => $page
            ->has('tabelas.chamados', Ocorrencia::where('tarm_id', $tarm->id)->where('aberta_em', '>=', now()->subHours(12))->count()));
});

test('eventos da ocorrência não aceitam alteração nem exclusão', function () {
    $evento = EventoOcorrencia::first();

    expect(fn () => $evento->update(['descricao' => 'adulterado']))->toThrow(QueryException::class)
        ->and(fn () => $evento->delete())->toThrow(QueryException::class);
});

test('LabSeeder se recusa a rodar em produção', function () {
    $this->app['env'] = 'production';

    expect(fn () => app(LabSeeder::class)->run())->toThrow(RuntimeException::class);
});
