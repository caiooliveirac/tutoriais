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

| Método | Caminho                                        | Uso                                                                                                       |
| ------ | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| GET    | `/tutoriais/atendimento/geocodificar?q=`       | endereço → lista de `{rotulo, logradouro, numero, bairro, lat, lng}` (Nominatim, só Salvador, cache 24 h) |
| GET    | `/tutoriais/atendimento/estimativas?lat=&lng=` | mesma resposta de `/api/v1/estimativas`                                                                   |
| POST   | `/tutoriais/atendimento/ocorrencias`           | abre a ocorrência; grava no evento de abertura as 5 unidades sugeridas naquele instante                   |

## Serviços externos e produção

| Serviço        | Variável                                | Padrão                      | Observação                                                                                                                                                                                                              |
| -------------- | --------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Geocodificação | `NOMINATIM_URL`, `NOMINATIM_USER_AGENT` | nominatim.openstreetmap.org | política de uso: 1 req/s, User-Agent identificável. A tela espera 700 ms de pausa na digitação e o servidor guarda cache.                                                                                               |
| Rotas          | `OSRM_URL`                              | router.project-osrm.org     | servidor **de demonstração**. Para produção: OSRM próprio em container com o recorte do Nordeste do Geofabrik (`osrm/osrm-backend`), ou trocar `App\Services\Roteamento` por Google Distance Matrix se quiser trânsito. |
| Token da API   | `RASTREAMENTO_TOKEN`                    | vazio (API fechada)         | gerar com `openssl rand -hex 32`.                                                                                                                                                                                       |

## Coordenadas das bases

`database/seeders/CatalogoSeeder.php`. Bases e códigos vêm da lista oficial
(`ChecagemdeBases/src/data/bases.ts`); coordenadas do OpenStreetMap, com a
fonte gravada em `bases.fonte_coordenada`. A maioria é o **centro do bairro**;
`JORGE AMADO` (Unijorge) e `PITUBA ARENA` (Arena Aquática) são suposições a
confirmar. Coordenada exata da porta da base melhora a estimativa em 1–3 min.
