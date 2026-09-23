<?php

namespace App\Services\Mapas;

use Illuminate\Support\Str;

/**
 * Comparação de nomes "de ouvido": o TARM escreve como escuta
 * ("toróro", "sussuarana", "cajaseiras"), então comparamos o som.
 */
final class Fonetica
{
    /** Tipos de logradouro (e abreviações): "rua do tororó" e "tororó" soam o mesmo nome. */
    private const TIPOS = [
        'rua' => 'rua', 'r' => 'rua', 'avenida' => 'avenida', 'av' => 'avenida', 'travessa' => 'travessa',
        'tv' => 'travessa', 'trav' => 'travessa', 'ladeira' => 'ladeira', 'ld' => 'ladeira', 'alameda' => 'alameda',
        'al' => 'alameda', 'estrada' => 'estrada', 'estr' => 'estrada', 'largo' => 'largo', 'lg' => 'largo',
        'praca' => 'praca', 'pca' => 'praca', 'beco' => 'beco', 'vila' => 'vila', 'via' => 'via', 'rodovia' => 'rodovia',
        'rod' => 'rodovia', 'caminho' => 'caminho', 'conjunto' => 'conjunto', 'cj' => 'conjunto',
        'loteamento' => 'loteamento', 'lot' => 'loteamento', 'viela' => 'viela', 'passagem' => 'passagem',
        'servidao' => 'servidao',
    ];

    /** Números por extenso (cardinais e ordinais) → dígito: "quatorze" = "14", "primeira" = "1". */
    private const NUMEROS = [
        'um' => 1, 'primeiro' => 1, 'primeira' => 1, 'dois' => 2, 'duas' => 2, 'segundo' => 2, 'segunda' => 2,
        'tres' => 3, 'terceiro' => 3, 'terceira' => 3, 'quatro' => 4, 'quarto' => 4, 'quarta' => 4,
        'cinco' => 5, 'quinto' => 5, 'quinta' => 5, 'seis' => 6, 'sexto' => 6, 'sexta' => 6,
        'sete' => 7, 'setimo' => 7, 'setima' => 7, 'oito' => 8, 'oitavo' => 8, 'oitava' => 8,
        'nove' => 9, 'nono' => 9, 'nona' => 9, 'dez' => 10, 'decimo' => 10, 'decima' => 10,
        'onze' => 11, 'doze' => 12, 'treze' => 13, 'quatorze' => 14, 'catorze' => 14, 'quinze' => 15,
        'dezesseis' => 16, 'dezeseis' => 16, 'dezessete' => 17, 'dezesete' => 17, 'dezoito' => 18,
        'dezenove' => 19, 'vinte' => 20, 'trinta' => 30, 'quarenta' => 40, 'cinquenta' => 50,
        'sessenta' => 60, 'setenta' => 70, 'oitenta' => 80, 'noventa' => 90, 'cem' => 100,
    ];

    /** Siglas populares de Salvador → nome oficial ("Av. ACM", "JJ Seabra"). */
    private const SIGLAS = [
        '/\bacm\b/' => 'antonio carlos magalhaes',
        '/\bj ?j seabra\b/' => 'jose joaquim seabra',
    ];

    /**
     * Minúsculo, sem acento, só letras/dígitos/espaço; números por extenso e
     * ordinais viram dígito ("vinte e oito" = "28", "1ª" = "1", "02" = "2")
     * e siglas populares viram o nome por extenso.
     */
    public static function normalizar(string $texto): string
    {
        $t = Str::lower(Str::ascii($texto));
        $t = preg_replace('/[^a-z0-9]+/', ' ', $t) ?? '';
        $t = preg_replace('/\b(\d+)(a|o|as|os)\b/', '$1', $t) ?? $t;
        $t = preg_replace_callback('/\b[a-z]+\b/', fn (array $m) => (string) (self::NUMEROS[$m[0]] ?? $m[0]), $t) ?? $t;
        $t = preg_replace_callback('/\b([2-9]0) e ([1-9])\b/', fn (array $m) => (string) ((int) $m[1] + (int) $m[2]), $t) ?? $t;
        $t = preg_replace('/\b0+(\d)/', '$1', $t) ?? $t;
        $t = preg_replace(array_keys(self::SIGLAS), array_values(self::SIGLAS), $t) ?? $t;

        return trim(preg_replace('/\s+/', ' ', $t) ?? $t);
    }

    public static function som(string $texto): string
    {
        $t = self::normalizar($texto);
        // Números seguidos ficam separados ("1ª Travessa 8" ≠ "Travessa 18").
        $t = preg_replace('/(\d) (?=\d)/', '$1-', $t) ?? $t;
        $t = preg_replace('/[^a-z0-9-]/', '', $t) ?? '';
        $t = strtr($t, ['y' => 'i', 'w' => 'v', 'k' => 'c']);

        $t = preg_replace(
            // m antes de consoante ou no fim soa n: "bomfim" = "bonfim", "bimba" = "binba".
            ['/ch|sh|x/', '/lh/', '/nh/', '/qu|q|c(?=[aou])|ck/', '/c(?=[ei])|ss|z/', '/h/', '/([a-z])\1+/', '/m(?![aeiou])/', '/([a-z])\1+/'],
            ['x', 'li', 'ni', 'k', 's', '', '$1', 'n', '$1'],
            $t,
        ) ?? '';

        // Vogal final some ("tororó" = "tororo" = "toror"), mas sem apagar o nome curto ("Bahia").
        $sem = preg_replace('/[aeiou]+$/', '', $t) ?? $t;

        return strlen($sem) >= 3 ? $sem : (preg_replace('/[aeiou]$/', '', $t) ?? $t);
    }

    /** Tipo de logradouro com que o nome começa ("av" → "avenida"), se houver. */
    public static function tipoDoLogradouro(string $nome): ?string
    {
        $t = self::normalizar($nome);

        return preg_match('/^(?:\d+ )?([a-z]+) /', $t, $m) ? (self::TIPOS[$m[1]] ?? null) : null;
    }

    /** Nome sem o tipo de logradouro nem "do/da/de" (o ordinal fica: "1ª Travessa X" → "1 x"). */
    private static function nucleo(string $nome): string
    {
        $t = self::normalizar($nome);
        $tipos = implode('|', array_keys(self::TIPOS));
        $t = preg_replace('/^(\d+ )?(?:'.$tipos.') (?=\S)/', '$1', $t) ?? $t;

        return trim(preg_replace('/\b(do|da|de|dos|das|e)\b/', ' ', $t) ?? $t);
    }

    /** Som do nome sem o tipo de logradouro nem "do/da/de". */
    public static function somDoNome(string $nome): string
    {
        return self::som(self::nucleo($nome));
    }

    /**
     * Som de cada palavra do nome (sem tipo de logradouro nem "do/da/de"),
     * para achar nome pela metade ou com palavra faltando.
     *
     * @return list<string>
     */
    public static function palavrasDoNome(string $nome): array
    {
        return array_values(array_filter(array_map(self::som(...), explode(' ', self::nucleo($nome))), fn (string $p) => $p !== ''));
    }

    /**
     * Palavras que o solicitante diz mas o nome do lugar nem sempre tem
     * ("farmácia pague menos" x "Pague Menos"; "atacadão atakarejo" x
     * "Atakarejo"). Ficam de fora da comparação de lugares.
     */
    private const GENERICOS_LUGAR = '/\b(farmacia|drogaria|drogarias|supermercado|supermercados|mercado|mercadinho|minimercado|atacadao|atakadao|atacarejo|posto|loja|lojas|padaria|panificadora|escola|colegio|creche|municipal|estadual|igreja|templo|paroquia|capela|assembleia|batista|hospital|clinica|upa|academia|restaurante|lanchonete|bar|pizzaria|acai|associacao|condominio|edificio|residencial|shopping|praca)\b/';

    /** O nome do lugar sem as palavras genéricas (ou inteiro, se só tiver elas). */
    private static function semGenericos(string $nome): string
    {
        $t = self::normalizar($nome);
        $sem = trim(preg_replace(self::GENERICOS_LUGAR, ' ', $t) ?? $t);

        // Só palavras genéricas ("Igreja Batista"): mantém o nome inteiro.
        return $sem === '' ? $t : $sem;
    }

    /** Som do nome de um lugar, sem as palavras genéricas. */
    public static function somDoLugar(string $nome): string
    {
        return self::somDoNome(self::semGenericos($nome));
    }

    /** @return list<string> */
    public static function palavrasDoLugar(string $nome): array
    {
        return self::palavrasDoNome(self::semGenericos($nome));
    }

    /**
     * Palavras genéricas ditas ("hospital", "igreja", "upa"): confirmam o
     * lugar quando ele as tem no nome ou no tipo.
     *
     * @return list<string>
     */
    public static function genericosDoLugar(string $nome): array
    {
        preg_match_all(self::GENERICOS_LUGAR, self::normalizar($nome), $m);

        return array_values(array_unique($m[1]));
    }

    /**
     * Nota de parecença (0 = igual; menor é melhor). Contido no nome conta
     * como quase igual: "tororo" acha "Amparo do Tororó". Número diferente é
     * outra rua: "8 de Dezembro" não é "28 de Dezembro".
     */
    public static function nota(string $buscado, string $candidato): int
    {
        if ($buscado === '' || $candidato === '') {
            return 99;
        }
        if ($buscado === $candidato) {
            return 0;
        }

        preg_match_all('/\d+/', $buscado, $b);
        preg_match_all('/\d+/', $candidato, $c);
        $outroNumero = array_diff($b[0], $c[0]) !== [] ? 2 : 0;

        if (strlen($buscado) >= 4 && self::contem($candidato, $buscado)) {
            return 1 + $outroNumero;
        }

        return levenshtein($buscado, $candidato) + 1 + $outroNumero;
    }

    /**
     * Nota por palavras: cada palavra buscada, na ordem, aparece (com pouco
     * erro) no candidato — "roberto santos" acha "Geral Roberto Santos",
     * "antonio magalhaes" acha "Antônio Carlos Magalhães". Null se faltar alguma.
     *
     * @param  list<string>  $buscadas
     * @param  list<string>  $candidatas
     */
    public static function notaPorPalavras(array $buscadas, array $candidatas): ?int
    {
        if ($buscadas === [] || strlen(implode('', $buscadas)) < 4) {
            return null;
        }

        $nota = count($candidatas) > count($buscadas) ? 1 : 0;
        $inicio = 0;
        foreach ($buscadas as $b) {
            // Número e palavra curta: só igual. Palavra maior: ~1 erro a cada 4 letras.
            $folga = ctype_digit($b) || strlen($b) < 4 ? 0 : max(1, intdiv(strlen($b), 4));
            $achou = null;
            for ($i = $inicio; $i < count($candidatas); $i++) {
                $d = levenshtein($b, $candidatas[$i]);
                if ($d <= $folga && ($achou === null || $d < $achou[1])) {
                    $achou = [$i, $d];
                }
            }
            if ($achou === null) {
                return null;
            }
            $inicio = $achou[0] + 1;
            $nota += $achou[1];
        }

        return $nota;
    }

    /** Até quanto de diferença ainda é "o mesmo nome dito errado". */
    public static function tolerancia(string $buscado): int
    {
        return max(2, (int) floor(strlen($buscado) * 0.34)) + 1;
    }

    /** Contido, sem cortar número ao meio ("8desembr" não está em "28desembr"). */
    private static function contem(string $candidato, string $buscado): bool
    {
        $antes = ctype_digit($buscado[0]) ? '(?<![0-9])' : '';
        $depois = ctype_digit($buscado[strlen($buscado) - 1]) ? '(?![0-9])' : '';

        return preg_match('/'.$antes.preg_quote($buscado, '/').$depois.'/', $candidato) === 1;
    }
}
