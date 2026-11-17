// Trae las publicaciones de Instagram de Reformas Paco y las convierte en la galería de la web.
//
// Uso normal (lo ejecuta GitHub cada hora):
//   IG_TOKEN=<token> node scripts/actualizar-instagram.mjs
// Prueba sin internet, con publicaciones inventadas:
//   node scripts/actualizar-instagram.mjs --prueba scripts/prueba-instagram.json
//
// Qué hace:
//  - Lee las publicaciones de la cuenta profesional de Instagram (fotos, carruseles y vídeos).
//  - Descarga las fotos a img/ig/ para que la web no dependa de los enlaces de Instagram.
//  - Clasifica cada publicación por servicio según sus hashtags (#alicatados, #pladur, ...).
//  - Las publicaciones con #noweb no se muestran en la web.
//  - Escribe trabajos.json, que es lo que lee la galería.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA_FOTOS = path.join(RAIZ, 'img', 'ig');
const SALIDA = path.join(RAIZ, 'trabajos.json');
const API = 'https://graph.instagram.com';
const MAX_PUBLICACIONES = 120;

// Hashtag (sin tildes, en minúsculas) → servicio de la web.
// Solo hashtags concretos: los genéricos (#reformas, #obra) no clasifican, así no se cuelan en otra categoría.
const HASHTAGS = {
  albanileria: 'albanileria', albanil: 'albanileria',
  pladur: 'pladur', drywall: 'pladur',
  soldadura: 'soldadura', soldador: 'soldadura',
  pintura: 'pintura', pintor: 'pintura',
  electricidad: 'electricidad', electricista: 'electricidad',
  fontaneria: 'fontaneria', fontanero: 'fontaneria',
  alicatados: 'alicatados', alicatado: 'alicatados', azulejos: 'alicatados',
  reformaintegral: 'reforma-integral'
};
const NOMBRES = {
  albanileria: 'albañilería', pladur: 'pladur', soldadura: 'soldadura', pintura: 'pintura',
  electricidad: 'electricidad', fontaneria: 'fontanería', alicatados: 'alicatado', 'reforma-integral': 'reforma integral'
};

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function leerTexto(caption = '') {
  const hashtags = [...caption.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => sinTildes(m[1]));
  const limpio = caption.replace(/#[\p{L}\p{N}_]+/gu, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  const lineas = limpio.split('\n').map((l) => l.trim()).filter(Boolean);
  let titulo = lineas.shift() || '';
  if (titulo.length > 70) {
    lineas.unshift(titulo); // el texto completo pasa a la descripción
    titulo = titulo.slice(0, 67).replace(/\s+\S*$/, '') + '…';
  }
  return { hashtags, titulo, descripcion: lineas.join(' ') };
}

async function pedir(url) {
  const r = await fetch(url);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) {
    const msg = j.error ? `${j.error.message} (código ${j.error.code})` : `HTTP ${r.status}`;
    throw new Error(`Instagram respondió con un error: ${msg}`);
  }
  return j;
}

async function leerInstagram(token) {
  const t = encodeURIComponent(token);
  const yo = await pedir(`${API}/me?fields=user_id,username&access_token=${t}`);
  const campos = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{id,media_type,media_url,thumbnail_url}';
  let url = `${API}/me/media?fields=${encodeURIComponent(campos)}&limit=50&access_token=${t}`;
  const publicaciones = [];
  while (url && publicaciones.length < MAX_PUBLICACIONES) {
    const pagina = await pedir(url);
    publicaciones.push(...(pagina.data || []));
    url = pagina.paging && pagina.paging.next;
  }
  // Si Instagram no devolvió las fotos de algún carrusel, se piden aparte
  for (const p of publicaciones) {
    if (p.media_type === 'CAROUSEL_ALBUM' && !(p.children && p.children.data && p.children.data.length)) {
      p.children = await pedir(`${API}/${p.id}/children?fields=id,media_type,media_url,thumbnail_url&access_token=${t}`);
    }
  }
  return { usuario: yo.username, publicaciones };
}

// Devuelve las imágenes que se pueden mostrar de una publicación (para vídeos, su miniatura)
function imagenesDe(p) {
  const piezas = p.media_type === 'CAROUSEL_ALBUM' ? (p.children && p.children.data) || [] : [p];
  return piezas
    .map((c) => ({ id: c.id, url: c.media_type === 'VIDEO' ? c.thumbnail_url : c.media_url, video: c.media_type === 'VIDEO' }))
    .filter((c) => c.url);
}

async function guardarImagen(origen, destino, modoPrueba) {
  try {
    await fs.access(destino);
    return; // ya descargada antes
  } catch (_) { /* no existe todavía */ }
  if (modoPrueba && !/^https?:/.test(origen)) {
    await fs.copyFile(path.resolve(RAIZ, origen), destino);
    return;
  }
  const r = await fetch(origen);
  if (!r.ok) throw new Error(`No se pudo descargar una foto (HTTP ${r.status})`);
  await fs.writeFile(destino, Buffer.from(await r.arrayBuffer()));
}

async function main() {
  const i = process.argv.indexOf('--prueba');
  const modoPrueba = i > -1;
  let datos;
  if (modoPrueba) {
    datos = JSON.parse(await fs.readFile(path.resolve(RAIZ, process.argv[i + 1]), 'utf8'));
  } else {
    const token = process.env.IG_TOKEN;
    if (!token) throw new Error('Falta el token de Instagram (variable IG_TOKEN).');
    datos = await leerInstagram(token);
  }

  await fs.mkdir(CARPETA_FOTOS, { recursive: true });
  const usadas = new Set();
  const trabajos = [];

  for (const p of datos.publicaciones) {
    const { hashtags, titulo, descripcion } = leerTexto(p.caption);
    if (hashtags.includes('noweb')) continue;
    const imagenes = imagenesDe(p);
    if (!imagenes.length) continue;

    const servicio = hashtags.map((h) => HASHTAGS[h]).find(Boolean) || null;
    const fotos = [];
    for (const [n, img] of imagenes.entries()) {
      const ext = modoPrueba ? path.extname(img.url) || '.jpg' : '.jpg';
      const nombre = `${p.id}-${n + 1}${ext}`;
      try {
        await guardarImagen(img.url, path.join(CARPETA_FOTOS, nombre), modoPrueba);
        fotos.push(`img/ig/${nombre}`);
        usadas.add(nombre);
      } catch (e) {
        console.warn(`Aviso: ${e.message} (publicación ${p.id})`);
      }
    }
    if (!fotos.length) continue;

    trabajos.push({
      id: p.id,
      titulo: titulo || (servicio ? `Trabajo de ${NOMBRES[servicio]}` : 'Trabajo realizado'),
      servicio,
      fecha: p.timestamp,
      descripcion,
      fotos,
      video: imagenes.some((x) => x.video),
      enlace: p.permalink
    });
  }

  // Borra fotos de publicaciones que ya no están en Instagram
  for (const f of await fs.readdir(CARPETA_FOTOS)) {
    if (!usadas.has(f)) await fs.unlink(path.join(CARPETA_FOTOS, f));
  }

  const salida = { instagram: datos.usuario || null, trabajos };
  const nuevo = JSON.stringify(salida, null, 2) + '\n';
  const viejo = await fs.readFile(SALIDA, 'utf8').catch(() => '');
  if (nuevo !== viejo) await fs.writeFile(SALIDA, nuevo);
  console.log(`${trabajos.length} trabajos en la web (${nuevo === viejo ? 'sin cambios' : 'actualizado'}).`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
