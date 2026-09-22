<?php

namespace Database\Seeders;

use App\Enums\TipoRecurso;
use App\Models\Hospital;
use App\Models\Unidade;
use Illuminate\Database\Seeder;

/**
 * Hospitais de destino e frota. Roda em todos os ambientes.
 */
class CatalogoSeeder extends Seeder
{
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

        $frota = [
            [TipoRecurso::Usa, ['CZ 51' => 'CAJAZEIRAS', 'SM 01' => 'SÃO MARCOS', 'CT 02' => 'CENTRO', 'SB 03' => 'SUBÚRBIO', 'IT 04' => 'ITAPUÃ', 'LB 05' => 'LIBERDADE', 'BR 06' => 'BROTAS']],
            [TipoRecurso::Usb, ['PM 42' => 'PAU MIÚDO', 'PM 43' => 'PAU MIÚDO', 'IT 31' => 'ITAPUÃ', 'BR 21' => 'BROTAS', 'LB 22' => 'LIBERDADE', 'SB 23' => 'SUBÚRBIO', 'CZ 24' => 'CAJAZEIRAS', 'CT 25' => 'CENTRO', 'PR 26' => 'PERIPERI']],
            [TipoRecurso::Moto, ['MT 71' => 'CENTRO', 'MT 72' => 'BARRA', 'MT 73' => 'ITAPUÃ']],
        ];

        foreach ($frota as [$tipo, $unidades]) {
            foreach ($unidades as $codigo => $base) {
                Unidade::updateOrCreate(['codigo' => $codigo], ['tipo' => $tipo, 'base' => $base]);
            }
        }
    }
}
