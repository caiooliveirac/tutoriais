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
        'nominatim.openstreetmap.org/search*' => Http::response([[
            'display_name' => 'Rua do Tororó, Tororó, Salvador, Bahia, Brasil',
            'lat' => '-12.9790', 'lon' => '-38.5050', 'osm_type' => 'way', 'osm_id' => 1,
            'address' => ['road' => 'Rua do Tororó', 'suburb' => 'Tororó'],
        ]]),
        'nominatim.openstreetmap.org/reverse*' => Http::response([
            'display_name' => 'Rua do Tororó, Tororó, Salvador, Bahia',
            'address' => ['suburb' => 'Tororó'],
        ]),
        'overpass-api.de/*' => Http::response(['elements' => [
            ['type' => 'way', 'tags' => ['highway' => 'residential', 'name' => 'Rua do Tororó'],
                'geometry' => [['lat' => -12.9791, 'lon' => -38.5051], ['lat' => -12.9795, 'lon' => -38.5055]]],
            ['type' => 'way', 'tags' => ['highway' => 'residential', 'name' => 'Ladeira da Fonte'],
                'geometry' => [['lat' => -12.9810, 'lon' => -38.5060]]],
            ['type' => 'node', 'lat' => -12.9792, 'lon' => -38.5049, 'tags' => ['name' => 'Farmácia do Povo', 'amenity' => 'pharmacy']],
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
        ->assertSessionHasErrors(['endereco', 'queixa', 'vitimas']);
});

test('só quem tem perfil de TARM abre ocorrência', function () {
    $medico = User::factory()->create(['perfis' => [Perfil::MedicoRegulador]]);

    $this->actingAs($medico)->post('/tutoriais/atendimento/ocorrencias', chamado())->assertForbidden();
});

test('sem chaves do Google, sugestões vêm do OSM já com coordenada', function () {
    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/sugerir?q=Rua do Tororó 18')
        ->assertOk()
        ->assertJsonPath('0.principal', 'Rua do Tororó')
        ->assertJsonPath('0.bairro', 'Tororó')
        ->assertJsonPath('0.lat', -12.979);
});

test('arredores trazem bairro e referências por distância; ruas vêm à parte com traçado', function () {
    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/arredores?lat=-12.979&lng=-38.505')
        ->assertOk()->json();

    expect($r['bairro'])->toBe('Tororó')
        ->and($r['referencias'][0]['nome'])->toBe('Farmácia do Povo')
        ->and($r['referencias'][0]['tipo'])->toBe('farmácia')
        ->and($r['avisos'])->toBe([]);

    $ruas = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/ruas?lat=-12.979&lng=-38.505')->assertOk()->json();
    expect(array_column($ruas, 'nome'))->toBe(['Rua do Tororó', 'Ladeira da Fonte'])
        ->and($ruas[0]['trechos'][0])->toHaveCount(2);
});

test('Overpass fora do ar: ruas avisam, conferência continua', function () {
    config(['services.overpass.url' => 'https://overpass-fora.test/api']);
    Http::fake(['overpass-fora.test/*' => Http::response(null, 504)]);

    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/ruas?lat=-12.979&lng=-38.505')->assertStatus(503);
    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/arredores?lat=-12.979&lng=-38.505')
        ->assertOk()->assertJsonPath('bairro', 'Tororó');
});

test('bairro digitado de ouvido é reconhecido', function () {
    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/bairros?q=rio vermeio')
        ->assertOk()->assertJsonPath('0.nome', 'Rio Vermelho');
});

test('com as chaves do Google, a tela usa Google para sugerir, detalhar e achar referências', function () {
    config(['services.google_maps.chave_servidor' => 'chave-servidor', 'services.google_maps.chave_navegador' => 'chave-navegador']);
    Http::fake([
        'places.googleapis.com/v1/places:autocomplete' => Http::response(['suggestions' => [
            ['placePrediction' => ['placeId' => 'ChIJ-tororo', 'text' => ['text' => 'Rua do Tororó'],
                'structuredFormat' => ['mainText' => ['text' => 'Rua do Tororó'], 'secondaryText' => ['text' => 'Tororó, Salvador - BA']]]],
        ]]),
        'places.googleapis.com/v1/places/ChIJ-tororo*' => Http::response([
            'formattedAddress' => 'Rua do Tororó, 18 - Tororó, Salvador - BA',
            'location' => ['latitude' => -12.979, 'longitude' => -38.505],
            'addressComponents' => [
                ['longText' => 'Rua do Tororó', 'types' => ['route']],
                ['longText' => '18', 'types' => ['street_number']],
                ['longText' => 'Tororó', 'types' => ['sublocality_level_1', 'sublocality']],
            ],
        ]),
        'maps.googleapis.com/maps/api/geocode/*' => Http::response(['results' => [[
            'formatted_address' => 'Rua do Tororó, 18 - Tororó',
            'address_components' => [['long_name' => 'Tororó', 'types' => ['sublocality_level_1', 'sublocality']]],
        ]]]),
        'places.googleapis.com/v1/places:searchNearby' => Http::response(['places' => [
            ['displayName' => ['text' => 'Igreja Batista do Tororó'], 'primaryTypeDisplayName' => ['text' => 'Igreja'],
                'location' => ['latitude' => -12.9795, 'longitude' => -38.5052]],
        ]]),
        'places.googleapis.com/v1/places:searchText' => Http::response(['places' => [
            ['displayName' => ['text' => 'Hospital Geral Roberto Santos'], 'formattedAddress' => 'Estr. do Saboeiro, Cabula',
                'location' => ['latitude' => -12.9566, 'longitude' => -38.4588]],
        ]]),
    ]);

    $this->actingAs($this->tarm)->get('/tutoriais/atendimento')
        ->assertInertia(fn ($p) => $p->where('mapas.provedor', 'google')->where('mapas.chave_navegador', 'chave-navegador'));

    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/sugerir?q=rua do tororo&sessao=abc')
        ->assertOk()->assertJsonPath('0.id', 'ChIJ-tororo')->assertJsonMissingPath('0.lat');

    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/lugar?id=ChIJ-tororo&sessao=abc')
        ->assertOk()->assertJson(['logradouro' => 'Rua do Tororó', 'numero' => '18', 'bairro' => 'Tororó', 'lat' => -12.979]);

    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/arredores?lat=-12.979&lng=-38.505')->json();
    expect($r['referencias'][0]['nome'])->toBe('Igreja Batista do Tororó');
    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/ruas?lat=-12.979&lng=-38.505')
        ->assertJsonPath('0.nome', 'Rua do Tororó'); // ruas continuam do OSM

    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/referencia?q=hospital roberto santos')
        ->assertOk()->assertJsonPath('0.nome', 'Hospital Geral Roberto Santos');

    Http::assertSent(fn ($req) => $req->hasHeader('X-Goog-Api-Key', 'chave-servidor'));
});

test('só a chave do servidor não basta: sem mapa Google, fica tudo em OSM', function () {
    config(['services.google_maps.chave_servidor' => 'chave-servidor', 'services.google_maps.chave_navegador' => null]);

    $this->actingAs($this->tarm)->get('/tutoriais/atendimento')
        ->assertInertia(fn ($p) => $p->where('mapas.provedor', 'osm')->where('mapas.chave_navegador', null));
});

test('falha do serviço de endereço vira aviso, não erro', function () {
    config(['services.nominatim.url' => 'https://nominatim-fora.test']);
    Http::fake(['nominatim-fora.test/*' => Http::response(null, 500)]);

    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/sugerir?q=rua qualquer')
        ->assertStatus(503)->assertJsonPath('message', 'Busca de endereço indisponível; marque o local no mapa.');
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

test('Google recusando a geocodificação vira aviso, sem derrubar a conferência', function () {
    config(['services.google_maps.chave_servidor' => 'chave-servidor', 'services.google_maps.chave_navegador' => 'chave-navegador']);
    Http::fake([
        'maps.googleapis.com/maps/api/geocode/*' => Http::response(['status' => 'REQUEST_DENIED', 'error_message' => 'This API is not activated']),
        'places.googleapis.com/v1/places:searchNearby' => Http::response(['places' => []]),
    ]);

    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/arredores?lat=-12.979&lng=-38.505')->assertOk()->json();

    expect($r['avisos'])->toContain('Endereço do ponto indisponível')
        ->and($r['bairro'])->toBe('Nazaré'); // cai para o bairro mais próximo
});
