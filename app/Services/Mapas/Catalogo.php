<?php

namespace App\Services\Mapas;

use App\Models\Lugar;
use App\Models\Rua;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Busca no catálogo local de ruas e lugares de Salvador (MariaDB, carregado
 * do OpenStreetMap). Rápido e sem depender de serviço externo. Toda busca
 * por nome é tolerante a erro (Fonetica) e prefere o que está perto do
 * bairro ou do ponto informado — "Atakarejo" há vários; o do bairro vem 1º.
 */
class Catalogo
{
    /** Lugar "de apoio" que leva o nome do principal (estacionamento do hospital, prédio "da Fonte Nova"). */
    private const SECUNDARIO = '/\b(estacionamento|garagem|edificio|residencial|condominio)\b/';

    private const TIPOS_SECUNDARIOS = ['parking', 'bicycle parking', 'apartment', 'Área residencial', 'garage', 'garages'];

    public function __construct(private Bairros $bairros) {}

    public function carregado(): bool
    {
        return Rua::query()->exists();
    }

    /**
     * Ruas com algum pedaço a até `$raio` metros do ponto, da mais perto à
     * mais longe, com o ponto da rua mais próximo (para mover o marcador).
     *
     * @return list<array{nome: string, bairro: ?string, metros: int, homonimos: int, lat: float, lng: float, trechos: list<list<array{0: float, 1: float}>>}>
     */
    public function ruasPerto(float $lat, float $lng, int $raio = 250, int $limite = 10): array
    {
        $d = $raio / 111000;
        $dLng = $d / max(0.1, cos(deg2rad($lat)));

        return array_values(Rua::query()
            ->where('lat_min', '<=', $lat + $d)->where('lat_max', '>=', $lat - $d)
            ->where('lng_min', '<=', $lng + $dLng)->where('lng_max', '>=', $lng - $dLng)
            ->get()
            ->map(function (Rua $r) use ($lat, $lng) {
                [$metros, $perto] = self::maisPerto($r->trechos, $lat, $lng);

                return [
                    'nome' => $r->nome,
                    'bairro' => $r->bairro,
                    'metros' => $metros,
                    'homonimos' => $r->homonimos,
                    'lat' => $perto[0],
                    'lng' => $perto[1],
                    'trechos' => $r->trechos,
                ];
            })
            ->filter(fn (array $r) => $r['metros'] <= $raio)
            ->sortBy('metros')
            ->take($limite)
            ->all());
    }

    /**
     * @return list<array{nome: string, tipo: string, bairro: ?string, lat: float, lng: float, metros: int, homonimos: int}>
     */
    public function lugaresPerto(float $lat, float $lng, int $raio = 400, int $limite = 12): array
    {
        $d = $raio / 111000;
        $dLng = $d / max(0.1, cos(deg2rad($lat)));

        return array_values(Lugar::query()
            ->whereBetween('lat', [$lat - $d, $lat + $d])
            ->whereBetween('lng', [$lng - $dLng, $lng + $dLng])
            ->get()
            ->map(fn (Lugar $l) => [
                'nome' => $l->nome,
                'tipo' => $l->tipo,
                'bairro' => $l->bairro,
                'lat' => $l->lat,
                'lng' => $l->lng,
                'metros' => Geo::metros($lat, $lng, $l->lat, $l->lng),
                'homonimos' => $l->homonimos,
            ])
            ->filter(fn (array $l) => $l['metros'] <= $raio)
            ->sortBy('metros')
            ->take($limite)
            ->all());
    }

    /**
     * Ruas pelo nome digitado (de ouvido), perto do bairro/ponto primeiro.
     *
     * @return list<array<string, mixed>> nome, bairro, homonimos, lat, lng, km
     */
    public function buscarRuas(string $texto, ?string $bairro = null, ?float $lat = null, ?float $lng = null, int $limite = 8): array
    {
        $referencia = $this->referencia($bairro, $lat, $lng);

        return $this->buscar(Rua::query(), $texto, $bairro, $referencia, $limite, function (Rua|Lugar $r) use ($referencia) {
            // O ponto da rua mais perto da referência (rua longa atravessa bairros).
            $ponto = $referencia && $r instanceof Rua
                ? self::maisPerto($r->trechos, $referencia[0], $referencia[1])[1]
                : [$r->lat, $r->lng];

            return [
                'nome' => $r->nome,
                'bairro' => $r->bairro,
                'homonimos' => $r->homonimos,
                'lat' => $ponto[0],
                'lng' => $ponto[1],
            ];
        });
    }

    /**
     * Lugares pelo nome (ponto de referência), perto do bairro/ponto primeiro.
     *
     * @return list<array<string, mixed>> nome, tipo, bairro, homonimos, lat, lng, km
     */
    public function buscarLugares(string $texto, ?string $bairro = null, ?float $lat = null, ?float $lng = null, int $limite = 8): array
    {
        return $this->buscar(Lugar::query(), $texto, $bairro, $this->referencia($bairro, $lat, $lng), $limite, fn (Rua|Lugar $l) => [
            'nome' => $l->nome,
            'tipo' => $l instanceof Lugar ? $l->tipo : 'rua',
            'bairro' => $l->bairro,
            'homonimos' => $l->homonimos,
            'lat' => $l->lat,
            'lng' => $l->lng,
        ]);
    }

    /**
     * @param  Builder<Rua>|Builder<Lugar>  $query
     * @param  string  $texto  o que foi digitado
     * @param  array{0: float, 1: float}|null  $referencia
     * @param  callable(Rua|Lugar): array<string, mixed>  $formatar
     * @return list<array<string, mixed>>
     */
    private function buscar(Builder $query, string $texto, ?string $bairro, ?array $referencia, int $limite, callable $formatar): array
    {
        $deLugar = $query->getModel() instanceof Lugar;
        $som = $deLugar ? Fonetica::somDoLugar($texto) : Fonetica::somDoNome($texto);
        $palavras = $deLugar ? Fonetica::palavrasDoLugar($texto) : Fonetica::palavrasDoNome($texto);
        $somBairro = $bairro !== null && trim($bairro) !== '' ? Fonetica::som($bairro) : null;
        if (strlen($som) < 2) {
            return [];
        }

        // Contém o som digitado; se vier pouco, amplia para quem começa igual
        // (pega troca de letra no meio: "sussuarana" x "susuarana") e para quem
        // tem a palavra mais longa digitada (nome com palavra a mais ou a menos).
        // Os mais curtos primeiro: o nome exato não se perde entre 400 que só o contêm ("bar" em "Barbalho").
        $candidatos = (clone $query)->where('som', 'like', '%'.$som.'%')->orderByRaw('LENGTH(som)')->limit(400)->get();
        if ($candidatos->count() < $limite) {
            $candidatos = $candidatos->merge((clone $query)->where('som', 'like', substr($som, 0, 2).'%')->limit(3000)->get());
            $maisLonga = collect($palavras)->sortByDesc(fn (string $p) => strlen($p))->first();
            if (count($palavras) > 1 && strlen((string) $maisLonga) >= 4) {
                $candidatos = $candidatos->merge((clone $query)->where('som', 'like', '%'.$maisLonga.'%')->orderByRaw('LENGTH(som)')->limit(400)->get());
            }
        }

        $tolerancia = Fonetica::tolerancia($som);
        $parecidos = $candidatos->filter(fn (Model $m) => Fonetica::nota($som, (string) $m->getAttribute('som')) <= $tolerancia)
            ->unique(fn (Model $m) => $m->getKey())->count();

        // Rua: o tipo dito ("avenida acm") desempata contra outro tipo ("Rua ACM").
        $tipoDito = $deLugar ? null : Fonetica::tipoDoLogradouro($texto);
        // Lugar: a palavra genérica dita ("hospital", "igreja", "upa") confirma o lugar
        // que a tem; estacionamento/prédio de mesmo nome só se foi isso que se disse.
        $genericos = $deLugar ? Fonetica::genericosDoLugar($texto) : [];
        $querSecundario = preg_match(self::SECUNDARIO, Fonetica::normalizar($texto)) === 1;

        return array_values($candidatos
            ->unique(fn (Model $m) => $m->getKey())
            ->map(function (Model $m) use ($som, $palavras, $referencia, $formatar, $parecidos, $somBairro, $tipoDito, $genericos, $querSecundario) {
                /** @var Rua|Lugar $m */
                $item = $formatar($m);
                $km = $referencia ? Geo::metros($referencia[0], $referencia[1], $item['lat'], $item['lng']) / 1000 : null;

                // Lugar: "homônimo" é qualquer outro que responda pelo mesmo nome
                // buscado (as ~25 lojas "Atacadão Atakarejo" / "Atakarejo").
                if ($m instanceof Lugar) {
                    $item['homonimos'] = max((int) $item['homonimos'], $parecidos - 1);
                }

                $nota = Fonetica::nota($som, $m->som);
                // Nome pela metade ou com palavra faltando, palavra a palavra.
                $porPalavras = Fonetica::notaPorPalavras($palavras, $m instanceof Lugar ? Fonetica::palavrasDoLugar($m->nome) : Fonetica::palavrasDoNome($m->nome));
                if ($porPalavras !== null) {
                    $nota = min($nota, $porPalavras);
                }
                // Lugar de rede: nome exato ou contido valem o mesmo; quem decide é a distância.
                if ($m instanceof Lugar && $nota <= 1) {
                    $nota = 0;
                }
                if ($m instanceof Rua && $tipoDito !== null) {
                    $tipo = Fonetica::tipoDoLogradouro($m->nome);
                    if ($tipo !== null && $tipo !== $tipoDito) {
                        $nota += 1;
                    }
                }
                if ($m instanceof Lugar) {
                    $nome = explode(' ', Fonetica::normalizar($m->nome));
                    $somTipo = Fonetica::som($m->tipo);
                    foreach ($genericos as $g) {
                        if (in_array($g, $nome, true) || $somTipo === Fonetica::som($g)) {
                            $nota -= 1;
                            break;
                        }
                    }
                    if (! $querSecundario && (in_array($m->tipo, self::TIPOS_SECUNDARIOS, true) || preg_match(self::SECUNDARIO, implode(' ', $nome)) === 1)) {
                        $nota += 1;
                    }
                }
                // No bairro que o solicitante disse (ou que começa por ele: "sao goncalo"
                // = São Gonçalo do Retiro): sobe na frente.
                // ...ou que leva o nome dele ("Atakarejo San Martin", no polígono de Santa Mônica).
                $somDoBairro = Fonetica::som((string) $item['bairro']);
                if ($somBairro !== null && (
                    $somDoBairro === $somBairro
                    || (strlen($somBairro) >= 5 && str_starts_with($somDoBairro, $somBairro))
                    || (strlen($somBairro) >= 5 && str_contains((string) $m->getAttribute('som'), substr($somBairro, 0, -1)))
                )) {
                    $nota -= 2;
                }

                return [...$item, 'km' => $km === null ? null : round($km, 1), '_nota' => $nota, '_km' => $km ?? 0];
            })
            ->filter(fn (array $i) => $i['_nota'] <= $tolerancia)
            // parecença manda; distância desempata e pesa (2 km ≈ 1 letra errada)
            ->sortBy(fn (array $i) => $i['_nota'] + $i['_km'] / 2)
            ->take($limite)
            ->map(fn (array $i) => array_diff_key($i, ['_nota' => 0, '_km' => 0]))
            ->all());
    }

    /**
     * Ponto de referência para ordenar por distância: o marcado no mapa, ou
     * o centro do bairro informado.
     *
     * @return array{0: float, 1: float}|null
     */
    private function referencia(?string $bairro, ?float $lat, ?float $lng): ?array
    {
        if ($lat !== null && $lng !== null) {
            return [$lat, $lng];
        }
        if ($bairro === null || trim($bairro) === '') {
            return null;
        }

        return $this->centroDoBairro($bairro);
    }

    /**
     * Centro do bairro: pela lista de bairros (tolerante a erro) ou, se o
     * nome não estiver lá, pela média das ruas do catálogo com esse bairro.
     *
     * @return array{0: float, 1: float}|null
     */
    public function centroDoBairro(string $bairro): ?array
    {
        $somBairro = Fonetica::som($bairro);
        $b = $this->bairros->parecidos($bairro, 1)[0] ?? null;
        if ($b !== null && Fonetica::som($b['nome']) === $somBairro) {
            return [$b['lat'], $b['lng']];
        }

        foreach ([Rua::query(), Lugar::query()] as $query) {
            $media = $query->where('bairro', $bairro)->selectRaw('AVG(lat) AS lat, AVG(lng) AS lng')->first();
            if ($media?->getAttribute('lat') !== null) {
                return [(float) $media->getAttribute('lat'), (float) $media->getAttribute('lng')];
            }
        }

        if ($b !== null) {
            return [$b['lat'], $b['lng']];
        }

        // Bairro com nome de rua ("San Martin" ↔ Av. General San Martin).
        $media = Rua::query()->where('som', 'like', '%'.Fonetica::somDoNome($bairro).'%')
            ->selectRaw('AVG(lat) AS lat, AVG(lng) AS lng')->first();

        return $media?->getAttribute('lat') !== null
            ? [(float) $media->getAttribute('lat'), (float) $media->getAttribute('lng')]
            : null;
    }

    /**
     * @param  list<list<array{0: float, 1: float}>>  $trechos
     * @return array{0: int, 1: array{0: float, 1: float}}
     */
    private static function maisPerto(array $trechos, float $lat, float $lng): array
    {
        $melhor = [PHP_INT_MAX, [$lat, $lng]];
        foreach ($trechos as $trecho) {
            foreach ($trecho as $p) {
                $m = Geo::metros($lat, $lng, (float) $p[0], (float) $p[1]);
                if ($m < $melhor[0]) {
                    $melhor = [$m, [(float) $p[0], (float) $p[1]]];
                }
            }
        }

        return $melhor;
    }
}
