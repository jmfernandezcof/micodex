// Tirada de gnomos (lógica pura, sin navegador: se prueba con node:test).
// Reglas (José, 2026-11-16 y 17): «suerte creciente» (sin número fijo: cada foto sin gnomo sube la
// probabilidad de la siguiente); 80/20 común/raro; 70 % uno que no tienes; repetidos desbloquean frases;
// máx. 15 tiradas al día.
// La Lucera (rara) solo de noche. El Gran Setero solo en las fechas de las Jornadas.
import { GNOMOS, JORNADAS } from './gnomos-datos.js';

export const REGLAS = {
  // 8 % + 7 % por cada foto seguida sin gnomo (8, 15, 22, 29…). De media, uno cada 4-5 fotos.
  probBase: 0.08,
  incremento: 0.07,
  probRaro: 0.2,
  probNuevo: 0.7,
  maxDia: 15,
  // Gran Setero (José, 2026-11-17): solo en las Jornadas y solo si ya tienes 4 gnomos distintos.
  // Entonces, cada vez que aparece un gnomo, es el legendario con un 50 %. Quien lo consigue entra
  // en el sorteo de la organización (lo enseña en la mesa; la app no recoge datos).
  gnomosParaLegendario: 4,
  probLegendario: 0.5
};

const dia = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const esJornadas = (t) => JORNADAS.some((j) => dia(t) >= j.desde && dia(t) <= j.hasta);

export const probAparicion = (sinGnomo) => Math.min(1, REGLAS.probBase + REGLAS.incremento * sinGnomo);

export const estadoInicial = () => ({ sinGnomo: 0, hoy: null, tiradasHoy: 0, fotosJornadas: 0, coleccion: {} });

/**
 * Devuelve { estado, gnomo } sin modificar el estado recibido.
 * `aleatorio` se inyecta para poder probarlo.
 */
export function tirar(estadoPrevio, { ahora = Date.now(), noche = false, aleatorio = Math.random } = {}) {
  const e = structuredCloneSeguro(estadoPrevio || estadoInicial());
  const hoy = dia(ahora);
  if (e.hoy !== hoy) { e.hoy = hoy; e.tiradasHoy = 0; }
  if (e.tiradasHoy >= REGLAS.maxDia) return { estado: e, gnomo: null, limite: true };
  e.tiradasHoy++;
  const jornadas = esJornadas(ahora);
  if (jornadas) e.fotosJornadas++;

  const aparece = aleatorio() < probAparicion(e.sinGnomo);
  if (!aparece) { e.sinGnomo++; return { estado: e, gnomo: null }; }
  e.sinGnomo = 0;

  let elegido;
  const tieneLegendario = Boolean(e.coleccion['gran-setero']);
  const distintos = Object.keys(e.coleccion).filter((id) => id !== 'gran-setero').length;
  if (jornadas && !tieneLegendario && distintos >= REGLAS.gnomosParaLegendario && aleatorio() < REGLAS.probLegendario) {
    elegido = 'gran-setero';
  } else {
    const rareza = aleatorio() < REGLAS.probRaro ? 'raro' : 'comun';
    const grupo = GNOMOS.filter((g) => g.rareza === rareza && (!g.soloNoche || noche));
    const nuevos = grupo.filter((g) => !e.coleccion[g.id]);
    const bolsa = nuevos.length && aleatorio() < REGLAS.probNuevo ? nuevos : grupo;
    elegido = bolsa[Math.floor(aleatorio() * bolsa.length)].id;
  }
  const previo = e.coleccion[elegido];
  e.coleccion[elegido] = { veces: (previo?.veces || 0) + 1, primera: previo?.primera || ahora };
  return { estado: e, gnomo: elegido, nuevo: !previo };
}

function structuredCloneSeguro(o) {
  return JSON.parse(JSON.stringify(o));
}

/**
 * Regla contra las fotos al azar (José, 2026-11-18): la app no sabe qué hay en la foto, así que
 * el sorteo no se hace al hacer la foto, sino al apuntar qué seta crees que es, y solo:
 *  - si la foto no es repetida y no ha sorteado ya (cambiar de especie no da otro sorteo);
 *  - si es la primera foto que sortea con esa especie (20 selfies «champiñón» = 1 sorteo).
 * «No lo sé → Mis misterios» no sortea; al resolver el misterio, sí (si es la primera de su especie).
 */
export function daSorteo(foto, fotos, especie) {
  if (!especie || !foto || foto.repetida || foto.sorteo || foto.gnomo) return false;
  return !fotos.some((f) => f.id !== foto.id && f.sorteo?.especie === especie);
}
