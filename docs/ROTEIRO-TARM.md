# Tela do TARM — roteiro de melhorias

Origem: análise feita por agentes em 2026-09-23. O primeiro agente mediu e
melhorou a busca; o segundo revisou o fluxo da tela. Premissas do dono:

- o TARM digita errado (muitos semianalfabetos) e o solicitante é leigo;
- os filtros **nunca** impedem abrir a ocorrência;
- o sistema **conduz** o TARM até o local certo.

## Feito

| Item                                                                                                                                    | Onde                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Busca de ouvido medida por bateria (`php artisan mapas:avaliar`, 44 casos reais): 1º lugar subiu de 73% para 98%.                       | `app/Services/Mapas/{Fonetica,Catalogo}.php`, `database/data/casos-dificeis.json` |
| Ordem bairro → referência → rua; lista "é numa destas ruas?" clicável; aviso de homônimo.                                               | `resources/js/pages/atendimento.tsx`, `components/samu/atendimento/*`             |
| Enter confirma o campo e não abre mais a ocorrência; Ctrl/⌘+Enter abre.                                                                 | `atendimento.tsx` (`teclado`)                                                     |
| O bairro dito não é mais trocado em silêncio ao escolher uma rua homônima de outro bairro; o quadro de conferência avisa a divergência. | `atendimento.tsx` (`escolherEndereco`)                                            |
| Botão "Ligação caiu — abrir com o que tenho": abre só com o telefone; o evento avisa para retornar a ligação.                           | `AbrirOcorrenciaRequest`, `AbrirOcorrencia`                                       |
| Trilha "digitado × escolhido" (bairro "quis dizer", referência, rua, rua próxima, bairro vindo do mapa) gravada no evento de abertura.  | `atendimento.tsx`, `AbrirOcorrencia`                                              |
| Estado limpo entre um chamado e outro.                                                                                                  | `key` por chamado nos campos                                                      |

## A fazer, por prioridade

| #   | Melhoria                                                                                                                                                                                                                                                                 | Impacto × esforço  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 1   | **Homônimo que pergunta.** Painel com os bairros de cada rua ou lugar de mesmo nome e um lugar marcante perto de cada um. Endpoint `atendimento/homonimos`. Teclas 1–9 escolhem.                                                                                         | alto × baixo/médio |
| 2   | **Confiança do local** (alta / média / baixa / sem local). Calculada pela trilha: bairro reconhecido, ponto marcado, bairro do mapa igual ao dito, rua do catálogo, referência confirmada. Vira selo na tela, texto do botão e coluna `local_confianca`. Nunca bloqueia. | alto × médio       |
| 3   | **Roteiro de perguntas** que muda com o estado, com uma pergunta por vez em linguagem simples. Texto no fim deste arquivo.                                                                                                                                               | alto × médio       |
| 4   | **"Descrição do local para a equipe"** (`local_obs`) quando a confiança é baixa, e "marcar pelo centro do bairro".                                                                                                                                                       | alto × baixo       |
| 5   | **Fluxo só de teclado.** Setas nas listas e Alt+1..9 para escolher; foco automático no próximo passo; atalhos F validados com a TI da central, por causa do softphone.                                                                                                   | alto × médio       |
| 6   | **Referências confirmáveis.** "Fica perto de X?" ganha ✓ sim / ✗ não, e o "sim" sobe a confiança.                                                                                                                                                                        | médio × baixo      |
| 7   | **Colher casos reais.** Comando `mapas:colher-casos` monta, a partir das trilhas, casos candidatos para `casos-dificeis.json`, com revisão humana e sem telefone ou nome.                                                                                                | alto × baixo       |
| 8   | **Custo do Google.** Não chamar o Google quando o catálogo local já resolveu (rua no bairro, sem número); contador diário para o chefe de plantão.                                                                                                                       | médio × baixo      |
| 9   | **Confiança visível na triagem e no despacho** ("⚠ local incerto — confirmar ao ligar de volta").                                                                                                                                                                        | médio × baixo      |
| 10  | **Rascunho do chamado** no navegador, recuperável se a página recarregar e apagado ao abrir.                                                                                                                                                                             | médio × baixo      |

## Esboço do roteiro de perguntas

A tela mostra só a primeira pergunta que se aplica ao estado do chamado.

1. **Sem telefone:** "Qual o número daí, caso a ligação caia?"
2. **Sem bairro:** "Em que bairro vocês estão?"
    - Se houver sugestões: "É **Tororó**?", lendo a 1ª opção.
    - Se o solicitante não souber: "Tem alguma coisa conhecida perto? Mercado, igreja, escola, posto?"
3. **Sem referência:** "O que tem perto daí que todo mundo conhece?"
    - Se a referência tiver homônimos: "Esse **Atakarejo** é o de qual bairro? (Pernambués · Cajazeiras · Paripe)"
4. **Ponto marcado e sem rua:** "Vou ler umas ruas daí. Me diz se é alguma: **Rua A… Rua B…**"
5. **Rua homônima sem bairro confirmado:** "Tem **11 Rua São Jorge** em Salvador. Em qual bairro é a sua?"
6. **Bairro do mapa diferente do dito:** "Aqui aparece **Engenho Velho de Brotas**. É aí mesmo, ou é **Brotas**?"
7. **Sem número:** "Qual o número da casa? Se não tiver: portão, cor da casa, alguma marca?"
8. **Nada bateu:** "Me descreve o caminho a partir de um lugar conhecido."
9. **Local conferido:** "Agora me diz: o que está acontecendo?"

Regras de redação:

- frases de até 12 palavras;
- nunca usar "logradouro";
- oferecer opções ("é X ou Y?") quando houver candidatos;
- nome de lugar em negrito.

## Cuidados

- **Não inventar.** Bairro vindo do mapa e ponto aproximado ficam marcados como origem "mapa" na trilha. O número da casa nunca é preenchido pelo sistema.
- **Não bloquear.** Toda regra nova de validação precisa de um teste de "abre mesmo assim".
- **Carga cognitiva.** Uma pergunta ativa por vez. Testar com TARMs reais no LAB antes de promover.
