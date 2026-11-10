# 📦 Kit de Alinhamento do Time — Lorem Studio & Analisador Commander BR

> **Objetivo deste documento:** Centralizar todos os links, materiais de pesquisa, métricas e divisão de tarefas para os membros do time e parceiros do projeto.

---

## 1. Visão Geral do Projeto

O **Analisador de Deck Commander BR** é o primeiro projeto próprio (Labs #01) do **Lorem Studio**, em fase de validação para se tornar um produto digital (Web App SaaS) voltado à comunidade brasileira de *Magic: The Gathering* (formato Commander/EDH).

### Qual problema real ele resolve?
Jogadores brasileiros de Commander usam ferramentas estrangeiras em inglês (Moxfield, Archidekt, EDHREC) que cotam cartas em dólar e não explicam **como pilotar ou corrigir o baralho na prática**. O nosso analisador entrega em segundos e 100% em português:
1. **Diagnóstico de Bracket (1 a 4):** Diz em qual nível oficial de poder o baralho joga (evitando partidas desequilibradas).
2. **Orçamento Real em Reais (R\$):** Cotação mínima e média baseada no mercado brasileiro (LigaMagic) + **sugestões de trocas baratas (Budget)** para cartas caras.
3. **Matemática da Mão Inicial (Mulligan):** Probabilidade hipergeométrica exata de abrir com terrenos e jogadas nos turnos 1 e 2.
4. **Dossiê de Pilotagem via IA:** Guia passo a passo (Turnos 1–3, 4–6, 7+), linhas de vitória, o que cortar e o que colocar no deck.

---

## 2. Links Oficiais Ativos (Produção & Pesquisa)

| Recurso | Link de Acesso | Finalidade |
| :--- | :--- | :--- |
| **Guia Visual do Estúdio** | https://girinox.github.io/lorem-studio-guia-visual/ | Manual de marca, motor generativo SVG e UI Kit do Lorem Studio |
| **Pitch Deck (Sociedade)** | https://girinox.github.io/lorem-studio-guia-visual/pitch/ | Apresentação interativa do estúdio para sócios e parceiros |
| **Landing Page (Smoke Test)** | https://girinox.github.io/lorem-studio-guia-visual/commander/ | Página de teste de demanda do Analisador Commander BR |
| **Pesquisa (Google Forms)** | https://docs.google.com/forms/d/e/1FAIpQLSec_pTuIPj5Wkny9IzMBcwBmQjKWw1JOl9GYVGT8m6ypkWY-Q/viewform | Questionário rápido (14 perguntas, 5 min) para jogadores |
| **Planilha Mestra (Drive)** | https://docs.google.com/spreadsheets/d/1LNxXq3R2dn3hF_YOTjHSAt75P16VXXU2w3LkmDWFcFI/edit | Recebe ao vivo as respostas do Forms + cliques/cadastros da Landing Page |
| **Repositório Git (Web/UI)** | https://github.com/GirinoX/lorem-studio-guia-visual | Código-fonte do Guia Visual, Pitch Deck e Landing Page |

---

## 3. Resumo das 6 Hipóteses de Validação (Frentes A a F)

| Código | Hipótese | Como estamos medindo | Meta para Confirmar (GO) | Status Atual |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | Jogadores têm dúvida real sobre o **Bracket (1 a 4)** do próprio deck | Perguntas 7 e 8 do Google Forms | $\ge 50\%$ respondem *"Mais ou menos"*/*"Não"* na 7 ou enfrentam mesas desequilibradas na 8 | 🔄 Coletando respostas |
| **H2** | Descobrir o **preço do deck em R\$** é trabalhoso hoje | Pergunta 6 do Google Forms | $\ge 50\%$ cotam carta a carta na LigaMagic, convertem dólar de cabeça ou usam planilha | 🔄 Coletando respostas |
| **H3** | **Alternativas baratas em R\$ (Budget)** são o recurso mais desejado | Pergunta 9 (Ranking de 1 a 7) | *"Alternativas mais baratas em R\$"* ficar no **Top 2** na média geral | 🔄 Coletando respostas |
| **H4** | Existe disposição a pagar ($\text{R\$ } 5\text{ a R\$ } 20/\text{mês}$ ou avulso) | Perguntas 11 e 12 + cliques nos planos da Landing Page | Conversão de cliques e interesse real entre quem já gastou com ferramentas/conteúdo | 🔄 Coletando respostas |
| **H5** | O custo de IA por análise permite margem saudável | Benchmark real nos 9 decks da pasta `exemplos/` | Custo de API $< \text{R\$ } 0,25$ por análise completa | ✅ **CONFIRMADA** ($\text{R\$ } 0,0881$ no Gemini Flash / $\text{R\$ } 0,019$ no Llama 3.3) |
| **H6** | Conseguimos tração orgânica nas comunidades brasileiras | Total de respostas no Forms + cadastros na Landing Page | $\ge 100$ respostas no Forms e $\ge 30$ contatos em 2 semanas | 🔄 Em divulgação |

---

## 4. Regras Legais Obrigatórias (Wizards of the Coast & Scryfall)

Qualquer membro do time que mexer na **Landing Page**, **UI** ou **Modelo de Negócio** precisa respeitar duas regras de ouro mapeadas na auditoria jurídica (`frentes_A_e_F_concorrencia_e_termos.md`):
1. **Não cobrar pelo acesso aos dados brutos das cartas (Regra do Scryfall & Wizards Fan Content Policy):**
   * Toda a parte matemática do deck, imagens das cartas, textos de regras, cálculo de Bracket e uso com chave própria de IA (modo *BYOK*) **devem ser 100% gratuitos e abertos**.
   * **O que pode ser cobrado:** O processamento em nuvem nos nossos servidores de IA (conveniência de 1 clique, histórico salvo na nuvem e relatórios de consultoria gerados pela IA).
2. **Aviso Legal no Rodapé e Proibição de Logos Oficiais:**
   * Nunca usar o logo oficial do *Magic: The Gathering* ou os símbolos oficiais de mana registrados da Wizards como marca do produto.
   * Manter sempre no rodapé o texto obrigatório da *Wizards of the Coast Fan Content Policy*.

---

## 5. Divisão Sugerida de Responsabilidades para o Time

* **Frente 1 — Comunidade & Pesquisa (2 semanas):**
  * Divulgar o link do Google Forms e da Landing Page em grupos de WhatsApp de lojas (LGS), servidores de Discord de Commander BR e Reddit.
  * Acompanhar a aba `Painel_Hipoteses` e `Respostas ao formulário 1` na Planilha Mestra.
  * Chamar de 5 a 10 respondentes da Pergunta 14 para um bate-papo rápido de 20 minutos.
* **Frente 2 — Front-end & Landing Page Oficial (Programador Web):**
  * Evoluir a página atual (`/commander/index.html`) para a Landing Page oficial e preparar a interface web que consumirá o motor Python.
  * Seguir o documento **`02_BRIEFING_PROGRAMADOR_E_COMO_FUNCIONA_SEM_SABER_MAGIC.md`**.
* **Frente 3 — Motor de Análise & IA (Engenharia / Produto):**
  * Expor o motor Python (`analisador_deck.py` + `analisador_tematico.py` + `gerenciador_ia.py`) via API REST rápida (FastAPI) para que o site oficial possa rodar análises reais ao vivo.
  * Refinar os prompts conforme o guia **`03_ARQUITETURA_IAS_E_RECEITAS_DE_PROMPTS.md`**.
