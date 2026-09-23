# Chaves do Google Maps — passo a passo

O SAMU MAIS funciona sem Google (OpenStreetMap). Com as **duas** chaves abaixo,
a tela do TARM passa a usar o Google para achar endereço mal digitado, lugares
de referência e o mapa. Leva uns 15 minutos.

| Variável no `.env`        | Para quê                          | APIs habilitadas na chave       | Restrição               |
| ------------------------- | --------------------------------- | ------------------------------- | ----------------------- |
| `GOOGLE_MAPS_API_KEY`     | servidor (Laravel chama o Google) | Places API (New), Geocoding API | por **IP**              |
| `GOOGLE_MAPS_BROWSER_KEY` | navegador (desenha o mapa)        | Maps JavaScript API             | por **site** (referrer) |

São duas chaves separadas de propósito: a do navegador aparece no código da
página (qualquer um vê); o que a protege é a restrição de site. A do servidor
nunca sai do servidor.

> Segredo nunca vai para o git, chat, print ou documentação. O `.env` já está
> no `.gitignore`. Cole as chaves direto no arquivo.

## 1. Projeto e faturamento

1. Entre no Google Cloud Console com a conta que vai pagar:
   <https://console.cloud.google.com/>
2. Crie um projeto (ex.: `samu-mais`):
   <https://console.cloud.google.com/projectcreate>
3. Vincule uma conta de faturamento — a Maps Platform **exige** cartão, mesmo
   dentro da cota gratuita: <https://console.cloud.google.com/billing>
4. Crie um **alerta de orçamento** (ex.: R$ 100/mês, avisos em 50/90/100 %),
   para não ter surpresa: <https://console.cloud.google.com/billing/budgets>
   — guia: <https://cloud.google.com/billing/docs/how-to/budgets>

Preços e cota gratuita mensal por API:
<https://mapsplatform.google.com/pricing/>. O autocompletar é cobrado por
**sessão** (todas as letras digitadas + o detalhe escolhido = 1 cobrança; o
SAMU MAIS já manda o token de sessão):
<https://developers.google.com/maps/documentation/places/web-service/session-pricing>

## 2. Habilitar as três APIs

Com o projeto selecionado no topo da página, abra cada link e clique em
**Ativar**:

- Places API (New) — <https://console.cloud.google.com/apis/library/places.googleapis.com>
- Geocoding API — <https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com>
- Maps JavaScript API — <https://console.cloud.google.com/apis/library/maps-backend.googleapis.com>

Atenção: é **Places API (New)**, não a "Places API" antiga. O SAMU MAIS usa os
endpoints novos (`places.googleapis.com/v1`).

## 3. Chave do servidor (`GOOGLE_MAPS_API_KEY`)

1. <https://console.cloud.google.com/google/maps-apis/credentials> →
   **Criar credenciais → Chave de API**. Renomeie para `samu-mais-servidor`.
2. **Restrições de aplicativo → Endereços IP**: adicione o IP público do
   servidor magalu. Para desenvolver no Mac, adicione também o IP público da sua
   internet (descubra em <https://ifconfig.me>; muda quando a operadora troca).
   Alternativa mais simples para o Mac: uma terceira chave `samu-mais-dev`, sem
   restrição de IP mas com restrição de API, e com cota diária baixa.
3. **Restrições de API → Restringir chave**: marque só _Places API (New)_ e
   _Geocoding API_.
4. Salve e copie a chave.

Guia oficial: <https://developers.google.com/maps/documentation/places/web-service/get-api-key>

## 4. Chave do navegador (`GOOGLE_MAPS_BROWSER_KEY`)

1. Mesma tela, **Criar credenciais → Chave de API**. Renomeie para
   `samu-mais-navegador`.
2. **Restrições de aplicativo → Sites (referenciadores HTTP)**, uma linha cada:
    ```
    https://mnrs.com.br/tutoriais/*
    http://localhost:8000/*
    http://localhost:4099/*
    ```
    (a primeira é o LIVE; a segunda o dev no Mac; a terceira o LAB pelo túnel)
3. **Restrições de API**: marque só _Maps JavaScript API_.
4. Salve e copie a chave.

Guia oficial: <https://developers.google.com/maps/documentation/javascript/get-api-key>
Boas práticas de segurança de chave:
<https://developers.google.com/maps/api-security-best-practices>

## 5. Colocar no `.env`

### No Mac (dev)

Abra `~/Projetos/SAMUmais/.env` no editor e preencha as duas linhas que já
existem no final:

```
GOOGLE_MAPS_API_KEY=cole-aqui-a-chave-do-servidor
GOOGLE_MAPS_BROWSER_KEY=cole-aqui-a-chave-do-navegador
```

Sem aspas, sem espaço. Recarregue a página do Atendimento — não precisa
reiniciar o `composer run dev`.

Conferir qual provedor está ativo:

```bash
php artisan tinker --execute 'echo app(App\Services\Mapas\Localizador::class)->provedor();'
```

`google` = ok. `osm` = falta uma das duas chaves.

### No LAB e no LIVE (magalu)

O `.env` fica em `~/lab/tutoriais/.env` (LAB) e `~/tutoriais/.env` (LIVE).
Edite no servidor (`nano`), preencha as duas linhas e recrie o container —
`restart` **não** relê o `.env`, precisa `--force-recreate`:

```bash
ssh magalu
cd ~/lab/tutoriais && nano .env && docker compose -f compose.lab.yml up -d --force-recreate app
cd ~/tutoriais && nano .env && docker compose up -d --force-recreate app
```

## 6. Se não funcionar

| Sintoma na tela                             | Causa provável                                                                                           |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Mapa cinza com "O Google Maps não carregou" | chave do navegador errada, Maps JavaScript API desligada, ou o site não está nos referenciadores         |
| "Busca de endereço indisponível"            | chave do servidor errada, Places API (New) desligada, IP fora da restrição, ou faturamento não vinculado |
| Continua aparecendo mapa OpenStreetMap      | falta uma das duas variáveis no `.env`                                                                   |

O motivo exato fica no log: `php artisan pail` (Mac) ou
`docker compose logs app` (servidor). A mensagem do Google diz qual API ou
restrição recusou.

## Termos de uso

O Google proíbe mostrar resultados dele (lugares, endereços, coordenadas) sobre
mapa que não seja Google — por isso o SAMU MAIS só liga o Google quando as duas
chaves existem. Termos: <https://cloud.google.com/maps-platform/terms>
