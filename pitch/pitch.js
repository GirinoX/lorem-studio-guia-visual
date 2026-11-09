/**
 * LOREM STUDIO — PITCH DECK INTERATIVO
 * Navegação por teclado, escala responsiva do canvas 1600×900, logo generativo vivo
 * (mesma geometria do Guia Visual: grade 6×6 de 358px inscrita no quadro 440px),
 * flywheel do modelo híbrido, mapa de posicionamento e simulador de receita.
 */

const PALETTE = { indigo: '#23265F', teal: '#0F8A85' };
const ROTATIONS = [354, 5, 85, 95, 175, 185, 265, 275];
const RECT_CONFIGS = [
  { w: 122, h: 122 },
  { w: 144, h: 112 },
  { w: 165, h: 105 }
];
let maskUid = 0;

const WORDMARK_PATHS = [
  'M 0.00 2.29 L 21.60 2.29 L 21.60 176.45 L 76.97 176.45 L 76.97 196.11 L 0.00 196.11 Z',
  'M 45.42 99.89 L 45.42 45.07 C 45.42 16.27, 59.82 0.21, 86.41 0.21 C 112.71 0.21, 127.38 16.27, 127.38 45.07 L 127.38 99.89 C 127.38 128.69, 112.71 145.02, 86.41 145.02 C 59.82 145.02, 45.42 128.69, 45.42 99.89 Z M 106.34 101.83 L 106.34 43.13 C 106.34 28.18, 100.80 18.76, 86.41 18.76 C 72.01 18.76, 66.19 28.18, 66.19 43.13 L 66.19 101.83 C 66.19 117.06, 72.01 126.47, 86.41 126.47 C 100.53 126.47, 106.34 117.06, 106.34 101.83 Z',
  'M 208.45 12.80 L 208.45 33.29 C 205.68 32.18, 202.91 31.90, 199.87 31.90 C 181.87 31.90, 172.73 45.20, 172.73 72.05 L 172.73 153.18 L 151.96 153.18 L 151.96 13.91 L 169.96 13.91 L 170.24 36.89 C 174.94 19.44, 184.64 11.14, 199.31 11.14 C 202.91 11.14, 205.68 11.41, 208.45 12.80 Z',
  'M 279.71 97.54 L 279.71 128.27 L 218.24 128.27 L 218.24 154.30 C 218.24 171.19, 225.16 178.94, 238.73 178.94 C 252.30 178.94, 259.49 171.19, 259.49 154.30 L 259.49 150.14 L 279.71 150.14 L 279.71 152.36 C 279.71 181.16, 265.03 197.49, 238.45 197.49 C 211.59 197.49, 197.19 181.16, 197.19 152.36 L 197.19 97.54 C 197.19 68.74, 211.59 52.68, 238.45 52.68 C 265.03 52.68, 279.71 68.74, 279.71 97.54 Z M 259.22 111.10 L 259.22 95.60 C 259.22 78.98, 251.74 71.23, 238.45 71.23 C 225.16 71.23, 218.24 78.98, 218.24 95.60 L 218.24 111.10 Z',
  'M 437.07 72.92 L 437.07 175.93 L 416.30 175.93 L 416.30 74.31 C 416.30 61.02, 411.59 52.44, 399.69 52.44 C 387.51 52.44, 378.64 62.96, 378.64 83.45 L 378.64 175.93 L 357.60 175.93 L 357.60 74.31 C 357.60 61.02, 352.89 52.44, 340.99 52.44 C 328.81 52.44, 319.94 62.96, 319.94 83.45 L 319.94 175.93 L 299.18 175.93 L 299.18 36.65 L 317.18 36.65 L 317.45 54.93 C 322.99 41.64, 333.51 33.89, 347.36 33.89 C 361.76 33.89, 371.72 40.25, 376.15 54.38 C 381.69 41.36, 392.21 33.89, 405.78 33.89 C 425.44 33.89, 437.07 46.07, 437.07 72.92 Z'
];

/* ------------------------------------------------------------------ */
/* LOGO GENERATIVO                                                      */
/* ------------------------------------------------------------------ */
function randomInstance() {
  return {
    anchor: Math.floor(Math.random() * 3),
    p5x: Math.random() * 100,
    p5y: Math.random() * 100,
    rotation: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
    flip: Math.random() < 0.5,
    seed: 'LRM-' + String(Math.floor(Math.random() * 9000) + 1000)
  };
}

function buildLogo(inst, withWordmark = true) {
  const sw = 20;
  const rc = RECT_CONFIGS[inst.anchor];
  const rect = { x: 135, y: 135, w: rc.w, h: rc.h };
  const p5 = { x: Math.round(158 + inst.p5x / 100 * 28), y: Math.round(158 + inst.p5y / 100 * 28) };
  const p4 = { x: 456, y: 456 };
  const p6 = { x: p5.x, y: 456 };
  const tri = `${p4.x},${p4.y} ${p5.x},${p5.y} ${p6.x},${p6.y}`;
  const id = ++maskUid;
  const flip = inst.flip ? 'translate(600,0) scale(-1,1)' : '';
  const vb = withWordmark ? '40 40 520 680' : '70 70 460 460';
  const wmScale = 0.842;
  const wmX = ((600 - 437.07 * wmScale) / 2).toFixed(1);
  const wordmark = withWordmark
    ? `<g transform="translate(${wmX},520) scale(${wmScale})" fill="${PALETTE.indigo}">${WORDMARK_PATHS.map((d) => `<path fill-rule="evenodd" d="${d}"/>`).join('')}</g>`
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <mask id="pr-${id}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1200" height="1200">
          <rect x="-300" y="-300" width="1200" height="1200" fill="#fff"/>
          <polygon points="${tri}" fill="#000" stroke="#000" stroke-width="${sw}" stroke-linejoin="miter" stroke-miterlimit="10"/>
          <circle cx="300" cy="300" r="63" fill="#000"/>
        </mask>
        <mask id="pt-${id}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1200" height="1200">
          <rect x="-300" y="-300" width="1200" height="1200" fill="#fff"/>
          <circle cx="300" cy="300" r="63" fill="#000"/>
        </mask>
      </defs>
      <g class="logo-symbol" style="transform-origin:300px 300px">
        <g transform="rotate(${inst.rotation} 300 300)">
          <g transform="${flip}">
            <rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="none" stroke="${PALETTE.teal}" stroke-width="${sw}" stroke-linejoin="miter" mask="url(#pr-${id})"/>
            <polygon points="${tri}" fill="none" stroke="${PALETTE.teal}" stroke-width="${sw}" stroke-linejoin="miter" stroke-miterlimit="10" mask="url(#pt-${id})"/>
            <circle cx="300" cy="300" r="63" fill="none" stroke="${PALETTE.indigo}" stroke-width="${sw + 3}"/>
          </g>
        </g>
      </g>
      ${wordmark}
    </svg>`;
}

let currentInstance = randomInstance();

function renderAllLogos() {
  document.querySelectorAll('.logo-live').forEach((el) => {
    el.innerHTML = buildLogo(currentInstance, !el.hasAttribute('data-no-wordmark'));
  });
  document.querySelectorAll('[data-seed-label]').forEach((el) => {
    el.textContent = `#${currentInstance.seed} · ${currentInstance.rotation}°${currentInstance.flip ? ' · FLIP X' : ''}`;
  });
}

function regenerateLogo() {
  currentInstance = randomInstance();
  renderAllLogos();
}

/* ------------------------------------------------------------------ */
/* NAVEGAÇÃO                                                            */
/* ------------------------------------------------------------------ */
const stage = document.getElementById('stage');
const slides = Array.from(document.querySelectorAll('.slide'));
const notesPanel = document.getElementById('notes-panel');
const overview = document.getElementById('overview');
let current = 0;

function fitStage() {
  const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  stage.style.transform = `scale(${scale})`;
}

function goTo(index) {
  current = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === current);
    s.classList.toggle('past', i < current);
  });
  document.getElementById('hud-cur').textContent = current + 1;
  document.getElementById('progress').style.width = `${((current + 1) / slides.length) * 100}%`;
  const note = slides[current].querySelector('.notes');
  notesPanel.textContent = note ? note.textContent : 'Sem notas para este slide.';
  history.replaceState(null, '', `#${current + 1}`);
  runCounters(slides[current]);
}

function runCounters(slide) {
  slide.querySelectorAll('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const start = performance.now();
    const dur = 1200;
    const tick = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * eased).toFixed(dec).replace('.', ',');
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

function toggleNotes() {
  notesPanel.classList.toggle('show');
  document.getElementById('btn-notes').classList.toggle('on', notesPanel.classList.contains('show'));
}

function buildOverview() {
  overview.innerHTML = slides.map((s, i) => `
    <button class="ov-item" data-go="${i}">
      <span>${String(i + 1).padStart(2, '0')}</span>
      <strong>${s.dataset.title || ''}</strong>
    </button>`).join('');
  overview.querySelectorAll('.ov-item').forEach((b) => b.addEventListener('click', () => {
    goTo(parseInt(b.dataset.go, 10));
    toggleOverview(false);
  }));
}

function toggleOverview(force) {
  const show = typeof force === 'boolean' ? force : !overview.classList.contains('show');
  overview.classList.toggle('show', show);
  overview.querySelectorAll('.ov-item').forEach((b, i) => b.classList.toggle('current', i === current));
}

document.addEventListener('keydown', (e) => {
  if (e.target.isContentEditable || e.target.tagName === 'INPUT') return;
  const k = e.key;
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); goTo(current + 1); }
  else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); goTo(current - 1); }
  else if (k === 'Home') goTo(0);
  else if (k === 'End') goTo(slides.length - 1);
  else if (k === 'f' || k === 'F') toggleFullscreen();
  else if (k === 'n' || k === 'N') toggleNotes();
  else if (k === 'o' || k === 'O') toggleOverview();
  else if (k === 'r' || k === 'R') regenerateLogo();
  else if (k === 'Escape') toggleOverview(false);
});

let touchX = null;
document.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

document.getElementById('btn-prev').addEventListener('click', () => goTo(current - 1));
document.getElementById('btn-next').addEventListener('click', () => goTo(current + 1));
document.getElementById('btn-full').addEventListener('click', toggleFullscreen);
document.getElementById('btn-notes').addEventListener('click', toggleNotes);
document.getElementById('btn-overview').addEventListener('click', () => toggleOverview());
document.querySelectorAll('.logo-live').forEach((el) => el.addEventListener('click', regenerateLogo));

/* ------------------------------------------------------------------ */
/* FLYWHEEL DO MODELO HÍBRIDO                                           */
/* ------------------------------------------------------------------ */
const FLY_STEPS = [
  { title: 'Serviços sob medida', text: 'Projetos de escopo fechado e retainers mensais financiam a operação desde o primeiro mês, sem depender de capital externo.' },
  { title: 'Ferramentas internas', text: 'Cada entrega gera componentes, automações e templates reaproveitáveis. O próximo projeto fica mais rápido e com margem maior.' },
  { title: 'Produtos SaaS próprios', text: 'As ferramentas mais pedidas pelos clientes viram produtos por assinatura: receita recorrente que não depende de horas trabalhadas.' },
  { title: 'Autoridade & marca', text: 'Produtos e cases publicados atraem clientes melhores e tickets maiores, e o ciclo recomeça com mais força.' }
];
const flyDetail = document.getElementById('fly-detail');
const flyNodes = document.querySelectorAll('.fly-node');
let flyIndex = 0;
let flyTimer = null;

function setFly(i) {
  flyIndex = i;
  flyNodes.forEach((n, j) => n.classList.toggle('active', j === i));
  flyDetail.innerHTML = `
    <span class="fly-detail-tag">ETAPA ${i + 1}</span>
    <h3>${FLY_STEPS[i].title}</h3>
    <p>${FLY_STEPS[i].text}</p>`;
}
flyNodes.forEach((n) => n.addEventListener('click', () => {
  clearInterval(flyTimer);
  setFly(parseInt(n.dataset.fly, 10));
}));
flyTimer = setInterval(() => {
  if (slides[current].dataset.title === 'Modelo de negócio') setFly((flyIndex + 1) % 4);
}, 4500);

/* ------------------------------------------------------------------ */
/* MAPA DE POSICIONAMENTO                                               */
/* ------------------------------------------------------------------ */
const posDetail = document.getElementById('pos-detail');
document.querySelectorAll('.pos-dot').forEach((dot) => {
  const show = () => {
    const [title, text] = dot.dataset.pos.split('|');
    posDetail.innerHTML = `<h3>${title}</h3><p>${text}</p>`;
    document.querySelectorAll('.pos-dot').forEach((d) => d.classList.toggle('active', d === dot));
  };
  dot.addEventListener('mouseenter', show);
  dot.addEventListener('click', show);
});

/* ------------------------------------------------------------------ */
/* SIMULADOR DE RECEITA                                                 */
/* ------------------------------------------------------------------ */
const SAAS_PRICE = 49;
const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const $ = (id) => document.getElementById(id);

function updateSim() {
  const proj = +$('in-proj').value;
  const ticket = +$('in-ticket').value;
  const ret = +$('in-ret').value;
  const retv = +$('in-retv').value;
  const saas = +$('in-saas').value;
  const cost = +$('in-cost').value;

  $('v-proj').textContent = proj;
  $('v-ticket').textContent = brl(ticket);
  $('v-ret').textContent = ret;
  $('v-retv').textContent = brl(retv);
  $('v-saas').textContent = saas;
  $('v-cost').textContent = `${cost}%`;

  const rProj = proj * ticket;
  const rRet = ret * retv;
  const rSaas = saas * SAAS_PRICE;
  const total = rProj + rRet + rSaas;
  const perPartner = (total * (1 - cost / 100)) / 3;
  const recurring = total ? ((rRet + rSaas) / total) * 100 : 0;

  $('out-total').textContent = brl(total);
  $('out-proj').textContent = brl(rProj);
  $('out-ret').textContent = brl(rRet);
  $('out-saas').textContent = brl(rSaas);
  $('out-partner').textContent = brl(perPartner);
  $('out-recurring').textContent = `${Math.round(recurring)}%`;

  const segs = document.querySelectorAll('#sim-stack .seg');
  const pct = (v) => (total ? (v / total) * 100 : 0);
  segs[0].style.width = `${pct(rProj)}%`;
  segs[1].style.width = `${pct(rRet)}%`;
  segs[2].style.width = `${pct(rSaas)}%`;
}
document.querySelectorAll('.sim input[type=range]').forEach((i) => i.addEventListener('input', updateSim));

/* ------------------------------------------------------------------ */
/* INIT                                                                 */
/* ------------------------------------------------------------------ */
document.getElementById('hud-total').textContent = slides.length;
window.addEventListener('resize', fitStage);
fitStage();
renderAllLogos();
buildOverview();
updateSim();
const startHash = parseInt(location.hash.replace('#', ''), 10);
goTo(Number.isFinite(startHash) ? startHash - 1 : 0);
