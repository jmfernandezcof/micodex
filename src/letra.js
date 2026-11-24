// «Ver mejor»: tamaño de letra A / A+ / A++ (0, 1, 2) sobre el tema activo.
// Se recuerda en este móvil (localStorage); si el navegador no deja guardarlo, funciona igual sin recordar.
const CLAVE = 'setas-letra';

export function leerLetra() {
  try { return Number(localStorage.getItem(CLAVE)) || 0; } catch { return 0; }
}

export function aplicarLetra(n) {
  const v = Math.min(Math.max(Number(n) || 0, 0), 2);
  if (v) document.documentElement.dataset.letra = String(v);
  else delete document.documentElement.dataset.letra;
  try { localStorage.setItem(CLAVE, String(v)); } catch { /* sin almacenamiento: solo esta visita */ }
  return v;
}

export const iniciarLetra = () => aplicarLetra(leerLetra());

// «Borrar todos mis datos»: vuelve a la letra normal y no deja nada guardado.
export function olvidarLetra() {
  delete document.documentElement.dataset.letra;
  try { localStorage.removeItem(CLAVE); } catch { /* nada que borrar */ }
}
