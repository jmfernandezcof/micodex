// Catálogo cerrado y validado (lo genera scripts/catalogo.mjs a partir de contenido/catalogo.csv).
import datos from './datos/catalogo.json';
import { normalizar, palabrasConsulta } from './consulta.js';

export const especies = [...datos.especies].sort((a, b) =>
  (a.comunes[0] || a.cientifico).localeCompare(b.comunes[0] || b.cientifico, 'es')
);

const porId = new Map(especies.map((e) => [e.id, e]));
export const especie = (id) => porId.get(id);

export const nombre = (e) => e.comunes[0] || e.cientifico;

// Especies mortales con las que se confunde esta (para el aviso rojo en su ficha).
export const confusionesMortales = (e) => e.confusiones.map(especie).filter((o) => o && o.mortal);

const indice = especies.map((e) => ({ e, texto: normalizar([e.cientifico, ...e.comunes].join(' ')) }));

export function buscar(consulta) {
  const palabras = palabrasConsulta(consulta);
  if (!palabras.length) return especies;
  return indice.filter(({ texto }) => palabras.every((p) => texto.includes(p))).map(({ e }) => e);
}

const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function textoMeses(meses) {
  if (!meses.length) return '';
  const consecutivos = meses.every((m, i) => i === 0 || m === meses[i - 1] + 1);
  if (consecutivos && meses.length > 1) return `De ${MESES_LARGOS[meses[0] - 1]} a ${MESES_LARGOS[meses[meses.length - 1] - 1]}`;
  return meses.map((m) => MESES_LARGOS[m - 1]).join(', ').replace(/^./, (c) => c.toUpperCase());
}
