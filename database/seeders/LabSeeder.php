<?php

namespace Database\Seeders;

use App\Enums\Intercorrencia;
use App\Enums\Perfil;
use App\Enums\Risco;
use App\Enums\StatusOcorrencia;
use App\Enums\TipoEvento;
use App\Enums\TipoRecurso;
use App\Models\Hospital;
use App\Models\Ocorrencia;
use App\Models\Unidade;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Plantão fictício para o LAB: ocorrências em todas as etapas e
 * situações levantadas no mock (docs/DOMINIO.md), com linha do tempo
 * completa em eventos_ocorrencia. Determinístico (mesma semente, mesmo
 * plantão). Nunca roda em produção.
 *
 *   php artisan migrate:fresh --seed --seeder=LabSeeder
 */
class LabSeeder extends Seeder
{
    private const ENVIO = 'ENVIO DE UNIDADE MÓVEL';

    private CarbonImmutable $agora;

    private int $sequencia = 0;

    /** @var array<string, list<User>> */
    private array $equipe = [];

    /** @var array<int, true> unidades empenhadas */
    private array $empenhadas = [];

    public function run(): void
    {
        if (app()->isProduction()) {
            throw new RuntimeException('LabSeeder não roda em produção.');
        }

        $this->call(DatabaseSeeder::class);

        mt_srand(2026);
        $this->agora = CarbonImmutable::now()->startOfMinute();
        $this->montarEquipe();

        foreach ($this->plano() as [$situacao, $destino]) {
            $this->criar(self::SITUACOES[$situacao], $destino);
        }

        $this->numerarProtocolos();
    }

    /**
     * Protocolo = data local + sequência do dia, em ordem de abertura.
     */
    private function numerarProtocolos(): void
    {
        $ocorrencias = Ocorrencia::orderBy('aberta_em')->get();
        $ocorrencias->each(fn (Ocorrencia $o) => $o->update(['protocolo' => 'TMP'.$o->id]));

        $sequencia = [];
        foreach ($ocorrencias as $o) {
            $dia = $o->aberta_em->setTimezone('America/Bahia')->format('Ymd');
            $sequencia[$dia] = ($sequencia[$dia] ?? 0) + 1;
            $o->update(['protocolo' => $dia.str_pad((string) $sequencia[$dia], 4, '0', STR_PAD_LEFT)]);
        }
    }

    /**
     * Situação clínica × até onde a ocorrência chegou.
     *
     * @return list<array{0: string, 1: string}>
     */
    private function plano(): array
    {
        return [
            // já finalizadas (mais antigas)
            ['tce_idoso', 'finalizada'],
            ['convulsao', 'finalizada'],
            ['agressao', 'finalizada'],
            ['sincope', 'finalizada'],
            ['obito', 'finalizada'],
            // encerradas sem envio de unidade
            ['febre_crianca', 'sem_envio:ORIENTAÇÃO MÉDICA'],
            ['vomitos_pos_alta', 'sem_envio:ORIENTO IDA PARA UNIDADE DE EMERGÊNCIA POR MEIOS PRÓPRIOS'],
            ['dor_abdominal', 'sem_envio:3 OU MAIS TENTATIVAS DE CONTATO SEM RETORNO'],
            ['transferencia_uti', 'sem_envio:REGULAÇÃO VIA CER'],
            // canceladas
            ['queda_bicicleta', 'cancelado_triagem:CANCELADO PELO SOLICITANTE'],
            ['surto', 'cancelado_despacho:REMOVIDO POR TERCEIROS'],
            // reguladas para hospital
            ['avc', 'regulado'],
            ['tce_idoso', 'regulado'],
            ['acidente_moto', 'regulado'],
            ['trabalho_parto', 'regulado'],
            ['dor_toracica', 'regulado'],
            // equipe no local, procurando recurso (vaga)
            ['apendicite_crianca', 'recurso'],
            ['queimadura', 'recurso'],
            ['dispneia_crianca', 'recurso'],
            ['convulsao', 'recurso'],
            // unidade empenhada, aguardando retorno — com e sem intercorrência
            ['hiperglicemia', 'retorno'],
            ['agressao', 'retorno'],
            ['sangramento_gestante', 'retorno'],
            ['surto', 'retorno:evasao'],
            ['sincope', 'retorno:recusa'],
            ['dor_toracica', 'retorno:problema_mecanico'],
            ['dispneia_crianca', 'retorno:piora'],
            ['queda_bicicleta', 'retorno:qta'],
            // triadas, aguardando despacho (fila do enfermeiro / rádio)
            ['avc', 'solicitado'],
            ['acidente_moto', 'solicitado'],
            ['trabalho_parto', 'solicitado'],
            ['tce_idoso', 'solicitado'],
            ['sincope', 'solicitado'],
            // recém-abertas, aguardando triagem
            ['dor_toracica', 'triagem'],
            ['vomitos_pos_alta', 'triagem'],
            ['tc_cranio', 'triagem'],
            ['convulsao', 'triagem_travada'],
            ['dispneia_crianca', 'triagem'],
            ['hiperglicemia', 'triagem'],
        ];
    }

    /**
     * @param  array<string, mixed>  $s
     */
    private function criar(array $s, string $destino): void
    {
        [$etapa, $detalhe] = array_pad(explode(':', $destino, 2), 2, null);

        $minutos = match ($etapa) {
            'finalizada' => mt_rand(150, 230),
            'sem_envio', 'cancelado_triagem', 'cancelado_despacho' => mt_rand(60, 200),
            'regulado' => mt_rand(55, 110),
            'recurso' => mt_rand(35, 60),
            'retorno' => mt_rand(12, 35),
            'solicitado' => mt_rand(5, 12),
            default => mt_rand(0, 4),
        };
        $t = $this->agora->subMinutes($minutos)->subSeconds(mt_rand(0, 59));

        $tarm = $this->alguem(Perfil::Tarm);
        $medico = $this->alguem(Perfil::MedicoRegulador);
        $radio = $this->alguem(Perfil::RadioOperador);
        $enfermeiro = $this->alguem(Perfil::EnfermeiroRegulador);

        // 1. TARM abre o chamado
        $o = Ocorrencia::create([
            'protocolo' => 'NOVA'.++$this->sequencia, // numerado ao final
            'status' => StatusOcorrencia::AguardandoTriagem,
            'aberta_em' => $t,
            'tarm_id' => $tarm->id,
            'telefone' => $this->telefone(),
            'solicitante' => $this->solicitante($s),
            'cidade' => 'Salvador',
            'bairro' => $this->sortear(self::BAIRROS),
            'endereco' => $this->sortear(self::LOGRADOUROS).', '.mt_rand(1, 999),
            'ponto_referencia' => $this->sortear(self::REFERENCIAS),
            'queixa' => $s['queixa'],
        ]);
        foreach ($s['vitimas'] as [$idadeMin, $idadeMax, $sexo]) {
            $o->vitimas()->create([
                'nome' => $this->nome($sexo),
                'idade' => mt_rand($idadeMin, $idadeMax),
                'sexo' => $sexo,
            ]);
        }
        $this->evento($o, TipoEvento::Aberta, 'Chamado aberto', $tarm, Perfil::Tarm, $t);

        if ($etapa === 'triagem') {
            return;
        }
        if ($etapa === 'triagem_travada') {
            $o->update(['travada_por' => $medico->id, 'travada_em' => $t->addMinutes(2)]);
            $this->evento($o, TipoEvento::FichaAberta, 'Ficha aberta para triagem', $medico, Perfil::MedicoRegulador, $t->addMinutes(2));

            return;
        }
        if ($etapa === 'cancelado_triagem') {
            $this->cancelar($o, (string) $detalhe, $tarm, Perfil::Tarm, $t->addMinutes(mt_rand(1, 3)));

            return;
        }

        // 2. Médico regulador tria e decide
        $t = $t->addMinutes(mt_rand(2, 6))->addSeconds(mt_rand(0, 59));
        $o->update([
            'medico_id' => $medico->id,
            'tipo_ocorrencia' => $s['tipo'],
            'motivo' => $s['motivo'],
            'detalhamento' => $s['detalhamento'] ?? 'SEM DETALHAMENTO',
            'risco' => $s['risco'],
            'hma' => $s['hma'],
        ]);
        $this->evento($o, TipoEvento::Triada, 'Triagem: risco '.$s['risco']->value, $medico, Perfil::MedicoRegulador, $t, depois: ['risco' => $s['risco']->value]);

        if ($etapa === 'sem_envio') {
            $o->update(['decisao_medica' => $detalhe, 'status' => StatusOcorrencia::EncerradoSemEnvio]);
            $this->evento($o, TipoEvento::DecisaoMedica, (string) $detalhe, $medico, Perfil::MedicoRegulador, $t->addMinutes(1));

            return;
        }

        $o->update([
            'decisao_medica' => self::ENVIO,
            'tipo_recurso' => $s['recurso'],
            'solicitado_envio_em' => $t,
            'status' => StatusOcorrencia::SolicitadoEnvio,
        ]);
        $this->evento($o, TipoEvento::DecisaoMedica, self::ENVIO.': '.$s['recurso']->label(), $medico, Perfil::MedicoRegulador, $t);

        if ($etapa === 'solicitado') {
            return;
        }
        if ($etapa === 'cancelado_despacho') {
            $this->cancelar($o, (string) $detalhe, $radio, Perfil::RadioOperador, $t->addMinutes(mt_rand(2, 5)));

            return;
        }

        // 3. Despacho: enfermeiro nas vermelhas, rádio-operador nas demais
        [$despachante, $perfil] = $s['risco'] === Risco::Vermelho
            ? [$enfermeiro, Perfil::EnfermeiroRegulador]
            : [$radio, Perfil::RadioOperador];
        $unidade = $this->unidadeLivre($s['recurso']);
        $t = $t->addMinutes(mt_rand(1, 4))->addSeconds(mt_rand(0, 59));
        $o->update(['unidade_id' => $unidade->id, 'despachada_em' => $t, 'status' => StatusOcorrencia::AguardandoRetorno]);
        $this->evento($o, TipoEvento::Despachada, "Unidade {$unidade->codigo} despachada", $despachante, $perfil, $t);

        if ($etapa === 'retorno') {
            if ($detalhe !== null) {
                $this->intercorrencia($o, Intercorrencia::from($detalhe), $unidade, $radio, $t->addMinutes(mt_rand(5, 10)));
            }

            return;
        }

        // 4. Equipe no local: relato e sinais vitais
        $t = $t->addMinutes(mt_rand(12, 25))->addSeconds(mt_rand(0, 59));
        $o->update(['relato_equipe' => str_replace('{unidade}', $unidade->codigo, $s['relato']), 'status' => StatusOcorrencia::ProcurandoRecurso]);
        foreach ($o->vitimas as $i => $vitima) {
            $vitima->update(['sinais_vitais' => $s['vitimas'][$i][3]]);
        }
        $this->evento($o, TipoEvento::RetornoEquipe, 'Equipe no local: relato recebido', $radio, Perfil::RadioOperador, $t);
        $this->evento($o, TipoEvento::ProcurandoRecurso, 'Procurando recurso hospitalar', $medico, Perfil::MedicoRegulador, $t->addMinutes(1));

        if ($etapa === 'recurso') {
            return;
        }

        // Óbito no local: não há destino a regular
        if ($s['hospital'] === null) {
            $o->update(['status' => StatusOcorrencia::Finalizada]);
            unset($this->empenhadas[$unidade->id]);
            $this->evento($o, TipoEvento::Finalizada, "Óbito constatado no local; {$unidade->codigo} liberada", $medico, Perfil::MedicoRegulador, $t->addMinutes(mt_rand(20, 35)));

            return;
        }

        // 5. Médico regula para o destino
        $hospital = Hospital::where('sigla', $s['hospital'])->orWhere('nome', $s['hospital'])->firstOrFail();
        $t = $t->addMinutes(mt_rand(5, 15))->addSeconds(mt_rand(0, 59));
        $o->update(['hospital_id' => $hospital->id, 'status' => StatusOcorrencia::Regulado]);
        $this->evento($o, TipoEvento::Regulada, "Regulado para {$hospital->nome}", $medico, Perfil::MedicoRegulador, $t);

        if ($etapa === 'regulado') {
            return;
        }

        // 6. Paciente entregue, unidade liberada
        $t = $t->addMinutes(mt_rand(20, 40));
        $o->update(['status' => StatusOcorrencia::Finalizada]);
        unset($this->empenhadas[$unidade->id]);
        $this->evento($o, TipoEvento::Finalizada, "Paciente entregue; {$unidade->codigo} liberada", $radio, Perfil::RadioOperador, $t);
    }

    private function intercorrencia(Ocorrencia $o, Intercorrencia $tipo, Unidade $unidade, User $radio, CarbonImmutable $t): void
    {
        $o->update([
            'intercorrencia' => $tipo,
            'unidade_desvinculada' => $tipo->desvinculaUnidade(),
        ]);

        if ($tipo === Intercorrencia::ProblemaMecanico) {
            $unidade->update(['baixada' => true]);
        }
        if ($tipo->desvinculaUnidade()) {
            unset($this->empenhadas[$unidade->id]);
        }

        $this->evento($o, TipoEvento::Intercorrencia, $tipo->titulo().' ('.$unidade->codigo.')', $radio, Perfil::RadioOperador, $t, depois: ['intercorrencia' => $tipo->value]);
    }

    private function cancelar(Ocorrencia $o, string $motivo, User $quem, Perfil $perfil, CarbonImmutable $t): void
    {
        $o->update(['status' => StatusOcorrencia::Cancelado, 'decisao_medica' => $o->decisao_medica ?? $motivo]);
        $this->evento($o, TipoEvento::Cancelada, $motivo, $quem, $perfil, $t);
    }

    /**
     * @param  array<string, mixed>|null  $depois
     */
    private function evento(Ocorrencia $o, TipoEvento $tipo, string $descricao, User $quem, Perfil $perfil, CarbonImmutable $quando, ?array $depois = null): void
    {
        $o->eventos()->create([
            'tipo' => $tipo,
            'descricao' => $descricao,
            'depois' => $depois,
            'user_id' => $quem->id,
            'perfil' => $perfil->value,
            'ip' => '10.0.0.'.mt_rand(10, 60),
            'created_at' => $quando,
        ]);
    }

    private function unidadeLivre(TipoRecurso $tipo): Unidade
    {
        $livre = Unidade::where('tipo', $tipo)->where('baixada', false)
            ->whereNotIn('id', array_keys($this->empenhadas))
            ->orderBy('codigo')->first()
            // frota esgotada: usa outra do mesmo tipo (plantão fictício)
            ?? Unidade::where('tipo', $tipo)->where('baixada', false)->inRandomOrder()->firstOrFail();

        $this->empenhadas[$livre->id] = true;

        return $livre;
    }

    private function montarEquipe(): void
    {
        $extras = [
            [Perfil::Tarm, 3],
            [Perfil::MedicoRegulador, 3],
            [Perfil::EnfermeiroRegulador, 1],
            [Perfil::RadioOperador, 2],
        ];

        foreach ($extras as [$perfil, $quantos]) {
            $membros = array_values(User::whereJsonContains('perfis', $perfil->value)->get()->all());

            for ($i = 1; $i <= $quantos; $i++) {
                $sexo = mt_rand(0, 1) ? 'M' : 'F';
                $nome = ($perfil === Perfil::MedicoRegulador ? ($sexo === 'M' ? 'Dr. ' : 'Dra. ') : '').Str::title($this->nome($sexo));
                $membros[] = User::updateOrCreate(
                    ['email' => "{$perfil->value}.{$i}@lab.samu.test"],
                    ['name' => $nome, 'password' => Str::random(32), 'perfis' => [$perfil], 'email_verified_at' => now()],
                );
            }

            $this->equipe[$perfil->value] = $membros;
        }
    }

    private function alguem(Perfil $perfil): User
    {
        return $this->sortear($this->equipe[$perfil->value]);
    }

    /**
     * @template T
     *
     * @param  list<T>  $lista
     * @return T
     */
    private function sortear(array $lista): mixed
    {
        return $lista[mt_rand(0, count($lista) - 1)];
    }

    private function nome(string $sexo): string
    {
        $primeiros = $sexo === 'F' ? self::NOMES_F : self::NOMES_M;

        return $this->sortear($primeiros).' '.$this->sortear(self::SOBRENOMES).' '.$this->sortear(self::SOBRENOMES);
    }

    private function telefone(): string
    {
        return sprintf('(71) 9%04d-%04d', mt_rand(0, 9999), mt_rand(0, 9999));
    }

    /**
     * @param  array<string, mixed>  $s
     */
    private function solicitante(array $s): string
    {
        if (isset($s['solicitante'])) {
            return $s['solicitante'];
        }

        $sexo = mt_rand(0, 1) ? 'M' : 'F';

        return explode(' ', $this->nome($sexo))[0].' ('.$this->sortear(self::VINCULOS[$sexo]).')';
    }

    private const NOMES_M = ['JOÃO', 'CARLOS', 'ANTÔNIO', 'JOSÉ', 'PAULO', 'LUCAS', 'RAFAEL', 'MARCOS', 'DAVI', 'ENZO', 'CAIO', 'RICARDO', 'EDSON', 'GILBERTO', 'RENATO'];

    private const NOMES_F = ['MARIA', 'ANA', 'JOSEFA', 'JULIANA', 'FERNANDA', 'CAMILA', 'LÚCIA', 'MARTA', 'SÔNIA', 'VALDETE', 'BEATRIZ', 'CLARA', 'RITA', 'TÂNIA', 'IARA'];

    private const SOBRENOMES = ['SANTOS', 'SOUZA', 'OLIVEIRA', 'JESUS', 'CONCEIÇÃO', 'NASCIMENTO', 'BISPO', 'PEREIRA', 'SILVA', 'ALMEIDA', 'BONFIM', 'REIS', 'COSTA', 'LIMA', 'ARAÚJO'];

    private const VINCULOS = [
        'M' => ['FILHO', 'VIZINHO', 'ESPOSO', 'IRMÃO', 'NETO', 'COLEGA'],
        'F' => ['FILHA', 'VIZINHA', 'ESPOSA', 'IRMÃ', 'MÃE', 'NETA'],
    ];

    private const BAIRROS = ['TORORÓ', 'PLATAFORMA', 'VALÉRIA', 'BAIXA DE QUINTAS', 'FAZENDA GRANDE 3', 'PARQUE BELA VISTA', 'ITAPUÃ', 'IAPI', 'BROTAS', 'CABULA', 'RIO VERMELHO', 'SÃO CRISTÓVÃO', 'LIBERDADE', 'PERIPERI', 'PAU DA LIMA', 'SUSSUARANA', 'CAJAZEIRAS', 'BARRA', 'NORDESTE DE AMARALINA', 'SÃO MARCOS'];

    private const LOGRADOUROS = ['RUA DIRETA', 'RUA NOVA', 'TRAVESSA SÃO JORGE', 'LADEIRA DO CAMPO', 'AV. PRINCIPAL', 'RUA DO CAMPO', 'BECO DA PAZ', 'RUA DA ESPERANÇA', 'CONJUNTO ACM, BLOCO B', 'RUA 2 DE JULHO'];

    private const REFERENCIAS = ['PRÓXIMO AO CAMPO', 'EM FRENTE AO MERCADO', 'AO LADO DA IGREJA', 'PRÓXIMO AO POSTO DE SAÚDE', 'EM FRENTE À ESCOLA MUNICIPAL', 'DEPOIS DO PONTO DE ÔNIBUS', 'PRÓXIMO À FARMÁCIA', 'VIELA AO LADO DO BAR'];

    /**
     * Situações clínicas. Vítimas: [idade mín, idade máx, sexo, sinais vitais no retorno].
     * Textos de HMA/relato baseados no mock (tag next-final), todos fictícios.
     */
    private const SITUACOES = [
        'avc' => [
            'queixa' => 'DESVIO DE RIMA E PERDA DE FORÇA', 'tipo' => 'CLÍNICO', 'motivo' => 'MAL SÚBITO', 'detalhamento' => 'COMORBIDADES',
            'risco' => Risco::Vermelho, 'recurso' => TipoRecurso::Usa, 'hospital' => 'HGRS',
            'hma' => 'DESVIO DE RIMA E PERDA DE FORÇA EM HEMICORPO DIREITO HÁ 30 MINUTOS. FALA PASTOSA. HIPERTENSA EM USO IRREGULAR DE MEDICAÇÃO.',
            'relato' => '{unidade} NO LOCAL: VIGIL, DISÁRTRICA, HEMIPARESIA COMPLETA À DIREITA. SINAIS TÍPICOS DE AVC ISQUÊMICO EM JANELA. ACESSO VENOSO E MONITORIZAÇÃO.',
            'vitimas' => [[65, 82, 'F', ['pa' => '190x110', 'fc' => '92', 'fr' => '22', 'temp' => '36.6', 'spo2' => '94', 'hgt' => '145', 'glasgow' => '13']]],
        ],
        'dor_toracica' => [
            'queixa' => 'DOR TORÁCICA', 'tipo' => 'CLÍNICO', 'motivo' => 'DOR TORÁCICA', 'detalhamento' => 'COMORBIDADES',
            'risco' => Risco::Vermelho, 'recurso' => TipoRecurso::Usa, 'hospital' => 'HGE',
            'hma' => 'DOR EM APERTO RETROESTERNAL HÁ 1 HORA, IRRADIANDO PARA MSE, COM SUDORESE. HIPERTENSO E TABAGISTA.',
            'relato' => '{unidade} NO LOCAL: DOR TORÁCICA TÍPICA, ECG COM SUPRA DE ST EM PAREDE INFERIOR. AAS ADMINISTRADO. SOLICITA HEMODINÂMICA.',
            'vitimas' => [[48, 70, 'M', ['pa' => '160x100', 'fc' => '104', 'fr' => '22', 'temp' => '36.4', 'spo2' => '95', 'hgt' => '132', 'glasgow' => '15']]],
        ],
        'tce_idoso' => [
            'queixa' => 'QUEDA DA PRÓPRIA ALTURA - TCE', 'tipo' => 'CAUSAS EXTERNAS', 'motivo' => 'QUEDA',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGE',
            'hma' => 'IDOSO SOFREU QUEDA APÓS TONTURA SÚBITA, BATEU A CABEÇA EM REGIÃO OCCIPITAL. HEMATOMA NO LOCAL. SONOLENTO, MAS RESPONDE.',
            'relato' => '{unidade} NO LOCAL: QPA + TCE LEVE, HEMATOMA SUBGALEAL OCCIPITAL. GLASGOW 14 (CONFUSO). NECESSITA AVALIAÇÃO NEUROCIRÚRGICA.',
            'vitimas' => [[68, 90, 'M', ['pa' => '150x90', 'fc' => '68', 'fr' => '18', 'temp' => '36.5', 'spo2' => '96', 'hgt' => '110', 'glasgow' => '14']]],
        ],
        'apendicite_crianca' => [
            'queixa' => 'DOR E DESCONFORTO ABDOMINAL', 'tipo' => 'CIRÚRGICO', 'motivo' => 'ABDOME AGUDO',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HUPES',
            'hma' => 'CRIANÇA COM DOR ABDOMINAL INTENSA HÁ 2 HORAS EM FOSSA ILÍACA DIREITA, 2 EPISÓDIOS DE VÔMITO. FEBRIL (38.5C).',
            'relato' => '{unidade} NO LOCAL: FÁCIES DE DOR, DB POSITIVO EM FID, FEBRIL. SUSPEITA DE APENDICITE AGUDA. SOLICITA CIRURGIA PEDIÁTRICA.',
            'vitimas' => [[6, 11, 'M', ['pa' => '100x60', 'fc' => '110', 'fr' => '24', 'temp' => '38.5', 'spo2' => '98', 'hgt' => '92', 'glasgow' => '15']]],
        ],
        'hiperglicemia' => [
            'queixa' => 'DIABÉTICA E HIPERTENSA PASSANDO MAL', 'tipo' => 'CLÍNICO', 'motivo' => 'MAL SÚBITO', 'detalhamento' => 'USO DE MEDICAÇÃO',
            'risco' => Risco::Vermelho, 'recurso' => TipoRecurso::Usa, 'hospital' => 'HGE',
            'hma' => 'DIABÉTICA INSULINODEPENDENTE, ENCONTRADA SONOLENTA, SUDOREICA E PÁLIDA. GLICEMIA CAPILAR "HI". RESPIRAÇÃO RUIDOSA.',
            'relato' => '{unidade} NO LOCAL: REBAIXAMENTO DE CONSCIÊNCIA, HGT HI, RESPIRAÇÃO DE KUSSMAUL. HIDRATAÇÃO INICIADA. SUSPEITA DE CETOACIDOSE.',
            'vitimas' => [[55, 72, 'F', ['pa' => '160x90', 'fc' => '105', 'fr' => '28', 'temp' => '37.0', 'spo2' => '92', 'hgt' => 'HI', 'glasgow' => '10']]],
        ],
        'agressao' => [
            'queixa' => 'SOFREU AGRESSÃO', 'tipo' => 'CAUSAS EXTERNAS', 'motivo' => 'AGRESSÃO', 'solicitante' => 'CABO MÁRCIO (PM)',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGE',
            'hma' => 'VÍTIMA DE AGRESSÃO FÍSICA POR POPULARES. CONSCIENTE, SANGRAMENTO IMPORTANTE EM FACE E ESCORIAÇÕES EM MMSS. NEGA PERDA DE CONSCIÊNCIA.',
            'relato' => '{unidade} NO LOCAL: FERIMENTO CORTO-CONTUSO EM SUPERCÍLIO, ESCORIAÇÕES EM MMSS. SANGRAMENTO CONTIDO. ESTÁVEL.',
            'vitimas' => [[18, 40, 'M', ['pa' => '130x80', 'fc' => '98', 'fr' => '20', 'temp' => '36.8', 'spo2' => '98', 'hgt' => '99', 'glasgow' => '15']]],
        ],
        'surto' => [
            'queixa' => 'SURTO', 'tipo' => 'CLÍNICO', 'motivo' => 'MAL SÚBITO',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGE',
            'hma' => 'SURTO AGUDO, AGITADO E GRITANDO. SEM RELATO DE TRAUMA. NEGA USO DE MEDICAÇÃO. NECESSITA AVALIAÇÃO NO LOCAL.',
            'relato' => '{unidade} NO LOCAL: AGITAÇÃO PSICOMOTORA, DISCURSO DESORGANIZADO. CONTENÇÃO VERBAL EFETIVA.',
            'vitimas' => [[20, 35, 'M', ['pa' => '140x90', 'fc' => '112', 'fr' => '22', 'temp' => '36.9', 'spo2' => '98', 'hgt' => '101', 'glasgow' => '15']]],
        ],
        'convulsao' => [
            'queixa' => 'CRISE CONVULSIVA', 'tipo' => 'CLÍNICO', 'motivo' => 'CRISE CONVULSIVA',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGRS',
            'hma' => 'CRISE TÔNICO-CLÔNICA COM DURAÇÃO DE 3 MINUTOS, SEM HISTÓRIA PRÉVIA. NO MOMENTO SONOLENTO.',
            'relato' => '{unidade} NO LOCAL: PÓS-ICTAL, SEM NOVAS CRISES. MORDEDURA DE LÍNGUA. SEM DÉFICIT FOCAL.',
            'vitimas' => [[18, 45, 'M', ['pa' => '130x80', 'fc' => '96', 'fr' => '18', 'temp' => '37.1', 'spo2' => '97', 'hgt' => '88', 'glasgow' => '13']]],
        ],
        'dispneia_crianca' => [
            'queixa' => 'DIFICULDADE RESPIRATÓRIA', 'tipo' => 'PEDIÁTRICO', 'motivo' => 'DIFICULDADE RESPIRATÓRIA',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HUPES',
            'hma' => 'CRIANÇA ASMÁTICA COM CANSAÇO HÁ 6 HORAS, SEM MELHORA COM BOMBINHA. CHIADO AUDÍVEL.',
            'relato' => '{unidade} NO LOCAL: TIRAGEM SUBCOSTAL, SIBILOS DIFUSOS. NEBULIZAÇÃO REALIZADA COM MELHORA PARCIAL.',
            'vitimas' => [[3, 9, 'M', ['pa' => '95x60', 'fc' => '130', 'fr' => '38', 'temp' => '37.4', 'spo2' => '91', 'hgt' => '104', 'glasgow' => '15']]],
        ],
        'trabalho_parto' => [
            'queixa' => 'GESTANTE EM TRABALHO DE PARTO', 'tipo' => 'GINECO/OBSTÉTRICO', 'motivo' => 'TRABALHO DE PARTO',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HS',
            'hma' => 'GESTANTE 39 SEMANAS, CONTRAÇÕES A CADA 4 MINUTOS, BOLSA ROTA HÁ 1 HORA. G2P1.',
            'relato' => '{unidade} NO LOCAL: DINÂMICA UTERINA PRESENTE, SEM SANGRAMENTO. BCF PRESENTE. TRANSPORTE PARA MATERNIDADE.',
            'vitimas' => [[18, 38, 'F', ['pa' => '120x80', 'fc' => '90', 'fr' => '20', 'temp' => '36.7', 'spo2' => '99', 'hgt' => '95', 'glasgow' => '15']]],
        ],
        'sangramento_gestante' => [
            'queixa' => 'GESTANTE COM SANGRAMENTO', 'tipo' => 'GINECO/OBSTÉTRICO', 'motivo' => 'SANGRAMENTO',
            'risco' => Risco::Vermelho, 'recurso' => TipoRecurso::Usa, 'hospital' => 'HS',
            'hma' => 'GESTANTE 32 SEMANAS COM SANGRAMENTO VAGINAL VOLUMOSO E DOR ABDOMINAL. TONTURA.',
            'relato' => '{unidade} NO LOCAL: SANGRAMENTO ATIVO, PALIDEZ, TAQUICARDIA. DOIS ACESSOS CALIBROSOS.',
            'vitimas' => [[20, 36, 'F', ['pa' => '90x50', 'fc' => '124', 'fr' => '24', 'temp' => '36.3', 'spo2' => '96', 'hgt' => '98', 'glasgow' => '15']]],
        ],
        'acidente_moto' => [
            'queixa' => 'ACIDENTE DE MOTO COM DUAS VÍTIMAS', 'tipo' => 'CAUSAS EXTERNAS', 'motivo' => 'ACIDENTE DE TRÂNSITO', 'detalhamento' => 'EQUIPE SOLICITA APOIO',
            'risco' => Risco::Vermelho, 'recurso' => TipoRecurso::Usa, 'hospital' => 'HGE',
            'hma' => 'COLISÃO MOTO X CARRO. CONDUTOR E GARUPA NO CHÃO. CONDUTOR NÃO RESPONDE BEM.',
            'relato' => '{unidade} NO LOCAL: CONDUTOR COM TCE GRAVE E FRATURA EXPOSTA DE FÊMUR. GARUPA CONSCIENTE COM ESCORIAÇÕES. IMOBILIZAÇÃO COMPLETA.',
            'vitimas' => [
                [18, 30, 'M', ['pa' => '100x60', 'fc' => '128', 'fr' => '26', 'temp' => '36.0', 'spo2' => '90', 'hgt' => '140', 'glasgow' => '9']],
                [17, 28, 'F', ['pa' => '120x80', 'fc' => '100', 'fr' => '20', 'temp' => '36.5', 'spo2' => '98', 'hgt' => '110', 'glasgow' => '15']],
            ],
        ],
        'queimadura' => [
            'queixa' => 'QUEIMADURA COM ÁLCOOL', 'tipo' => 'CAUSAS EXTERNAS', 'motivo' => 'QUEIMADURA',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGE',
            'hma' => 'QUEIMADURA EM TÓRAX E BRAÇOS AO ACENDER CHURRASQUEIRA COM ÁLCOOL. DOR INTENSA.',
            'relato' => '{unidade} NO LOCAL: QUEIMADURA DE 2º GRAU EM TÓRAX ANTERIOR E MMSS, CERCA DE 18% SCQ. RESFRIAMENTO E ANALGESIA.',
            'vitimas' => [[25, 50, 'M', ['pa' => '140x90', 'fc' => '110', 'fr' => '22', 'temp' => '36.9', 'spo2' => '97', 'hgt' => '120', 'glasgow' => '15']]],
        ],
        'sincope' => [
            'queixa' => 'DESMAIOU NA RUA', 'tipo' => 'CLÍNICO', 'motivo' => 'SÍNCOPE',
            'risco' => Risco::Verde, 'recurso' => TipoRecurso::Moto, 'hospital' => 'UPA BROTAS',
            'hma' => 'PERDA DE CONSCIÊNCIA BREVE NO PONTO DE ÔNIBUS, JÁ ACORDADA. SEM TRAUMA. EM JEJUM DESDE ONTEM.',
            'relato' => '{unidade} NO LOCAL: LÚCIDA E ORIENTADA, HGT NORMAL APÓS DIETA. SEM SINAIS DE ALERTA.',
            'vitimas' => [[18, 60, 'F', ['pa' => '110x70', 'fc' => '82', 'fr' => '16', 'temp' => '36.5', 'spo2' => '99', 'hgt' => '78', 'glasgow' => '15']]],
        ],
        'queda_bicicleta' => [
            'queixa' => 'QUEDA DE BICICLETA', 'tipo' => 'CAUSAS EXTERNAS', 'motivo' => 'QUEDA',
            'risco' => Risco::Verde, 'recurso' => TipoRecurso::Moto, 'hospital' => 'UPA ITAPUÃ',
            'hma' => 'QUEDA DE BICICLETA, ESCORIAÇÕES EM JOELHOS E COTOVELO. DEAMBULANDO.',
            'relato' => '{unidade} NO LOCAL: ESCORIAÇÕES SUPERFICIAIS, SEM DEFORMIDADES. CURATIVO REALIZADO.',
            'vitimas' => [[12, 30, 'M', ['pa' => '120x80', 'fc' => '88', 'fr' => '16', 'temp' => '36.6', 'spo2' => '99', 'hgt' => '100', 'glasgow' => '15']]],
        ],
        'febre_crianca' => [
            'queixa' => 'CRIANÇA COM FEBRE', 'tipo' => 'PEDIÁTRICO', 'motivo' => 'FEBRE',
            'risco' => Risco::Verde, 'recurso' => TipoRecurso::Usb, 'hospital' => 'UPA BARRIS',
            'hma' => 'CRIANÇA COM FEBRE DE 38C DESDE A MANHÃ, ATIVA E BRINCANDO, ACEITANDO DIETA. MÃE ANSIOSA.',
            'relato' => '', 'vitimas' => [[1, 6, 'F', null]],
        ],
        'vomitos_pos_alta' => [
            'queixa' => 'TEVE ALTA HOJE // TEVE VÔMITO //', 'tipo' => 'CLÍNICO', 'motivo' => 'MAL SÚBITO',
            'risco' => Risco::Azul, 'recurso' => TipoRecurso::Usb, 'hospital' => 'UPA BROTAS',
            'hma' => 'ALTA HOSPITALAR HOJE APÓS PNEUMONIA, UM EPISÓDIO DE VÔMITO. SEM FEBRE, SEM DISPNEIA.',
            'relato' => '', 'vitimas' => [[18, 30, 'M', null]],
        ],
        'dor_abdominal' => [
            'queixa' => 'DOR ABDOMINAL INTENSA', 'tipo' => 'CIRÚRGICO', 'motivo' => 'ABDOME AGUDO',
            'risco' => Risco::Amarelo, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGE',
            'hma' => 'DOR ABDOMINAL INTENSA HÁ 5 HORAS. LIGAÇÃO CAIU DURANTE A REGULAÇÃO.',
            'relato' => '', 'vitimas' => [[25, 50, 'M', null]],
        ],
        'transferencia_uti' => [
            'queixa' => 'TRANSFERÊNCIA PARA LEITO DE UTI', 'tipo' => 'TRANSFERÊNCIAS', 'motivo' => 'LEITO UTI', 'solicitante' => 'UPA SANTO ANTÔNIO',
            'risco' => Risco::HoraMarcada, 'recurso' => TipoRecurso::Usa, 'hospital' => 'HGRS',
            'hma' => 'PACIENTE EM VENTILAÇÃO MECÂNICA NA UPA AGUARDANDO LEITO DE UTI. ENCAMINHADO À CENTRAL ESTADUAL.',
            'relato' => '', 'vitimas' => [[40, 80, 'M', null]],
        ],
        'tc_cranio' => [
            'queixa' => 'TC CRÂNIO', 'tipo' => 'TRANSFERÊNCIAS', 'motivo' => 'TRANSFERÊNCIA INTER-HOSPITALAR', 'solicitante' => 'DR. RICARDO (UPA VALÉRIA)',
            'risco' => Risco::HoraMarcada, 'recurso' => TipoRecurso::Usb, 'hospital' => 'HGE',
            'hma' => 'SOLICITA TRANSPORTE PARA TC DE CRÂNIO E RETORNO.',
            'relato' => '', 'vitimas' => [[40, 60, 'F', null]],
        ],
        'obito' => [
            'queixa' => 'PACIENTE NÃO RESPONDE', 'tipo' => 'CLÍNICO', 'motivo' => 'MAL SÚBITO',
            'risco' => Risco::Vermelho, 'recurso' => TipoRecurso::Usa, 'hospital' => null,
            'hma' => 'IDOSO ACAMADO ENCONTRADO SEM RESPONDER PELA FAMÍLIA. NÃO RESPIRA.',
            'relato' => '{unidade} NO LOCAL: PCR SEM RESPOSTA APÓS 30 MINUTOS DE RCP. ÓBITO CONSTATADO.',
            'vitimas' => [[75, 95, 'M', ['pa' => '0x0', 'fc' => '0', 'fr' => '0', 'temp' => '35.0', 'spo2' => '0', 'hgt' => '60', 'glasgow' => '3']]],
        ],
    ];
}
