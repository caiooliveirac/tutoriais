<?php

use App\Enums\Perfil;
use App\Models\User;

test('cada perfil acessa só as próprias áreas', function (array $perfis, array $permitidas) {
    $user = User::factory()->create(['perfis' => $perfis]);

    foreach (['atendimento', 'triagem', 'despacho', 'plantao', 'bi'] as $area) {
        $esperado = in_array($area, $permitidas) ? 200 : 403;

        $this->actingAs($user)->get("/tutoriais/{$area}")->assertStatus($esperado);
    }
})->with([
    'tarm' => [[Perfil::Tarm], ['atendimento']],
    'rádio-operador' => [[Perfil::RadioOperador], ['despacho']],
    'enfermeiro' => [[Perfil::EnfermeiroRegulador], ['despacho']],
    'médico' => [[Perfil::MedicoRegulador], ['triagem']],
    'chefe que também é médico' => [[Perfil::ChefePlantao, Perfil::MedicoRegulador], ['plantao', 'triagem']],
    'administrativo' => [[Perfil::Administrativo], ['bi']],
    'sem perfil' => [[], []],
]);

test('visitante é mandado para o login', function () {
    $this->get('/tutoriais/despacho')->assertRedirect('/tutoriais/login');
});

test('cadastro público está desligado', function () {
    $this->get('/tutoriais/register')->assertNotFound();
});

test('seeder cria um usuário por perfil com senha fácil', function () {
    $this->seed();

    $this->post('/tutoriais/login', ['email' => 'enf@samu.test', 'password' => 'enf123'])
        ->assertRedirect('/tutoriais/dashboard');
});
