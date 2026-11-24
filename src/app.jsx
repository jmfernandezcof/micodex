import { useEffect, useState } from 'preact/hooks';
import { Icono } from './iconos.jsx';
import { Inicio, Catalogo, Ficha } from './pantallas.jsx';
import { Apuntar, Apuntada, Micodex, MiFoto } from './micodex.jsx';
import { Identificar } from './identificar.jsx';
import { Aparicion, Album, DetalleGnomo } from './gnomos.jsx';
import { Montaje } from './montaje.jsx';
import { AvisoLogro } from './logros.jsx';
import { VerMejor, Privacidad, Creditos } from './info.jsx';
import { Urgencias } from './urgencias.jsx';
import { Programa } from './programa.jsx';
import { enDemo, salirDemo } from './demo.js';

// Rutas con hash (#/setas/amanita-phalloides): el botón «atrás» del móvil funciona
// y no hace falta configuración especial en nginx.
function useRuta() {
  const leer = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [ruta, setRuta] = useState(leer);
  useEffect(() => {
    const cambio = () => {
      setRuta(leer());
      window.scrollTo(0, 0);
    };
    addEventListener('hashchange', cambio);
    return () => removeEventListener('hashchange', cambio);
  }, []);
  return ruta;
}

function useConexion() {
  const [enLinea, setEnLinea] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setEnLinea(true);
    const off = () => setEnLinea(false);
    addEventListener('online', on);
    addEventListener('offline', off);
    return () => {
      removeEventListener('online', on);
      removeEventListener('offline', off);
    };
  }, []);
  return enLinea;
}

const PESTANAS = [
  { id: '', icono: Icono.foto, texto: 'Hacer foto' },
  { id: 'setas', icono: Icono.setas, texto: 'Setas' },
  { id: 'micodex', icono: Icono.micodex, texto: 'Mi Micodex' },
  { id: 'gnomos', icono: Icono.gnomos, texto: 'Gnomos' }
];

export function App() {
  const [seccion = '', id, extra] = useRuta();
  const enLinea = useConexion();

  let pantalla;
  if (seccion === 'setas' && id) pantalla = <Ficha id={decodeURIComponent(id)} />;
  else if (seccion === 'setas') pantalla = <Catalogo />;
  else if (seccion === 'foto' && id && extra === 'hecho') pantalla = <Apuntada id={Number(id)} />;
  else if (seccion === 'foto' && id) pantalla = <Apuntar id={Number(id)} />;
  else if (seccion === 'identificar') pantalla = <Identificar key={id || 'libre'} fotoId={id ? Number(id) : null} />;
  else if (seccion === 'mifoto' && id) pantalla = <MiFoto id={Number(id)} desde={extra} />;
  else if (seccion === 'micodex') pantalla = <Micodex pestana={id} />;
  else if (seccion === 'montaje' && id) pantalla = <Montaje fotoId={Number(id)} />;
  else if (seccion === 'aparicion' && id) pantalla = <Aparicion fotoId={Number(id)} />;
  else if (seccion === 'gnomos' && id) pantalla = <DetalleGnomo id={id} />;
  else if (seccion === 'gnomos') pantalla = <Album />;
  else if (seccion === 'ver-mejor') pantalla = <VerMejor />;
  else if (seccion === 'privacidad') pantalla = <Privacidad />;
  else if (seccion === 'urgencias') pantalla = <Urgencias />;
  else if (seccion === 'programa') pantalla = <Programa />;
  else if (seccion === 'creditos') pantalla = <Creditos />;
  else pantalla = <Inicio />;

  return (
    <div class="marco">
      {enDemo && <p class="franja-demo" role="status">Modo demostración <button type="button" onClick={salirDemo}>Salir</button></p>}
      {!enLinea && <p class="sin-red" role="status">Sin cobertura: la app sigue funcionando</p>}
      <main class="pantalla">{pantalla}</main>
      <AvisoLogro oculto={(seccion === 'micodex' && id === 'logros') || seccion === 'aparicion'} />
      <nav class="nav" aria-label="Secciones">
        {PESTANAS.map((t) => {
          const grupo = seccion === 'foto' || seccion === 'aparicion' || seccion === 'montaje' || (seccion === 'identificar' && id) ? '' : seccion === 'identificar' ? 'setas' : seccion === 'mifoto' ? 'micodex' : seccion;
          const activo = (grupo || '') === t.id;
          const Ico = t.icono;
          return (
            <a key={t.id} href={`#/${t.id}`} class={activo ? 'activo' : ''} aria-current={activo ? 'page' : undefined}>
              <Ico />
              <span>{t.texto}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
