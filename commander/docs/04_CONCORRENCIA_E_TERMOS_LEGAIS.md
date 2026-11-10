# Frentes A & F — Mapa de Concorrência e Auditoria de Termos de Uso

> **Projeto:** Analisador de Deck Commander & Cotação R$ (Primeiro Produto de Teste — Lorem Studio)  
> **Data:** 10/11/2026  
> **Objetivo:** Mapear o que já existe para o jogador brasileiro de Commander (Frente A) e verificar as restrições jurídicas/contratuais da Wizards of the Coast, Scryfall e LigaMagic sobre monetização (Frente F).

---

## 1. Frente A — Mapa Comparativo de Concorrentes

Testamos e comparamos as 5 ferramentas mais usadas por jogadores de Commander no Brasil com o motor atual do `analisador_de_deck_commander`:

| Ferramenta | Preço / Modelo | Preço em R$ (Brasil) | Cálculo Automático de Bracket (1 a 4) | Dossiê de Pilotagem & Combos (PT-BR) | Sugestão de Upgrades Budget em R$ | Onde deixa lacuna para o jogador BR |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Moxfield** | **100% Grátis** (Apoio via Patreon US$ 1 a US$ 50/mês remove anúncios e dá badge/URL) | ❌ Não (apenas USD/EUR via TCGplayer, Card Kingdom, Cardmarket) | ⚠️ Parcial (indica *Game Changers*, mas não explica o ritmo turno a turno em PT-BR) | ❌ Não (apenas Primer manual escrito pelo autor) | ❌ Não | Interface em inglês, preços em dólar distantes da realidade brasileira e zero diagnóstico automático. |
| **Archidekt** | **100% Grátis** (Patreon US$ 2+/mês remove anúncios) | ❌ Não (apenas USD/EUR) | ⚠️ Básico (estimativa simples) | ❌ Não | ❌ Não | Excelente editor visual, mas não orienta o jogador casual sobre *o que cortar* ou *como pilotar*. |
| **EDHREC** | **Grátis c/ Anúncios** + Afiliados de lojas | ❌ Não (preços em USD) | ❌ Não analisa o seu deck completo gratuitamente com diagnóstico | ❌ Não (mostra estatísticas agregadas de cartas, sem explicar o *timing* do seu deck) | ⚠️ Filtro "Budget" em dólar (muitas cartas baratas lá fora são caras ou sem estoque no Brasil) | Mostra *quais* cartas são populares com um comandante, mas não diz quais das suas 100 cartas estão travando sua curva. |
| **LigaMagic (Deck Builder)** | **Grátis** (Monetiza via marketplace de lojas brasileiras + banners + LigaSegura) | ✅ **Sim (Referência nacional)** | ❌ Não | ❌ Não | ❌ Não | Resolve o preço em R$, mas a análise estatística/tática do deck é mínima (apenas curva básica de mana). |
| **ManaBox** (Mobile) | **Freemium** (Grátis + Premium a **US$ 2,99/mês** ou ~US$ 23/ano) | ⚠️ Converte câmbio ou busca parceiros globais | ❌ Não | ❌ Não | ❌ Não | Focado em catalogar coleção física e fichários (*binders*) no celular, não em consultoria tática. |
| **Nosso Protótipo (`Analisador Commander`)** | **Em definição (Freemium / Apoio + Afiliados)** | ✅ **Sim (Menor, Médio e Maior preço em R$)** | ✅ **Sim (Brackets 1 a 4 + janela de vitória)** | ✅ **Sim (Early/Mid/Late game, Mulligan e Sinergias em PT-BR)** | ✅ **Sim (Cortes + Upgrades Budget em R$)** | Hoje está preso em um `.exe` desktop; precisa ir para Web App responsivo. |

### Principais Conclusões da Frente A (Oportunidade de Produto)
1. **A dor brasileira real é a desconexão entre "Sinergia (EDHREC/Moxfield)" e "Bolso em Reais (LigaMagic)":**
   - O jogador brasileiro monta o deck no Moxfield olhando o EDHREC, mas quando vai comprar na LigaMagic descobre que uma carta de US$ 2 nos EUA custa R$ 80 no Brasil (ou não tem estoque), enquanto outra carta equivalente custa R$ 3,00.
2. **Nenhuma ferramenta entrega um "Guia de Pilotagem & Mulligan em Português" pronto para a mesa:**
   - Jogadores casuais frequentemente compram ou montam um deck e só descobrem na mesa que falta rampa no turno 2 ou que não sabem qual mão de 7 cartas manter (*keep vs. mulligan*).

---

## 2. Frente F — Auditoria dos Termos de Uso (Risco Crítico de Monetização)

A investigação dos termos oficiais revelou uma **restrição determinante** que muda a forma como o plano pago deve ser estruturado:

### 2.1. Wizards of the Coast — *Fan Content Policy*
- **Regra de Ouro ("One Word: F-R-E-E"):** Qualquer conteúdo ou ferramenta que utilize propriedade intelectual da Wizards (nomes, símbolos de mana, textos Oracle e artes de cartas) **deve ser acessível gratuitamente pela comunidade**.
- **O que é PROIBIDO:** Cobrar assinatura obrigatória (*paywall*) para visualizar dados ou imagens das cartas da Wizards.
- **O que é PERMITIDO:**
  1. Receita de anúncios (*Ads*) e patrocínios;
  2. Doações / Apoio voluntário (Patreon, Apoia.se, Ko-fi) e benefícios cosméticos/comunitários;
  3. Comissões de afiliados (links para compra de cartas físicas em lojas);
  4. Cobrar por **serviços de infraestrutura/processamento avulso de IA ou armazenamento em nuvem** desde que a visualização das cartas e a ferramenta base continuem abertas (ou que o usuário possa usar sua própria chave de IA gratuitamente — modelo *BYOK*).
- **Aviso Legal Obrigatório no Rodapé do Web App:**
  > *“Este produto é Conteúdo de Fã não oficial permitido sob a Política de Conteúdo de Fã da Wizards of the Coast. Não aprovado ou endossado pela Wizards. Parte dos materiais utilizados são propriedade da Wizards of the Coast. ©Wizards of the Coast LLC.”*

### 2.2. Scryfall — *API Terms of Service*
- **Uso Gratuito:** A API e os pacotes *Bulk Data* do Scryfall são 100% gratuitos.
- **Proibição Expressa de Paywall:** *"You may not paywall access to Scryfall data."* Não é permitido cobrar do usuário para acessar buscas, textos ou imagens vindos do Scryfall.
- **Boa Prática Técnica para Web App:** Em produção, em vez de fazer dezenas de chamadas em tempo real à API do Scryfall a cada deck, devemos baixar o arquivo diário **Scryfall Bulk Data (`Oracle Cards` / `Default Cards`)** no servidor, mantendo busca instantânea em `0 ms` e custo zero.

### 2.3. LigaMagic — Raspagem (*Scraping*) vs. Parceria / Afiliados
- **Risco Técnico e Jurídico do Scraping em Produção:** No app desktop local, o `scraper_ligamagic.py` faz requisições com o IP residencial do próprio jogador. Porém, se colocarmos isso em um servidor web centralizado (cloud), o IP do servidor será bloqueado rapidamente por *Cloudflare / Rate Limit* da LigaMagic, além de violar termos contra coleta automatizada em massa.
- **3 Soluções Viáveis para o Web App:**
  1. **Curto Prazo (MVP):** Manter um cache agressivo de preços atualizado periodicamente + permitir que o usuário cole a lista exportada ou busque sob demanda apenas as cartas que não estão em cache.
  2. **Médio Prazo (Monetização):** Entrar em contato com a **LigaMagic** ou com grandes lojas brasileiras (Bazar de Bagda, City Class Games, Epic Game, etc.) para usar **links de afiliados (`utm_source` / cupom)** no botão *"Comprar Upgrades Mais Baratos"*.
  3. **Alternativa de Fallback:** Usar os preços oficiais embutidos no *Scryfall Bulk Data* como estimativa base e cotar em R$ apenas o Top 15 cartas de maior impacto.

---

## 3. Como Estruturar o Modelo Freemium 100% Dentro das Regras

Para respeitar integralmente a *Fan Content Policy* da Wizards e os Termos do Scryfall sem abrir mão de receita recorrente:

| Camada | O que entrega | Preço | Conformidade Legal |
| :--- | :--- | :---: | :--- |
| **1. Grátis (Comunidade)** | Importação Moxfield/Texto, Cálculo de **Bracket (1–4)**, Curva de Mana, Probabilidade da Mão Inicial (Hipergeométrica), Sinergias Determinísticas + **Modo BYOK** (usuário pode colar sua própria chave gratuita do Google AI Studio/Groq para rodar IA sem pagar nada). | **R$ 0** | 100% aberto — nenhum dado do Scryfall ou da Wizards fica trancado atrás de paywall. |
| **2. Créditos / Passe IA Cloud ("Pro")** | Usuário não precisa configurar chave técnica: usa nossos servidores de IA com 1 clique para gerar o **Dossiê de Pilotagem, Guia de Mulligan e Recomendações Budget**, além de salvar histórico de evolução dos decks na nuvem e exportar PDF de bolso. | **R$ 9,90/mês** *(ou pacote avulso)* | Cobra exclusivamente pela **conveniência de processamento em nuvem (LLM tokens + armazenamento)**, nunca pelos dados das cartas. |
| **3. Afiliados / Lojas (B2B)** | Botão *"Onde comprar este pacote de upgrades pelo menor preço em R$"* ao final de cada análise. | **Comissão de 3% a 8%** para o estúdio | 100% permitido e alinhado ao modelo do EDHREC. |
