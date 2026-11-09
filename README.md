# Lorem Studio — Guia Visual & Sistema Generativo

Site oficial interativo de Identidade Visual, Motor Algorítmico SVG e **Lorem UI Kit** (Swiss Grid & Geometria Ortogonal Bauhaus) do **Lorem Studio**.

---

## Estrutura de Produção (Static Web / Git Ready)

O projeto foi construído em arquitetura **Vanilla Web Zero-Dependency** (HTML5 + CSS3 + ES6 SVG Engine), pronto para deploy imediato no **GitHub Pages**, **Vercel**, **Netlify** ou qualquer servidor estático sem etapa de build:

```text
lorem_identidade_visual/
├── index.html                  # Documento principal semântico (8 seções + App Shell)
├── styles.css                  # Design Tokens, Swiss Grid e Lorem UI Kit
├── app.js                      # Motor algorítmico 6×6, Roda de Flusser e exportador SVG
├── ABRIR_MANUAL_INTERATIVO.bat # Atalho para execução local rápida no Windows
├── .gitignore                  # Regras de exclusão para versionamento Git
└── README.md                   # Documentação técnica
```

---

## Destaques da Versão de Produção

1. **Proporção Vetorial 1:1 com a Matriz do Illustrator (`lorem2.ai`):**
   - Caixa externa de proteção `440 × 440` (`80..520`) com o grid `6×6` de construção dimensionado em `358 × 358` (`121..479`, proporção exata de `81.2%` do original) e wordmark `Lorem` em curvas Bézier na escala `0.842`, garantindo que nenhuma rotação nos quadrantes `(7)` extrapole a caixa do símbolo.
2. **Contraste Cromático Calibrado (WCAG AA):**
   - **Bauhaus Indigo (`#23265F`)** como cor institucional primária (`12.8:1` sobre branco).
   - **Cyber Teal (`#0F8A85` / `#0B726E`)** recalibrado para garantir legibilidade nítida tanto em elementos gráficos quanto em textos técnicos sobre fundo branco (`4.3:1` a `5.4:1`), sem perder a identidade ciano-Bauhaus.
3. **Arquitetura Tipográfica Unificada:**
   - **Space Grotesk** (`Regular 400`, `SemiBold 600`, `Bold 700`) para todos os títulos, cabeçalhos, métricas e corpo editorial.
   - **JetBrains Mono** para coordenadas do grid, *seeds* (`#LRM-XXXX`) e tabelas técnicas.
   - **Bebas Neue** preservada exclusivamente nas curvas vetoriais da assinatura `Lorem`.
4. **Roda do Tempo de Vilém Flusser:**
   - Simulador de `1` a `120` instâncias sobrepostas com **giro contínuo em sentido horário** e máscara vetorial expandida (`1200 × 1200 userSpaceOnUse`), sem recorte pelas bordas do container.
5. **Lorem UI Kit (Swiss Orthogonal System):**
   - Componentes com `border-radius: 0px`, grid exposto de `1px`, primitivas semânticas da Bauhaus (Círculo, Retângulo, Triângulo) e *App Shell* interativo completo.

---

## Como Publicar via Git

```bash
cd lorem_identidade_visual
git init
git add .
git commit -m "feat: release Lorem Studio Guia Visual production ready"
git branch -M main
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push -u origin main
```
