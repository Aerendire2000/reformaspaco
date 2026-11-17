// Reformas Paco · galería de trabajos
// Los trabajos se leen de trabajos.json. Cada trabajo tiene un servicio y una o varias fotos.
// Enlaces que se pueden compartir:
//   reformaspaco.com/#trabajos/alicatados   → solo los trabajos de alicatados
//   reformaspaco.com/#trabajo/<id>          → abre ese trabajo directamente

const SERVICIOS = [
  { id: 'albanileria', nombre: 'Albañilería' },
  { id: 'pladur', nombre: 'Drywall / Pladur' },
  { id: 'soldadura', nombre: 'Soldadura' },
  { id: 'pintura', nombre: 'Pintura' },
  { id: 'electricidad', nombre: 'Electricidad' },
  { id: 'fontaneria', nombre: 'Fontanería' },
  { id: 'alicatados', nombre: 'Alicatados' },
  { id: 'reforma-integral', nombre: 'Reforma integral' }
];
const nombreServicio = (id) => (SERVICIOS.find((s) => s.id === id) || { nombre: id }).nombre;

const MENSAJE_WA = 'Hola Paco, he visto tu web y quiero pedir un presupuesto.';
document.querySelectorAll('[data-whatsapp]').forEach((a) => {
  a.href = 'https://wa.me/34641382507?text=' + encodeURIComponent(MENSAJE_WA);
  a.target = '_blank';
  a.rel = 'noopener';
});
document.querySelector('[data-anio]').textContent = new Date().getFullYear();

const $filtros = document.querySelector('.filtros');
const $galeria = document.querySelector('.galeria');
const $vacio = document.querySelector('.vacio');
const $servicios = document.querySelector('.lista-servicios');

let trabajos = [];
let filtro = 'todos';

// Lista de servicios (enlaza con el filtro de la galería)
$servicios.innerHTML = SERVICIOS.map((s) => `<li><a href="#trabajos/${s.id}">${s.nombre}</a></li>`).join('');

function pintarFiltros() {
  const cuenta = (id) => trabajos.filter((t) => t.servicio === id).length;
  const chips = [{ id: 'todos', nombre: 'Todos', n: trabajos.length }]
    .concat(SERVICIOS.map((s) => ({ ...s, n: cuenta(s.id) })).filter((s) => s.n > 0));
  $filtros.innerHTML = chips
    .map((c) => `<button class="chip" type="button" data-filtro="${c.id}" aria-pressed="${c.id === filtro}">${c.nombre}<span>${c.n}</span></button>`)
    .join('');
}

function pintarGaleria() {
  const lista = filtro === 'todos' ? trabajos : trabajos.filter((t) => t.servicio === filtro);
  $galeria.innerHTML = lista
    .map((t) => `<button class="tarjeta" type="button" data-trabajo="${t.id}" aria-label="${t.titulo}">
      <img src="${t.fotos[0]}" alt="" loading="lazy">
      ${t.ejemplo ? '<span class="tarjeta-ejemplo">EJEMPLO</span>' : ''}
      ${t.video ? '<span class="tarjeta-video"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-play"/></svg></span>' : ''}
      ${t.fotos.length > 1 ? `<span class="tarjeta-num"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-fotos"/></svg>${t.fotos.length}</span>` : ''}
      <span class="tarjeta-info">${t.servicio ? `<span class="etiqueta">${nombreServicio(t.servicio)}</span>` : ''}<strong>${t.titulo}</strong></span>
    </button>`)
    .join('');
  $vacio.hidden = lista.length > 0;
}

function ponerFiltro(id, { scroll = false } = {}) {
  filtro = SERVICIOS.some((s) => s.id === id) ? id : 'todos';
  pintarFiltros();
  pintarGaleria();
  if (scroll) document.getElementById('trabajos').scrollIntoView();
}

$filtros.addEventListener('click', (e) => {
  const b = e.target.closest('[data-filtro]');
  if (!b) return;
  history.replaceState(null, '', b.dataset.filtro === 'todos' ? '#trabajos' : `#trabajos/${b.dataset.filtro}`);
  ponerFiltro(b.dataset.filtro);
});
$galeria.addEventListener('click', (e) => {
  const b = e.target.closest('[data-trabajo]');
  if (b) abrirTrabajo(b.dataset.trabajo);
});

// Visor de fotos
const $visor = document.querySelector('.visor');
const $img = $visor.querySelector('img');
const $ant = $visor.querySelector('[data-anterior]');
const $sig = $visor.querySelector('[data-siguiente]');
let actual = null;
let indice = 0;

function abrirTrabajo(id, i = 0) {
  actual = trabajos.find((t) => t.id === id);
  if (!actual) return;
  indice = i;
  history.replaceState(null, '', `#trabajo/${id}`);
  pintarVisor();
  if (!$visor.open) $visor.showModal();
}
function pintarVisor() {
  const n = actual.fotos.length;
  $img.src = actual.fotos[indice];
  $img.alt = `${actual.titulo}, foto ${indice + 1} de ${n}`;
  $visor.querySelector('.visor-contador').textContent = n > 1 ? `${indice + 1} / ${n}` : '';
  const $et = $visor.querySelector('.etiqueta');
  $et.textContent = actual.servicio ? nombreServicio(actual.servicio) : '';
  $et.hidden = !actual.servicio;
  const $ig = $visor.querySelector('.visor-ig');
  $ig.hidden = !actual.enlace;
  if (actual.enlace) {
    $ig.href = actual.enlace;
    $ig.querySelector('span').textContent = actual.video ? 'Ver el vídeo en Instagram' : 'Ver en Instagram';
  }
  $visor.querySelector('h3').textContent = actual.titulo;
  $visor.querySelector('.visor-texto p').textContent = actual.descripcion || '';
  $ant.hidden = $sig.hidden = n < 2;
}
function mover(paso) {
  if (!actual || actual.fotos.length < 2) return;
  indice = (indice + paso + actual.fotos.length) % actual.fotos.length;
  pintarVisor();
}
function cerrarVisor() {
  if ($visor.open) $visor.close();
}
$visor.addEventListener('close', () => {
  history.replaceState(null, '', filtro === 'todos' ? '#trabajos' : `#trabajos/${filtro}`);
  actual = null;
});
$ant.addEventListener('click', () => mover(-1));
$sig.addEventListener('click', () => mover(1));
$visor.querySelector('[data-cerrar]').addEventListener('click', cerrarVisor);
$visor.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') mover(-1);
  if (e.key === 'ArrowRight') mover(1);
});
// Deslizar con el dedo
let x0 = null;
$visor.querySelector('.visor-foto').addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
$visor.querySelector('.visor-foto').addEventListener('touchend', (e) => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 40) mover(dx < 0 ? 1 : -1);
  x0 = null;
});

// Compartir el trabajo que se está viendo
$visor.querySelector('[data-compartir]').addEventListener('click', async () => {
  if (!actual) return;
  const url = location.origin + location.pathname + `#trabajo/${actual.id}`;
  const datos = { title: `${actual.titulo} · Reformas Paco`, text: `${actual.titulo} · Reformas Paco`, url };
  if (navigator.share) {
    try { await navigator.share(datos); } catch (_) { /* cancelado */ }
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    avisar('Enlace copiado');
  } catch (_) {
    prompt('Copia este enlace:', url);
  }
});
function avisar(texto) {
  const d = document.createElement('div');
  d.className = 'aviso-copiado';
  d.textContent = texto;
  $visor.append(d);
  setTimeout(() => d.remove(), 1800);
}

// Enlaces directos (#trabajos/servicio o #trabajo/id)
function leerEnlace() {
  const [tipo, valor] = location.hash.replace('#', '').split('/');
  if (tipo === 'trabajos') {
    cerrarVisor();
    ponerFiltro(valor || 'todos', { scroll: true });
  } else if (tipo === 'trabajo' && valor) {
    abrirTrabajo(valor);
  }
}
window.addEventListener('hashchange', leerEnlace);

fetch('trabajos.json', { cache: 'no-cache' })
  .then((r) => r.json())
  .then((datos) => {
    // trabajos.json puede ser una lista (ejemplos) o lo que genera el script de Instagram
    const lista = Array.isArray(datos) ? datos : datos.trabajos || [];
    if (datos.instagram) {
      const url = `https://www.instagram.com/${encodeURIComponent(datos.instagram)}/`;
      document.querySelectorAll('[data-instagram]').forEach((el) => {
        el.href = url;
        el.hidden = false;
        const s = el.querySelector('span');
        if (s) s.textContent = '@' + datos.instagram;
      });
      document.querySelector('[data-instagram-texto]').hidden = false;
    }
    trabajos = lista
      .filter((t) => t && t.id && Array.isArray(t.fotos) && t.fotos.length)
      .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
    ponerFiltro('todos');
    leerEnlace();
  })
  .catch(() => {
    $vacio.hidden = false;
    $vacio.textContent = 'No se pudieron cargar las fotos. Prueba a recargar la página.';
  });
