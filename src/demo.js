// Modo demostración: setas.nomadprompters.es/?demo=1
// Colección inventada (100 especies, misterios, los 12 gnomos y logros) para enseñar la app y grabar
// el vídeo. Vive en OTRA base de datos (BD_DEMO): nunca toca la colección real del móvil.
// Se recuerda solo en esta pestaña (sessionStorage): al cerrar la app o la pestaña, se sale solo.
const CLAVE = 'setas-demo';
export const BD_REAL = 'setas-saceruela';
const BD_DEMO = 'setas-saceruela-demo';

function calcular() {
  let pide = false;
  try { pide = new URLSearchParams(location.search).has('demo'); } catch { /* sin URL */ }
  try {
    if (pide) sessionStorage.setItem(CLAVE, '1');
    return sessionStorage.getItem(CLAVE) === '1';
  } catch {
    return pide; // sin sessionStorage: solo mientras la URL lo pida
  }
}

export const enDemo = calcular();
export const NOMBRE_BD = enDemo ? BD_DEMO : BD_REAL;

export function salirDemo() {
  try { sessionStorage.removeItem(CLAVE); } catch { /* nada */ }
  const borrar = indexedDB.deleteDatabase(BD_DEMO); // la BD real no se toca
  const ir = () => location.replace('/');
  borrar.onsuccess = ir; borrar.onerror = ir; borrar.onblocked = ir;
}
