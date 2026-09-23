# API de rastreamento e estimativa de chegada

Para sistemas externos que conhecem a posição das viaturas (AVL/GPS, app da
equipe, simulador). Base: `https://mnrs.com.br/tutoriais/api/v1` (LAB:
`http://localhost:4099/tutoriais/api/v1`, dev: `http://localhost:8000/tutoriais/api/v1`).

## Autenticação

Cabeçalho `Authorization: Bearer <RASTREAMENTO_TOKEN>`. O token fica só no
`.env` de cada ambiente (nunca no repositório). Sem token configurado, a API
responde `401` para tudo. Limite: 120 requisições/minuto por cliente.

## POST /posicoes — enviar posições

Lote de 1 a 500 posições. Posição mais antiga que a já gravada é ignorada
(lotes fora de ordem não voltam a viatura no tempo).

```bash
curl -X POST https://mnrs.com.br/tutoriais/api/v1/posicoes \
  -H "Authorization: Bearer $RASTREAMENTO_TOKEN" \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"posicoes": [
        {"codigo": "SM01", "lat": -12.9496, "lng": -38.4780, "registrada_em": "2026-09-23T14:05:12-03:00"},
        {"codigo": "PM41", "lat": -12.9601, "lng": -38.4812}
      ]}'
```

| Campo                      | Obrigatório | Descrição                                                      |
| -------------------------- | ----------- | -------------------------------------------------------------- |
| `posicoes[].codigo`        | sim         | código da unidade, igual ao da lista oficial (`SM01`, `PM41`…) |
| `posicoes[].lat`, `lng`    | sim         | WGS84, graus decimais                                          |
| `posicoes[].registrada_em` | não         | ISO 8601; padrão = hora do recebimento                         |

Resposta `200`: `{"recebidas": 2, "atualizadas": 2}`. Código desconhecido → `422`.

Uma posição vale por **10 minutos** (`Unidade::POSICAO_VALIDA_MINUTOS`). Depois
disso a unidade volta a ser considerada na base.

## GET /estimativas — quem chega primeiro

```bash
curl "https://mnrs.com.br/tutoriais/api/v1/estimativas?lat=-12.979&lng=-38.505&tipo=usa" \
  -H "Authorization: Bearer $RASTREAMENTO_TOKEN" -H "Accept: application/json"
```

| Parâmetro    | Obrigatório | Descrição              |
| ------------ | ----------- | ---------------------- |
| `lat`, `lng` | sim         | local da ocorrência    |
| `tipo`       | não         | `usa`, `usb` ou `moto` |

Resposta:

```json
{
    "fonte": "osrm",
    "bases": [
        {
            "nome": "5º CENTRO",
            "lat": -12.98,
            "lng": -38.52,
            "minutos": 6,
            "km": 3.3,
            "livres": ["CN11", "CN12"]
        }
    ],
    "unidades": [
        {
            "codigo": "SM01",
            "tipo": "USA",
            "base": "SAN MARTIN",
            "origem": "posicao",
            "lat": -12.9496,
            "lng": -38.478,
            "minutos": 5,
            "km": 2.9
        }
    ]
}
```

- `unidades` só traz as **livres**: não baixadas e sem ocorrência em andamento
  (ou desvinculadas dela). Ordenadas por `minutos`.
- `origem`: `posicao` (posição recente pela API) ou `base` (sai da base).
- `fonte`: `osrm` = tempo por rua, sem trânsito; `linha_reta` = roteador fora do
  ar, estimativa por distância reta × 1,4 a 30 km/h. A tela avisa o TARM.

## Endpoints internos (sessão do TARM, usados pela tela de Atendimento)

A tela conduz o TARM numa ordem pensada para solicitante leigo:
**1. bairro → 2. ponto de referência → 3. rua**. Cada passo filtra o próximo
(a referência é buscada perto do bairro; as ruas, perto da referência), mas
**nenhum filtro impede abrir a ocorrência**: basta a queixa e uma pista do
local (endereço, bairro, referência ou clique no mapa).

| Método | Caminho                                                       | Uso                                                                                                                                           |
| ------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/tutoriais/atendimento/bairros?q=`                           | "quis dizer": bairros parecidos pelo som (`rio vermeio` → Rio Vermelho)                                                                       |
| GET    | `/tutoriais/atendimento/referencia?q=&bairro=&lat=&lng=`      | lugar pelo nome: catálogo local primeiro, perto do bairro/ponto, com `homonimos` e `km`; depois Google (se ligado) puxado para a mesma região |
| GET    | `/tutoriais/atendimento/sugerir?q=&sessao=&bairro=&lat=&lng=` | rua digitada: ruas do catálogo (com bairro, `homonimos`, `km`, coordenada) e depois o provedor (Google/OSM), marcadas por `origem`            |
| GET    | `/tutoriais/atendimento/lugar?id=&sessao=`                    | (Google) detalhe de uma sugestão do Google                                                                                                    |
| GET    | `/tutoriais/atendimento/ruas?lat=&lng=`                       | ruas a até 250 m, com o ponto de cada uma mais perto do local e o traçado — a lista "é numa destas ruas?"                                     |
| GET    | `/tutoriais/atendimento/arredores?lat=&lng=`                  | endereço e bairro do ponto + lugares em volta (Google, ou catálogo local)                                                                     |
| GET    | `/tutoriais/atendimento/estimativas?lat=&lng=`                | mesma resposta de `/api/v1/estimativas`                                                                                                       |
| POST   | `/tutoriais/atendimento/ocorrencias`                          | abre a ocorrência; grava `localizado_por` e as 5 unidades sugeridas no evento de abertura                                                     |

## Catálogo local de ruas e lugares (OpenStreetMap)

Tabelas `ruas` e `lugares`, carregadas pelo `MapaSeeder` a partir de
`database/data/osm-salvador.json.gz` (sem internet — LIVE, LAB e dev recebem o
mesmo mapa). O arquivo é gerado por `php artisan osm:importar`: baixa o recorte
oficial do Nordeste da Geofabrik (~450 MB, apagado no fim), recorta Salvador com
`osmium-tool` e converte em segundos. Rode para atualizar e comite o `.gz`.
Qualidade da busca: `php artisan mapas:avaliar`.

- **Bairro** de cada rua/lugar: pelo polígono de bairro do OSM
  (`admin_level=10`); onde não há polígono, o bairro de centro mais próximo.
- **Uma rua por (nome, bairro)**: os trechos do mesmo nome no mesmo bairro se
  juntam; o traçado vai em `trechos` para destacar no mapa.
- **Homônimos**: `homonimos` = quantos outros registros da cidade têm o mesmo
  nome ("Rua São José" em vários bairros, várias lojas "Atakarejo"). A tela
  mostra ⚠ e pede para confirmar o bairro.
- **Busca de ouvido**: coluna `som` (`App\Services\Mapas\Fonetica`): sem
  acento, sem tipo de logradouro, sem "do/da", com as trocas de quem escreve
  como ouve. "tororro" acha "Rua Amparo do Tororó".

## Serviços externos e produção

| Serviço                | Variável                                | Padrão                      | Observação                                                                                                                                                                                        |
| ---------------------- | --------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google (servidor)      | `GOOGLE_MAPS_API_KEY`                   | vazio                       | habilitar **Places API (New)** e **Geocoding API**; restringir a chave por IP do servidor.                                                                                                        |
| Google (navegador)     | `GOOGLE_MAPS_BROWSER_KEY`               | vazio                       | habilitar **Maps JavaScript API**; restringir por referrer (`https://mnrs.com.br/tutoriais/*`, `http://localhost:8000/*`, `http://localhost:4099/*`). Vai para a página (é pública por natureza). |
| Geocodificação OSM     | `NOMINATIM_URL`, `NOMINATIM_USER_AGENT` | nominatim.openstreetmap.org | usada sem Google. 1 req/s, User-Agent identificável; cache de 24 h.                                                                                                                               |
| Ruas e referências OSM | `OVERPASS_URL`                          | overpass-api.de             | ruas próximas com traçado (sempre) e referências (sem Google).                                                                                                                                    |
| Rotas                  | `OSRM_URL`                              | router.project-osrm.org     | servidor **de demonstração**. Produção: OSRM próprio em container com o recorte do Nordeste (Geofabrik, `osrm/osrm-backend`), ou Google Routes se quiser trânsito.                                |
| Token da API           | `RASTREAMENTO_TOKEN`                    | vazio (API fechada)         | gerar com `openssl rand -hex 32`.                                                                                                                                                                 |

**Por que duas chaves e "tudo ou nada":** os termos do Google Maps Platform
proíbem exibir resultados do Google (lugares, endereços, coordenadas
geocodificadas) sobre mapa que não seja Google. Com as duas chaves, a tela usa
Google em tudo, inclusive o mapa. Faltando a do navegador, a tela inteira usa
OpenStreetMap + Leaflet. As ruas próximas vêm sempre do OSM (dado aberto, ODbL),
desenhadas por cima de qualquer um dos mapas.

## Coordenadas das bases

`database/seeders/CatalogoSeeder.php`. Bases e códigos: lista oficial
(`ChecagemdeBases/src/data/bases.ts`). Coordenadas: as mesmas que o
ChecagemdeBases plota no mapa (`src/data/coordenadas.ts`, branch
`claude/mapa-bases-alertas-equipes-393de6`, commit `678a92d`): **13 exatas**
(10 da geofence de check-in do `taximetro-digital` e 3 ancoradas em POI do OSM)
e **3 aproximadas** (Valéria, Boca do Rio 12º Centro, Pituba Arena). A origem
de cada uma fica em `bases.fonte_coordenada`.

Chaves do Google: passo a passo em `docs/GOOGLE-MAPS.md`.
