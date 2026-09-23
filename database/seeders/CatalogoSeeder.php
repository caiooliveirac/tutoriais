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
 * ChecagemdeBases/src/data/bases.ts (códigos e status). Coordenadas de
 * ChecagemdeBases/src/data/coordenadas.ts (branch claude/mapa-bases-alertas-
 * equipes-393de6, commit 678a92d): 13 exatas (geofence de check-in do
 * taximetro-digital ou POI do OSM) e 3 aproximadas. Motolâncias (ML..) não
 * constam da lista oficial: são fictícias, para o fluxo USA/USB/Moto.
 */
class CatalogoSeeder extends Seeder
{
    /**
     * nome => [lat, lng, fonte, [código => [tipo, ativa]]]
     */
    private const BASES = [
        '5º CENTRO' => [-12.990816, -38.511382, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['CN10' => ['usa', true], 'CN11' => ['usb', true], 'CN12' => ['usb', true], 'CN13' => ['usb', true], 'ML01' => ['moto', true]]],
        'SAN MARTIN' => [-12.946836, -38.481288, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['SM01' => ['usa', true], 'SM17' => ['usb', true], 'SM18' => ['usb', true], 'SM19' => ['usb', true], 'ML02' => ['moto', true]]],
        'PERIPERI' => [-12.868043, -38.47256, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['PP20' => ['usa', true], 'PP21' => ['usb', true], 'PP22' => ['usb', true], 'PP23' => ['usb', true]]],
        'UPA SANTO ANTÔNIO (CIDADE BAIXA)' => [-12.935104, -38.506528, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['CB02' => ['usa', true], 'CB25' => ['usb', true], 'CB26' => ['usb', true], 'CB27' => ['usb', true], 'CB28' => ['usb', true]]],
        'ITAPUÃ' => [-12.924475, -38.351147, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['IT30' => ['usa', true], 'IT31' => ['usb', true], 'IT32' => ['usb', true]]],
        'FTC' => [-12.93414, -38.392223, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['PR03' => ['usa', true], 'PR33' => ['usb', true], 'PR34' => ['usb', true], 'PR35' => ['usb', true], 'PR36' => ['usb', false]]],
        'JORGE AMADO' => [-12.936804, -38.410645, 'EXATA: POI OSM — Unijorge, Av. Luís Viana 6775, Patamares (ChecagemdeBases coordenadas.ts)', ['JA37' => ['usb', true], 'JA38' => ['usb', true], 'JA39' => ['usb', false]]],
        'PAU MIÚDO' => [-12.959059, -38.487838, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['PM04' => ['usa', true], 'PM40' => ['usa', true], 'PM41' => ['usb', true], 'PM42' => ['usb', false], 'PM43' => ['usb', true], 'PM44' => ['usb', false], 'PM45' => ['usb', true], 'PM46' => ['usb', true], 'PM47' => ['usb', true], 'PM48' => ['usb', true], 'PM49' => ['usb', true]]],
        'CAJAZEIRAS' => [-12.898305, -38.389943, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['CZ50' => ['usa', true], 'CZ51' => ['usb', false], 'CZ52' => ['usb', true], 'CZ53' => ['usb', true]]],
        'SÃO CRISTÓVÃO' => [-12.907002, -38.36447, 'EXATA: POI OSM — UPA Parque São Cristóvão, Rua Oeste 1 (ChecagemdeBases coordenadas.ts)', ['SC54' => ['usb', true], 'SC55' => ['usb', true]]],
        'VALÉRIA' => [-12.8705, -38.4395, 'APROXIMADA: bairro da base (ChecagemdeBases coordenadas.ts)', ['VL56' => ['usb', true], 'VL57' => ['usb', true]]],
        'BOCA DO RIO ROSA GARCIA' => [-12.983681, -38.438684, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['BR05' => ['usa', true], 'BR60' => ['usa', true], 'BR61' => ['usb', true], 'BR62' => ['usb', true], 'BR63' => ['usb', true], 'BR64' => ['usb', false]]],
        'BOCA DO RIO 12º CENTRO' => [-12.9807, -38.4419, 'APROXIMADA: bairro da base (ChecagemdeBases coordenadas.ts)', ['BR65' => ['usb', true], 'BR66' => ['usb', false]]],
        'PITUBA ARENA' => [-12.9985, -38.4575, 'APROXIMADA: bairro da base (ChecagemdeBases coordenadas.ts)', ['PB67' => ['usb', true], 'PB68' => ['usb', true], 'ML03' => ['moto', true]]],
        'CAMPUS CABULA' => [-12.959085, -38.452476, 'EXATA: geofence de check-in (taximetro-digital, via ChecagemdeBases coordenadas.ts)', ['CC70' => ['usa', true], 'CC71' => ['usb', true], 'CC72' => ['usb', false], 'CC73' => ['usb', true]]],
        'RODRIGO ARGOLO' => [-12.94532, -38.446339, 'EXATA: POI OSM — PA Dr. Rodrigo Argolo, Rua Betel, Tancredo Neves (ChecagemdeBases coordenadas.ts)', ['CC74' => ['usb', true]]],
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
