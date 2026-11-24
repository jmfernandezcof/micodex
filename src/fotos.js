// Fotos del usuario: solo en su móvil (IndexedDB). Nunca salen del dispositivo.
// Al guardar se redibuja la imagen en un canvas: eso elimina el EXIF (incluido el GPS).
import { openDB } from 'idb';
import { useEffect, useState } from 'preact/hooks';
import { tirar, estadoInicial, daSorteo } from './tirada.js';
import { esDeNoche } from './tema.js';
import { NOMBRE_BD } from './demo.js';

const LADO_MAX = 1600;
const LADO_MINI = 240;

const db = openDB(NOMBRE_BD, 2, { // 'setas-saceruela'; en modo demostración, otra BD aparte (demo.js)
  upgrade(d, version) {
    if (version < 1) {
      const fotos = d.createObjectStore('fotos', { keyPath: 'id', autoIncrement: true });
      fotos.createIndex('especie', 'especie');
    }
    if (version < 2) d.createObjectStore('juego');
  }
});

// ---------- Avisos de cambios (para refrescar pantallas) ----------
const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());
// Solo para el modo demostración (demo-datos.js), que rellena su propia BD.
export const baseDeDatos = db;
export const refrescar = avisar;

// ---------- Procesado ----------
async function decodificar(archivo) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(archivo, { imageOrientation: 'from-image' });
    } catch {
      /* algunos navegadores no aceptan opciones: seguimos con <img> */
    }
  }
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function lienzo(fuente, ladoMax) {
  const w = fuente.width, h = fuente.height;
  const k = Math.min(1, ladoMax / Math.max(w, h));
  const c = document.createElement('canvas');
  c.width = Math.round(w * k);
  c.height = Math.round(h * k);
  c.getContext('2d').drawImage(fuente, 0, 0, c.width, c.height);
  return c;
}

const aBlob = (c, calidad) => new Promise((ok, mal) => c.toBlob((b) => (b ? ok(b) : mal(new Error('No se pudo guardar la foto'))), 'image/jpeg', calidad));

// dHash de 64 bits: detecta la misma foto repetida (para el juego), no identifica setas.
function dHash(fuente) {
  const c = document.createElement('canvas');
  c.width = 9;
  c.height = 8;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(fuente, 0, 0, 9, 8);
  const p = ctx.getImageData(0, 0, 9, 8).data;
  const gris = (x, y) => { const i = (y * 9 + x) * 4; return p[i] * 0.299 + p[i + 1] * 0.587 + p[i + 2] * 0.114; };
  let bits = '';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += gris(x, y) > gris(x + 1, y) ? '1' : '0';
  return bits;
}

export const distancia = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; return d; };
const UMBRAL_REPETIDA = 5;

export async function guardarFoto(archivo) {
  const img = await decodificar(archivo);
  const blob = await aBlob(lienzo(img, LADO_MAX), 0.82);
  const mini = await aBlob(lienzo(img, LADO_MINI), 0.7);
  const hash = dHash(img);
  if (img.close) img.close();
  const anteriores = await (await db).getAll('fotos');
  const repetida = anteriores.some((f) => distancia(f.hash, hash) <= UMBRAL_REPETIDA);
  const d = await db;
  // El sorteo del gnomo ya no se hace aquí: se hace al apuntar la especie (asignarEspecie, daSorteo).
  const id = await d.add('fotos', { fecha: Date.now(), blob, mini, hash, repetida, especie: null, gnomo: null, gnomoNuevo: false });
  navigator.storage?.persist?.();
  avisar();
  return { id, repetida };
}

export async function asignarEspecie(id, especie) {
  const d = await db;
  const tx = d.transaction(['fotos', 'juego'], 'readwrite');
  const almacen = tx.objectStore('fotos');
  const f = await almacen.get(id);
  if (!f) { await tx.done; return { gnomo: null }; }
  // Para el logro «Misterio resuelto»: la foto estuvo en Mis misterios y ahora tiene especie.
  if (especie && f.marcadaMisterio && !f.misterioResuelto) f.misterioResuelto = Date.now();
  let gnomo = null;
  if (daSorteo(f, await almacen.getAll(), especie)) {
    const estado = (await tx.objectStore('juego').get('estado')) || estadoInicial();
    const r = tirar(estado, { noche: esDeNoche() });
    await tx.objectStore('juego').put(r.estado, 'estado');
    // Con el tope diario no hay sorteo: no se marca, para que esa especie pueda sortear otro día.
    if (!r.limite) {
      f.sorteo = { especie, fecha: Date.now() };
      f.gnomo = r.gnomo;
      f.gnomoNuevo = Boolean(r.nuevo);
      gnomo = r.gnomo;
    }
  }
  f.especie = especie;
  await almacen.put(f);
  await tx.done;
  avisar();
  return { gnomo };
}

export async function marcarMisterio(id) {
  const d = await db;
  const f = await d.get('fotos', id);
  if (!f) return;
  f.especie = null;
  f.marcadaMisterio = true;
  await d.put('fotos', f);
  avisar();
}

export async function guardarMontaje(id, blob) {
  const d = await db;
  const f = await d.get('fotos', id);
  if (!f) return;
  f.montaje = blob;
  await d.put('fotos', f);
  avisar();
}

export async function borrarFoto(id) {
  await (await db).delete('fotos', id);
  avisar();
}

export const leerFoto = async (id) => (await db).get('fotos', id);

// ---------- Hooks ----------
export function useFotos() {
  const [fotos, setFotos] = useState(null);
  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      const todas = await (await db).getAll('fotos');
      if (vivo) setFotos(todas.sort((a, b) => b.fecha - a.fecha));
    };
    cargar();
    oyentes.add(cargar);
    return () => { vivo = false; oyentes.delete(cargar); };
  }, []);
  return fotos;
}

// URL temporal para mostrar un Blob; se libera al desmontar.
export function useUrl(blob) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!blob) return undefined;
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

// ---------- Estado del juego (gnomos) ----------
export function useJuego() {
  const [estado, setEstado] = useState(null);
  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      const e = (await (await db).get('juego', 'estado')) || estadoInicial();
      if (vivo) setEstado(e);
    };
    cargar();
    oyentes.add(cargar);
    return () => { vivo = false; oyentes.delete(cargar); };
  }, []);
  return estado;
}

// ---------- Marcas para los logros (descarga, fichas mortales leídas, usos de Identificar) ----------
// Van en el mismo almacén `juego`, con clave propia, para no tocar el estado de la tirada.
const marcasIniciales = () => ({ descarga: null, mortalesLeidas: [], identificar: 0, logrosVistos: [] });

async function cambiarMarcas(cambio) {
  const d = await db;
  const tx = d.transaction('juego', 'readwrite');
  const m = { ...marcasIniciales(), ...((await tx.store.get('marcas')) || {}) };
  if (cambio(m) === false) { await tx.done; return; } // sin cambios: no se avisa
  await tx.store.put(m, 'marcas');
  await tx.done;
  avisar();
}

export const anotarDescarga = () => cambiarMarcas((m) => { if (m.descarga) return false; m.descarga = Date.now(); });
export const anotarMortalLeida = (id) => cambiarMarcas((m) => {
  if (m.mortalesLeidas.includes(id)) return false;
  m.mortalesLeidas = [...m.mortalesLeidas, id];
});
export const anotarIdentificar = () => cambiarMarcas((m) => { m.identificar++; });
export const anotarLogrosVistos = (ids) => cambiarMarcas((m) => {
  const nuevos = ids.filter((id) => !m.logrosVistos.includes(id));
  if (!nuevos.length) return false;
  m.logrosVistos = [...m.logrosVistos, ...nuevos];
});

export function useMarcas() {
  const [marcas, setMarcas] = useState(null);
  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      const m = { ...marcasIniciales(), ...((await (await db).get('juego', 'marcas')) || {}) };
      if (vivo) setMarcas(m);
    };
    cargar();
    oyentes.add(cargar);
    return () => { vivo = false; oyentes.delete(cargar); };
  }, []);
  return marcas;
}

// ---------- Borrar todo (aviso de privacidad) ----------
export async function borrarTodo() {
  const d = await db;
  const tx = d.transaction(['fotos', 'juego'], 'readwrite');
  await Promise.all([tx.objectStore('fotos').clear(), tx.objectStore('juego').clear(), tx.done]);
  avisar();
}
