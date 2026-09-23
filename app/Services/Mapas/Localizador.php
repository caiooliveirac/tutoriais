<?php

namespace App\Services\Mapas;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Tudo que a tela do TARM precisa para achar e conferir o local.
 * Usa Google quando as duas chaves estão configuradas; senão OpenStreetMap.
 * Ruas próximas vêm sempre do OSM (o Google não tem "ruas em volta"), em
 * chamada separada.
 */
class Localizador
{
    public function __construct(
        private GoogleMaps $google,
        private Osm $osm,
        private Bairros $bairros,
        private Catalogo $catalogo,
    ) {}

    public function provedor(): string
    {
        return config('services.google_maps.chave_servidor') && config('services.google_maps.chave_navegador')
            ? 'google'
            : 'osm';
    }

    /**
     * Sugestões para o endereço digitado: primeiro as ruas do catálogo local
     * (com bairro e aviso de homônimo, perto do bairro/ponto), depois as do
     * provedor (Google tolera melhor número e erro). Itens do catálogo e do
     * OSM já trazem coordenada; os do Google precisam de lugar($id).
     *
     * @return list<array<string, mixed>>
     */
    public function sugerir(string $texto, string $sessao, ?string $bairro = null, ?float $lat = null, ?float $lng = null): array
    {
        $catalogo = array_map(fn (array $r) => [
            'id' => 'rua:'.$r['nome'].'|'.$r['bairro'],
            'origem' => 'catalogo',
            'principal' => $r['nome'],
            'secundario' => $r['bairro'] ?? '',
            'bairro' => $r['bairro'],
            'logradouro' => $r['nome'],
            'numero' => null,
            'homonimos' => $r['homonimos'],
            'km' => $r['km'],
            'lat' => $r['lat'],
            'lng' => $r['lng'],
        ], $this->catalogo->buscarRuas($texto, $bairro, $lat, $lng, 5));

        try {
            $provedor = $this->provedor() === 'google'
                ? $this->google->sugerir($texto, $sessao)
                : Cache::remember('osm:sugerir:'.md5(mb_strtolower($texto)), now()->addDay(), fn () => $this->osm->sugerir($texto));
        } catch (Throwable $e) {
            if ($catalogo === []) {
                throw $e;
            }
            report($e);
            $provedor = [];
        }

        return [...$catalogo, ...array_map(fn (array $s) => [...$s, 'origem' => $this->provedor()], array_slice($provedor, 0, 5))];
    }

    /**
     * @return array{rotulo: string, logradouro: ?string, numero: ?string, bairro: ?string, lat: float, lng: float}
     */
    public function lugar(string $id, string $sessao): array
    {
        return $this->google->lugar($id, $sessao);
    }

    /**
     * Endereço, bairro e lugares conhecidos em volta do ponto, para o TARM
     * conferir com o solicitante. Resultado com falha não fica no cache.
     *
     * @return array{
     *     endereco: ?string,
     *     bairro: ?string,
     *     referencias: list<array{nome: string, tipo: string, lat: float, lng: float, metros: int}>,
     *     avisos: list<string>
     * }
     */
    public function arredores(float $lat, float $lng): array
    {
        $chave = sprintf('arredores:%s:%.4f,%.4f', $this->provedor(), $lat, $lng);
        $resultado = Cache::remember($chave, now()->addDay(), fn () => $this->calcularArredores($lat, $lng));

        if ($resultado['avisos'] !== []) {
            Cache::forget($chave);
        }

        return $resultado;
    }

    /**
     * Ruas próximas (OSM/Overpass), separadas porque o Overpass público às
     * vezes demora: a conferência aparece antes, as ruas chegam depois.
     *
     * @return list<array{nome: string, metros: int, trechos: list<list<array{0: float, 1: float}>>}>
     */
    public function ruas(float $lat, float $lng): array
    {
        if ($this->catalogo->carregado()) {
            return $this->catalogo->ruasPerto($lat, $lng);
        }

        return Cache::remember(sprintf('ruas:%.4f,%.4f', $lat, $lng), now()->addWeek(), fn () => $this->osm->ruas($lat, $lng));
    }

    /**
     * @return array{
     *     endereco: ?string,
     *     bairro: ?string,
     *     referencias: list<array{nome: string, tipo: string, lat: float, lng: float, metros: int}>,
     *     avisos: list<string>
     * }
     */
    private function calcularArredores(float $lat, float $lng): array
    {
        $avisos = [];
        $tentar = function (callable $f, string $falha, mixed $padrao) use (&$avisos) {
            try {
                return $f();
            } catch (Throwable $e) {
                Log::warning($falha, ['erro' => $e->getMessage()]);
                $avisos[] = $falha;

                return $padrao;
            }
        };

        $google = $this->provedor() === 'google';
        $endereco = $tentar(
            fn () => $google ? $this->google->enderecoDoPonto($lat, $lng) : $this->osm->enderecoDoPonto($lat, $lng),
            'Endereço do ponto indisponível',
            ['endereco' => null, 'bairro' => null],
        );
        $referencias = $tentar(
            fn () => match (true) {
                $google => $this->google->referencias($lat, $lng),
                $this->catalogo->carregado() => $this->catalogo->lugaresPerto($lat, $lng),
                default => $this->osm->referencias($lat, $lng),
            },
            'Pontos de referência indisponíveis',
            [],
        );

        return [
            'endereco' => $endereco['endereco'],
            'bairro' => $endereco['bairro'] ?? $this->bairros->maisProximo($lat, $lng),
            'referencias' => $referencias,
            'avisos' => $avisos,
        ];
    }

    /**
     * Acha o local pelo ponto de referência ("perto do Atakarejo"): catálogo
     * local primeiro, ordenado pela distância do bairro/ponto, e o Google
     * (quando ligado) puxado para a mesma região.
     *
     * @return list<array{nome: string, endereco: string, bairro: ?string, homonimos: int, km: ?float, lat: float, lng: float, origem: string}>
     */
    public function buscarReferencia(string $texto, ?string $bairro, ?float $lat, ?float $lng): array
    {
        $locais = array_map(fn (array $l) => [
            'nome' => $l['nome'],
            'endereco' => trim($l['tipo'].' · '.($l['bairro'] ?? ''), ' ·'),
            'bairro' => $l['bairro'],
            'homonimos' => $l['homonimos'],
            'km' => $l['km'],
            'lat' => $l['lat'],
            'lng' => $l['lng'],
            'origem' => 'catalogo',
        ], $this->catalogo->buscarLugares($texto, $bairro, $lat, $lng, 6));

        if ($this->provedor() !== 'google') {
            return $locais;
        }

        if ($lat === null && $bairro !== null && ($centro = $this->catalogo->centroDoBairro($bairro))) {
            [$lat, $lng] = $centro;
        }

        try {
            $google = $this->google->buscarLugar($texto, $lat, $lng);
        } catch (Throwable $e) {
            report($e);
            $google = [];
        }

        return [...$locais, ...array_map(fn (array $g) => [
            ...$g,
            'bairro' => null,
            'homonimos' => 0,
            'km' => $lat !== null && $lng !== null ? round(Geo::metros($lat, $lng, $g['lat'], $g['lng']) / 1000, 1) : null,
            'origem' => 'google',
        ], $google)];
    }

    /**
     * @return list<array{nome: string, lat: float, lng: float}>
     */
    public function bairrosParecidos(string $texto): array
    {
        return $this->bairros->parecidos($texto);
    }
}
