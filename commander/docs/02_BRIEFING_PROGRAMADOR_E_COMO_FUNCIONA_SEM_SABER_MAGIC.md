# 💻 Briefing para o Programador — Como o Analisador Funciona (Sem Precisar Jogar Magic) + Guia da Landing Page

> **Para quem é este guia:** Foi escrito especialmente para desenvolvedores que **não jogam Magic: The Gathering**, explicando a lógica do domínio de forma simples e direta, seguida da arquitetura técnica do software e das instruções do repositório Git.

---

## Parte 1: Entendendo o Jogo em 3 Minutos (Analogia para Desenvolvedores)

Você **não** precisa aprender as regras de Magic para construir a Landing Page ou o Front-end do produto. Basta pensar no jogo como um **sistema de montagem de elenco/setup com restrições matemáticas**:

1. **O que é um "Deck de Commander"?**
   * É uma lista de exatamente **100 cartas** escolhidas pelo jogador (sem repetir cartas, exceto terrenos básicos).
   * Dessas 100 cartas, **1 carta especial é o "Comandante"** (o capitão/líder do time, que fica sempre disponível desde o início da partida) e as outras **99 cartas** formam o baralho que é embaralhado.
2. **O que é "Mana" e "CMC" (Custo de Mana)?**
   * Pense em **Mana** como a **memória RAM ou energia por rodada**. A cada turno (rodada 1, rodada 2, rodada 3...), o jogador coloca 1 **Terreno** na mesa, ganhando +1 de energia por turno.
   * **CMC (Converted Mana Cost)** é o **preço de energia** para jogar uma carta (ex.: uma carta de CMC 2 custa 2 de energia; uma de CMC 6 custa 6).
   * **O problema clássico do jogador:** Se ele colocar cartas caras demais (CMC alto) e poucos terrenos ou aceleradores (*"Rampa"*), o baralho trava nos primeiros turnos.
3. **O que é "Mulligan"?**
   * No começo do jogo, o jogador sorteia **7 cartas** (a "mão inicial"). Se vierem só cartas caras ou faltar terreno, ele precisa devolver a mão e sortear outra (*Mulligan*). Nosso sistema usa probabilidade estatística para dizer: *"A chance de você abrir com uma mão jogável neste deck é de 78%"*.
4. **O que são os "Brackets (1 a 4)"?**
   * Uma partida de Commander tem **4 jogadores na mesma mesa**.
   * Como existem mais de 27 mil cartas na história do jogo, um baralho pode custar R\$ 150 (casual, lento) ou R\$ 15.000 (competitivo, ganha no turno 2).
   * Para evitar colocar um "carro de Fórmula 1" contra um "carro de passeio", existe uma escala oficial de **1 a 4 chamada Bracket**:
     * **Bracket 1:** Casual temático / lento (ganha depois do turno 9).
     * **Bracket 2:** Baralho padrão / pré-construído melhorado (ganha nos turnos 7 a 9).
     * **Bracket 3:** Otimizado / forte (ganha nos turnos 5 a 7).
     * **Bracket 4 (cEDH):** Competitivo máximo, usa as cartas mais apelonas do jogo (ganha nos turnos 2 a 4).
5. **Qual é a grande dor do jogador brasileiro?**
   * Os sites famosos lá fora mostram tudo em inglês e em Dólar (US\$). No Brasil, o preço real das cartas vem de um marketplace nacional chamado **LigaMagic** (em R\$), e muitas cartas famosas lá fora custam R\$ 200+ aqui. O jogador quer saber:
     1. *"Em qual Bracket (1 a 4) meu deck está?"*
     2. *"Quanto meu deck custa em Reais hoje?"*
     3. *"Qual carta de R\$ 5,00 faz quase a mesma coisa que essa carta de R\$ 150,00?"*
     4. *"Como eu piloto esse baralho turno a turno para ganhar?"*

---

## Parte 2: Como o Motor do Analisador Funciona por Dentro (8 Etapas)

O motor atual foi escrito em Python e funciona como um **pipeline de dados de 8 etapas** (parte 100% matemática/determinística e parte IA generativa):

```
[Entrada: Lista de 100 nomes de cartas ou link do Moxfield]
       │
       ▼
1. PARSER DE LISTA (carregar_decklist / moxfield_importer.py)
   Separa as 99 cartas do baralho e identifica automaticamente quem é o Comandante.
       │
       ▼
2. ENRIQUECIMENTO DE DADOS (API Scryfall + cache_cartas.json)
   Consulta em lote (até 75 cartas por request em /cards/collection) a API pública do Scryfall.
   Baixa custo de mana, tipo da carta, texto oficial de regras (Oracle Text) e URL da imagem.
       │
       ▼
3. CLASSIFICADOR TÁTICO DETERMINÍSTICO (analisador_deck.py)
   Via expressões regulares (Regex) sobre o texto de regras de cada carta, rotula cada uma das 100 cartas em:
   - 12 Funções Macro (Terreno, Rampa/Aceleração, Compra de Cartas, Remoção, Condição de Vitória, etc.)
   - +30 Papéis Táticos e até 5 Tags Mecânicas
   - Timing real de jogo (se é uma carta proativa de Turno 1-2 ou reativa para guardar na mão).
       │
       ▼
4. MOTOR MATEMÁTICO HIPERGEOMÉTRICO (analisador_deck.py)
   Calcula a distribuição hipergeométrica exata P(X >= k) na mão inicial de 7 cartas:
   - Chance de abrir com pelo menos 2 terrenos;
   - Chance de ter jogada ativa no Turno 1 e Turno 2;
   - Curva de custo médio (CMC médio) e proporção de cores.
       │
       ▼
5. CALCULADORA DE BRACKET 1 A 4 (avaliar_bracket_e_potencia)
   Cruza o custo médio do deck com listas de cartas competitivas ("Fast Mana", "Tutores", "Free Spells" e "Combos").
   Gera uma nota ponderada e classifica o deck entre Bracket 1, 2, 3 ou 4 + janela estimada de vitória.
       │
       ▼
6. GRAFO DE SINERGIAS E ZONAS MECÂNICAS (analisador_tematico.py)
   Agrupa as cartas que conversam entre si em até 6 "Zonas Mecânicas" ao redor do Comandante e calcula o peso de conexão entre cada par de cartas (para desenhar um mapa visual interativo).
       │
       ▼
7. COTAÇÃO EM REAIS (scraper_ligamagic.py + cache_precos_liga.json)
   Consulta o menor preço e o preço médio em R$ no mercado brasileiro (LigaMagic) e lista as 15 cartas mais caras do deck.
       │
       ▼
8. CONSULTORIA ESTRATÉGICA VIA IA (gerenciador_ia.py)
   Envia o resumo estruturado do deck para a IA (Google Gemini / Llama 3.3), que devolve em português:
   - Guia de Mulligan (o que manter na mão inicial);
   - Como jogar nos Turnos 1-3, 4-6 e 7+;
   - Quais cartas fracas cortar e quais substitutos baratos em R$ colocar.
```

---

## Parte 3: Repositórios Git e Estrutura para Criar a Landing Page Oficial

### 1. Repositório Web Atual (GitHub Pages)
* **URL do Repositório:** `https://github.com/GirinoX/lorem-studio-guia-visual.git`
* **Site publicado:** `https://girinox.github.io/lorem-studio-guia-visual/`
* **Estrutura de pastas do repositório:**
  * `/index.html` → Guia Visual e UI Kit oficial do **Lorem Studio** (use como referência de Design System, cores, botões e tipografia!).
  * `/pitch/index.html` → Apresentação interativa de negócios do estúdio.
  * `/commander/index.html` → **Landing Page atual (Smoke Test) do Analisador Commander BR** (`https://girinox.github.io/lorem-studio-guia-visual/commander/`).
  * `/commander/docs/` → Esta documentação completa para o time.

### 2. Identidade Visual & Design System a Seguir
O produto usa o sistema visual **Bauhaus Generativo / Editorial Técnico** do Lorem Studio (documentado em `/index.html`):
* **Fonte Única Principal:** `Space Grotesk` (pesos 400, 500, 600, 700).
* **Paleta de Cores (CSS Variables):**
  * `--indigo: #23265F` (Cor primária estrutural, títulos e barras principais)
  * `--teal: #0F8A85` e `--teal-text: #0B726E` (Destaques técnicos, badges de aprovação/economia, contraste AA sobre fundo claro)
  * `--amber: #F4B41A` (Botões de conversão principal / CTAs de destaque)
  * `--black: #111317` (Textos e rodapé)
  * `--page: #F7FAFC` e `--ice: #EBF3F6` (Fundos claros limpos — fugir de visual genérico escuro/neon de IA).

### 3. Telemetria e Integração com Google Sheets (IMPORTANTE MANTER!)
Na Landing Page atual (`/commander/index.html`), toda ação do visitante é gravada em uma planilha do Google Drive através de um Webhook do Google Apps Script e ligada ao Google Forms oficial. Ao criar ou atualizar a Landing Page oficial, **preserve essas duas integrações**:

1. **Link Oficial da Pesquisa (Google Forms):**
   ```text
   https://docs.google.com/forms/d/e/1FAIpQLSec_pTuIPj5Wkny9IzMBcwBmQjKWw1JOl9GYVGT8m6ypkWY-Q/viewform
   ```
2. **Webhook de Comportamento e Waitlist (`SHEETS_WEBHOOK_URL`):**
   ```javascript
   const SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzke1nq0-vMDSn3HmbxdWwlY26Dg_bSXU0iZvMkQ4f0uWicLCZ8LjMK6owJYbiVjJshvg/exec';
   ```
   Sempre que o visitante abrir a página (`pageview`), testar um deck de demonstração (`troca_deck_demo`), clicar em um plano de preço (`clique_botao_plano`) ou enviar o formulário de espera (`inscricao_waitlist`), faça um `POST` JSON (`mode: 'no-cors'`, `Content-Type: 'text/plain;charset=utf-8'`) com o formato:
   ```json
   {
     "ts": "2026-11-10T12:00:00.000Z",
     "tipo_evento": "inscricao_waitlist",
     "plano_ou_acao": "Passe Pro Cloud (R$ 9,90/mes)",
     "contato": "usuario@email.com",
     "deck": "https://moxfield.com/decks/...",
     "dor": "preco_brl",
     "referrer": "direto",
     "ua": "Mozilla/5.0..."
   }
   ```
   Isso alimenta automaticamente a aba `Eventos_Site_SmokeTest` da planilha mestra do time.
