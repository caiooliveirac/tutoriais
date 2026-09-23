<?php

use App\Enums\Perfil;
use App\Models\Lugar;
use App\Models\Ocorrencia;
use App\Models\Rua;
use App\Models\User;
use App\Services\Mapas\Fonetica;
use Database\Seeders\CatalogoSeeder;
use Illuminate\Support\Facades\Http;

function rua(string $nome, string $bairro, float $lat, float $lng, int $homonimos = 0): Rua
{
    $trecho = [[$lat, $lng], [$lat + 0.0008, $lng + 0.0008]];

    return Rua::create([
        'nome' => $nome, 'som' => Fonetica::somDoNome($nome), 'tipo' => 'residential', 'bairro' => $bairro,
        'lat' => $lat, 'lng' => $lng, 'lat_min' => $lat, 'lat_max' => $lat + 0.0008, 'lng_min' => $lng, 'lng_max' => $lng + 0.0008,
        'trechos' => [$trecho], 'homonimos' => $homonimos,
    ]);
}

function lugar(string $nome, string $tipo, string $bairro, float $lat, float $lng, int $homonimos = 0): Lugar
{
    return Lugar::create(['nome' => $nome, 'som' => Fonetica::somDoNome($nome), 'tipo' => $tipo, 'bairro' => $bairro, 'lat' => $lat, 'lng' => $lng, 'homonimos' => $homonimos]);
}

beforeEach(function () {
    $this->seed(CatalogoSeeder::class);
    $this->tarm = User::factory()->create(['perfis' => [Perfil::Tarm]]);
    Http::fake([
        'nominatim.openstreetmap.org/*' => Http::response([]),
        'router.project-osrm.org/*' => Http::response(null, 500),
    ]);

    rua('Rua Amparo do Tororó', 'Tororó', -12.9870, -38.5100);
    rua('Rua São José', 'Liberdade', -12.9480, -38.4970, homonimos: 1);
    rua('Rua São José', 'Cajazeiras', -12.9000, -38.4000, homonimos: 1);
    lugar('Atakarejo', 'supermercado', 'Cabula', -12.9560, -38.4600, homonimos: 1);
    lugar('Atakarejo', 'supermercado', 'San Martin', -12.9470, -38.4810, homonimos: 1);
    lugar('Escola Municipal Amélia Rodrigues', 'escola', 'Tororó', -12.9866, -38.5101);
});

test('rua escrita de ouvido é achada, mesmo sem o tipo do logradouro', function () {
    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/sugerir?q=tororro')
        ->assertOk()
        ->assertJsonPath('0.origem', 'catalogo')
        ->assertJsonPath('0.principal', 'Rua Amparo do Tororó')
        ->assertJsonPath('0.bairro', 'Tororó');
});

test('rua homônima: vem sinalizada e a do bairro informado aparece primeiro', function () {
    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/sugerir?q=rua sao jose&bairro=Cajazeiras')->assertOk()->json();

    expect($r[0]['bairro'])->toBe('Cajazeiras')
        ->and($r[0]['homonimos'])->toBe(1)
        ->and($r[1]['bairro'])->toBe('Liberdade');
});

test('referência com vários iguais: a do bairro informado vem primeiro', function () {
    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/referencia?q=atakarejo&bairro=San Martin')->assertOk()->json();

    expect($r[0]['bairro'])->toBe('San Martin')
        ->and($r[0]['homonimos'])->toBe(1)
        ->and($r[0]['origem'])->toBe('catalogo');

    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/referencia?q=atakarejo&bairro=cabula')->json();
    expect($r[0]['bairro'])->toBe('Cabula');
});

test('ruas perto da referência vêm do catálogo, com o ponto da rua mais próximo', function () {
    $r = $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/ruas?lat=-12.9866&lng=-38.5101')->assertOk()->json();

    expect($r)->toHaveCount(1)
        ->and($r[0]['nome'])->toBe('Rua Amparo do Tororó')
        ->and($r[0]['metros'])->toBeLessThan(60)
        ->and($r[0])->toHaveKeys(['lat', 'lng', 'bairro', 'homonimos', 'trechos']);

    Http::assertNothingSent(); // sem Overpass: tudo local
});

test('sem Google, as referências em volta também vêm do catálogo', function () {
    Http::fake(['nominatim.openstreetmap.org/reverse*' => Http::response(['address' => ['suburb' => 'Tororó']])]);

    $this->actingAs($this->tarm)->getJson('/tutoriais/atendimento/arredores?lat=-12.9866&lng=-38.5101')
        ->assertOk()->assertJsonPath('referencias.0.nome', 'Escola Municipal Amélia Rodrigues');
});

test('o TARM abre a ocorrência só com a queixa e uma pista do local', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', [
        'cidade' => 'Salvador', 'queixa' => 'CAIU NA RUA', 'ponto_referencia' => 'perto do atakarejo',
        'vitimas' => [['nome' => null, 'idade' => null, 'sexo' => null]],
    ])->assertSessionHasNoErrors();

    expect(Ocorrencia::sole())->telefone->toBeNull()->endereco->toBeNull()->lat->toBeNull();
});

test('sem nenhuma pista do local, pede só uma — e diz qual', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', [
        'cidade' => 'Salvador', 'queixa' => 'CAIU NA RUA', 'vitimas' => [['nome' => null]],
    ])->assertSessionHasErrors(['endereco' => 'Informe pelo menos uma pista: telefone, endereço, bairro, ponto de referência ou um clique no mapa.'])
        ->assertSessionDoesntHaveErrors(['telefone', 'solicitante', 'bairro']);
});

test('ligação caiu: abre só com o telefone, sem queixa, e avisa para retornar', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', [
        'cidade' => 'Salvador', 'telefone' => '(71) 98888-7777', 'abertura' => 'ligacao_caiu',
        'vitimas' => [['nome' => null]],
    ])->assertSessionHasNoErrors();

    $o = Ocorrencia::with('eventos')->sole();
    expect($o->queixa)->toBe('LIGAÇÃO CAIU — SEM QUEIXA')
        ->and($o->eventos->sole()->descricao)->toContain('retornar');
});

test('no fluxo normal a queixa continua obrigatória, com mensagem que aponta a saída', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', [
        'cidade' => 'Salvador', 'telefone' => '(71) 98888-7777', 'vitimas' => [['nome' => null]],
    ])->assertSessionHasErrors(['queixa' => 'Informe a queixa — ou use "Ligação caiu" para abrir só com o que já tem.']);
});

test('a trilha "digitado × escolhido" vai para o evento de abertura', function () {
    $this->actingAs($this->tarm)->post('/tutoriais/atendimento/ocorrencias', [
        'cidade' => 'Salvador', 'queixa' => 'DOR', 'bairro' => 'Tororó', 'vitimas' => [['nome' => null]],
        'trilha' => [
            ['passo' => 'bairro', 'digitado' => 'tororo', 'escolhido' => 'Tororó', 'origem' => 'quis_dizer'],
            ['passo' => 'rua', 'digitado' => 'amparo do tororro', 'escolhido' => 'Rua Amparo do Tororó (Tororó)', 'origem' => 'catalogo'],
        ],
    ])->assertSessionHasNoErrors();

    $depois = Ocorrencia::sole()->eventos()->sole()->depois;
    expect($depois['trilha'])->toHaveCount(2)
        ->and($depois['trilha'][1]['digitado'])->toBe('amparo do tororro')
        ->and($depois['dados'])->not->toHaveKey('trilha');
});
