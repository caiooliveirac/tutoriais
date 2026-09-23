<?php

use App\Enums\Perfil;
use App\Enums\StatusOcorrencia;
use App\Enums\TipoEvento;
use App\Models\Base;
use App\Models\Ocorrencia;
use App\Models\Unidade;
use App\Models\User;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->seed(CatalogoSeeder::class);
    $this->tarm = User::factory()->create(['perfis' => [Perfil::Tarm]]);

    // OSRM falso: tempo = 60 s × posição da origem (a 1ª é a mais rápida).
    Http::fake([
        'router.project-osrm.org/*' => function ($request) {
            $n = substr_count(parse_url($request->url(), PHP_URL_PATH), ';');

            return Http::response([
                'durations' => array_map(fn ($i) => [60.0 * ($i + 1)], range(0, $n - 1)),
                'distances' => array_map(fn ($i) => [500.0 * ($i + 1)], range(0, $n - 1)),
            ]);
        },
        'nominatim.openstreetmap.org/*' => Http::response([[
            'display_name' => 'Rua do Tororó, Tororó, Salvador, Bahia, Brasil',
            'lat' => '-12.9790', 'lon' => '-38.5050',
            'address' => ['road' => 'Rua do Tororó', 'suburb' => 'Tororó'],
        ]]),
    ]);
});

function chamado(array $extra = []): array
{
    return [
        'telefone' => '(71) 99999-0000',
        'solicitante' => 'JULIANA (FILHA)',
        'cidade' => 'Salvador',
        'bairro' => 'Tororó',
        'endereco' => 'Rua do Tororó, 18',
        'ponto_referencia' => 'Próximo ao campo',
        'queixa' => 'DOR TORÁCICA',
        'lat' => -12.979,
        'lng' => -38.505,
        'vitimas' => [['nome' => 'JOÃO', 'idade' => 54, 'sexo' => 'M']],
        ...$extra,
    ];
}

test('TARM abre ocorrência com sugestão de recursos e auditoria', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', chamado())
        ->assertRedirect()->assertSessionHasNoErrors();

    $o = Ocorrencia::with('vitimas', 'eventos')->sole();
    expect($o->status)->toBe(StatusOcorrencia::AguardandoTriagem)
        ->and($o->protocolo)->toStartWith(now('America/Bahia')->format('Ymd'))->toEndWith('0001')
        ->and($o->tarm_id)->toBe($this->tarm->id)
        ->and($o->vitimas)->toHaveCount(1);

    $evento = $o->eventos->sole();
    expect($evento->tipo)->toBe(TipoEvento::Aberta)
        ->and($evento->user_id)->toBe($this->tarm->id)
        ->and($evento->perfil)->toBe('tarm')
        ->and($evento->depois['sugestao'])->toHaveCount(5)
        ->and($evento->depois['sugestao'][0])->toHaveKeys(['codigo', 'base', 'minutos']);
});

test('protocolos do dia são sequenciais', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', chamado());
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', chamado(['lat' => null, 'lng' => null]));

    expect(Ocorrencia::orderBy('id')->pluck('protocolo')->map(fn ($p) => substr($p, -4))->all())->toBe(['0001', '0002']);
});

test('abertura valida os campos obrigatórios', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', ['vitimas' => []])
        ->assertSessionHasErrors(['telefone', 'solicitante', 'endereco', 'bairro', 'queixa', 'vitimas']);
});

test('só quem tem perfil de TARM abre ocorrência', function () {
    $medico = User::factory()->create(['perfis' => [Perfil::MedicoRegulador]]);

    $this->actingAs($medico)->post('/tutoriais/atendimento/ocorrencias', chamado())->assertForbidden();
});

test('busca de endereço devolve coordenadas e bairro', function () {
    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/geocodificar?q=Rua do Tororó 18')
        ->assertOk()
        ->assertJsonPath('0.bairro', 'Tororó')
        ->assertJsonPath('0.lat', -12.979);
});

test('estimativa ordena unidades pelo tempo e cai para linha reta sem OSRM', function () {
    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/estimativas?lat=-12.979&lng=-38.505')
        ->assertOk()->json();

    expect($r['fonte'])->toBe('osrm');
    $minutos = array_column($r['unidades'], 'minutos');
    expect($minutos)->toBe(collect($minutos)->sort()->values()->all());

    config(['services.osrm.url' => 'https://osrm-fora-do-ar.test']);
    Http::fake(['osrm-fora-do-ar.test/*' => Http::response(null, 500)]);
    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/estimativas?lat=-12.979&lng=-38.505')->json();
    expect($r['fonte'])->toBe('linha_reta')
        ->and($r['bases'][0]['nome'])->toBe('5º CENTRO'); // o Tororó fica ao lado do Centro
});

test('API de posições exige token e atualiza a unidade', function () {
    config(['services.rastreamento.token' => 'segredo-teste']);
    $corpo = ['posicoes' => [['codigo' => 'SM01', 'lat' => -12.97, 'lng' => -38.50]]];

    $this->postJson('/tutoriais/api/v1/posicoes', $corpo)->assertUnauthorized();
    $this->postJson('/tutoriais/api/v1/posicoes', $corpo, ['Authorization' => 'Bearer errado'])->assertUnauthorized();

    $this->postJson('/tutoriais/api/v1/posicoes', $corpo, ['Authorization' => 'Bearer segredo-teste'])
        ->assertOk()->assertJson(['recebidas' => 1, 'atualizadas' => 1]);

    $sm01 = Unidade::where('codigo', 'SM01')->first();
    expect($sm01->lat)->toBe(-12.97)->and($sm01->temPosicaoRecente())->toBeTrue();
});

test('API de estimativas usa a posição ao vivo da unidade', function () {
    config(['services.rastreamento.token' => 'segredo-teste']);
    Unidade::where('codigo', 'PP20')->update(['lat' => -12.98, 'lng' => -38.50, 'posicao_em' => now()]);

    $r = $this->getJson('/tutoriais/api/v1/estimativas?lat=-12.979&lng=-38.505&tipo=usa', ['Authorization' => 'Bearer segredo-teste'])
        ->assertOk()->json();

    $pp20 = collect($r['unidades'])->firstWhere('codigo', 'PP20');
    expect($pp20['origem'])->toBe('posicao')
        ->and(collect($r['unidades'])->pluck('tipo')->unique()->all())->toBe(['USA'])
        ->and(Base::count())->toBe(16);
});

test('API fechada quando não há token configurado', function () {
    config(['services.rastreamento.token' => null]);

    $this->getJson('/tutoriais/api/v1/estimativas?lat=-12.9&lng=-38.5', ['Authorization' => 'Bearer '])->assertUnauthorized();
});
