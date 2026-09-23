<?php

namespace App\Services\Mapas;

/**
 * Bairros de Salvador (database/data/bairros-salvador.json) com busca
 * tolerante a erro de digitação: o TARM escreve como ouve ("toróro",
 * "sussuarana", "sucupira"...), a comparação é feita por som.
 */
class Bairros
{
    /** @var list<array{nome: string, lat: float, lng: float, som: string}>|null */
    private ?array $lista = null;

    /**
     * @return list<array{nome: string, lat: float, lng: float}>
     */
    public function parecidos(string $digitado, int $limite = 3): array
    {
        $alvo = self::som($digitado);

        if ($alvo === '') {
            return [];
        }

        return array_values(collect($this->lista())
            ->map(function (array $b) use ($alvo) {
                $distancia = levenshtein($alvo, $b['som']);
                $prefixo = str_starts_with($b['som'], $alvo) && strlen($alvo) >= 4;

                return [...$b, 'nota' => $prefixo ? 0 : $distancia];
            })
            ->filter(fn (array $b) => $b['nota'] <= max(2, (int) floor(strlen($alvo) * 0.34)))
            ->sortBy('nota')
            ->take($limite)
            ->map(fn (array $b) => ['nome' => $b['nome'], 'lat' => $b['lat'], 'lng' => $b['lng']])
            ->all());
    }

    /** Bairro cujo centro está mais perto do ponto (quando o mapa não diz o bairro). */
    public function maisProximo(float $lat, float $lng): string
    {
        return collect($this->lista())
            ->sortBy(fn (array $b) => ($b['lat'] - $lat) ** 2 + (($b['lng'] - $lng) * cos(deg2rad($lat))) ** 2)
            ->first()['nome'];
    }

    public static function som(string $texto): string
    {
        return Fonetica::som($texto);
    }

    /**
     * @return list<array{nome: string, lat: float, lng: float, som: string}>
     */
    private function lista(): array
    {
        if ($this->lista === null) {
            /** @var array{bairros: list<array{nome: string, lat: float, lng: float}>} $dados */
            $dados = json_decode((string) file_get_contents(database_path('data/bairros-salvador.json')), true);
            $this->lista = array_map(fn (array $b) => [...$b, 'som' => self::som($b['nome'])], $dados['bairros']);
        }

        return $this->lista;
    }
}
