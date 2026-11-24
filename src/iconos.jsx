// Iconos y siluetas (trazos del mockup aprobado). Todos decorativos: aria-hidden.
const trazo = { fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };

export const Icono = {
  calendario: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  foto: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.2"><rect x="3" y="8" width="22" height="15" rx="4" /><path d="M10 8l1.5-3h5L18 8" /><circle cx="14" cy="15.5" r="4.2" /></g></svg>
  ),
  setas: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.2"><path d="M4 14c0-5.5 4.5-9 10-9s10 3.5 10 9z" /><path d="M11 14v9h6v-9" /></g></svg>
  ),
  micodex: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="8.5" cy="8.5" r="4.5" /><circle cx="19.5" cy="8.5" r="4.5" fill="currentColor" /><circle cx="8.5" cy="19.5" r="4.5" /><circle cx="19.5" cy="19.5" r="4.5" /></g></svg>
  ),
  gnomos: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.2"><path d="M3 14c0-6 5-10 11-10s11 4 11 10c-3 1.5-19 1.5-22 0z" /><path d="M8 16c-.5 4 0 6 1 8h10c1-2 1.5-4 1-8" /></g><circle cx="11" cy="19.5" r="1.7" fill="currentColor" /><circle cx="17" cy="19.5" r="1.7" fill="currentColor" /></svg>
  ),
  volver: () => (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4l-8 8 8 8" {...trazo} stroke-width="2.6" /></svg>
  ),
  aviso: () => (
    <svg viewBox="0 0 30 30" aria-hidden="true"><path d="M15 3.5L27.5 25.5h-25z" {...trazo} stroke-width="2.4" /><path d="M15 11.5v7" {...trazo} stroke-width="2.6" /><circle cx="15" cy="22" r="1.6" fill="currentColor" /></svg>
  ),
  escudo: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3l9 3.5V13c0 6-4 10-9 12-5-2-9-6-9-12V6.5z" {...trazo} stroke-width="2.3" /><path d="M14 9v6.5" {...trazo} stroke-width="2.5" /><circle cx="14" cy="19.5" r="1.5" fill="currentColor" /></svg>
  ),
  bajar: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.3"><path d="M14 4v13M8.5 12l5.5 5.5 5.5-5.5" /><path d="M5 19v4h18v-4" /></g></svg>
  ),
  micro: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.2"><rect x="10" y="3" width="8" height="14" rx="4" /><path d="M6 13a8 8 0 0 0 16 0M14 21v4M10 25h8" /></g></svg>
  ),
  hecho: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><path d="M5 14.5l6 6L23 8" {...trazo} stroke-width="2.8" /></svg>
  ),
  cesta: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.2"><path d="M4 12h20l-2.5 11h-15z" /><path d="M8 12c0-5 2.7-8 6-8s6 3 6 8" /><path d="M10 16v4M14 16v4M18 16v4" /></g></svg>
  ),
  lupa: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.4"><circle cx="12" cy="12" r="7" /><path d="M17.5 17.5L24 24" /></g></svg>
  ),
  misterio: () => (
    <svg viewBox="0 0 28 28" aria-hidden="true"><g {...trazo} stroke-width="2.3"><circle cx="14" cy="14" r="11" /><path d="M10.5 11a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3" /></g><circle cx="14" cy="20.4" r="1.5" fill="currentColor" /></svg>
  ),
  mortal: () => (
    <svg viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="15.5" fill="#fff" /><path d="M17 8.5v11" stroke="#A3141A" stroke-width="4" stroke-linecap="round" /><circle cx="17" cy="25" r="2.4" fill="#A3141A" /></svg>
  )
};

// Siluetas por forma (columna «silueta» del catálogo).
const SILUETAS = {
  volva: <g><path d="M7 22c0-9 8-15 17-15s17 6 17 15z" /><path d="M20 22v16M28 22v16" /><path d="M18 28h12" /><path d="M15 41c1-4 5-4 9-4s8 0 9 4z" /></g>,
  parasol: <g><path d="M6 15c4-6 11-9 18-9s14 3 18 9z" /><path d="M24 15v28" /><path d="M19 21h10" /><path d="M19 43h10" /></g>,
  plana: <g><path d="M5 19c2-6 10-9 19-9s17 3 19 9c-6 2-32 2-38 0z" /><path d="M19 21v19h10V21" /></g>,
  embudo: <g><path d="M6 10c6 3 30 3 36 0L27 24h-6z" /><path d="M21 24v17h6V24" /></g>,
  boleto: <g><path d="M6 22c0-9 8-14 18-14s18 5 18 14z" /><path d="M15 22c-2 8-1 15 3 19h12c4-4 5-11 3-19" /></g>,
  repisa: <g><path d="M8 8v32" /><path d="M8 14c10 0 26 2 32 8-8 2-24 2-32-2" /><path d="M8 28c8 0 20 1 26 6-6 2-18 1-26-1" /></g>,
  bola: <g><circle cx="24" cy="24" r="14" /><path d="M14 38c4 2 16 2 20 0" /></g>,
  otra: <g><path d="M8 22c0-9 7-15 16-15s16 6 16 15z" /><path d="M20 22v18h8V22" /></g>
};

export function Silueta({ forma, clase }) {
  return (
    <svg class={clase} viewBox="0 0 48 48" aria-hidden="true">
      <g {...trazo} stroke-width="2">{SILUETAS[forma] || SILUETAS.otra}</g>
    </svg>
  );
}
