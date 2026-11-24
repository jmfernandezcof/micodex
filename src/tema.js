// Tema automático: «bosque de noche» (v2) o «Niebla del amanecer» (v4, Fila B),
// según el amanecer y el atardecer calculados para Saceruela. Sin GPS: coordenadas fijas.
const LAT = 38.9434;
const LON = -4.6083;
const RAD = Math.PI / 180;

// Ecuación del amanecer (https://en.wikipedia.org/wiki/Sunrise_equation), precisión de ±2 min.
export function solSaceruela(fecha = new Date()) {
  const jd = fecha.getTime() / 86400000 + 2440587.5;
  const n = Math.round(jd - 2451545.0 + 0.0008);
  const jEstrella = n - LON / 360;
  const M = (357.5291 + 0.98560028 * jEstrella) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lambda = (M + C + 180 + 102.9372) % 360;
  const jTransito = 2451545.0 + jEstrella + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
  const sinDec = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosW = (Math.sin(-0.833 * RAD) - Math.sin(LAT * RAD) * sinDec) / (Math.cos(LAT * RAD) * cosDec);
  const w = Math.acos(Math.min(1, Math.max(-1, cosW))) / RAD;
  const aFecha = (j) => new Date((j - 2440587.5) * 86400000);
  return { amanecer: aFecha(jTransito - w / 360), atardecer: aFecha(jTransito + w / 360) };
}

export function esDeNoche(fecha = new Date()) {
  const { amanecer, atardecer } = solSaceruela(fecha);
  return fecha < amanecer || fecha >= atardecer;
}

const COLOR_BARRA = { noche: '#0B1A1F', alba: '#DCE7EA' };

// Para probar: ?tema=noche o ?tema=alba fuerza el tema.
const forzado = new URLSearchParams(location.search).get('tema');

// Elección de la persona en «Ver mejor» (José, 18-nov): 'auto' (por defecto), 'alba' (día) o 'noche'.
// Solo cambia los colores: la Lucera sigue saliendo por la noche real (esDeNoche), no por el tema.
const CLAVE = 'setas-tema';
export function leerPreferenciaTema() {
  try { const v = localStorage.getItem(CLAVE); return v === 'alba' || v === 'noche' ? v : 'auto'; } catch { return 'auto'; }
}
export function elegirTema(v) {
  try {
    if (v === 'alba' || v === 'noche') localStorage.setItem(CLAVE, v); else localStorage.removeItem(CLAVE);
  } catch { /* sin almacenamiento: solo esta visita */ }
  preferencia = v === 'alba' || v === 'noche' ? v : 'auto';
  aplicarTema();
  return preferencia;
}
let preferencia = leerPreferenciaTema();

export function aplicarTema(fecha = new Date()) {
  const elegido = forzado === 'noche' || forzado === 'alba' ? forzado : preferencia !== 'auto' ? preferencia : null;
  const tema = elegido || (esDeNoche(fecha) ? 'noche' : 'alba');
  const html = document.documentElement;
  if (html.dataset.tema !== tema) {
    html.dataset.tema = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[tema]);
  }
  return tema;
}

export function iniciarTema() {
  aplicarTema();
  setInterval(aplicarTema, 5 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) aplicarTema();
  });
}
