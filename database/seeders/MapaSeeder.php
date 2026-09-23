<?php

namespace Database\Seeders;

use App\Models\Lugar;
use App\Models\Rua;
use App\Services\Mapas\Bairros;
use App\Services\Mapas\Fonetica;
use App\Services\Mapas\Geo;
use App\Services\Mapas\Osm;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Carrega ruas e lugares de Salvador de database/data/osm-salvador.json.gz
 * (gerado por `php artisan osm:baixar`). Não usa internet: LIVE e LAB
 * recebem exatamente o mesmo mapa. Recarrega do zero a cada execução.
 */
class MapaSeeder extends Seeder
{
    /** @var list<array{nome: string, bordas: list<list<array{0: float, 1: float}>>, caixa: array{0: float, 1: float, 2: float, 3: float}}> */
    private array $poligonos = [];

    public function __construct(private Bairros $bairros) {}

    public function run(): void
    {
        $arquivo = database_path('data/osm-salvador.json.gz');
        if (! is_file($arquivo)) {
            $this->command->warn('Sem database/data/osm-salvador.json.gz — rode `php artisan osm:baixar`.');

            return;
        }

        /** @var array{bairros: list<array{nome: string, bordas: list<list<array{0: float, 1: float}>>}>, ruas: list<array{n: string, t: string, g: list<array{0: float, 1: float}>}>, lugares: list<array{n: string, t: string, p: array{0: float, 1: float}}>} $osm */
        $osm = json_decode((string) gzdecode((string) file_get_contents($arquivo)), true);

        foreach ($osm['bairros'] as $b) {
            $pontos = array_merge(...$b['bordas']);
            if ($pontos === []) {
                continue;
            }
            $lats = array_column($pontos, 0);
            $lngs = array_column($pontos, 1);
            $this->poligonos[] = [...$b, 'caixa' => [min($lats), max($lats), min($lngs), max($lngs)]];
        }

        DB::transaction(function () use ($osm) {
            Rua::query()->delete();
            Lugar::query()->delete();
            $this->carregarRuas($osm['ruas']);
            $this->carregarLugares($osm['lugares']);
        });

        $this->command->info(sprintf('Mapa: %d ruas, %d lugares.', Rua::count(), Lugar::count()));
    }

    /**
     * @param  list<array{n: string, t: string, g: list<array{0: float, 1: float}>}>  $trechos
     */
    private function carregarRuas(array $trechos): void
    {
        // Um registro por (nome, bairro): os pedaços da mesma rua se juntam.
        $ruas = [];
        foreach ($trechos as $t) {
            $meio = $t['g'][intdiv(count($t['g']), 2)];
            $bairro = $this->bairroDe($meio[0], $meio[1]);
            $chave = Str::lower(Str::ascii($t['n'])).'|'.$bairro;
            $ruas[$chave] ??= ['nome' => $t['n'], 'tipo' => $t['t'], 'bairro' => $bairro, 'trechos' => []];
            $ruas[$chave]['trechos'][] = $t['g'];
        }

        $linhas = [];
        foreach ($ruas as $r) {
            $pontos = array_merge(...$r['trechos']);
            if ($pontos === []) {
                continue;
            }
            $lats = array_column($pontos, 0);
            $lngs = array_column($pontos, 1);
            $linhas[] = [
                'nome' => $r['nome'],
                'som' => Str::limit(Fonetica::somDoNome($r['nome']), 120, ''),
                'tipo' => $r['tipo'],
                'bairro' => $r['bairro'],
                'lat' => array_sum($lats) / count($lats),
                'lng' => array_sum($lngs) / count($lngs),
                'lat_min' => min($lats), 'lat_max' => max($lats),
                'lng_min' => min($lngs), 'lng_max' => max($lngs),
                'trechos' => json_encode($r['trechos']),
                'homonimos' => 0,
            ];
        }

        $this->marcarRuasHomonimas($linhas);
        foreach (array_chunk($linhas, 500) as $lote) {
            Rua::insert($lote);
        }
    }

    /**
     * @param  list<array{n: string, t: string, p: array{0: float, 1: float}}>  $lugares
     */
    private function carregarLugares(array $lugares): void
    {
        // O mesmo lugar costuma vir duas vezes (ponto + prédio): um por nome a cada ~100 m.
        $unicos = [];
        foreach ($lugares as $l) {
            $unicos[Fonetica::somDoLugar($l['n']).'|'.round($l['p'][0], 3).'|'.round($l['p'][1], 3)] ??= $l;
        }
        $lugares = array_values($unicos);

        $linhas = array_map(fn (array $l) => [
            'nome' => Str::limit($l['n'], 250, ''),
            'som' => Str::limit(Fonetica::somDoLugar($l['n']), 120, ''),
            'tipo' => Str::limit(Osm::traduzirTipo($l['t']), 60, ''),
            'bairro' => $this->bairroDe($l['p'][0], $l['p'][1]),
            'lat' => $l['p'][0],
            'lng' => $l['p'][1],
            'homonimos' => 0,
        ], $lugares);

        $this->marcarHomonimos($linhas, fn (array $l) => $l['som']);
        foreach (array_chunk($linhas, 1000) as $lote) {
            Lugar::insert($lote);
        }
    }

    /**
     * Homônimos de lugar: quantos OUTROS lugares da cidade têm o mesmo nome.
     *
     * @param  list<array<string, mixed>>  $linhas
     */
    private function marcarHomonimos(array &$linhas, callable $chave): void
    {
        $contagem = [];
        foreach ($linhas as $l) {
            $k = $chave($l);
            $contagem[$k] = ($contagem[$k] ?? 0) + 1;
        }
        foreach ($linhas as $i => $l) {
            $linhas[$i]['homonimos'] = $contagem[$chave($l)] - 1;
        }
    }

    /**
     * Homônimos de rua: OUTRAS ruas com o mesmo nome em outro ponto da
     * cidade. Pedaços que se encostam (avenida longa cortando vários
     * bairros) são a mesma rua e não contam.
     *
     * @param  list<array<string, mixed>>  $linhas
     */
    private function marcarRuasHomonimas(array &$linhas): void
    {
        $porNome = [];
        foreach ($linhas as $i => $l) {
            $porNome[Str::lower(Str::ascii($l['nome']))][] = $i;
        }

        $folga = 0.0015; // ~150 m entre caixas = mesma rua
        foreach ($porNome as $indices) {
            // grupos de pedaços que se encostam (união simples)
            $grupo = array_combine($indices, $indices);
            $raiz = function (int $i) use (&$grupo, &$raiz): int {
                return $grupo[$i] === $i ? $i : ($grupo[$i] = $raiz($grupo[$i]));
            };
            foreach ($indices as $a) {
                foreach ($indices as $b) {
                    if ($a < $b
                        && $linhas[$a]['lat_min'] - $folga <= $linhas[$b]['lat_max'] && $linhas[$b]['lat_min'] - $folga <= $linhas[$a]['lat_max']
                        && $linhas[$a]['lng_min'] - $folga <= $linhas[$b]['lng_max'] && $linhas[$b]['lng_min'] - $folga <= $linhas[$a]['lng_max']) {
                        $grupo[$raiz($a)] = $raiz($b);
                    }
                }
            }
            $grupos = count(array_unique(array_map($raiz, $indices)));
            foreach ($indices as $i) {
                $linhas[$i]['homonimos'] = $grupos - 1;
            }
        }
    }

    /** Bairro pelo polígono do OSM; sem polígono, o de centro mais próximo. */
    private function bairroDe(float $lat, float $lng): string
    {
        foreach ($this->poligonos as $p) {
            [$s, $n, $o, $l] = $p['caixa'];
            if ($lat >= $s && $lat <= $n && $lng >= $o && $lng <= $l && Geo::dentro([$lat, $lng], $p['bordas'])) {
                return $p['nome'];
            }
        }

        return $this->bairros->maisProximo($lat, $lng);
    }
}
