<?php

namespace App\Console\Commands;

use App\Services\Mapas\Geo;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use RuntimeException;
use SplFileObject;

/**
 * Gera database/data/osm-salvador.json.gz (ruas, lugares e bairros de
 * Salvador) a partir do recorte oficial do OpenStreetMap do Nordeste
 * (Geofabrik), usando o osmium-tool. Esse arquivo vai para o git e é
 * carregado pelo MapaSeeder, sem internet. Rodar só para atualizar o mapa.
 *
 *   brew install osmium-tool        (Mac)   |   apt install osmium-tool
 *   php artisan osm:importar
 */
#[Signature('osm:importar {--pbf= : usar um .osm.pbf já baixado em vez de baixar da Geofabrik}')]
#[Description('Importa ruas, lugares e bairros de Salvador do OpenStreetMap (Geofabrik + osmium)')]
class ImportarOsm extends Command
{
    private const GEOFABRIK = 'https://download.geofabrik.de/south-america/brazil/nordeste-latest.osm.pbf';

    /** Caixa que contém o município (o recorte fino é pelo polígono oficial). */
    private const CAIXA = '-38.70,-13.02,-38.25,-12.73';

    /** Município de Salvador no OSM (IBGE 2927408). */
    private const RELACAO_SALVADOR = 362362;

    private const CHAVES_LUGAR = ['amenity', 'shop', 'healthcare', 'leisure', 'tourism', 'office', 'craft', 'public_transport'];

    public function handle(): int
    {
        if (! Process::run('osmium --version')->successful()) {
            $this->error('osmium-tool não encontrado. Mac: brew install osmium-tool · Linux: apt install osmium-tool');

            return self::FAILURE;
        }

        $pasta = storage_path('app/osm');
        @mkdir($pasta, 0755, true);

        $pbf = $this->option('pbf') ?: "{$pasta}/nordeste-latest.osm.pbf";
        if (! $this->option('pbf')) {
            $this->info('Baixando o recorte do Nordeste (Geofabrik, ~450 MB)…');
            $this->rodar(['curl', '-sSfL', '-o', $pbf, self::GEOFABRIK], 1800);
        }

        $this->info('Recortando Salvador e filtrando…');
        $this->rodar(['osmium', 'extract', '-b', self::CAIXA, '-s', 'complete_ways', $pbf, '-o', "{$pasta}/salvador.osm.pbf", '--overwrite']);
        $this->rodar(['osmium', 'tags-filter', "{$pasta}/salvador.osm.pbf",
            'w/highway', 'r/boundary=administrative',
            ...array_map(fn ($k) => "nwr/{$k}", self::CHAVES_LUGAR),
            '-o', "{$pasta}/salvador-filtrado.osm.pbf", '--overwrite']);
        $this->rodar(['osmium', 'export', "{$pasta}/salvador-filtrado.osm.pbf", '-f', 'geojsonseq', '-a', 'type,id',
            '-o', "{$pasta}/salvador.geojsonseq", '--overwrite']);

        $this->info('Convertendo…');
        [$municipio, $bairros, $ruas, $lugares] = $this->ler("{$pasta}/salvador.geojsonseq");

        $dados = [
            '_' => 'Dados © colaboradores do OpenStreetMap (ODbL), recorte Geofabrik, gerado em '.now()->toDateString().' por `php artisan osm:importar`.',
            'bairros' => $bairros,
            'ruas' => $ruas,
            'lugares' => $lugares,
        ];
        $arquivo = database_path('data/osm-salvador.json.gz');
        file_put_contents($arquivo, gzencode((string) json_encode($dados, JSON_UNESCAPED_UNICODE), 9));

        $this->info(sprintf('%d trechos de rua, %d lugares, %d bairros com polígono → %s (%.1f MB)',
            count($ruas), count($lugares), count($bairros), $arquivo, filesize($arquivo) / 1e6));
        $this->line('Agora: php artisan db:seed --class=MapaSeeder');

        if (! $this->option('pbf')) {
            @unlink($pbf);
        }

        return self::SUCCESS;
    }

    /**
     * @return array{0: list<list<array{0: float, 1: float}>>, 1: list<array{nome: string, bordas: list<list<array{0: float, 1: float}>>}>, 2: list<array{n: string, t: string, g: list<array{0: float, 1: float}>}>, 3: list<array{n: string, t: string, p: array{0: float, 1: float}}>}
     */
    private function ler(string $arquivo): array
    {
        $municipio = [];
        $candidatosBairro = [];
        $ruas = [];
        $lugares = [];

        $arquivoLido = new SplFileObject($arquivo);
        while (! $arquivoLido->eof()) {
            $f = json_decode(ltrim((string) $arquivoLido->fgets(), "\x1e"), true);
            if (! is_array($f) || ! isset($f['geometry']['type'])) {
                continue;
            }
            $p = $f['properties'] ?? [];
            $geo = $f['geometry'];

            if (($p['@type'] ?? null) === 'relation' && (int) ($p['@id'] ?? 0) === self::RELACAO_SALVADOR) {
                $municipio = self::aneis($geo);

                continue;
            }
            if (($p['boundary'] ?? null) === 'administrative' && ($p['admin_level'] ?? null) === '10' && isset($p['name'])) {
                $candidatosBairro[] = ['nome' => (string) $p['name'], 'bordas' => self::aneis($geo)];

                continue;
            }
            if (isset($p['highway'], $p['name']) && $geo['type'] === 'LineString') {
                $ruas[] = ['n' => (string) $p['name'], 't' => (string) $p['highway'], 'g' => self::pontos($geo['coordinates'])];

                continue;
            }
            if (isset($p['name'])) {
                $chave = collect(self::CHAVES_LUGAR)->first(fn ($k) => isset($p[$k]));
                $ponto = self::centro($geo);
                if ($chave !== null && $ponto !== null) {
                    $lugares[] = ['n' => (string) $p['name'], 't' => $chave.'='.$p[$chave], 'p' => $ponto];
                }
            }
        }

        if ($municipio === []) {
            throw new RuntimeException('Contorno de Salvador (relação '.self::RELACAO_SALVADOR.') não está no recorte.');
        }

        // Só o que fica dentro do município (a caixa pega Lauro de Freitas e ilhas).
        $bairros = array_values(array_filter($candidatosBairro, fn ($b) => $b['bordas'] !== [] && Geo::dentro(self::media(array_merge(...$b['bordas'])), $municipio)));
        $ruas = array_values(array_filter($ruas, fn ($r) => $r['g'] !== [] && Geo::dentro($r['g'][intdiv(count($r['g']), 2)], $municipio)));
        $lugares = array_values(array_filter($lugares, fn ($l) => Geo::dentro($l['p'], $municipio)));

        return [$municipio, $bairros, $ruas, $lugares];
    }

    /**
     * Anéis de Polygon/MultiPolygon como linhas [lat, lng].
     *
     * @param  array<string, mixed>  $geo
     * @return list<list<array{0: float, 1: float}>>
     */
    private static function aneis(array $geo): array
    {
        $poligonos = match ($geo['type']) {
            'Polygon' => [$geo['coordinates']],
            'MultiPolygon' => $geo['coordinates'],
            default => [],
        };

        $aneis = [];
        foreach ($poligonos as $poligono) {
            foreach ($poligono as $anel) {
                $aneis[] = self::pontos($anel);
            }
        }

        return $aneis;
    }

    /**
     * @param  array<string, mixed>  $geo
     * @return array{0: float, 1: float}|null
     */
    private static function centro(array $geo): ?array
    {
        return match ($geo['type']) {
            'Point' => [round((float) $geo['coordinates'][1], 5), round((float) $geo['coordinates'][0], 5)],
            'Polygon', 'MultiPolygon' => ($a = self::aneis($geo)) === [] || $a[0] === [] ? null : self::media($a[0]),
            'LineString' => ($l = self::pontos($geo['coordinates'])) === [] ? null : self::media($l),
            default => null,
        };
    }

    /**
     * GeoJSON [lng, lat] → [lat, lng] arredondado a ~1 m.
     *
     * @param  list<array{0: float, 1: float}>  $coordenadas
     * @return list<array{0: float, 1: float}>
     */
    private static function pontos(array $coordenadas): array
    {
        return array_map(fn ($c) => [round((float) $c[1], 5), round((float) $c[0], 5)], $coordenadas);
    }

    /**
     * @param  list<array{0: float, 1: float}>  $pontos
     * @return array{0: float, 1: float}
     */
    private static function media(array $pontos): array
    {
        return [array_sum(array_column($pontos, 0)) / count($pontos), array_sum(array_column($pontos, 1)) / count($pontos)];
    }

    /**
     * @param  list<string>  $comando
     */
    private function rodar(array $comando, int $timeout = 600): void
    {
        $r = Process::timeout($timeout)->run($comando);
        if (! $r->successful()) {
            throw new RuntimeException($comando[0].' falhou: '.trim($r->errorOutput()));
        }
    }
}
