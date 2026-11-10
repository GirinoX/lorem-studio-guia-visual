# 🧠 Arquitetura de IAs, Custos Reais e Receitas de Prompts

> **Objetivo deste documento:** Detalhar exatamente quais modelos de Inteligência Artificial o Analisador de Decks utiliza, como funciona o sistema de contingência (fallback), quanto custa cada análise e quais são os **2 prompts exatos ("receitas")** que estão em produção no código (`analisador_deck.py` e `gerenciador_ia.py`).

---

## 1. Quais IAs Usamos? (Cascata Multi-IA com Fallback Automático)

O arquivo `gerenciador_ia.py` implementa uma **esteira de contingência em 3 níveis** para garantir que o sistema nunca pare se uma chave atingir limite de requisição gratuita (`HTTP 429`) ou se um servidor cair:

### Nível 1 — Google Gemini (Provedor Primário)
Usa o SDK oficial `google-genai` (tentando primeiro a *Interactions API* e depois `models.generate_content` com timeout de 20s), percorrendo em ordem de prioridade:
1. `gemini-3.8-flash`
2. `gemini-3.7-flash`
3. `gemini-3.6-flash`
4. `gemini-3.5-flash`
* **Rotação de Chaves:** Se houver múltiplas chaves cadastradas em `gemini_api_keys`, ele testa todos os modelos na Chave 1, depois rotaciona automaticamente para a Chave 2, e assim por diante.

### Nível 2 — Provedores Secundários Compatíveis com OpenAI (`/chat/completions`)
Se as chaves do Gemini falharem ou estiverem sem cota, o orquestrador aciona automaticamente (com `temperature: 0.7`):
1. **Groq (`llama-3.3-70b-versatile`)** — *Atualmente validado nos benchmarks como o mais rápido (~2,4 segundos por dossiê completo) e com cota gratuita generosa.*
2. **OpenRouter (`meta-llama/llama-3.3-70b-instruct:free`)** — Rota gratuita de backup.
3. **DeepSeek (`deepseek-chat` / DeepSeek V3)** — Excelente raciocínio analítico e baixíssimo custo por milhão de tokens.
4. **OpenAI (`gpt-4o-mini`)** — Última linha de contingência paga.

---

## 2. Quanto Custa Cada Análise Completa? (Benchmark Real — 9 Decks)

Medimos o consumo real de tokens executando os 2 prompts abaixo nos 9 baralhos completos da pasta `exemplos/` (relatório completo em `pesquisa_produto/custo_ia_20261110-110848.md`):

* **Consumo Médio por Deck (100 cartas):**
  * **Entrada (Prompt):** `1.988 tokens` (~7.300 caracteres de dados estruturados pré-calculados pelo Python).
  * **Saída (Resposta da IA):** `2.244 tokens` (~10.500 caracteres de consultoria em português).
  * **Total:** `4.232 tokens` por análise completa.
* **Custo Financeiro por Análise (Dólar cotado a R\$ 5,80):**
  * **No Google Gemini Flash:** **R\$ 0,0881 por deck** (com 100 análises custando R\$ 8,81).
  * **No Llama 3.3 70B (Groq) / DeepSeek:** **R\$ 0,0192 por deck** (menos de 2 centavos de Real por análise).

> **Por que o prompt é tão barato e preciso?**
> Porque **não pedimos para a IA adivinhar o texto das 100 cartas nem fazer contas**. O Python faz toda a matemática (curva de mana, probabilidades hipergeométricas, classificação das cartas via Scryfall e cotação na LigaMagic) e entrega um **resumo técnico mastigado** no prompt. A IA atua apenas como o **estrategista sênior** que interpreta os dados já calculados.

---

## 3. As 2 Receitas de Prompts em Produção (`analisador_deck.py`)

Hoje o sistema possui **duas receitas de prompt** com papéis complementares:
* **Receita #1 (`consultar_ia_otimizacao`):** Focada em **Auditoria de Cartas, Cortes e Upgrades por Orçamento (R\$) e Bracket**.
* **Receita #2 (`aprimorar_deck_com_ia`):** Focada no **Dossiê de Pilotagem na Interface Gráfica (6 Seções padronizadas + destaque de cartas no hover)**.

---

### 📜 RECEITA DE PROMPT #1: Consultoria de Cortes, Redundância e Upgrades (`consultar_ia_otimizacao`)

**Variáveis injetadas pelo Python antes de enviar à IA:**
* `{cmd}`, `{cost_cmd}`, `{tl_cmd}`, `{oracle_cmd}`: Nome, custo, tipo e texto oficial do Comandante no Scryfall.
* `{papel_temporal}` e `{timing_entrada}`: Papel calculado pelo Python (ex.: *Iniciador de Motor - Turno 3*).
* `{cmc_medio}`, `{bracket_titulo}`, `{turno_vitoria}`: Resultado da calculadora determinística de Bracket.
* `{lista_wincons}`: Condições de vitória detectadas no baralho.
* `{info_orcamento}`: Preço total mínimo/médio na LigaMagic (R\$) + lista das 6 cartas mais caras do deck.
* `{exemplos_cartas}`: Lista das cartas do baralho já com custo de mana e até 3 tags mecânicas extraídas pelo Python.

**Template exato do Prompt #1:**
```markdown
Você é um dos maiores especialistas mundiais em Magic: The Gathering, focado no formato Commander (EDH) e no sistema oficial de Brackets de Poder (1 a 4).

DADOS DO DECK ANALISADO:
- Arquivo: {nome_arquivo_origem}
- Comandante: {cmd} {cost_cmd} ({tl_cmd})
- Texto Oracle do Comandante: {oracle_cmd}
- Papel Estratégico no Tempo: {papel_temporal}
- Janela Ideal de Entrada: {timing_entrada}
- CMC Médio (sem terrenos): {cmc_medio}
- Enquadramento Atual: {bracket_titulo} (Turno estimado de vitória: {turno_vitoria})
- Total de Cartas: {total_cartas} (Terrenos: {terrenos} | Mágicas: {nao_terrenos})
- Linhas de Vitória Identificadas no Deck:
  {lista_wincons}
- Orçamento de Mercado (LigaMagic Brasil):
  * Total Mínimo Estimado: R$ {total_menor} | Total Médio: R$ {total_medio}
  * Cartas Mais Valiosas: {top_caras}
  * Diretriz Orçamentária: Apresente recomendações de upgrades separadas por:
    (1) Peças competitivas ideais para Bracket 4.
    (2) Alternativas 'Budget' acessíveis (baixo custo em R$) com efeito substituto análogo.
- Amostra de Mágicas do Deck:
  {exemplos_cartas}

SUA MISSÃO COMO CONSULTOR ESTRATÉGICO (SIGA EXATAMENTE A ÁRVORE DE DECISÃO DO FLUXOGRAMA):

1. ANÁLISE DE TIMING E QUANDO AS CARTAS REALMENTE QUEREM SER JOGADAS
Explique o sequenciamento prático: diferencie claramente jogadas proativas que QUEREM ser jogadas na curva nos turnos 1-3 para colocar o comandante/motor no chão, de jogadas reativas (como remoções de CMC 2) que devem guardar mana aberta para responder a ameaças. Em que momento exato o comandante deve entrar?

2. CONEXÃO DAS PEÇAS E LINHAS DE VITÓRIA (WIN CONDITIONS)
Descreva detalhadamente como as principais cartas do deck se conectam para fechar o jogo. Explique os combos, sinergias ocultas ou sequências letais disponíveis nesta lista.

3. AUDITORIA PEÇA POR PEÇA & SISTEMA DE RECOMENDAÇÕES (SEGUINDO O FLUXOGRAMA):
A) CARTAS CORE (MAIOR IMPORTÂNCIA):
   - Aponte de 3 a 5 cartas pilares indispensáveis nesta lista.
   - RECOMENDE CARTAS PARECIDAS QUE NÃO ESTÃO NA LISTA (para aumentar a redundância do plano central).

B) CARTAS COM IMPORTÂNCIA, MAS RECONHECIDAMENTE FRACAS / SUBÓTIMAS:
   - Aponte cartas que cumprem um papel necessário, mas de forma ineficiente ou lenta.
   - Investigue se há algum motivo plausível para ela estar no deck. Se sim, VERIFIQUE SE EXISTE OPÇÃO MAIS OTIMIZADA QUE NÃO ESTEJA NO DECK e recomende o substituto.

C) CARTAS DE IMPORTÂNCIA MÍNIMA OU CARTAS QUE NÃO SÃO BOAS PARA O DECK:
   - Identifique cartas sobressalentes (dead weight).
   - Investigue se pode haver alguma sinergia oculta. Se não encontrar: RECOMENDE TIRAR (cortes sugeridos).

4. UPGRADES ESTRATÉGICOS POR BRACKET & ORÇAMENTO:
- O que colocar para solidificar o deck no BRACKET 3 (High-Power Otimizado)? Sugira cartas com ótimo custo-benefício.
- O que seria necessário para sentar em uma mesa de BRACKET 4 (cEDH / Máxima Potência)? Quais tutores, fast mana (ex: Mox Opal, Mana Crypt) e respostas livres de mana (ex: Fierce Guardianship, Force of Will, Deflecting Swat, Silence) são fundamentais para responder e vencer no ritmo do Bracket 4?
- SUGESTÕES ORÇAMENTÁRIAS (BUDGET): Alternativas acessíveis financeiramente para jogadores que buscam alta eficiência sem gastar fortunas.

Responda em português, com tom profissional, direto e profundo.
```

---

### 📜 RECEITA DE PROMPT #2: Dossiê Estratégico de Pilotagem em 6 Seções (`aprimorar_deck_com_ia`)

Usada pela interface visual (`app_gui.py`) porque exige **6 cabeçalhos `###` fixos** que o front-end consegue separar em cards e inclui a instrução para **citar nominalmente o nome oficial das cartas em inglês** (para que a interface transforme cada nome citado num link com preview da imagem da carta ao passar o mouse).

**Variáveis injetadas pelo Python antes de enviar à IA:**
* `{cmd}`, `{cost_cmd}`, `{tl_cmd}`, `{oracle_cmd}`, `{cmc_medio}`, `{bracket_titulo}`, `{turno_vitoria}`
* `{lista_cartas_str}`: Até 85 linhas no formato `- 1x Nome da Carta (CMC: X, Papel: Papel Calculado pelo Python)`.

**Template exato do Prompt #2:**
```markdown
Você é o maior especialista e estrategista mundial de Magic: The Gathering Commander (EDH).
Sua missão é fornecer um DOSSIÊ ESTRATÉGICO COMPLETO, PROFUNDO E MINUCIOSO para o deck abaixo.
IMPORTANTE: Sempre cite nominalmente as cartas oficiais do deck (ex: Sol Ring, Skullclamp, Blood Artist, Spawning Pit) para que o sistema interativo exiba a foto delas ao passar o mouse.

DADOS DO COMANDANTE & DECK:
- Comandante: {cmd} {cost_cmd} ({tl_cmd})
- Texto Oracle: {oracle_cmd}
- CMC Médio: {cmc_medio}
- Bracket Preliminar: {bracket_titulo} (Janela: {turno_vitoria})

CARTAS DA LISTA DO DECK:
{lista_cartas_str}

ESTRUTURE SEU DOSSIÊ RIGOROSAMENTE NAS 6 SEÇÕES ABAIXO, USANDO OS CABEÇALHOS EXATOS:

### 1. FILOSOFIA & IDENTIDADE ESTRATÉGICA DO DECK
[Defina o arquétipo e a mentalidade do jogador ao pilotar este deck. Explique se a postura é proativa, reativa, atrito ou motor oculto, e qual a vantagem fundamental que o deck explora contra 3 oponentes.]

### 2. GUIA DE MULLIGAN & DECISÕES DE ABERTURA
[Quais cartas de CMC 1-2 você PRECISA ver na mão de 7 para mantê-la? Cite cartas específicas da lista que justificam um KEEP confiável e quais combinações de mãos exigem MULLIGAN imediato.]

### 3. SEQUENCIAMENTO DE PILOTAGEM TURNO A TURNO
- Early Game (Turnos 1 a 3): [Quais cartas jogar em cada turno, desenvolvimento de mana, rampa e posicionamento de combustível sem atrair o foco dos oponentes. Quando o comandante deve descer?]
- Mid Game (Turnos 4 a 6): [Como engrenar o motor de vantagem, conectar sinergias e gerar valor exponencial com o comandante. Como pilotar com mana aberta para respostas e remoções.]
- End Game (Turnos 7+): [O momento da virada: como fechar as contas de vida e punir tentativas de board wipes ou contra-ataques.]

### 4. LINHAS DE VITÓRIA DETALHADAS & COMBOS
[Explique passo a passo as rotas exatas para vencer a partida com as cartas presentes nesta lista. Se houver combos infinitos, loops de sacrifício, Overruns de fichas ou drenos cumulativos de 120 de vida, descreva a sequência precisa de ativações e gatilhos citando cada carta envolvida.]

### 5. VULNERABILIDADES & COMO PROTEGER O MOTOR
[Quais são as fraquezas mortais deste baralho (ex: wipes no cemitério, remoções de artefatos, interrupção do comandante)? Quais cartas da lista você deve guardar como salvaguarda e qual o plano de contingência caso o comandante seja removido múltiplas vezes?]

### 6. SINERGIAS SECRETAS & RECLASSIFICAÇÃO CONTEXTUAL
[Aponte de 4 a 8 interações de alto impacto entre cartas específicas da lista que um jogador desatento poderia não enxergar. Formato: Carta A + Carta B: Explicação do efeito multiplicador.]
```

---

## 4. Próxima Evolução Recomendada para os Prompts (Web App MVP)

Quando o programador integrar o motor na versão Web, a recomendação técnica é:
1. **Unificar as Receitas #1 e #2 em uma única chamada JSON estruturada (`response_mime_type="application/json"`):**
   * Assim a IA retorna de uma só vez tanto o **Dossiê de Pilotagem** quanto a tabela de **Cortes & Substitutos Budget em R\$**, reduzindo o custo por análise completa pela metade (de R\$ 0,088 para ~R\$ 0,045 no Gemini Flash, ou ~R\$ 0,010 no Llama 3.3).
2. **Injetar os preços reais da LigaMagic nas sugestões de substituição:**
   * Validar os nomes das cartas sugeridas pela IA contra o nosso `cache_precos_liga.json` antes de exibir na tela, garantindo que toda sugestão *"Budget"* realmente tenha o preço atualizado em R\$ ao lado.
