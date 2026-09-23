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
    ) {}

    public function provedor(): string
    {
        return config('services.google_maps.chave_servidor') && config('services.google_maps.chave_navegador')
            ? 'google'
            : 'osm';
    }

    /**
     * Sugestões para o que foi digitado. Itens do OSM já trazem coordenada;
     * os do Google precisam de lugar($id).
     *
     * @return list<array<string, mixed>>
     */
    public function sugerir(string $texto, string $sessao): array
    {
        return $this->provedor() === 'google'
            ? $this->google->sugerir($texto, $sessao)
            : Cache::remember('osm:sugerir:'.md5(mb_strtolower($texto)), now()->addDay(), fn () => $this->osm->sugerir($texto));
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
            fn () => $google ? $this->google->referencias($lat, $lng) : $this->osm->referencias($lat, $lng),
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
     * Acha o local pelo ponto de referência ("perto do Hospital Roberto Santos").
     *
     * @return list<array{nome: string, endereco: string, lat: float, lng: float}>
     */
    public function buscarReferencia(string $texto, ?float $lat, ?float $lng): array
    {
        if ($this->provedor() === 'google') {
            return $this->google->buscarLugar($texto, $lat, $lng);
        }

        return array_map(fn (array $s) => [
            'nome' => $s['principal'],
            'endereco' => $s['secundario'],
            'lat' => $s['lat'],
            'lng' => $s['lng'],
        ], $this->sugerir($texto, ''));
    }

    /**
     * @return list<array{nome: string, lat: float, lng: float}>
     */
    public function bairrosParecidos(string $texto): array
    {
        return $this->bairros->parecidos($texto);
    }
}
