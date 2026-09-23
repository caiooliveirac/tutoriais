<?php

namespace App\Console\Commands;

use App\Services\Mapas\Catalogo;
use App\Services\Mapas\Fonetica;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

/**
 * Mede a busca de ruas e referências contra casos difíceis reais
 * (database/data/casos-dificeis.json): o que o TARM digitaria ouvindo um
 * solicitante leigo × o que é de verdade. Rodar depois de mexer na busca.
 */
#[Signature('mapas:avaliar {--detalhe : mostra cada caso}')]
#[Description('Mede acerto da busca de ruas/referências em casos difíceis')]
class AvaliarBusca extends Command
{
    public function handle(Catalogo $catalogo): int
    {
        if (! $catalogo->carregado()) {
            $this->error('Catálogo vazio: rode php artisan db:seed --class=MapaSeeder');

            return self::FAILURE;
        }

        /** @var list<array{tipo: string, digitado: string, bairro?: ?string, espera: string, espera_bairro?: ?string, nota?: string}> $casos */
        $casos = json_decode((string) file_get_contents(database_path('data/casos-dificeis.json')), true)['casos'];

        $placar = ['top1' => 0, 'top3' => 0, 'top5' => 0, 'erro' => 0];
        $linhas = [];
        foreach ($casos as $c) {
            $achados = $c['tipo'] === 'rua'
                ? $catalogo->buscarRuas($c['digitado'], $c['bairro'] ?? null, limite: 5)
                : $catalogo->buscarLugares($c['digitado'], $c['bairro'] ?? null, limite: 5);

            $posicao = null;
            foreach ($achados as $i => $a) {
                $nomeOk = Fonetica::somDoNome((string) $a['nome']) === Fonetica::somDoNome($c['espera']);
                $bairroOk = empty($c['espera_bairro']) || Fonetica::som((string) $a['bairro']) === Fonetica::som($c['espera_bairro']);
                if ($nomeOk && $bairroOk) {
                    $posicao = $i + 1;
                    break;
                }
            }

            match (true) {
                $posicao === 1 => $placar['top1']++,
                $posicao !== null && $posicao <= 3 => $placar['top3']++,
                $posicao !== null => $placar['top5']++,
                default => $placar['erro']++,
            };
            $linhas[] = [
                $posicao ? "#{$posicao}" : 'ERRO',
                $c['tipo'],
                $c['digitado'].($c['bairro'] ?? null ? " | {$c['bairro']}" : ''),
                $c['espera'].($c['espera_bairro'] ?? null ? " ({$c['espera_bairro']})" : ''),
                $posicao === 1 ? '' : implode(' · ', array_map(fn ($a) => $a['nome'].' ('.$a['bairro'].')', array_slice($achados, 0, 3))),
            ];
        }

        if ($this->option('detalhe')) {
            $this->table(['acerto', 'tipo', 'digitado | bairro', 'esperado', 'veio (se não foi 1º)'], $linhas);
        }

        $n = count($casos);
        $this->info(sprintf(
            '%d casos — 1º lugar: %d (%.0f%%) · até 3º: %d (%.0f%%) · até 5º: %d (%.0f%%) · não achou: %d',
            $n,
            $placar['top1'], 100 * $placar['top1'] / $n,
            $placar['top1'] + $placar['top3'], 100 * ($placar['top1'] + $placar['top3']) / $n,
            $n - $placar['erro'], 100 * ($n - $placar['erro']) / $n,
            $placar['erro'],
        ));

        return self::SUCCESS;
    }
}
