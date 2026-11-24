// «Usar sin conexión» (interruptor en Inicio).
// La app, las 200 fichas con sus avisos y los gnomos van SIEMPRE en el precache del service worker
// (≈2,6 MB): sin red, la seguridad funciona aunque nadie toque nada.
// Las fotos de las fichas (≈15 MB) solo se guardan si la persona activa el interruptor: van a una
// caché propia (FOTOS) que el SW consulta primero (CacheFirst sin escribir, ver vite.config.js).
// Interruptor en «Sí» = existe esa caché. «No» = se borra. Nada sale del móvil.
import { useEffect, useRef, useState } from 'preact/hooks';
import { especies } from './catalogo.js';
import { anotarDescarga } from './fotos.js';

export const FOTOS = 'setas-fotos';
const urls = especies.filter((e) => e.foto).map((e) => `/fotos/${e.foto.archivo}`);
export const TOTAL = urls.length;

const hayCaches = () => typeof window !== 'undefined' && 'caches' in window;

async function contarGuardadas(cache) {
  const claves = await cache.keys();
  const guardadas = new Set(claves.map((r) => new URL(r.url).pathname));
  return urls.filter((u) => guardadas.has(u)).length;
}

export function useSinConexion() {
  // estado: 'comprobando' | 'no' | 'descargando' | 'cortado' | 'listo' | 'sin-soporte'
  const [estado, setEstado] = useState('comprobando');
  const [hechas, setHechas] = useState(0);
  const enMarcha = useRef(false);
  const tanda = useRef(0); // cambia con cada «Sí»/«No»: la descarga de una tanda anterior se para
  const relanzar = useRef(false);
  const vivo = useRef(true);

  async function descargar() {
    if (enMarcha.current) { relanzar.current = true; return; }
    enMarcha.current = true;
    const mia = tanda.current;
    try {
      const cache = await caches.open(FOTOS);
      const guardadas = new Set((await cache.keys()).map((r) => new URL(r.url).pathname));
      let n = urls.filter((u) => guardadas.has(u)).length;
      let fallos = 0;
      if (vivo.current) { setHechas(n); setEstado(n === TOTAL ? 'listo' : 'descargando'); }
      const pendientes = urls.filter((u) => !guardadas.has(u));
      const trabajar = async () => {
        while (pendientes.length) {
          if (tanda.current !== mia) return; // han cambiado el interruptor
          const u = pendientes.shift();
          try {
            const r = await fetch(u, { cache: 'no-cache' });
            if (!r.ok) throw new Error(String(r.status));
            if (tanda.current !== mia) return;
            await cache.put(u, r);
            n++;
            if (vivo.current) setHechas(n);
          } catch {
            fallos++;
          }
        }
      };
      await Promise.all([trabajar(), trabajar(), trabajar(), trabajar()]);
      if (tanda.current !== mia) return;
      if (n === TOTAL) anotarDescarga(); // logro «Preparado sin cobertura»
      if (vivo.current) setEstado(n === TOTAL ? 'listo' : fallos ? 'cortado' : 'descargando');
    } finally {
      enMarcha.current = false;
      if (relanzar.current) { relanzar.current = false; if (await caches.has(FOTOS)) descargar(); }
    }
  }

  useEffect(() => {
    vivo.current = true;
    if (!hayCaches()) { setEstado('sin-soporte'); return; }
    (async () => {
      if (!(await caches.has(FOTOS))) { if (vivo.current) setEstado('no'); return; }
      const n = await contarGuardadas(await caches.open(FOTOS));
      if (!vivo.current) return;
      setHechas(n);
      if (n === TOTAL) setEstado('listo');
      else if (navigator.onLine === false) setEstado('cortado');
      else descargar(); // se quedó a medias: sigue sola
    })();
    const alVolver = async () => { if (await caches.has(FOTOS)) descargar(); };
    window.addEventListener('online', alVolver);
    return () => { vivo.current = false; window.removeEventListener('online', alVolver); };
  }, []);

  async function cambiar(si) {
    if (!hayCaches()) return;
    tanda.current++;
    if (si) {
      await caches.open(FOTOS);
      try { await navigator.storage?.persist?.(); } catch { /* el navegador decide */ }
      setHechas(0);
      setEstado('descargando');
      descargar();
    } else {
      await caches.delete(FOTOS);
      setHechas(0);
      setEstado('no');
    }
  }

  return { estado, hechas, total: TOTAL, cambiar, reintentar: descargar };
}
