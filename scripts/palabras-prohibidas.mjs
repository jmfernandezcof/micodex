// Regla dura de seguridad: ningún texto de la app habla de comer, cocinar ni recetas.
// Se usa en el validador del catálogo y, más adelante, en el de las frases de los gnomos.

// Raíces que se buscan al principio de una palabra (sin tildes, en minúsculas).
// "come" cubre "se come", "comer", "comestible"; "cocin" cubre "cocina", "cocinar"...
const RAICES = [
  'comestib', 'comible', 'comer', 'come', 'comed', 'comid', 'comia',
  'cocin', 'receta', 'guis', 'sabros', 'sabor', 'delicios', 'exquisit',
  'gastronom', 'culinari', 'frit', 'freir', 'plancha', 'revuelto', 'asad', 'asar',
  'manjar', 'apetitos', 'paladar', 'degust', 'alino', 'alinar', 'alinad', 'tapa', 'tapas',
  'buena para', 'bueno para', 'apta para', 'apto para', 'se puede tomar',
  'ingeri', 'ingier', 'ingest', 'consum'
];

// Excepciones: palabras que empiezan por una raíz prohibida pero no tienen que ver con comer.
const PERMITIDAS = new Set([
  'comedero', 'comentario', 'comentarios', 'comenzar', 'comienza', 'comienzan', 'comenzando',
  'cometa', 'cometas', 'tapadera', 'tapado', 'tapada', 'tapar', 'tapiz', 'tapia', 'tapias'
].map(quitarTildes));

export function quitarTildes(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function escaparRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Devuelve la lista de coincidencias prohibidas en `texto`.
 * `exentos`: nombres científicos que se borran antes de buscar (p. ej. "Lactarius deliciosus").
 */
export function buscarProhibidas(texto, exentos = []) {
  if (!texto) return [];
  let t = quitarTildes(String(texto));
  for (const nombre of exentos) {
    t = t.replace(new RegExp(escaparRegex(quitarTildes(nombre)), 'g'), ' ');
  }
  const encontradas = [];
  for (const raiz of RAICES) {
    const r = quitarTildes(raiz);
    const re = new RegExp(`(^|[^a-z0-9ñ])(${escaparRegex(r)}[a-zñ]*)`, 'g');
    let m;
    while ((m = re.exec(t))) {
      const palabra = m[2];
      if (PERMITIDAS.has(palabra)) continue;
      encontradas.push(palabra);
    }
  }
  return [...new Set(encontradas)];
}
