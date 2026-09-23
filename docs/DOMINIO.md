# Domínio SAMU MAIS — levantamento do mock

Fonte: mock Next.js na tag `next-final` (`src/hooks/useSamuSimulation.ts`,
`src/types/index.ts`, `src/components/TriagemDetail/TriagemPanel.tsx`,
`src/components/OccurrenceDetail/constants.ts`, `src/scenarios/modules/*`).
Tudo aqui é fictício. É o que alimenta o `LabSeeder`.

## Ciclo de vida (`App\Enums\StatusOcorrencia`)

```
AGUARDANDO_TRIAGEM ──► SOLICITADO_ENVIO ──► AGUARDANDO_RETORNO ──► PROCURANDO_RECURSO ──► REGULADO ──► FINALIZADA
   (TARM abriu)        (médico decidiu        (unidade despachada,     (equipe no local,          (destino
                        enviar recurso)        a caminho / no local)    buscando vaga)             definido)
        │                      │
        ├──► CANCELADO ◄───────┘   (cancelado pelo solicitante, removido por terceiros, QTA na triagem)
        └──► ENCERRADO_SEM_ENVIO   (decisão médica ≠ envio de unidade)
```

No mock, triagem e regulação eram duas listas com status próprios
(`statusBadge` e `statusType`). Aqui é um status só, e cada tela filtra o
pedaço que lhe cabe. Etapas mais finas (empenhada, a caminho, no local,
transporte, chegada ao destino) entram quando a tela de despacho existir.

## O que cada etapa preenche

| Etapa             | Quem                                                                           | Campos                                                                            |
| ----------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Abertura          | TARM                                                                           | telefone, solicitante, cidade, bairro, endereço, referência, queixa, vítimas      |
| Triagem           | Médico regulador                                                               | tipo, motivo, detalhamento, **risco (cor)**, HMA, decisão médica, tipo de recurso |
| Despacho          | Enfermeiro (vermelhas) / rádio-operador (amarelas) — organização, não bloqueio | unidade (USA/USB/Moto)                                                            |
| Retorno da equipe | Rádio-operador                                                                 | relato da equipe, sinais vitais por vítima                                        |
| Regulação         | Médico regulador                                                               | hospital de destino                                                               |
| Finalização       | Rádio-operador                                                                 | libera a unidade                                                                  |

## Catálogos levantados

- **Tipo → motivo**: CLÍNICO (dor torácica, dispneia, mal súbito, síncope, crise
  convulsiva) · CAUSAS EXTERNAS (acidente de trânsito, queda, agressão, acidente
  de trabalho, queimadura) · GINECO/OBSTÉTRICO (trabalho de parto, sangramento,
  dor pélvica, hipertensão gestacional) · PEDIÁTRICO (febre, dificuldade
  respiratória, trauma, vômitos) · CIRÚRGICO (abdome agudo, hérnia encarcerada,
  colecistite, obstrução intestinal) · TRANSFERÊNCIAS (inter-hospitalar, leito
  UTI, regulação de vaga).
- **Detalhamento**: sem detalhamento, comorbidades, uso de medicação, equipe solicita apoio.
- **Risco**: vermelho, amarelo, verde, azul, preto, hora marcada.
- **Decisão médica**: envio de unidade móvel · orientação médica · ida por meios
  próprios · 3+ tentativas de contato sem retorno · cancelado pelo solicitante ·
  recusa durante a regulação · removido por terceiros · paciente evadiu-se ·
  apoio não pertinente · regulação via CER.
- **Recursos no mock**: USA, USB, motolância, helicóptero, VIR, ambulancha.
  Implementados: USA, USB, Moto (decisão do usuário, docs/STACK.md).
- **Intercorrências** (`App\Enums\Intercorrencia`): evasão, recusa, problema
  mecânico (VTR baixada), piora do quadro, QTA. Evasão, pane e QTA desvinculam a
  unidade (círculo vermelho com X); toda intercorrência ativa mostra o asterisco
  vermelho até alguém dar ciência.
- **Frota**: 16 bases e ~70 unidades oficiais de Salvador (lista do
  `ChecagemdeBases`), com coordenada OSM por base; unidades desativadas entram
  como baixadas. Motolâncias ML01–ML03 são fictícias. Ver `docs/API.md`.
- **Ficha travada**: ocorrência aberta por outro usuário (cadeado, não abre).
- **Sinais vitais**: PA, FC, FR, temperatura, SpO2, HGT, Glasgow.

## Plantão do LAB (`database/seeders/LabSeeder.php`)

21 situações clínicas (AVC em janela, dor torácica com supra, TCE em idoso,
apendicite pediátrica, cetoacidose, agressão, surto, convulsão, asma pediátrica,
trabalho de parto, sangramento na gestação, acidente de moto com 2 vítimas,
queimadura, síncope, queda de bicicleta, febre, vômito pós-alta, dor abdominal
sem contato, transferência para UTI, TC de crânio, óbito no local) distribuídas
em 39 ocorrências que cobrem todos os status, as 5 intercorrências e uma ficha
travada — cada uma com a linha do tempo completa em `eventos_ocorrencia`.
Determinístico: mesma semente, mesmo plantão, com horários relativos a "agora".

Escala fixa com login (senha `lab123`, só LAB e dev): 5 TARMs, 4 médicos
reguladores, 2 enfermeiros, 4 rádio-operadores e 1 chefe de plantão (que também
regula), além dos usuários demo. Cada decisão tem responsável: `tarm_id`,
`medico_id`, `despachada_por` na ocorrência e `user_id` + `perfil` em cada evento.

```bash
php artisan migrate:fresh --seed --seeder=LabSeeder
```
