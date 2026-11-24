import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app.jsx';
import { iniciarTema } from './tema.js';
import { iniciarLetra } from './letra.js';
import { enDemo } from './demo.js';
import './styles.css';

iniciarTema();
iniciarLetra();
render(<App />, document.getElementById('app'));
if (enDemo) import('./demo-datos.js').then((m) => m.rellenarDemo());

// Service worker: precachea la app para que funcione sin cobertura.
// autoUpdate: la versión nueva se activa sola al recargar; no molestamos al usuario.
registerSW({ immediate: true });
