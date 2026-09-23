<?php

namespace Database\Seeders;

use App\Enums\TipoRecurso;
use App\Models\Base;
use App\Models\Hospital;
use App\Models\Unidade;
use Illuminate\Database\Seeder;

/**
 * Hospitais de destino, bases e frota. Roda em todos os ambientes.
 *
 * Bases e unidades de Salvador: lista oficial em
 * ChecagemdeBases/src/data/bases.ts (códigos e status). Coordenadas do
 * OpenStreetMap — ver a fonte de cada uma. Motolâncias (ML..) não constam
 * da lista oficial: são fictícias, para o fluxo USA/USB/Moto.
 */
class CatalogoSeeder extends Seeder
{
    private const BAIRRO = 'OSM: centro do bairro';

    /**
     * nome => [lat, lng, fonte, [código => [tipo, ativa]]]
     */
    private const BASES = [
        '5º CENTRO' => [-12.986648, -38.520108, self::BAIRRO.' Centro', ['CN10' => ['usa', true], 'CN11' => ['usb', true], 'CN12' => ['usb', true], 'CN13' => ['usb', true], 'ML01' => ['moto', true]]],
        'SAN MARTIN' => [-12.9495715, -38.4780449, 'OSM: Av. General San Martin', ['SM01' => ['usa', true], 'SM17' => ['usb', true], 'SM18' => ['usb', true], 'SM19' => ['usb', true], 'ML02' => ['moto', true]]],
        'PERIPERI' => [-12.863354, -38.473672, self::BAIRRO.' Periperi', ['PP20' => ['usa', true], 'PP21' => ['usb', true], 'PP22' => ['usb', true], 'PP23' => ['usb', true]]],
        'UPA SANTO ANTÔNIO (CIDADE BAIXA)' => [-12.9351382, -38.5063325, 'OSM: UPA Santo Antônio', ['CB02' => ['usa', true], 'CB25' => ['usb', true], 'CB26' => ['usb', true], 'CB27' => ['usb', true], 'CB28' => ['usb', true]]],
        'ITAPUÃ' => [-12.942418, -38.35874, self::BAIRRO.' Itapuã', ['IT30' => ['usa', true], 'IT31' => ['usb', true], 'IT32' => ['usb', true]]],
        'FTC' => [-12.9348678, -38.3921953, 'OSM: FTC, Av. Luís Viana (Paralela)', ['PR03' => ['usa', true], 'PR33' => ['usb', true], 'PR34' => ['usb', true], 'PR35' => ['usb', true], 'PR36' => ['usb', false]]],
        'JORGE AMADO' => [-12.9309512, -38.4130370, 'SUPOSIÇÃO: Unijorge, Paralela — confirmar', ['JA37' => ['usb', true], 'JA38' => ['usb', true], 'JA39' => ['usb', false]]],
        'PAU MIÚDO' => [-12.959904, -38.480808, self::BAIRRO.' Pau Miúdo', ['PM04' => ['usa', true], 'PM40' => ['usa', true], 'PM41' => ['usb', true], 'PM42' => ['usb', false], 'PM43' => ['usb', true], 'PM44' => ['usb', false], 'PM45' => ['usb', true], 'PM46' => ['usb', true], 'PM47' => ['usb', true], 'PM48' => ['usb', true], 'PM49' => ['usb', true]]],
        'CAJAZEIRAS' => [-12.899938, -38.408157, self::BAIRRO.' Cajazeiras', ['CZ50' => ['usa', true], 'CZ51' => ['usb', false], 'CZ52' => ['usb', true], 'CZ53' => ['usb', true]]],
        'SÃO CRISTÓVÃO' => [-12.908277, -38.361035, self::BAIRRO.' São Cristóvão', ['SC54' => ['usb', true], 'SC55' => ['usb', true]]],
        'VALÉRIA' => [-12.861071, -38.433227, self::BAIRRO.' Valéria', ['VL56' => ['usb', true], 'VL57' => ['usb', true]]],
        'BOCA DO RIO ROSA GARCIA' => [-12.977449, -38.427951, self::BAIRRO.' Boca do Rio', ['BR05' => ['usa', true], 'BR60' => ['usa', true], 'BR61' => ['usb', true], 'BR62' => ['usb', true], 'BR63' => ['usb', true], 'BR64' => ['usb', false]]],
        'BOCA DO RIO 12º CENTRO' => [-12.9785, -38.4295, self::BAIRRO.' Boca do Rio (deslocado)', ['BR65' => ['usb', true], 'BR66' => ['usb', false]]],
        'PITUBA ARENA' => [-13.0059509, -38.4550929, 'SUPOSIÇÃO: Arena Aquática, Pituba — confirmar', ['PB67' => ['usb', true], 'PB68' => ['usb', true], 'ML03' => ['moto', true]]],
        'CAMPUS CABULA' => [-12.956494, -38.463595, self::BAIRRO.' Cabula', ['CC70' => ['usa', true], 'CC71' => ['usb', true], 'CC72' => ['usb', false], 'CC73' => ['usb', true]]],
        'RODRIGO ARGOLO' => [-13.0097272, -38.4839926, 'OSM: Rua Rodrigo Argolo, Rio Vermelho', ['CC74' => ['usb', true]]],
    ];

    public function run(): void
    {
        $hospitais = [
            ['HOSPITAL GERAL DO ESTADO', 'HGE'],
            ['HOSPITAL GERAL ROBERTO SANTOS', 'HGRS'],
            ['HOSPITAL DO SUBÚRBIO', 'HS'],
            ['HOSPITAL SANTO ANTÔNIO', 'OSID'],
            ['HOSPITAL UNIVERSITÁRIO PROF. EDGARD SANTOS', 'HUPES'],
            ['UPA BROTAS', null],
            ['UPA BARRIS', null],
            ['UPA SANTO ANTÔNIO', null],
            ['UPA ITAPUÃ', null],
        ];

        foreach ($hospitais as [$nome, $sigla]) {
            Hospital::updateOrCreate(['nome' => $nome], ['sigla' => $sigla]);
        }

        foreach (self::BASES as $nome => [$lat, $lng, $fonte, $unidades]) {
            $base = Base::updateOrCreate(['nome' => $nome], ['lat' => $lat, 'lng' => $lng, 'fonte_coordenada' => $fonte]);

            foreach ($unidades as $codigo => [$tipo, $ativa]) {
                Unidade::updateOrCreate(['codigo' => $codigo], [
                    'tipo' => TipoRecurso::from($tipo),
                    'base_id' => $base->id,
                    'baixada' => ! $ativa,
                ]);
            }
        }
    }
}
