// Rellena la base de datos de DEMOSTRACIÓN (solo con enDemo; ver demo.js). Una vez por base de datos.
// Las «fotos del usuario» son las fotos del catálogo (la grande si se puede descargar; si no, la miniatura).
import { baseDeDatos, refrescar } from './fotos.js';
import { especies } from './catalogo.js';
import { GNOMOS, JORNADAS } from './gnomos-datos.js';
import { LOGROS } from './logros.js';
import { miniatura } from './foto-seta.jsx';

const N_VISTAS = 100;
const DIA = 24 * 3600 * 1000;

async function traer(url) {
  try { const r = await fetch(url); return r.ok ? await r.blob() : null; } catch { return null; }
}

// Reparto fijo (no aleatorio) para que la demo salga siempre igual.
function elegir(lista, n) {
  const paso = lista.length / n;
  return Array.from({ length: n }, (_, i) => lista[Math.floor(i * paso)]);
}

export async function rellenarDemo() {
  const d = await baseDeDatos;
  if ((await d.count('fotos')) > 0) return; // ya rellenada en esta pestaña
  const ahora = Date.now();
  const vistas = elegir(especies.filter((e) => e.foto), N_VISTAS);
  const conGnomo = new Map(GNOMOS.map((g, i) => [Math.floor((i * N_VISTAS) / GNOMOS.length), g.id]));

  const fotos = await Promise.all(vistas.map(async (e, i) => {
    const mini = await traer(miniatura(e));
    const blob = (await traer(`/fotos/${e.foto.archivo}`)) || mini;
    const gnomo = conGnomo.get(i) || null;
    return {
      fecha: ahora - (N_VISTAS - i) * 37 * 60 * 1000, blob, mini, hash: `demo-${i}`.padEnd(64, '0'),
      repetida: false, especie: e.id, sorteo: { especie: e.id, fecha: ahora }, gnomo, gnomoNuevo: false,
      ...(i === 1 ? { marcadaMisterio: ahora - DIA, misterioResuelto: ahora } : {}) // para el logro «Misterio resuelto»
    };
  }));
  const misterios = elegir(especies.filter((e) => e.foto && !vistas.includes(e)), 3);
  for (const [i, e] of misterios.entries()) {
    const mini = await traer(miniatura(e));
    fotos.push({ fecha: ahora - i * 11 * 60 * 1000, blob: mini, mini, hash: `misterio-${i}`.padEnd(64, '0'),
      repetida: false, especie: null, marcadaMisterio: ahora, gnomo: null, gnomoNuevo: false });
  }

  const coleccion = {};
  GNOMOS.forEach((g, i) => {
    const primera = g.rareza === 'legendario' ? new Date(`${JORNADAS[0].desde}T12:34:00`).getTime() : ahora - (12 - i) * DIA / 6;
    coleccion[g.id] = { veces: 1 + (i % g.frases.length), primera };
  });

  const tx = d.transaction(['fotos', 'juego'], 'readwrite');
  for (const f of fotos) tx.objectStore('fotos').add(f);
  tx.objectStore('juego').put({ sinGnomo: 0, hoy: null, tiradasHoy: 0, fotosJornadas: 0, coleccion }, 'estado');
  tx.objectStore('juego').put({
    descarga: ahora,
    mortalesLeidas: especies.filter((e) => e.mortal).map((e) => e.id),
    identificar: 5,
    logrosVistos: LOGROS.map((l) => l.id) // sin avisos flotantes de «¡Logro conseguido!»
  }, 'marcas');
  await tx.done;
  refrescar();
}
