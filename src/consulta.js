// Limpia lo que se escribe o se DICTA en los buscadores (micrófono del teclado del móvil):
// sin tildes ni mayúsculas, sin signos («Níscalo.», «¿oronja verde?») y sin palabras de relleno
// («es un níscalo», «la seta de los caballeros»). Devuelve las palabras que deben coincidir.
const RELLENO = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'y', 'es', 'esta', 'esto', 'seta', 'setas', 'hongo', 'hongos', 'creo', 'que']);

export const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function palabrasConsulta(consulta) {
  const limpias = normalizar(consulta).replace(/[^a-zñ0-9\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
  const utiles = limpias.filter((p) => !RELLENO.has(p));
  return utiles.length ? utiles : limpias; // si solo dice «seta», que busque «seta»
}
