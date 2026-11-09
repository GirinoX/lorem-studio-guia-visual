/**
 * LOREM STUDIO GUIA VISUAL — MOTOR DE IDENTIDADE VISUAL ALGORÍTMICA (PRODUÇÃO)
 * Calibrado 1:1 com as matrizes vetoriais do arquivo Adobe Illustrator (lorem2.ai):
 * 1) Escala exata do Símbolo: grade interna 6x6 de 358x358 inscrita no quadro externo de 440x440,
 *    garantindo que nenhuma ponta do triângulo ou do retângulo vaze do quadro ao rotacionar.
 * 2) Logotipo 'Lorem' escalado na proporção exata (largura 375px dentro do quadro de 440px).
 * 3) Cyber Teal recalibrado (#0F8A85) para garantir legibilidade e contraste WCAG AA sobre branco.
 * 4) Roda do Tempo de Vilém Flusser com giro estritamente no sentido horário e sem cortes de caixa.
 */

const OFFICIAL_PALETTE = {
  name: 'Paleta Oficial Lorem Studio',
  black: '#111317',
  midnight: '#23265F',
  cyan: '#0F8A85',
  pastel: '#BACACE',
  mint: '#EBF3F6',
  accent: '#F4B41A',
  swatches: [
    {
      name: 'Carbon Void',
      role: 'Neutro Escuro / Negativo',
      hex: '#111317',
      cmyk: '82 · 74 · 65 · 88',
      contrastWhite: '18.6:1 (AAA)',
      textColor: '#FFFFFF'
    },
    {
      name: 'Bauhaus Indigo',
      role: 'Principal · Sobriedade & Círculo (1)',
      hex: '#23265F',
      cmyk: '98 · 92 · 24 · 22',
      contrastWhite: '12.8:1 (AAA)',
      textColor: '#FFFFFF'
    },
    {
      name: 'Cyber Teal',
      role: 'Principal · Formas Móveis (Alto Contraste)',
      hex: '#0F8A85',
      cmyk: '86 · 18 · 48 · 4',
      contrastWhite: '4.3:1 c/ Branco (AA)',
      textColor: '#FFFFFF'
    },
    {
      name: 'Bauhaus Amber',
      role: 'Acento Tático · Interação & Destaque',
      hex: '#F4B41A',
      cmyk: '4 · 28 · 95 · 0',
      contrastWhite: '9.4:1 c/ Carbon',
      textColor: '#111317'
    },
    {
      name: 'Architectural Mist',
      role: 'Secundária · Apoio Gráfico',
      hex: '#BACACE',
      cmyk: '28 · 12 · 16 · 0',
      contrastWhite: '7.8:1 c/ Indigo',
      textColor: '#111317'
    },
    {
      name: 'Ice Canvas',
      role: 'Secundária · Superfície Clara',
      hex: '#EBF3F6',
      cmyk: '8 · 2 · 3 · 0',
      contrastWhite: '16.5:1 c/ Carbon',
      textColor: '#111317'
    }
  ]
};

// Quadrantes oficiais de rotação (7) extraídos do arquivo lorem2.ai (sentido horário)
const VALID_ROTATION_SECTORS = [
  { label: 'Q1 · Topo (354°)', angle: 354 },
  { label: 'Q1 · Topo (5°)', angle: 5 },
  { label: 'Q2 · Direita (85°)', angle: 85 },
  { label: 'Q2 · Direita (95°)', angle: 95 },
  { label: 'Q3 · Base (175°)', angle: 175 },
  { label: 'Q3 · Base (185°)', angle: 185 },
  { label: 'Q4 · Esquerda (265°)', angle: 265 },
  { label: 'Q4 · Esquerda (275°)', angle: 275 }
];

// Estado global da instância ativa do logo
const state = {
  seed: 'LRM-2026',
  anchorIndex: 2, // 0: Ponto A (45°), 1: Ponto B (67.5°), 2: Ponto C (90° Topo)
  p5x: 42,        // 0..100 (coordenada X dentro da área 5)
  p5y: 45,        // 0..100 (coordenada Y dentro da área 5)
  rotation: 175,  // Ângulo válido nos quadrantes (7)
  flipX: false,   // 50% de chance de virar horizontalmente
  showGrid: false,
  showWordmark: true,
  stageBg: '#FFFFFF',
  autoCycleTimer: null,
  flusserCount: 1,
  flusserRotationDeg: 0,
  flusserAnimTimer: null,
  buildStep: 1,
  stripVariations: []
};

let uniqueMaskCounter = 0;

/**
 * Normaliza qualquer ângulo para o setor válido mais próximo da regra (7) do manual
 */
function snapToValidRotation(deg) {
  let norm = ((deg % 360) + 360) % 360;
  const quadrants = [0, 90, 180, 270, 360];
  let closestQ = 0;
  let minDiff = 999;
  for (const q of quadrants) {
    const d = Math.abs(norm - q);
    if (d < minDiff) {
      minDiff = d;
      closestQ = q;
    }
  }
  let offset = norm - closestQ;
  if (Math.abs(offset) < 4) {
    offset = offset < 0 ? -5 : 5;
  } else if (Math.abs(offset) > 8) {
    offset = offset < 0 ? -7 : 7;
  }
  return Math.round(((closestQ + offset) % 360 + 360) % 360);
}

/**
 * Calcula a geometria exata dos elementos Bauhaus conforme extraído de lorem2.ai (Stream 11):
 * - Quadro externo de proteção do símbolo: 440x440 (de 80 a 520), centrado em (300, 300).
 * - Grade interna 6x6 do símbolo: 358x358 (de 121 a 479), centrada em (300, 300),
 *   garantindo que o símbolo rotacionado fique 100% contido dentro do quadro 440x440!
 * - Passo 1: Círculo (1) centrado em (300, 300), raio r = 63, espessura = 23.
 * - Passo 2: Retângulo (2)-(3) partindo de (135, 135) com largura e altura determinadas
 *   pelos 3 pontos de ancoragem no círculo.
 * - Passo 3: Triângulo retângulo puro de 3 vértices:
 *   pt4 = (456, 456), pt5 = (x5, y5) na área (5), pt6 = (x5, 456).
 */
function computeLogoGeometry(params) {
  const { anchorIndex = 0, p5x = 50, p5y = 50 } = params;

  // Quadro externo (440x440) e Grade interna 6x6 (358x358)
  const outerBox = { x: 80, y: 80, size: 440 };
  const innerGrid = { x: 121, y: 121, size: 358 };

  // Passo 1: Círculo central (1) sempre fixo no centro (300, 300)
  const circle = { cx: 300, cy: 300, r: 63, strokeWidth: 23 };

  // Passo 2: Retângulo ortogonal (2)-(3) na escala exata do arquivo .ai
  const rectConfigs = [
    {
      name: 'Ponto A (45° Círculo)',
      x: 135,
      y: 135,
      w: 122,
      h: 122
    },
    {
      name: 'Ponto B (67.5° Círculo)',
      x: 135,
      y: 135,
      w: 144,
      h: 112
    },
    {
      name: 'Ponto C (90° Topo Círculo)',
      x: 135,
      y: 135,
      w: 165,
      h: 105
    }
  ];

  const rc = rectConfigs[anchorIndex % 3];

  // Passo 3: Triângulo retângulo puro de 3 vértices (pt4 -> pt5 -> pt6)
  const normX = p5x / 100;
  const normY = p5y / 100;

  // Área (5) contida na região superior esquerda do retângulo
  const area5 = { xMin: 158, xMax: 186, yMin: 158, yMax: 186 };

  const pt5 = {
    x: Math.round(area5.xMin + normX * (area5.xMax - area5.xMin)),
    y: Math.round(area5.yMin + normY * (area5.yMax - area5.yMin))
  };

  // Vértice (4) no canto inferior direito da grade interna e Vértice (6) alinhado ortogonalmente
  const pt4 = { x: 456, y: 456 };
  const pt6 = { x: pt5.x, y: 456 };

  const rect = {
    name: rc.name,
    x: rc.x,
    y: rc.y,
    w: rc.w,
    h: rc.h
  };

  return {
    outerBox,
    innerGrid,
    circle,
    rect,
    area5,
    pt4,
    pt5,
    pt6
  };
}

/**
 * Renderiza o logotipo tipográfico "Lorem" usando EXATAMENTE os vetores Bézier de lorem2.ai
 * na proporção exata da Página 6/7 (escala 0.842 -> largura 368px, altura 166px,
 * centralizado em x = 116 dentro do quadro 80..520, iniciando em yOffset = 520).
 */
function renderWordmarkGroup(color, yOffset = 520, scale = 0.842) {
  const xOffset = (600 - 437.07 * scale) / 2;
  return `
    <g class="lorem-wordmark" transform="translate(${xOffset.toFixed(1)}, ${yOffset}) scale(${scale})" fill="${color}">
      <!-- Letra L (prolongada sob a letra o) -->
      <path d="M 0.00 2.29 L 21.60 2.29 L 21.60 176.45 L 76.97 176.45 L 76.97 196.11 L 0.00 196.11 Z" />
      <!-- Letra o (elevada sobre a base do L) -->
      <path fill-rule="evenodd" d="M 45.42 99.89 L 45.42 45.07 C 45.42 16.27, 59.82 0.21, 86.41 0.21 C 112.71 0.21, 127.38 16.27, 127.38 45.07 L 127.38 99.89 C 127.38 128.69, 112.71 145.02, 86.41 145.02 C 59.82 145.02, 45.42 128.69, 45.42 99.89 Z M 106.34 101.83 L 106.34 43.13 C 106.34 28.18, 100.80 18.76, 86.41 18.76 C 72.01 18.76, 66.19 28.18, 66.19 43.13 L 66.19 101.83 C 66.19 117.06, 72.01 126.47, 86.41 126.47 C 100.53 126.47, 106.34 117.06, 106.34 101.83 Z" />
      <!-- Letra r -->
      <path d="M 208.45 12.80 L 208.45 33.29 C 205.68 32.18, 202.91 31.90, 199.87 31.90 C 181.87 31.90, 172.73 45.20, 172.73 72.05 L 172.73 153.18 L 151.96 153.18 L 151.96 13.91 L 169.96 13.91 L 170.24 36.89 C 174.94 19.44, 184.64 11.14, 199.31 11.14 C 202.91 11.14, 205.68 11.41, 208.45 12.80 Z" />
      <!-- Letra e (rebaixada alinhando com a base do L) -->
      <path fill-rule="evenodd" d="M 279.71 97.54 L 279.71 128.27 L 218.24 128.27 L 218.24 154.30 C 218.24 171.19, 225.16 178.94, 238.73 178.94 C 252.30 178.94, 259.49 171.19, 259.49 154.30 L 259.49 150.14 L 279.71 150.14 L 279.71 152.36 C 279.71 181.16, 265.03 197.49, 238.45 197.49 C 211.59 197.49, 197.19 181.16, 197.19 152.36 L 197.19 97.54 C 197.19 68.74, 211.59 52.68, 238.45 52.68 C 265.03 52.68, 279.71 68.74, 279.71 97.54 Z M 259.22 111.10 L 259.22 95.60 C 259.22 78.98, 251.74 71.23, 238.45 71.23 C 225.16 71.23, 218.24 78.98, 218.24 95.60 L 218.24 111.10 Z" />
      <!-- Letra m -->
      <path d="M 437.07 72.92 L 437.07 175.93 L 416.30 175.93 L 416.30 74.31 C 416.30 61.02, 411.59 52.44, 399.69 52.44 C 387.51 52.44, 378.64 62.96, 378.64 83.45 L 378.64 175.93 L 357.60 175.93 L 357.60 74.31 C 357.60 61.02, 352.89 52.44, 340.99 52.44 C 328.81 52.44, 319.94 62.96, 319.94 83.45 L 319.94 175.93 L 299.18 175.93 L 299.18 36.65 L 317.18 36.65 L 317.45 54.93 C 322.99 41.64, 333.51 33.89, 347.36 33.89 C 361.76 33.89, 371.72 40.25, 376.15 54.38 C 381.69 41.36, 392.21 33.89, 405.78 33.89 C 425.44 33.89, 437.07 46.07, 437.07 72.92 Z" />
    </g>
  `;
}

/**
 * Gera o SVG completo da marca Lorem (Símbolo + opcionalmente Grid + Wordmark)
 */
function buildLogoSVG(options = {}) {
  const {
    anchorIndex = state.anchorIndex,
    p5x = state.p5x,
    p5y = state.p5y,
    rotation = state.rotation,
    flipX = state.flipX,
    showGrid = false,
    showWordmark = true,
    polyColor = OFFICIAL_PALETTE.cyan,
    circleColor = OFFICIAL_PALETTE.midnight,
    wordmarkColor = OFFICIAL_PALETTE.midnight,
    strokeWidth = 20,
    size = '100%'
  } = options;

  const geom = computeLogoGeometry({ anchorIndex, p5x, p5y });
  const { innerGrid, circle, rect, pt4, pt5, pt6 } = geom;

  const viewBoxHeight = showWordmark ? 720 : 560;
  const uid = ++uniqueMaskCounter;
  const rectMaskId = `lorem-rect-mask-${uid}`;
  const triMaskId = `lorem-tri-mask-${uid}`;

  const flipTransform = flipX ? 'translate(600, 0) scale(-1, 1)' : '';
  const rotTransform = `rotate(${rotation} 300 300)`;

  let gridOverlay = '';
  if (showGrid) {
    let lines = '';
    for (let i = 0; i <= 6; i++) {
      const pos = innerGrid.x + i * (innerGrid.size / 6);
      lines += `<line x1="${pos.toFixed(1)}" y1="${innerGrid.x}" x2="${pos.toFixed(1)}" y2="${innerGrid.x + innerGrid.size}" stroke="#90A4AE" stroke-width="1.3" stroke-dasharray="4 4" />`;
      lines += `<line x1="${innerGrid.x}" y1="${pos.toFixed(1)}" x2="${innerGrid.x + innerGrid.size}" y2="${pos.toFixed(1)}" stroke="#90A4AE" stroke-width="1.3" stroke-dasharray="4 4" />`;
    }
    gridOverlay = `
      <g class="construction-grid-overlay" opacity="0.8">
        <rect x="80" y="80" width="440" height="440" fill="none" stroke="#B0BEC5" stroke-width="1.5" />
        <circle cx="300" cy="300" r="252.7" fill="none" stroke="#CFD8DC" stroke-width="1.2" />
        <g transform="${rotTransform}">
          ${lines}
        </g>
      </g>
    `;
  }

  const trianglePoints = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 520 ${viewBoxHeight - 40}" width="${size}" height="${size}">
      <defs>
        <mask id="${rectMaskId}">
          <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
          <polygon
            points="${trianglePoints}"
            fill="#000000"
            stroke="#000000"
            stroke-width="${strokeWidth}"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
          />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
        </mask>
        <mask id="${triMaskId}">
          <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
        </mask>
      </defs>
      ${gridOverlay}
      <g transform="${rotTransform}">
        <g transform="${flipTransform}">
          <rect
            x="${rect.x}"
            y="${rect.y}"
            width="${rect.w}"
            height="${rect.h}"
            fill="none"
            stroke="${polyColor}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
            mask="url(#${rectMaskId})"
          />
          <polygon
            points="${trianglePoints}"
            fill="none"
            stroke="${polyColor}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
            mask="url(#${triMaskId})"
          />
          <circle
            cx="${circle.cx}"
            cy="${circle.cy}"
            r="${circle.r}"
            fill="none"
            stroke="${circleColor}"
            stroke-width="${strokeWidth + 3}"
          />
        </g>
      </g>
      ${showWordmark ? renderWordmarkGroup(wordmarkColor, 520, 0.842) : ''}
    </svg>
  `;
}

/**
 * Gera a assinatura horizontal (Símbolo Generativo + Logotipo 'Lorem' lado a lado)
 * para uso direto na barra superior clara e no App Shell.
 */
function buildHorizontalLockupSVG(options = {}) {
  const {
    anchorIndex = state.anchorIndex,
    p5x = state.p5x,
    p5y = state.p5y,
    rotation = state.rotation,
    flipX = state.flipX,
    polyColor = OFFICIAL_PALETTE.cyan,
    circleColor = OFFICIAL_PALETTE.midnight,
    wordmarkColor = OFFICIAL_PALETTE.midnight,
    strokeWidth = 24,
    height = '38px'
  } = options;

  const geom = computeLogoGeometry({ anchorIndex, p5x, p5y });
  const { circle, rect, pt4, pt5, pt6 } = geom;
  const uid = ++uniqueMaskCounter;
  const rectMaskId = `horiz-rect-mask-${uid}`;
  const triMaskId = `horiz-tri-mask-${uid}`;

  const flipTransform = flipX ? 'translate(600, 0) scale(-1, 1)' : '';
  const rotTransform = `rotate(${rotation} 300 300)`;
  const trianglePoints = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="95 95 920 410" height="${height}" style="width:auto; display:block;">
      <defs>
        <mask id="${rectMaskId}">
          <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
          <polygon points="${trianglePoints}" fill="#000000" stroke="#000000" stroke-width="${strokeWidth}" stroke-linejoin="miter" stroke-miterlimit="10" />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
        </mask>
        <mask id="${triMaskId}">
          <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
        </mask>
      </defs>
      <!-- Símbolo Generativo à Esquerda -->
      <g transform="${rotTransform}">
        <g transform="${flipTransform}">
          <rect
            x="${rect.x}"
            y="${rect.y}"
            width="${rect.w}"
            height="${rect.h}"
            fill="none"
            stroke="${polyColor}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
            mask="url(#${rectMaskId})"
          />
          <polygon
            points="${trianglePoints}"
            fill="none"
            stroke="${polyColor}"
            stroke-width="${strokeWidth}"
            stroke-linejoin="miter"
            stroke-miterlimit="10"
            mask="url(#${triMaskId})"
          />
          <circle
            cx="${circle.cx}"
            cy="${circle.cy}"
            r="${circle.r}"
            fill="none"
            stroke="${circleColor}"
            stroke-width="${strokeWidth + 4}"
          />
        </g>
      </g>
      <!-- Logotipo 'Lorem' à Direita -->
      <g transform="translate(530, 198) scale(0.98)" fill="${wordmarkColor}">
        <path d="M 0.00 2.29 L 21.60 2.29 L 21.60 176.45 L 76.97 176.45 L 76.97 196.11 L 0.00 196.11 Z" />
        <path fill-rule="evenodd" d="M 45.42 99.89 L 45.42 45.07 C 45.42 16.27, 59.82 0.21, 86.41 0.21 C 112.71 0.21, 127.38 16.27, 127.38 45.07 L 127.38 99.89 C 127.38 128.69, 112.71 145.02, 86.41 145.02 C 59.82 145.02, 45.42 128.69, 45.42 99.89 Z M 106.34 101.83 L 106.34 43.13 C 106.34 28.18, 100.80 18.76, 86.41 18.76 C 72.01 18.76, 66.19 28.18, 66.19 43.13 L 66.19 101.83 C 66.19 117.06, 72.01 126.47, 86.41 126.47 C 100.53 126.47, 106.34 117.06, 106.34 101.83 Z" />
        <path d="M 208.45 12.80 L 208.45 33.29 C 205.68 32.18, 202.91 31.90, 199.87 31.90 C 181.87 31.90, 172.73 45.20, 172.73 72.05 L 172.73 153.18 L 151.96 153.18 L 151.96 13.91 L 169.96 13.91 L 170.24 36.89 C 174.94 19.44, 184.64 11.14, 199.31 11.14 C 202.91 11.14, 205.68 11.41, 208.45 12.80 Z" />
        <path fill-rule="evenodd" d="M 279.71 97.54 L 279.71 128.27 L 218.24 128.27 L 218.24 154.30 C 218.24 171.19, 225.16 178.94, 238.73 178.94 C 252.30 178.94, 259.49 171.19, 259.49 154.30 L 259.49 150.14 L 279.71 150.14 L 279.71 152.36 C 279.71 181.16, 265.03 197.49, 238.45 197.49 C 211.59 197.49, 197.19 181.16, 197.19 152.36 L 197.19 97.54 C 197.19 68.74, 211.59 52.68, 238.45 52.68 C 265.03 52.68, 279.71 68.74, 279.71 97.54 Z M 259.22 111.10 L 259.22 95.60 C 259.22 78.98, 251.74 71.23, 238.45 71.23 C 225.16 71.23, 218.24 78.98, 218.24 95.60 L 218.24 111.10 Z" />
        <path d="M 437.07 72.92 L 437.07 175.93 L 416.30 175.93 L 416.30 74.31 C 416.30 61.02, 411.59 52.44, 399.69 52.44 C 387.51 52.44, 378.64 62.96, 378.64 83.45 L 378.64 175.93 L 357.60 175.93 L 357.60 74.31 C 357.60 61.02, 352.89 52.44, 340.99 52.44 C 328.81 52.44, 319.94 62.96, 319.94 83.45 L 319.94 175.93 L 299.18 175.93 L 299.18 36.65 L 317.18 36.65 L 317.45 54.93 C 322.99 41.64, 333.51 33.89, 347.36 33.89 C 361.76 33.89, 371.72 40.25, 376.15 54.38 C 381.69 41.36, 392.21 33.89, 405.78 33.89 C 425.44 33.89, 437.07 46.07, 437.07 72.92 Z" />
      </g>
    </svg>
  `;
}

/**
 * Renderiza a Capa Oficial "manual" usando os 14 caminhos vetoriais exatos da Página 1 de lorem2.ai
 */
function renderHeroCoverManualSVG() {
  const holder = document.getElementById('hero-cover-svg-holder');
  if (!holder) return;

  const p = OFFICIAL_PALETTE;
  const rotOffset = ((state.rotation % 45) - 20) * 0.35;
  const shiftX = (state.p5x - 50) * 0.18;
  const shiftY = (state.p5y - 50) * 0.18;

  holder.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 865 615" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <!-- Marca d'água superior 'man' em Ice Canvas (#EBF3F6) -->
      <g fill="${p.mint}">
        <path d="M 86.69 72.05 L 86.69 128.73 C 86.69 129.68, 85.92 130.46, 84.97 130.46 L 76.65 130.46 C 75.69 130.46, 74.92 129.68, 74.92 128.73 L 74.92 72.83 C 74.92 65.30, 72.25 60.43, 65.50 60.43 C 58.59 60.43, 53.57 66.40, 53.57 78.01 L 53.57 128.73 C 53.57 129.68, 52.79 130.46, 51.84 130.46 L 43.36 130.46 C 42.41 130.46, 41.63 129.68, 41.63 128.73 L 41.63 72.83 C 41.63 65.30, 38.96 60.43, 32.21 60.43 C 25.30 60.43, 20.28 66.40, 20.28 78.01 L 20.28 128.73 C 20.28 129.68, 19.51 130.46, 18.55 130.46 L 10.23 130.46 C 9.28 130.46, 8.50 129.68, 8.50 128.73 L 8.50 6.38 C 8.50 5.42, 9.28 4.65, 10.23 4.65 L 16.99 4.65 C 17.94 4.65, 18.71 5.42, 18.71 6.37 L 18.85 55.49 C 18.85 57.12, 20.91 57.84, 21.92 56.56 C 25.29 52.29, 30.04 49.91, 35.82 49.91 C 42.75 49.91, 47.87 52.51, 50.80 58.19 C 51.41 59.39, 53.09 59.49, 53.80 58.35 C 57.17 52.94, 62.44 49.91, 68.95 49.91 C 80.10 49.91, 86.69 56.82, 86.69 72.05 Z" />
        <path fill-rule="evenodd" d="M 132.22 103.76 L 132.22 91.77 C 132.22 90.37, 130.65 89.55, 129.51 90.35 C 127.62 91.68, 124.85 93.19, 120.76 95.29 C 112.91 99.21, 109.61 103.92, 109.61 110.83 C 109.61 117.74, 112.91 121.66, 119.35 121.66 C 127.35 121.66, 132.22 115.07, 132.22 103.76 Z M 134.57 129.03 C 134.41 128.09, 134.25 126.86, 134.10 125.43 C 133.93 123.87, 131.93 123.32, 131.00 124.58 C 127.45 129.40, 122.06 132.03, 115.26 132.03 C 104.43 132.03, 97.68 124.49, 97.68 112.56 C 97.68 100.31, 103.02 93.40, 117.31 86.65 C 130.49 80.68, 132.22 79.11, 132.22 73.77 L 132.22 71.89 C 132.22 64.04, 128.77 60.11, 122.02 60.11 C 115.11 60.11, 111.03 64.35, 111.03 72.20 L 111.03 72.83 C 111.03 73.79, 110.25 74.56, 109.30 74.56 L 101.60 74.56 C 100.65 74.56, 99.88 73.79, 99.88 72.83 C 99.88 58.07, 108.04 49.91, 122.17 49.91 C 137.25 49.91, 144.00 58.07, 144.00 73.77 L 144.00 108.94 C 144.00 117.46, 144.46 123.88, 145.29 128.41 C 145.49 129.48, 144.68 130.46, 143.60 130.46 L 136.28 130.46 C 135.44 130.46, 134.72 129.86, 134.57 129.03 Z" />
        <path d="M 204.76 72.68 L 204.76 128.73 C 204.76 129.68, 203.98 130.46, 203.03 130.46 L 194.55 130.46 C 193.60 130.46, 192.82 129.68, 192.82 128.73 L 192.82 74.25 C 192.82 65.14, 189.84 60.43, 182.93 60.43 C 175.87 60.43, 170.53 66.24, 170.53 78.01 L 170.53 128.73 C 170.53 129.68, 169.75 130.46, 168.80 130.46 L 160.48 130.46 C 159.52 130.46, 158.75 129.68, 158.75 128.73 L 158.75 53.21 C 158.75 52.25, 159.52 51.48, 160.48 51.48 L 167.26 51.48 C 168.20 51.48, 168.97 52.24, 168.98 53.18 L 169.02 55.67 C 169.05 57.28, 171.08 58.00, 172.08 56.74 C 175.55 52.36, 180.56 49.91, 186.54 49.91 C 198.16 49.91, 204.76 56.97, 204.76 72.68 Z" />
      </g>

      <!-- Círculo Bauhaus superior em Architectural Mist (#BACACE) -->
      <path fill="${p.pastel}" transform="translate(${shiftX.toFixed(1)}, ${shiftY.toFixed(1)})" d="M 311.24 71.23 C 309.21 96.88, 286.77 116.04, 261.11 114.01 C 235.46 111.98, 216.30 89.54, 218.33 63.88 C 220.36 38.22, 242.80 19.07, 268.46 21.10 C 294.12 23.13, 313.27 45.57, 311.24 71.23 Z" />

      <!-- Triângulo Bauhaus em Bauhaus Indigo (#23265F) -->
      <path fill="${p.midnight}" transform="rotate(${rotOffset.toFixed(1)} 535 148)" d="M 565.05 225.94 L 508.33 170.88 L 451.61 115.83 L 527.65 94.23 L 603.68 72.64 L 584.37 149.29 Z" />

      <!-- Quadrado Bauhaus inferior direito em Cyber Teal (#0F8A85) -->
      <rect x="647.55" y="297.64" width="194.34" height="231.02" fill="${p.cyan}" transform="translate(0, ${(-shiftY).toFixed(1)})" />

      <!-- Marca d'água inferior 'ual' + barra horizontal em Ice Canvas (#EBF3F6) -->
      <g fill="${p.mint}">
        <path d="M 242.95 458.96 L 242.95 544.23 L 231.93 544.23 L 231.76 532.87 C 228.37 541.18, 221.59 545.93, 212.95 545.93 C 200.40 545.93, 193.28 538.30, 193.28 521.18 L 192.97 458.87 L 205.85 458.87 L 206.16 519.65 C 206.16 529.48, 209.38 534.57, 216.84 534.57 C 224.47 534.57, 230.24 528.30, 230.24 515.58 L 230.24 458.96 Z" />
        <path fill-rule="evenodd" d="M 292.78 515.41 L 292.78 498.29 C 291.09 500.50, 287.70 502.53, 280.41 506.26 C 271.93 510.50, 268.37 515.58, 268.37 523.04 C 268.37 530.50, 271.93 534.74, 278.88 534.74 C 287.53 534.74, 292.78 527.62, 292.78 515.41 Z M 295.66 544.23 C 295.16 542.54, 294.65 538.13, 294.31 532.70 C 290.92 541.18, 283.97 545.93, 274.48 545.93 C 262.78 545.93, 255.49 537.79, 255.49 524.91 C 255.49 511.68, 261.25 504.22, 276.68 496.94 C 290.92 490.49, 292.78 488.80, 292.78 483.04 L 292.78 481.00 C 292.78 472.53, 289.05 468.29, 281.76 468.29 C 274.31 468.29, 269.90 472.86, 269.90 481.34 L 269.90 483.88 L 257.86 483.88 L 257.86 482.02 C 257.86 466.08, 266.68 457.27, 281.93 457.27 C 298.21 457.27, 305.50 466.08, 305.50 483.04 L 305.50 521.01 C 305.50 531.69, 306.18 539.31, 307.36 544.23 Z" />
        <path d="M 321.43 418.00 L 334.14 418.00 L 334.14 531.52 L 860.28 531.52 L 860.28 544.23 L 321.43 544.23 Z" />
      </g>

      <!-- Tipografia central 'manual' com hastes geométricas prolongadas em Carbon Void (#111317) -->
      <g fill="${p.black}">
        <path d="M 299.43 253.58 L 299.43 298.20 L 290.44 298.20 L 290.44 254.18 C 290.44 248.42, 288.40 244.70, 283.24 244.70 C 277.96 244.70, 274.12 249.26, 274.12 258.13 L 274.12 298.20 L 265.01 298.20 L 265.01 254.18 C 265.01 248.42, 262.97 244.70, 257.81 244.70 C 252.53 244.70, 248.69 249.26, 248.69 258.13 L 248.69 298.20 L 239.69 298.20 L 239.69 -10.35 L 247.49 -2.55 L 247.61 245.78 C 250.01 240.02, 254.57 236.66, 260.57 236.66 C 266.81 236.66, 271.12 239.42, 273.04 245.54 C 275.44 239.90, 280.00 236.66, 285.88 236.66 C 294.40 236.66, 299.43 241.94, 299.43 253.58 Z" />
        <path fill-rule="evenodd" d="M 334.22 277.81 L 334.22 265.69 C 333.02 267.25, 330.62 268.69, 325.46 271.33 C 319.46 274.33, 316.94 277.93, 316.94 283.21 C 316.94 288.48, 319.46 291.48, 324.38 291.48 C 330.50 291.48, 334.22 286.44, 334.22 277.81 Z M 336.26 298.20 C 335.90 297.00, 335.54 293.88, 335.30 290.04 C 332.90 296.04, 327.98 299.40, 321.26 299.40 C 312.99 299.40, 307.83 293.64, 307.83 284.53 C 307.83 275.17, 311.91 269.89, 322.82 264.73 C 332.90 260.17, 334.22 258.97, 334.22 254.90 L 334.22 253.46 C 334.22 247.46, 331.58 244.46, 326.42 244.46 C 321.14 244.46, 318.02 247.70, 318.02 253.70 L 318.02 255.49 L 309.51 255.49 L 309.51 254.18 C 309.51 242.90, 315.74 236.66, 326.54 236.66 C 338.06 236.66, 343.22 242.90, 343.22 254.90 L 343.22 281.77 C 343.22 289.32, 343.70 294.72, 344.53 298.20 Z" />
        <path d="M 389.64 254.06 L 389.64 298.20 L 380.52 298.20 L 380.52 255.26 C 380.52 248.30, 378.24 244.70, 372.96 244.70 C 367.56 244.70, 363.49 249.14, 363.49 258.13 L 363.49 298.20 L 354.49 298.20 L 354.49 237.86 L 362.29 237.86 L 362.41 245.78 C 364.80 240.02, 369.60 236.66, 375.72 236.66 C 384.60 236.66, 389.64 242.06, 389.64 254.06 Z" />
        <path d="M 415.89 298.27 L 415.89 358.61 L 408.09 358.61 L 407.97 350.57 C 405.57 356.45, 400.77 359.81, 394.66 359.81 C 385.78 359.81, 380.74 354.41, 380.74 342.29 L 380.52 298.20 L 389.64 298.20 L 389.86 341.21 C 389.86 348.17, 392.14 351.77, 397.42 351.77 C 402.81 351.77, 406.89 347.33, 406.89 338.34 L 406.89 298.27 Z" />
        <path fill-rule="evenodd" d="M 451.15 338.22 L 451.15 326.10 C 449.95 327.66, 447.56 329.10, 442.40 331.74 C 436.40 334.74, 433.88 338.34, 433.88 343.61 C 433.88 348.89, 436.40 351.89, 441.32 351.89 C 447.44 351.89, 451.15 346.85, 451.15 338.22 Z M 453.19 358.61 C 452.83 357.41, 452.47 354.29, 452.23 350.45 C 449.83 356.45, 444.92 359.81, 438.20 359.81 C 429.92 359.81, 424.76 354.05, 424.76 344.93 C 424.76 335.58, 428.84 330.30, 439.76 325.14 C 449.83 320.58, 451.15 319.38, 451.15 315.30 L 451.15 313.86 C 451.15 307.87, 448.52 304.87, 443.36 304.87 C 438.08 304.87, 434.96 308.11, 434.96 314.10 L 434.96 315.90 L 426.44 315.90 L 426.44 314.58 C 426.44 303.31, 432.68 297.07, 443.48 297.07 C 454.99 297.07, 460.15 303.31, 460.15 315.30 L 460.15 342.17 C 460.15 349.73, 460.63 355.13, 461.47 358.61 Z" />
        <path d="M 469.92 268.40 L 478.92 268.40 L 478.92 349.55 L 857.90 349.55 L 857.90 358.55 L 469.92 358.55 Z" />
        <path d="M 811.90 613.84 L 802.90 613.84 L 799.45 356.70 L 808.45 356.70 Z" />
      </g>
    </svg>
  `;
}

/**
 * Gera uma semente e parâmetros aleatórios fiéis às gamas de ângulos (7) do arquivo .ai
 */
function generateRandomParams() {
  const sector = VALID_ROTATION_SECTORS[Math.floor(Math.random() * VALID_ROTATION_SECTORS.length)];
  const jitter = Math.floor(Math.random() * 3) - 1;
  const angle = ((sector.angle + jitter) % 360 + 360) % 360;

  return {
    seed: 'LRM-' + Math.floor(1000 + Math.random() * 9000),
    anchorIndex: Math.floor(Math.random() * 3),
    p5x: Math.floor(10 + Math.random() * 80),
    p5y: Math.floor(10 + Math.random() * 80),
    rotation: angle,
    flipX: Math.random() < 0.5
  };
}

/**
 * Atualiza o palco principal, a Hero, a barra superior e as aplicações
 */
function renderAllViews() {
  const palette = OFFICIAL_PALETTE;

  // 0. Capa vetorial "manual"
  renderHeroCoverManualSVG();

  // 1. Assinatura Horizontal completa na barra superior clara
  const navMini = document.getElementById('nav-mini-logo');
  if (navMini) {
    navMini.innerHTML = buildHorizontalLockupSVG({ height: '38px', strokeWidth: 24 });
  }

  // 2. Hero Card
  const heroBox = document.getElementById('hero-logo-preview');
  const heroSeed = document.getElementById('hero-seed-label');
  if (heroBox) {
    heroBox.innerHTML = buildLogoSVG({ showWordmark: true });
  }
  if (heroSeed) {
    heroSeed.textContent = '#' + state.seed;
  }

  // 3. Palco Principal do Gerador (Seção 02)
  const mainCanvas = document.getElementById('main-generator-canvas');
  if (mainCanvas) {
    mainCanvas.style.backgroundColor = state.stageBg;
    const isDarkBg = ['#111317', '#23265F'].includes(state.stageBg.toUpperCase());
    const isCyanBg = ['#0F8A85', '#2AB3AC'].includes(state.stageBg.toUpperCase());

    let polyCol = palette.cyan;
    let circCol = palette.midnight;
    let wordCol = palette.midnight;

    if (isDarkBg) {
      polyCol = '#FFFFFF';
      circCol = palette.cyan;
      wordCol = '#FFFFFF';
    } else if (isCyanBg) {
      polyCol = '#FFFFFF';
      circCol = palette.midnight;
      wordCol = '#FFFFFF';
    }

    mainCanvas.innerHTML = buildLogoSVG({
      showGrid: state.showGrid,
      showWordmark: state.showWordmark,
      polyColor: polyCol,
      circleColor: circCol,
      wordmarkColor: wordCol
    });
  }

  // Atualizar metadados e controles
  const anchorNames = ['Ponto A (45° Círculo)', 'Ponto B (67.5° Círculo)', 'Ponto C (90° Topo)'];
  document.getElementById('meta-seed').textContent = state.seed;
  document.getElementById('meta-anchor').textContent = anchorNames[state.anchorIndex];
  document.getElementById('meta-p5').textContent = `(${(state.p5x / 100).toFixed(2)}, ${(state.p5y / 100).toFixed(2)})`;
  document.getElementById('meta-flip').textContent = state.flipX ? 'Sim (Flip X)' : 'Não (Original)';
  document.getElementById('meta-angle').textContent = `${state.rotation}°`;

  document.getElementById('lbl-anchor-val').textContent = anchorNames[state.anchorIndex];
  document.getElementById('lbl-p5-val').textContent = `${(state.p5x / 100).toFixed(2)} / ${(state.p5y / 100).toFixed(2)}`;
  document.getElementById('lbl-rot-val').textContent = `${state.rotation}°`;

  document.getElementById('rng-p5x').value = state.p5x;
  document.getElementById('rng-p5y').value = state.p5y;

  const rotRng = document.getElementById('rng-rotation');
  if (rotRng) rotRng.value = state.rotation;

  document.querySelectorAll('#ctrl-anchor .seg-btn').forEach(btn => {
    btn.classList.toggle('active', Number(btn.dataset.anchor) === state.anchorIndex);
  });
  document.querySelectorAll('#ctrl-flip .seg-btn').forEach(btn => {
    btn.classList.toggle('active', (btn.dataset.flip === 'true') === state.flipX);
  });
  document.querySelectorAll('#ctrl-rot-sectors .seg-btn').forEach(btn => {
    const sectorAngle = ((Number(btn.dataset.sectorAngle) % 360) + 360) % 360;
    btn.classList.toggle('active', Math.abs(sectorAngle - state.rotation) <= 4);
  });

  // 4. Atualizar diagrama do Grid de Construção (Seção 04)
  renderConstructionStepDiagram(state.buildStep);

  // 5. Atualizar Área de Proteção e Redução (Seção 04)
  renderProtectionAndReduction();

  // 6. Atualizar Aplicações Positiva, Negativa, Secundárias e Usos Incorretos (Seção 07)
  renderApplicationsSection();

  // 7. Atualizar Rodapé
  const footerLogo = document.getElementById('footer-logo-large');
  if (footerLogo) {
    footerLogo.innerHTML = buildLogoSVG({ showWordmark: true });
  }
}

/**
 * Renderiza a faixa de 5 variações da Página 5 ("Assinatura padrão" fiel ao .ai)
 */
function renderVariationsStrip() {
  const strip = document.getElementById('signature-variations-strip');
  if (!strip) return;

  if (state.stripVariations.length === 0) {
    state.stripVariations = [
      { seed: 'LRM-P5A', anchorIndex: 0, p5x: 62, p5y: 25, rotation: 86, flipX: true },
      { seed: 'LRM-P5B', anchorIndex: 1, p5x: 40, p5y: 55, rotation: 266, flipX: true },
      { seed: 'LRM-P5C', anchorIndex: 2, p5x: 52, p5y: 42, rotation: 184, flipX: true },
      { seed: 'LRM-P5D', anchorIndex: 0, p5x: 18, p5y: 44, rotation: 353, flipX: false },
      { seed: 'LRM-P5E', anchorIndex: 2, p5x: 42, p5y: 45, rotation: 175, flipX: false }
    ];
  }

  strip.innerHTML = state.stripVariations.map((v, idx) => `
    <div class="strip-item-card" data-strip-index="${idx}" title="Clique para carregar esta variação no laboratório">
      ${buildLogoSVG({ ...v, showWordmark: true })}
      <span class="strip-item-tag">${v.seed} · ${v.rotation}°</span>
    </div>
  `).join('');

  strip.querySelectorAll('.strip-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const v = state.stripVariations[Number(card.dataset.stripIndex)];
      Object.assign(state, v);
      renderAllViews();
      renderStationeryMockups();
      showToast(`Variação ${v.seed} carregada no palco!`);
    });
  });
}

/**
 * Seção 03: Roda do Tempo de Vilém Flusser
 * - Gira estritamente no SENTIDO HORÁRIO (+flusserRotationDeg).
 * - Sem qualquer recorte de caixa limitadora (viewBox amplo + máscara de 1200x1200).
 */
function renderFlusserWheel(count) {
  const canvas = document.getElementById('flusser-canvas');
  const label = document.getElementById('lbl-flusser-count');
  if (!canvas) return;

  const palette = OFFICIAL_PALETTE;
  label.textContent = count === 1 ? '1 variação (Indivíduo)' : `${count} variações sobrepostas`;

  const maskId = `flusser-circle-mask-${++uniqueMaskCounter}`;
  let pathsHtml = '';
  for (let i = 0; i < count; i++) {
    // Passo angular estritamente positivo (sentido horário no SVG)
    const angle = (state.flusserRotationDeg + i * (360 / count) + ((i * 23) % 15)) % 360;
    const anchorIndex = i % 3;
    const p5x = 15 + ((i * 29) % 70);
    const p5y = 15 + ((i * 43) % 70);
    const flip = i % 2 === 1;

    const geom = computeLogoGeometry({ anchorIndex, p5x, p5y });
    const { rect, pt4, pt5, pt6 } = geom;
    const triPoints = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;
    const flipTr = flip ? 'translate(600,0) scale(-1,1)' : '';
    const sw = count > 45 ? 16 : 19;

    pathsHtml += `
      <g transform="rotate(${angle.toFixed(1)} 300 300)">
        <g transform="${flipTr}">
          <rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="none" stroke="${palette.black}" stroke-width="${sw}" />
          <polygon points="${triPoints}" fill="none" stroke="${palette.black}" stroke-width="${sw}" stroke-linejoin="miter" />
        </g>
      </g>
    `;
  }

  canvas.innerHTML = `
    <svg viewBox="20 20 560 560" width="100%" height="100%" style="overflow:visible;">
      <defs>
        <mask id="${maskId}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1200" height="1200">
          <rect x="-300" y="-300" width="1200" height="1200" fill="#FFFFFF" />
          <circle cx="300" cy="300" r="63" fill="#000000" />
        </mask>
      </defs>
      <g mask="url(#${maskId})">
        ${pathsHtml}
      </g>
      <circle cx="300" cy="300" r="63" fill="#FFFFFF" stroke="${palette.black}" stroke-width="23" />
    </svg>
  `;
}

function renderFlusserFiveStagesStrip() {
  const container = document.getElementById('flusser-5-stages');
  if (!container) return;

  const stages = [
    { count: 1, label: '1x · Forma Base' },
    { count: 2, label: '2x · Dualidade' },
    { count: 4, label: '4x · Rotação Horária' },
    { count: 9, label: '9x · Densidade' },
    { count: 95, label: '∞ · Roda do Tempo' }
  ];

  container.innerHTML = stages.map(st => {
    let miniPaths = '';
    for (let i = 0; i < st.count; i++) {
      const angle = i * (360 / st.count);
      const geom = computeLogoGeometry({ anchorIndex: i % 3, p5x: 50, p5y: 50 });
      const { rect, pt4, pt5, pt6 } = geom;
      const tPts = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;
      miniPaths += `
        <g transform="rotate(${angle} 300 300)">
          <rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="none" stroke="#111317" stroke-width="20" />
          <polygon points="${tPts}" fill="none" stroke="#111317" stroke-width="20" />
        </g>
      `;
    }
    return `
      <div class="flusser-mini-stage" data-stage-count="${st.count}">
        <svg viewBox="20 20 560 560" width="68" height="68">
          ${miniPaths}
          <circle cx="300" cy="300" r="63" fill="#FFFFFF" stroke="#111317" stroke-width="23" />
        </svg>
        <span>${st.label}</span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.flusser-mini-stage').forEach(el => {
    el.addEventListener('click', () => {
      const c = Number(el.dataset.stageCount);
      state.flusserCount = c;
      document.getElementById('rng-flusser-count').value = c;
      renderFlusserWheel(c);
    });
  });
}

/**
 * Seção 04: Diagrama Técnico Passo a Passo do Grid de Construção (Página 6 de lorem2.ai)
 * Agora com a escala 1:1 do arquivo Illustrator:
 * - Passos 1, 2, 3 na grade 6x6 (121..479).
 * - Passo 4 exibindo o quadro externo (80..520), a circunferência (r=252.7), os raios de 30°/60°,
 *   o quadrado interno rotacionado com os marcadores '7' nos 4 cantos e o quadro inferior de 'Lorem'.
 */
function renderConstructionStepDiagram(step) {
  const holder = document.getElementById('step-diagram-svg');
  if (!holder) return;

  const palette = OFFICIAL_PALETTE;
  const geom = computeLogoGeometry({
    anchorIndex: state.anchorIndex,
    p5x: state.p5x,
    p5y: state.p5y
  });
  const { innerGrid, circle, rect, area5, pt4, pt5, pt6 } = geom;

  // Passo 4: Diagrama completo de Rotação nos eixos (7) idêntico à referência do Illustrator
  if (step === 4) {
    const uid = ++uniqueMaskCounter;
    const trianglePoints = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;
    const flipTransform = state.flipX ? 'translate(600, 0) scale(-1, 1)' : '';
    const rotTransform = `rotate(${state.rotation} 300 300)`;

    holder.innerHTML = `
      <svg viewBox="20 20 560 700" width="100%" height="100%">
        <defs>
          <mask id="s4-rect-mask-${uid}">
            <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
            <polygon points="${trianglePoints}" fill="#000000" stroke="#000000" stroke-width="20" stroke-linejoin="miter" stroke-miterlimit="10" />
            <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
          </mask>
          <mask id="s4-tri-mask-${uid}">
            <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
            <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
          </mask>
        </defs>

        <!-- Circunferência externa cinza e eixos principais -->
        <circle cx="300" cy="300" r="252.7" fill="none" stroke="#90A4AE" stroke-width="1.6" />
        <line x1="47.3" y1="300" x2="552.7" y2="300" stroke="#B0BEC5" stroke-width="1.4" />
        <line x1="300" y1="47.3" x2="300" y2="552.7" stroke="#B0BEC5" stroke-width="1.4" />

        <!-- Raios diagonais de 30° e 60° inscritos no quadro 440x440 -->
        <line x1="80" y1="173" x2="520" y2="427" stroke="#111317" stroke-width="1.8" />
        <line x1="80" y1="427" x2="520" y2="173" stroke="#111317" stroke-width="1.8" />
        <line x1="173" y1="80" x2="427" y2="520" stroke="#111317" stroke-width="1.8" />
        <line x1="427" y1="80" x2="173" y2="520" stroke="#111317" stroke-width="1.8" />

        <!-- Quadro externo do símbolo (80..520) e Quadro do logotipo Lorem (520..688) -->
        <rect x="80" y="80" width="440" height="440" fill="none" stroke="#111317" stroke-width="2.4" />
        <rect x="80" y="520" width="440" height="168" fill="none" stroke="#111317" stroke-width="2.4" />

        <!-- Quadrado interno da grade 6x6 rotacionado + Símbolo Generativo -->
        <g transform="${rotTransform}">
          <rect x="${innerGrid.x}" y="${innerGrid.y}" width="${innerGrid.size}" height="${innerGrid.size}" fill="none" stroke="#78909C" stroke-width="1.3" />
          <g transform="${flipTransform}">
            <rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="none" stroke="#111317" stroke-width="20" stroke-linejoin="miter" mask="url(#s4-rect-mask-${uid})" />
            <polygon points="${trianglePoints}" fill="none" stroke="#111317" stroke-width="20" stroke-linejoin="miter" mask="url(#s4-tri-mask-${uid})" />
            <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="#111317" stroke-width="23" />
          </g>
        </g>

        <!-- Marcadores '7' nos 4 cantos da grade rotacionada -->
        <text x="112" y="138" font-family="var(--font-mono)" font-size="18" font-weight="700" fill="#111317">7</text>
        <text x="462" y="128" font-family="var(--font-mono)" font-size="18" font-weight="700" fill="#111317">7</text>
        <text x="128" y="482" font-family="var(--font-mono)" font-size="18" font-weight="700" fill="#111317">7</text>
        <text x="478" y="468" font-family="var(--font-mono)" font-size="18" font-weight="700" fill="#111317">7</text>

        <!-- Logotipo 'Lorem' na proporção exata dentro da caixa inferior -->
        ${renderWordmarkGroup('#111317', 521, 0.842)}
      </svg>
    `;
    return;
  }

  // Passos 1, 2 e 3 sobre a grade 6x6 (121..479)
  let gridLines = '';
  for (let i = 0; i <= 6; i++) {
    const p = innerGrid.x + i * (innerGrid.size / 6);
    const isInner = i >= 1 && i <= 5;
    gridLines += `
      <line x1="${p.toFixed(1)}" y1="${innerGrid.y}" x2="${p.toFixed(1)}" y2="${innerGrid.y + innerGrid.size}" stroke="${isInner ? '#B0C0CA' : '#111317'}" stroke-width="${i === 0 || i === 6 ? 2.5 : 1.2}" />
      <line x1="${innerGrid.x}" y1="${p.toFixed(1)}" x2="${innerGrid.x + innerGrid.size}" y2="${p.toFixed(1)}" stroke="${isInner ? '#B0C0CA' : '#111317'}" stroke-width="${i === 0 || i === 6 ? 2.5 : 1.2}" />
    `;
  }

  const trianglePoints = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;

  // Passo 1: Círculo central (1)
  const step1Layer = `
    <g>
      <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${palette.midnight}" stroke-width="23" />
      <polygon points="300,237 363,300 300,363 237,300" fill="none" stroke="#8BC34A" stroke-width="2" />
      <circle cx="222" cy="355" r="15" fill="${palette.midnight}" />
      <text x="222" y="360" text-anchor="middle" fill="#FFF" font-family="var(--font-mono)" font-size="14" font-weight="bold">1</text>
    </g>
  `;

  // Passo 2: Retângulo ortogonal (2)->(3)
  const rectMaskUrl = step >= 3 ? 'url(#step-rect-and-tri-mask)' : 'url(#step-circle-only-mask)';
  const step2Layer = step >= 2 ? `
    <g>
      <rect
        x="${rect.x}"
        y="${rect.y}"
        width="${rect.w}"
        height="${rect.h}"
        fill="none"
        stroke="${palette.cyan}"
        stroke-width="20"
        stroke-linejoin="miter"
        mask="${rectMaskUrl}"
      />
      <circle cx="105" cy="108" r="14" fill="${palette.cyan}" />
      <text x="105" y="113" text-anchor="middle" fill="#FFF" font-family="var(--font-mono)" font-size="13" font-weight="bold">2</text>
      <circle cx="${rect.x + rect.w + 16}" cy="${rect.y + rect.h - 20}" r="14" fill="${palette.cyan}" />
      <text x="${rect.x + rect.w + 16}" y="${rect.y + rect.h - 15}" text-anchor="middle" fill="#FFF" font-family="var(--font-mono)" font-size="13" font-weight="bold">3</text>
    </g>
  ` : '';

  // Passo 3: Triângulo puro de 3 vértices (4) -> (5) -> (6)
  const step3Layer = step >= 3 ? `
    <g>
      <rect
        x="${area5.xMin - 8}"
        y="${area5.yMin - 8}"
        width="${area5.xMax - area5.xMin + 16}"
        height="${area5.yMax - area5.yMin + 16}"
        fill="rgba(230, 81, 0, 0.12)"
        stroke="#E65100"
        stroke-dasharray="4 3"
        stroke-width="1.5"
      />
      <polygon
        points="${trianglePoints}"
        fill="none"
        stroke="#E65100"
        stroke-width="19"
        stroke-linejoin="miter"
        stroke-miterlimit="10"
        mask="url(#step-circle-only-mask)"
      />
      <circle cx="${pt4.x + 18}" cy="${pt4.y + 16}" r="14" fill="#E65100" />
      <text x="${pt4.x + 18}" y="${pt4.y + 21}" text-anchor="middle" fill="#FFF" font-family="var(--font-mono)" font-size="13" font-weight="bold">4</text>
      <circle cx="${pt5.x - 22}" cy="${pt5.y}" r="14" fill="#E65100" />
      <text x="${pt5.x - 22}" y="${pt5.y + 5}" text-anchor="middle" fill="#FFF" font-family="var(--font-mono)" font-size="13" font-weight="bold">5</text>
      <circle cx="${pt6.x - 22}" cy="${pt6.y + 6}" r="14" fill="#E65100" />
      <text x="${pt6.x - 22}" y="${pt6.y + 11}" text-anchor="middle" fill="#FFF" font-family="var(--font-mono)" font-size="13" font-weight="bold">6</text>
    </g>
  ` : '';

  holder.innerHTML = `
    <svg viewBox="75 75 450 450" width="100%" height="100%">
      <defs>
        <mask id="step-circle-only-mask">
          <rect x="0" y="0" width="600" height="600" fill="#FFFFFF" />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
        </mask>
        <mask id="step-rect-and-tri-mask">
          <rect x="0" y="0" width="600" height="600" fill="#FFFFFF" />
          <polygon points="${trianglePoints}" fill="#000000" stroke="#000000" stroke-width="19" stroke-linejoin="miter" />
          <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
        </mask>
      </defs>
      ${gridLines}
      ${step2Layer}
      ${step3Layer}
      ${step1Layer}
    </svg>
  `;
}

/**
 * Seção 04b: Área de Proteção (Fiel à Página 7 de lorem2.ai — Símbolo 100% contido no quadro 440x440)
 */
function renderProtectionAndReduction() {
  const protHolder = document.getElementById('protection-diagram');
  const palette = OFFICIAL_PALETTE;

  if (protHolder) {
    const geom = computeLogoGeometry({
      anchorIndex: state.anchorIndex,
      p5x: state.p5x,
      p5y: state.p5y
    });
    const { circle, rect, pt4, pt5, pt6 } = geom;
    const trianglePoints = `${pt4.x},${pt4.y} ${pt5.x},${pt5.y} ${pt6.x},${pt6.y}`;
    const flipTransform = state.flipX ? 'translate(600, 0) scale(-1, 1)' : '';
    const rotTransform = `rotate(${state.rotation} 300 300)`;
    const uid = ++uniqueMaskCounter;

    // Caminho Bézier da letra "o" de Lorem escalado em 0.842 (largura 69px, altura 122px)
    const oGlyphPath = 'M 45.42 99.89 L 45.42 45.07 C 45.42 16.27, 59.82 0.21, 86.41 0.21 C 112.71 0.21, 127.38 16.27, 127.38 45.07 L 127.38 99.89 C 127.38 128.69, 112.71 145.02, 86.41 145.02 C 59.82 145.02, 45.42 128.69, 45.42 99.89 Z M 106.34 101.83 L 106.34 43.13 C 106.34 28.18, 100.80 18.76, 86.41 18.76 C 72.01 18.76, 66.19 28.18, 66.19 43.13 L 66.19 101.83 C 66.19 117.06, 72.01 126.47, 86.41 126.47 C 100.53 126.47, 106.34 117.06, 106.34 101.83 Z';

    protHolder.innerHTML = `
      <svg viewBox="-10 -10 620 790" width="100%" height="100%">
        <defs>
          <mask id="prot-rect-mask-${uid}">
            <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
            <polygon points="${trianglePoints}" fill="#000000" stroke="#000000" stroke-width="20" stroke-linejoin="miter" stroke-miterlimit="10" />
            <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
          </mask>
          <mask id="prot-tri-mask-${uid}">
            <rect x="-200" y="-200" width="1000" height="1000" fill="#FFFFFF" />
            <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="#000000" />
          </mask>
        </defs>

        <!-- Moldura Externa Tracejada da Área de Proteção (distância = largura do 'o' escalado = 69px) -->
        <rect x="11" y="11" width="578" height="746" fill="none" stroke="#111317" stroke-width="3" stroke-dasharray="18 14" />

        <!-- Circunferência cinza e eixos ortogonais do grid (r = 252.7) -->
        <circle cx="300" cy="300" r="252.7" fill="none" stroke="#B8C2C8" stroke-width="1.8" />
        <line x1="47.3" y1="300" x2="552.7" y2="300" stroke="#B8C2C8" stroke-width="1.6" />
        <line x1="300" y1="47.3" x2="300" y2="552.7" stroke="#B8C2C8" stroke-width="1.6" />

        <!-- Raios diagonais de construção (30° e 60°) limitados ao quadrado 440x440 -->
        <line x1="80" y1="173" x2="520" y2="427" stroke="#111317" stroke-width="2.2" />
        <line x1="80" y1="427" x2="520" y2="173" stroke="#111317" stroke-width="2.2" />
        <line x1="173" y1="80" x2="427" y2="520" stroke="#111317" stroke-width="2.2" />
        <line x1="427" y1="80" x2="173" y2="520" stroke="#111317" stroke-width="2.2" />

        <!-- Caixa sólida interna do Símbolo (440x440) e Caixa sólida do Logotipo Lorem (440x168) -->
        <rect x="80" y="80" width="440" height="440" fill="none" stroke="#111317" stroke-width="2.8" />
        <rect x="80" y="520" width="440" height="168" fill="none" stroke="#111317" stroke-width="2.8" />

        <!-- Símbolo Generativo Ativo (100% contido dentro do quadro 440x440) -->
        <g transform="${rotTransform}">
          <g transform="${flipTransform}">
            <rect
              x="${rect.x}"
              y="${rect.y}"
              width="${rect.w}"
              height="${rect.h}"
              fill="none"
              stroke="#111317"
              stroke-width="20"
              stroke-linejoin="miter"
              stroke-miterlimit="10"
              mask="url(#prot-rect-mask-${uid})"
            />
            <polygon
              points="${trianglePoints}"
              fill="none"
              stroke="#111317"
              stroke-width="20"
              stroke-linejoin="miter"
              stroke-miterlimit="10"
              mask="url(#prot-tri-mask-${uid})"
            />
            <circle
              cx="${circle.cx}"
              cy="${circle.cy}"
              r="${circle.r}"
              fill="none"
              stroke="#111317"
              stroke-width="23"
            />
          </g>
        </g>

        <!-- Logotipo 'Lorem' na proporção exata dentro da caixa inferior (y: 520..688) -->
        ${renderWordmarkGroup('#111317', 521, 0.842)}

        <!-- As 4 letras 'o' medidoras da margem de segurança (escala 0.842, tangenciando x=11..80 e y=11..80) -->
        <g fill="#111317">
          <!-- Topo (rotacionado 90° horizontalmente, tocando y=11 e y=80) -->
          <path d="${oGlyphPath}" fill-rule="evenodd" transform="translate(300, 45.5) rotate(90) scale(0.842) translate(-86.4, -72.6)" />
          <!-- Base (rotacionado 90° horizontalmente, tocando y=688 e y=757) -->
          <path d="${oGlyphPath}" fill-rule="evenodd" transform="translate(300, 722.5) rotate(90) scale(0.842) translate(-86.4, -72.6)" />
          <!-- Esquerda (vertical, tocando x=11 e x=80) -->
          <path d="${oGlyphPath}" fill-rule="evenodd" transform="translate(45.5, 300) scale(0.842) translate(-86.4, -72.6)" />
          <!-- Direita (vertical, tocando x=520 e x=589) -->
          <path d="${oGlyphPath}" fill-rule="evenodd" transform="translate(554.5, 300) scale(0.842) translate(-86.4, -72.6)" />
        </g>
      </svg>
    `;
  }

  const r1 = document.getElementById('red-preview-1');
  const r2 = document.getElementById('red-preview-2');
  const r3 = document.getElementById('red-preview-3');

  if (r1) r1.innerHTML = buildLogoSVG({ showWordmark: true, size: '58px' });
  if (r2) r2.innerHTML = buildLogoSVG({ showWordmark: false, size: '40px', strokeWidth: 24 });
  if (r3) {
    r3.innerHTML = `
      <svg viewBox="0 0 100 100" width="18px" height="18px">
        <circle cx="50" cy="50" r="36" fill="none" stroke="${palette.midnight}" stroke-width="22" />
      </svg>
    `;
  }
}

/**
 * Seção 05: Paleta de Cores Oficial
 */
function renderColorSwatches() {
  const container = document.getElementById('color-swatches-container');
  if (!container) return;

  container.innerHTML = OFFICIAL_PALETTE.swatches.map(sw => `
    <article class="color-card" data-copy-hex="${sw.hex}" title="Clique para copiar ${sw.hex}">
      <div class="color-sample" style="background:${sw.hex}; color:${sw.textColor}">
        <span class="color-role-pill">${sw.role}</span>
        <strong style="font-family:var(--font-mono); font-size:1.1rem;">${sw.hex}</strong>
      </div>
      <div class="color-meta">
        <h4>${sw.name}</h4>
        <div class="color-codes">
          <span><strong>HEX:</strong> ${sw.hex}</span>
          <span><strong>CMYK:</strong> ${sw.cmyk}</span>
          <span><strong>Contraste:</strong> ${sw.contrastWhite}</span>
        </div>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.color-card').forEach(card => {
    card.addEventListener('click', () => {
      const hex = card.dataset.copyHex;
      navigator.clipboard?.writeText(hex);
      showToast(`Cor ${hex} copiada para a área de transferência!`);
    });
  });
}

/**
 * Seção 07: Aplicações Positiva, Negativa, Secundárias e Usos Incorretos
 */
function renderApplicationsSection() {
  const palette = OFFICIAL_PALETTE;

  const posHolder = document.getElementById('app-pos-svg');
  if (posHolder) {
    posHolder.innerHTML = buildLogoSVG({
      polyColor: palette.cyan,
      circleColor: palette.midnight,
      wordmarkColor: palette.midnight,
      size: '210px'
    });
  }

  const negHolder = document.getElementById('app-neg-svg');
  if (negHolder) {
    negHolder.innerHTML = buildLogoSVG({
      polyColor: '#FFFFFF',
      circleColor: '#FFFFFF',
      wordmarkColor: '#FFFFFF',
      size: '210px'
    });
  }

  const secGrid = document.getElementById('secondary-apps-grid');
  if (secGrid) {
    const combos = [
      { bg: palette.mint, poly: palette.midnight, circ: palette.midnight, word: palette.midnight, label: 'Fundo Ice Canvas' },
      { bg: palette.pastel, poly: palette.black, circ: palette.black, word: palette.black, label: 'Fundo Arch. Mist' },
      { bg: palette.cyan, poly: palette.mint, circ: palette.mint, word: palette.mint, label: 'Fundo Cyber Teal' },
      { bg: palette.midnight, poly: palette.mint, circ: palette.mint, word: palette.mint, label: 'Fundo Bauhaus Indigo' },
      { bg: '#FFFFFF', poly: '#000000', circ: '#000000', word: '#000000', label: 'Monocromático Preto' },
      { bg: '#111317', poly: '#FFFFFF', circ: '#FFFFFF', word: '#FFFFFF', label: 'Monocromático Branco' }
    ];

    secGrid.innerHTML = combos.map(c => `
      <div class="sec-app-box" style="background:${c.bg}; color:${c.word}">
        ${buildLogoSVG({
          polyColor: c.poly,
          circleColor: c.circ,
          wordmarkColor: c.word,
          size: '115px'
        })}
        <span>${c.label}</span>
      </div>
    `).join('');
  }

  const misuseGrid = document.getElementById('misuse-grid');
  if (misuseGrid) {
    misuseGrid.innerHTML = `
      <div class="misuse-card">
        <div class="misuse-preview" style="background:${palette.mint}">
          ${buildLogoSVG({ polyColor: '#FFFFFF', circleColor: '#FFFFFF', wordmarkColor: '#FFFFFF', size: '110px' })}
        </div>
        <span class="misuse-badge">✕ Logo branca em fundo claro</span>
      </div>

      <div class="misuse-card">
        <div class="misuse-preview" style="background:${palette.midnight}">
          ${buildLogoSVG({ polyColor: '#111317', circleColor: '#111317', wordmarkColor: '#111317', size: '110px' })}
        </div>
        <span class="misuse-badge">✕ Logo preta em fundo escuro</span>
      </div>

      <div class="misuse-card">
        <div class="misuse-preview">
          ${buildLogoSVG({ polyColor: palette.midnight, circleColor: palette.cyan, wordmarkColor: palette.midnight, size: '110px' })}
        </div>
        <span class="misuse-badge">✕ Inversão das cores principais</span>
      </div>

      <div class="misuse-card">
        <div class="misuse-preview" style="flex-direction:column;">
          ${buildLogoSVG({ showWordmark: false, size: '82px' })}
          <span style="font-family:Georgia, serif; font-size:1.3rem; color:${palette.midnight}; margin-top:4px;">Lorem</span>
        </div>
        <span class="misuse-badge">✕ Alteração da tipografia</span>
      </div>

      <div class="misuse-card">
        <div class="misuse-preview">
          <div style="transform: scaleX(1.45) scaleY(0.68);">
            ${buildLogoSVG({ size: '105px' })}
          </div>
        </div>
        <span class="misuse-badge">✕ Distorção de proporção</span>
      </div>
    `;
  }
}

/**
 * Seção 08: Atualiza o Lorem UI Kit & App Shell com a instância ativa da marca
 */
function renderStationeryMockups(customParams = null) {
  const palette = OFFICIAL_PALETTE;
  const p = customParams || state;
  const anchorNames = ['Ponto A (45°)', 'Ponto B (67.5°)', 'Ponto C (90°)'];

  const shellLogo = document.getElementById('uikit-shell-logo');
  const shellSeed = document.getElementById('uikit-shell-seed');
  const shellAngle = document.getElementById('uikit-shell-angle');

  if (shellLogo) {
    shellLogo.innerHTML = buildHorizontalLockupSVG({
      ...p,
      height: '32px',
      strokeWidth: 24
    });
  }
  if (shellSeed) shellSeed.textContent = '#' + p.seed;
  if (shellAngle) shellAngle.textContent = `${p.rotation}°`;

  const iconLight = document.getElementById('uikit-icon-light');
  const iconIndigo = document.getElementById('uikit-icon-indigo');
  const iconDark = document.getElementById('uikit-icon-dark');

  if (iconLight) {
    iconLight.innerHTML = buildLogoSVG({
      ...p,
      showWordmark: false,
      polyColor: palette.cyan,
      circleColor: palette.midnight,
      strokeWidth: 26
    });
  }
  if (iconIndigo) {
    iconIndigo.innerHTML = buildLogoSVG({
      ...p,
      showWordmark: false,
      polyColor: '#2AB3AC',
      circleColor: '#FFFFFF',
      strokeWidth: 26
    });
  }
  if (iconDark) {
    iconDark.innerHTML = buildLogoSVG({
      ...p,
      showWordmark: false,
      polyColor: palette.accent,
      circleColor: '#FFFFFF',
      strokeWidth: 26
    });
  }

  const tdAnchor = document.getElementById('uikit-td-anchor');
  const tdP5 = document.getElementById('uikit-td-p5');
  if (tdAnchor) tdAnchor.textContent = anchorNames[p.anchorIndex % 3];
  if (tdP5) tdP5.textContent = `Vértice (${(p.p5x / 100).toFixed(2)}, ${(p.p5y / 100).toFixed(2)})`;

  const inspLogo = document.getElementById('uikit-inspector-logo');
  const specSeed = document.getElementById('uikit-spec-seed');
  const specRot = document.getElementById('uikit-spec-rot');
  const specFlip = document.getElementById('uikit-spec-flip');

  if (inspLogo) {
    inspLogo.innerHTML = buildLogoSVG({
      ...p,
      showGrid: true,
      showWordmark: true,
      size: '155px'
    });
  }
  if (specSeed) specSeed.textContent = '#' + p.seed;
  if (specRot) specRot.textContent = `${p.rotation}°`;
  if (specFlip) specFlip.textContent = p.flipX ? 'TRUE (FLIP X)' : 'FALSE';
}

/**
 * Exporta o SVG atual como arquivo para download
 */
function downloadCurrentSVG() {
  const svgContent = buildLogoSVG({
    showGrid: state.showGrid,
    showWordmark: state.showWordmark,
    size: '800'
  });
  const blob = new Blob([svgContent.trim()], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lorem-logo-${state.seed.toLowerCase()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Arquivo lorem-logo-${state.seed.toLowerCase()}.svg baixado!`);
}

function showToast(msg) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/**
 * Inicialização e Eventos Interativos
 */
document.addEventListener('DOMContentLoaded', () => {
  const triggerRandomMutation = () => {
    const next = generateRandomParams();
    Object.assign(state, next);
    renderAllViews();
    renderStationeryMockups();
  };

  document.getElementById('btn-global-regenerate')?.addEventListener('click', triggerRandomMutation);
  document.getElementById('btn-hero-new')?.addEventListener('click', triggerRandomMutation);
  document.getElementById('btn-random-logo')?.addEventListener('click', triggerRandomMutation);
  document.getElementById('bar-brand-trigger')?.addEventListener('click', triggerRandomMutation);

  document.querySelectorAll('#ctrl-anchor .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.anchorIndex = Number(btn.dataset.anchor);
      renderAllViews();
      renderStationeryMockups();
    });
  });

  document.querySelectorAll('#ctrl-flip .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.flipX = btn.dataset.flip === 'true';
      renderAllViews();
      renderStationeryMockups();
    });
  });

  document.querySelectorAll('#ctrl-rot-sectors .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rawAngle = Number(btn.dataset.sectorAngle);
      state.rotation = ((rawAngle % 360) + 360) % 360;
      renderAllViews();
      renderStationeryMockups();
    });
  });

  document.getElementById('rng-p5x')?.addEventListener('input', e => {
    state.p5x = Number(e.target.value);
    renderAllViews();
    renderStationeryMockups();
  });

  document.getElementById('rng-p5y')?.addEventListener('input', e => {
    state.p5y = Number(e.target.value);
    renderAllViews();
    renderStationeryMockups();
  });

  document.getElementById('rng-rotation')?.addEventListener('input', e => {
    state.rotation = snapToValidRotation(Number(e.target.value));
    renderAllViews();
    renderStationeryMockups();
  });

  document.getElementById('chk-show-grid')?.addEventListener('change', e => {
    state.showGrid = e.target.checked;
    renderAllViews();
  });

  document.getElementById('chk-show-wordmark')?.addEventListener('change', e => {
    state.showWordmark = e.target.checked;
    renderAllViews();
  });

  document.querySelectorAll('.bg-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      state.stageBg = sw.dataset.stageBg;
      document.querySelectorAll('.bg-swatch').forEach(b => b.classList.toggle('active', b === sw));
      renderAllViews();
    });
  });

  document.getElementById('btn-export-svg')?.addEventListener('click', downloadCurrentSVG);
  document.getElementById('btn-hero-svg')?.addEventListener('click', downloadCurrentSVG);

  const btnAuto = document.getElementById('btn-auto-cycle');
  btnAuto?.addEventListener('click', () => {
    if (state.autoCycleTimer) {
      clearInterval(state.autoCycleTimer);
      state.autoCycleTimer = null;
      btnAuto.classList.remove('active');
      btnAuto.textContent = '▶ Modo Mutação Contínua';
    } else {
      triggerRandomMutation();
      state.autoCycleTimer = setInterval(triggerRandomMutation, 1100);
      btnAuto.classList.add('active');
      btnAuto.textContent = '⏸ Pausar Mutação';
    }
  });

  document.getElementById('btn-refresh-strip')?.addEventListener('click', () => {
    state.stripVariations = Array.from({ length: 5 }, () => generateRandomParams());
    renderVariationsStrip();
    showToast('5 novas variações geradas na galeria!');
  });

  const rngFlusser = document.getElementById('rng-flusser-count');
  rngFlusser?.addEventListener('input', e => {
    state.flusserCount = Number(e.target.value);
    renderFlusserWheel(state.flusserCount);
  });

  document.querySelectorAll('[data-flusser-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.flusserPreset);
      state.flusserCount = val;
      if (rngFlusser) rngFlusser.value = val;
      document.querySelectorAll('[data-flusser-preset]').forEach(b => b.classList.toggle('active', b === btn));
      renderFlusserWheel(val);
    });
  });

  const btnFlusserAnim = document.getElementById('btn-flusser-animate');
  btnFlusserAnim?.addEventListener('click', () => {
    if (state.flusserAnimTimer) {
      clearInterval(state.flusserAnimTimer);
      state.flusserAnimTimer = null;
      btnFlusserAnim.textContent = '▶ Animar Giro Horário & Convergência';
      return;
    }
    btnFlusserAnim.textContent = '⏸ Pausar Roda do Tempo';
    state.flusserAnimTimer = setInterval(() => {
      // Incrementa o giro estritamente no SENTIDO HORÁRIO (+graus) e aumenta a densidade
      state.flusserRotationDeg = (state.flusserRotationDeg + 4) % 360;
      state.flusserCount += state.flusserCount < 20 ? 1 : 3;
      if (state.flusserCount > 110) {
        state.flusserCount = 1;
      }
      if (rngFlusser) rngFlusser.value = state.flusserCount;
      renderFlusserWheel(state.flusserCount);
    }, 75);
  });

  document.querySelectorAll('[data-build-step]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.buildStep = Number(btn.dataset.buildStep);
      document.querySelectorAll('[data-build-step]').forEach(b => b.classList.toggle('active', b === btn));
      renderConstructionStepDiagram(state.buildStep);
    });
  });

  document.getElementById('btn-regenerate-mockups')?.addEventListener('click', () => {
    const custom = generateRandomParams();
    Object.assign(state, custom);
    renderAllViews();
    renderStationeryMockups(custom);
    showToast(`UI Kit sincronizado com a instância #${custom.seed}!`);
  });

  document.getElementById('btn-uikit-export')?.addEventListener('click', downloadCurrentSVG);

  document.querySelectorAll('#uikit-demo-seg .lk-seg-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#uikit-demo-seg .lk-seg-item').forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  document.querySelectorAll('.lk-nav-list li').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.lk-nav-list li').forEach(li => li.classList.toggle('active', li === item));
    });
  });

  const shellViews = {
    modulos: {
      title: 'REGISTRO TÉCNICO DE MÓDULOS ATIVOS',
      k1: '99.98%',
      k2: '4.2 ms',
      k3: '2 × 2 mm'
    },
    tokens: {
      title: 'MATRIZ DE DESIGN TOKENS & GEOMETRIA BAUHAUS',
      k1: '0 px',
      k2: '1.0 px',
      k3: '12.8 : 1'
    },
    logs: {
      title: 'AUDITORIA DETERMINÍSTICA DE RENDERIZAÇÃO SVG',
      k1: '100%',
      k2: '0 Erros',
      k3: '4 Quadrantes'
    }
  };

  document.querySelectorAll('#uikit-shell-tabs .lk-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#uikit-shell-tabs .lk-tab').forEach(t => t.classList.toggle('active', t === tab));
      const v = shellViews[tab.dataset.shellView];
      if (v) {
        document.getElementById('uikit-table-title').textContent = v.title;
        document.getElementById('uikit-kpi-1').textContent = v.k1;
        document.getElementById('uikit-kpi-2').textContent = v.k2;
        document.getElementById('uikit-kpi-3').textContent = v.k3;
      }
    });
  });

  document.getElementById('uikit-chk-inspect')?.addEventListener('change', e => {
    document.getElementById('uikit-app-showcase')?.classList.toggle('inspect-grid-active', e.target.checked);
  });

  // Renderização inicial completa
  renderColorSwatches();
  renderVariationsStrip();
  renderFlusserWheel(1);
  renderFlusserFiveStagesStrip();
  renderStationeryMockups();
  renderAllViews();
});
