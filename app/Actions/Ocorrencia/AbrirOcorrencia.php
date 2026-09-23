<?php

namespace App\Actions\Ocorrencia;

use App\Enums\Perfil;
use App\Enums\StatusOcorrencia;
use App\Enums\TipoEvento;
use App\Models\Ocorrencia;
use App\Models\User;
use App\Services\EstimativaChegada;
use Illuminate\Support\Facades\DB;

/**
 * TARM abre o chamado. Grava a ocorrência, as vítimas e o evento de
 * abertura com a sugestão de recursos calculada naquele instante.
 */
class AbrirOcorrencia
{
    public function __construct(private EstimativaChegada $estimativa) {}

    /**
     * @param  array<string, mixed>  $dados  validado por AbrirOcorrenciaRequest
     */
    public function executar(User $tarm, array $dados, ?string $ip): Ocorrencia
    {
        // Calculada fora da transação: é chamada de rede e não pode segurar lock.
        $sugestao = isset($dados['lat'], $dados['lng'])
            ? array_slice($this->estimativa->ate((float) $dados['lat'], (float) $dados['lng'])['unidades'], 0, 5)
            : null;

        return DB::transaction(function () use ($tarm, $dados, $ip, $sugestao) {
            $agora = now();
            $ocorrencia = Ocorrencia::create([
                'protocolo' => $this->proximoProtocolo(),
                'status' => StatusOcorrencia::AguardandoTriagem,
                'aberta_em' => $agora,
                'tarm_id' => $tarm->id,
                ...collect($dados)->only(['telefone', 'solicitante', 'cidade', 'bairro', 'endereco', 'ponto_referencia', 'queixa', 'lat', 'lng'])->all(),
            ]);

            /** @var list<array<string, mixed>> $vitimas */
            $vitimas = $dados['vitimas'];
            foreach ($vitimas as $vitima) {
                $ocorrencia->vitimas()->create($vitima);
            }

            $ocorrencia->eventos()->create([
                'tipo' => TipoEvento::Aberta,
                'descricao' => 'Chamado aberto',
                'depois' => [
                    'dados' => collect($dados)->except('vitimas')->all(),
                    'vitimas' => $vitimas,
                    'sugestao' => $sugestao === null ? null : array_map(
                        fn (array $u) => collect($u)->only(['codigo', 'tipo', 'base', 'origem', 'minutos', 'km'])->all(),
                        $sugestao,
                    ),
                ],
                'user_id' => $tarm->id,
                'perfil' => Perfil::Tarm->value,
                'ip' => $ip,
                'created_at' => $agora,
            ]);

            return $ocorrencia;
        });
    }

    /** Data da central + sequência do dia (ex.: 202609230042). */
    private function proximoProtocolo(): string
    {
        $dia = now('America/Bahia')->format('Ymd');
        $ultimo = Ocorrencia::where('protocolo', 'like', $dia.'%')->lockForUpdate()->max('protocolo');

        return $dia.str_pad((string) ((int) substr((string) $ultimo, 8) + 1), 4, '0', STR_PAD_LEFT);
    }
}
