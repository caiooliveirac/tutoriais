# SAMU+ em Laravel — stack e decisões

Registro das escolhas de stack da reescrita do mock (`tag next-final`, Next.js)
para um sistema real em Laravel, publicado em `mnrs.com.br/tutoriais`.

Status de cada item: **DECIDIDO** ou **PENDENTE** (decisão do usuário).

## 1. Núcleo

| Item         | Escolha                                                                                       | Status   |
| ------------ | --------------------------------------------------------------------------------------------- | -------- |
| Framework    | Laravel 13                                                                                    | DECIDIDO |
| PHP          | 8.5 (Laravel 13 exige ≥ 8.3)                                                                  | DECIDIDO |
| Banco        | MariaDB 11.8 LTS (sempre: dev, LAB e LIVE). `DATETIME(6)` em UTC, exibição em `America/Bahia` | DECIDIDO |
| Frontend     | Inertia + React (starter kit React do Laravel 13)                                             | DECIDIDO |
| Autenticação | Starter kit oficial do Laravel 13 (inclui login, reset, 2FA)                                  | DECIDIDO |
| Tempo real   | Laravel Reverb + Echo, em fases (ver §8)                                                      | DECIDIDO |
| Filas        | `database` agora; Redis + Horizon quando os gatilhos do §8 aparecerem                         | DECIDIDO |
| Agendador    | `schedule:run` — dispara intercorrências da simulação                                         | DECIDIDO |
| Testes       | Pest (feature test por transição de estado e por permissão)                                   | DECIDIDO |
| Qualidade    | Pint (estilo) + Larastan (análise estática) no CI                                             | DECIDIDO |

## 2. Perfis e telas

Cada perfil tem grupo de rotas próprio, middleware de perfil e Policies.
Nenhuma tela é compartilhada “escondendo botão”: a autorização é no servidor.

| Perfil               | Tela principal           | Pode                                                                                                                                                  |
| -------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| TARM                 | Atendimento              | abrir chamado, identificar solicitante/paciente/endereço, cancelar a pedido do solicitante                                                            |
| Médico regulador     | Triagem + Regulação      | classificar risco, decisão médica (enviar / não enviar), regular para destino                                                                         |
| Enfermeiro regulador | Despacho (compartilhada) | recebe a ocorrência já triada pelo médico; nas **vermelhas** define qual USA vai; vê também as **amarelas** e comanda a operação dos rádio-operadores |
| Rádio-operador       | Despacho (compartilhada) | despacha as **amarelas**; registra QTA/intercorrências, troca e liberação de unidade                                                                  |
| Chefe de plantão     | Painel do plantão        | ver tudo em tempo real, destravar fichas, redistribuir; sem editar ato médico de outro                                                                |
| Administrativo       | BI                       | somente leitura dos dados consolidados; cadastros (unidades, hospitais, usuários)                                                                     |

**Tela de Despacho** é uma só para enfermeiro regulador e rádio-operador: fila de
ocorrências triadas + frota, com poder de despachar USA, USB ou Moto.
A divisão vermelha = enfermeiro, amarela = rádio-operador é **organização do
trabalho**, não bloqueio: ambos podem agir em qualquer ocorrência (a auditoria
registra quem fez). O médico indica na triagem só a **cor** (risco); a escolha
do tipo e da unidade (USA/USB/Moto) é do despacho.

Um usuário pode ter **vários perfis** (ex.: médico regulador que é chefe de
plantão). Não há escolha de perfil no login: a aplicação oferece uma aba para
cada perfil que o usuário possui e ele alterna livremente. O `perfil` gravado
em cada evento é o da área (grupo de rotas) de onde o envio saiu, não um
estado de sessão.

## 3. Auditoria (requisito duro)

Tudo registrado com usuário, perfil (área de origem), IP e horário com segundo (µs no banco).

- **Acessos** — tabela `acessos`: login, logout, falha de login, expiração.
  Fonte: eventos `Illuminate\Auth\Events\*`. Sessões no driver `database`
  (sabe-se quem está logado agora).
- **Eventos da ocorrência** — tabela `eventos_ocorrencia`, **append-only**:
  cada envio de cada formulário vira uma linha, mesmo sem mudança de valor.
  Campos: `ocorrencia_id`, `tipo`, `antes` (JSON), `depois` (JSON),
  `user_id`, `perfil`, `ip`, `created_at DATETIME(6)` (UTC).
  O painel de Histórico da ocorrência lê desta tabela.
- **Imutabilidade** — o usuário do banco da aplicação não tem `UPDATE`/`DELETE`
  nas tabelas de auditoria (`REVOKE`), e triggers `BEFORE UPDATE/DELETE` com
  `SIGNAL SQLSTATE '45000'` barram qualquer outro caminho. Correção = novo evento, nunca edição.
- **Estado atual** — colunas na própria `ocorrencias` + enum PHP de status.
  Toda transição passa por um único método (máquina de estados) que valida,
  grava o evento e emite broadcast na mesma transação.

## 4. Domínio (herdado do mock)

Levantamento completo em `docs/DOMINIO.md`. Resumo:

- Status único `StatusOcorrencia`: aguardando triagem → solicitado envio →
  aguardando retorno → procurando recurso → regulado → finalizada; saídas
  laterais cancelado e encerrado sem envio.
- Entidades: `ocorrencias`, `vitimas` (1:N, com sinais vitais), `unidades`
  (USA/USB/Moto), `hospitais`, `users`; linha do tempo em `eventos_ocorrencia`.
- Ficha travada: `travada_por`, `travada_em`.
- Dados **sempre fictícios**. O LAB usa o `LabSeeder` (nomes gerados de listas
  próprias, sem Faker, porque roda na mesma imagem de produção).

## 5. BI (perfil Administrativo)

- Fase 1: painéis dentro do app (tempo-resposta por etapa, volume por risco,
  por unidade, por plantão) a partir de views SQL `bi_*`.
- Fase 2 (se precisar): Metabase lendo as views com usuário somente leitura.

## 6. Ambientes e fluxo de desenvolvimento

- **Desenvolvimento sem Docker**: PHP + Composer + Node nativos, `composer run dev`
  (servidor, fila, logs e Vite com hot reload). Reload instantâneo.
- **Onde**: Mac local (ver §7). Exceção consciente à regra
  do LAB residente no magalu enquanto o app nasce.
- **Banco no dev**: MariaDB — pode rodar em container desde já, não afeta o reload.
- **Docker em LIVE e LAB**, mesma imagem (`Dockerfile`: FrankenPHP PHP 8.5,
  build com Node 26), bancos diferentes:
    - LIVE: `compose.yaml` em `/home/ubuntu/tutoriais`, porta `127.0.0.1:3099`
      (a que o nginx de `/tutoriais/` já aponta). Banco só com usuários demo e
      catálogos (`DatabaseSeeder`). Promoção: `labctl promote tutoriais`.
    - LAB: `compose.lab.yml` em `/home/ubuntu/lab/tutoriais`, porta
      `127.0.0.1:4099`, banco `tutoriais_lab` com o plantão fictício
      (`LabSeeder`). Acesso pelo túnel: `http://localhost:4099/tutoriais`.
    - Migrations rodam à mão (`docker compose exec app php artisan migrate --force`),
      nunca no promote. No LAB, `migrate:fresh --seed --seeder=LabSeeder` recria o plantão.
- **Subpath**: todas as rotas têm prefixo literal `tutoriais` (`routes/web.php`,
  `fortify.prefix`), para que o Wayfinder gere URLs certas. Assets do Vite em
  `public/tutoriais/build`; cookie de sessão com `SESSION_PATH=/tutoriais`.
- O mock Next.js anterior está na tag `next-final`; o container antigo
  `tutoriais` fica parado (não removido) como rollback do primeiro deploy.
- Usuários demo (um por perfil, senha fácil) vêm do `DatabaseSeeder`; lista
  local em `credenciais-demo.txt` (fora do git).

## 7. Versões fixadas (fonte para o Dockerfile do LIVE)

O Docker do LIVE deve reproduzir exatamente isto. Mudou aqui, muda lá.

| Componente           | Dev (Mac, Homebrew)                                                | Imagem Docker futura                                      |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| PHP                  | 8.5.10 (`php`)                                                     | `php:8.5-fpm` ou FrankenPHP com PHP 8.5                   |
| Extensões PHP usadas | bcmath, gd, intl, mbstring, pcntl, pdo_mysql, sodium, zip, opcache | instalar as mesmas (`docker-php-ext-install`)             |
| Composer             | 2.10.3                                                             | `composer:2` (estágio de build)                           |
| MariaDB              | 11.8.9 (`mariadb@11.8`, serviço `brew services`)                   | `mariadb:11.8`                                            |
| Node                 | 26.3.0 / npm 11.16.0 (só build do Vite)                            | `node:26` (estágio de build; não vai para a imagem final) |
| Laravel Installer    | 5.32.0 (`composer global`)                                         | —                                                         |

Banco no dev: charset `utf8mb4`; `time_zone` do servidor = SYSTEM, a aplicação
grava UTC (`config/app.php` timezone `UTC` + `timezone => +00:00` na conexão `mariadb`).
PATH no `~/.zshrc`: `~/.composer/vendor/bin` e `/opt/homebrew/opt/mariadb@11.8/bin`.

## 8. Tempo real, filas, Redis e Horizon — estratégia

Ponto de partida: resposta do GPT trazida pelo usuário (2026-09-22). O que
adotamos, o que adaptamos e o que recusamos:

| Proposta                                                                 | Decisão                                                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Dev nativo, Docker cedo no repositório                                   | Já é assim (LIVE e LAB em Docker desde o dia 1).                                                 |
| PostgreSQL                                                               | **Recusado.** MariaDB sempre. JSON do MariaDB e `DATETIME(6)` cobrem auditoria e linha do tempo. |
| Actions + Events + Policies + máquina de estados, sem controller gigante | **Adotado** a partir do primeiro fluxo de escrita (ver abaixo).                                  |
| Tabela de eventos como linha do tempo                                    | Já existe: `eventos_ocorrencia`, append-only com trigger.                                        |
| Redis e Horizon no dia 1                                                 | Adiado com gatilho explícito (fases 2 e 3).                                                      |
| Uma imagem, vários processos (app, queue, reverb, scheduler)             | **Adotado**: serviços do mesmo `Dockerfile` no compose, mudando só o `command`.                  |

### Organização do código de escrita

```
Controller (fino)  →  Action (app/Actions/Ocorrencia/*)  →  modelo + evento em eventos_ocorrencia
                           │  valida transição em StatusOcorrencia
                           │  autoriza por Policy (perfil/área)
                           └► dispara Event de domínio (ex.: UnidadeDespachada)
                                   └► ShouldBroadcast (fase 1)
```

Tudo numa transação; o broadcast só sai depois do commit
(`ShouldDispatchAfterCommit`), para ninguém ver estado que foi desfeito.

### Fases

| Fase      | Gatilho                                                                                                    | Entra                                   | Como                                                                                                                                                                                                                                                                                                             |
| --------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 (agora) | —                                                                                                          | Fila, cache e sessão no MariaDB         | `QUEUE_CONNECTION=database`. As listas podem usar `usePoll` do Inertia (ex.: 10 s) como ponte até o WebSocket.                                                                                                                                                                                                   |
| 1         | Primeiro fluxo multiusuário pronto (despacho: médico decide → fila do despacho muda na tela do enfermeiro) | **Reverb + Echo** (WS) e worker de fila | Serviços `reverb` (`php artisan reverb:start`) e `queue` (`php artisan queue:work`) no compose, mesma imagem. Canais privados `area.{slug}` (autorizados pela mesma regra de área) e `ocorrencia.{id}`. nginx: `location /tutoriais/app` com upgrade de WebSocket para o Reverb. Eventos broadcast enfileirados. |
| 2         | Fila com atraso perceptível, >1 instância do Reverb, ou locks/caches concorrentes pesando no banco         | **Redis**                               | Serviço `redis` no compose (dev: `brew install redis`). `QUEUE_CONNECTION=redis`, `CACHE_STORE=redis`, `REVERB_SCALING_ENABLED=true` (pub/sub entre instâncias). Sessão continua no banco (auditoria de acesso).                                                                                                 |
| 3         | Fila em Redis com jobs de naturezas diferentes (broadcast, simulação, relatórios de BI, notificações)      | **Horizon**                             | Substitui o `queue:work` pelo `php artisan horizon`; painel em `/tutoriais/horizon`, liberado só para chefe de plantão e administrativo. Filas separadas por prioridade: `broadcast` > `default` > `relatorios`.                                                                                                 |
| —         | Simulação automática de intercorrências (modo tutorial)                                                    | **Scheduler**                           | Serviço `scheduler` (`php artisan schedule:work`) disparando Jobs de cenário; só no LAB até decidir o contrário.                                                                                                                                                                                                 |

O que continua síncrono de propósito: gravação da ocorrência e do evento de
auditoria (tem que falhar junto com a requisição, nunca "depois").
