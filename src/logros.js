// Paso 7: logros (lista aprobada por José, 2026-11-17). Lógica pura: se prueba con node:test.
// Ninguno premia coger, tocar ni hacer fotos en masa: las especies cuentan distintas y las fotos
// repetidas no cuentan.
import { GNOMOS } from './gnomos-datos.js';

const especiesDistintas = (fotos) => new Set(fotos.filter((f) => f.especie).map((f) => f.especie)).size;
const gnomosDe = (juego, rareza) => GNOMOS.filter((g) => g.rareza === rareza && juego.coleccion?.[g.id]).length;

// cuenta(datos) → número conseguido; meta → número necesario.
export const LOGROS = [
  { id: 'primer-paso', titulo: 'Primer paso en el monte', texto: 'Haz tu primera foto a una seta.', meta: 1,
    cuenta: ({ fotos }) => fotos.length },
  { id: 'sin-cobertura', titulo: 'Preparado sin cobertura', texto: 'Activa «Usar sin conexión» en Inicio y espera a que termine.', meta: 1,
    cuenta: ({ marcas }) => (marcas.descarga ? 1 : 0) },
  { id: 'ojo-setero', titulo: 'Ojo de setero', texto: 'Apunta 5 especies distintas en tu Micodex.', meta: 5,
    cuenta: ({ fotos }) => especiesDistintas(fotos) },
  { id: 'buen-rastreador', titulo: 'Buen rastreador', texto: 'Apunta 15 especies distintas.', meta: 15,
    cuenta: ({ fotos }) => especiesDistintas(fotos) },
  { id: 'maestro-micodex', titulo: 'Maestro del Micodex', texto: 'Apunta 30 especies distintas.', meta: 30,
    cuenta: ({ fotos }) => especiesDistintas(fotos) },
  { id: 'lo-que-no-se-toca', titulo: 'Sabe lo que no se toca', texto: 'Lee las fichas de todas las setas mortales del catálogo.',
    meta: ({ mortales }) => mortales.length,
    cuenta: ({ marcas, mortales }) => mortales.filter((id) => marcas.mortalesLeidas?.includes(id)).length },
  { id: 'detective', titulo: 'Detective de setas', texto: 'Usa 3 veces «Identificar paso a paso».', meta: 3,
    cuenta: ({ marcas }) => marcas.identificar || 0 },
  { id: 'misterio-resuelto', titulo: 'Misterio resuelto', texto: 'Apunta qué era una seta de Mis misterios.', meta: 1,
    cuenta: ({ fotos }) => fotos.filter((f) => f.misterioResuelto).length },
  { id: 'amigo-gnomos', titulo: 'Amigo de los gnomos', texto: 'Encuentra tu primer gnomo.', meta: 1,
    cuenta: ({ juego }) => Object.keys(juego.coleccion || {}).length },
  { id: 'album-pueblo', titulo: 'Álbum del pueblo', texto: 'Reúne a los 8 gnomos comunes.',
    meta: GNOMOS.filter((g) => g.rareza === 'comun').length,
    cuenta: ({ juego }) => gnomosDe(juego, 'comun') },
  { id: 'nunca-visto', titulo: 'Lo nunca visto', texto: 'Encuentra a los 3 gnomos raros.',
    meta: GNOMOS.filter((g) => g.rareza === 'raro').length,
    cuenta: ({ juego }) => gnomosDe(juego, 'raro') },
  { id: 'gran-setero', titulo: 'El Gran Setero', texto: 'Encuentra al gnomo legendario. Solo sale en las Jornadas.', meta: 1,
    cuenta: ({ juego }) => gnomosDe(juego, 'legendario') }
];

/** datos: { fotos, juego, marcas, mortales: [ids] } → [{ id, titulo, texto, hecho, n, meta }] */
export function calcularLogros({ fotos = [], juego = {}, marcas = {}, mortales = [] }) {
  const validas = fotos.filter((f) => !f.repetida);
  const datos = { fotos: validas, juego, marcas, mortales };
  return LOGROS.map((l) => {
    const meta = typeof l.meta === 'function' ? l.meta(datos) : l.meta;
    const n = Math.min(l.cuenta(datos), meta);
    return { id: l.id, titulo: l.titulo, texto: l.texto, meta, n, hecho: meta > 0 && n >= meta };
  });
}
