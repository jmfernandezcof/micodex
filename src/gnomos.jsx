import { useEffect, useState } from 'preact/hooks';
// Paso 6: aparición de gnomos y álbum.
import { Icono } from './iconos.jsx';
import { GNOMOS, RAREZA_TEXTO, gnomo } from './gnomos-datos.js';
import { useJuego, useFotos } from './fotos.js';
import { useFoto } from './micodex.jsx';
import { Cabecera } from './pantallas.jsx';
import { enDemo } from './demo.js';
import conIlustracion from './datos/gnomos-ilustraciones.json';

const ILUSTRADOS = new Set(conIlustracion);
export const tieneIlustracion = (id) => ILUSTRADOS.has(id);

const fraseActual = (g, veces) => g.frases[Math.min(Math.max(veces, 1), g.frases.length) - 1];

export function Ilustracion({ g, clase = 'hueco-ilus' }) {
  if (tieneIlustracion(g.id)) return <img class={clase} src={`/gnomos/${g.id}-cromo.webp`} alt={`Ilustración de ${g.nombre}`} />;
  return (
    <div class={`${clase} pendiente`} role="img" aria-label={`${g.nombre}: ilustración pendiente`}>
      <Icono.gnomos />
      <span>Ilustración pendiente</span>
    </div>
  );
}

const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Reloj en marcha del cromo: en la mesa se ve que es la app de verdad y no una captura (José, 18-nov).
function RelojVivo() {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <p class="reloj-vivo" aria-live="off">
      <i aria-hidden="true" />Ahora: {ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </p>
  );
}

// Resumen para quien revisa en la mesa (José, 18-nov): cuántas especies y entre qué horas se apuntaron.
// Muchas especies en pocos minutos delatan fotos al azar. Hooks antes de cualquier return.
function ResumenMicodex() {
  const fotos = useFotos();
  if (!fotos) return null;
  const apuntadas = fotos.filter((f) => f.especie);
  const especies = new Set(apuntadas.map((f) => f.especie)).size;
  if (!especies) return <p class="resumen-mesa">Sin especies apuntadas en el Micodex.</p>;
  const fechas = apuntadas.map((f) => f.fecha);
  const ini = new Date(Math.min(...fechas)), fin = new Date(Math.max(...fechas));
  const h = (d) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dm = (d) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const tramo = ini.toDateString() === fin.toDateString()
    ? `el ${dm(ini)}, entre las ${h(ini)} y las ${h(fin)}`
    : `entre el ${dm(ini)} a las ${h(ini)} y el ${dm(fin)} a las ${h(fin)}`;
  return <p class="resumen-mesa">{especies} {especies === 1 ? 'especie apuntada' : 'especies apuntadas'} en el Micodex, {tramo}.</p>;
}

// Cromo especial del Gran Setero: fecha y hora para enseñarlo en la mesa (sorteo de la organización).
function Sorteo({ primera }) {
  const d = new Date(primera);
  const fecha = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hora = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (enDemo) {
    // Cromo de la demostración: que nadie pueda usar una captura para el sorteo.
    return (
      <div class="sorteo sorteo-demo" role="note">
        <b>CROMO DE EJEMPLO · NO VALE PARA EL SORTEO</b>
        <RelojVivo />
        <p>Esto es el modo demostración. El Gran Setero de verdad solo se consigue jugando durante las Jornadas.</p>
      </div>
    );
  }
  return (
    <div class="sorteo" role="note">
      <b>Conseguido el {fecha} a las {hora}</b>
      <RelojVivo />
      <ResumenMicodex />
      <p>Enséñaselo a la organización en la mesa de las Jornadas, junto con las fotos de tu Micodex, para entrar en el sorteo. Enséñalo en la app, no en una captura: en la mesa verán que el reloj se mueve. Allí comprobarán también que tus fotos son de setas de verdad.</p>
    </div>
  );
}

// ---------- Aparición (tras hacer una foto) ----------
export function Aparicion({ fotoId }) {
  const foto = useFoto(fotoId);
  const juego = useJuego();
  if (!foto || !juego) return <div class="aparicion" />;
  const g = gnomo(foto.gnomo);
  if (!g) { location.hash = `#/foto/${fotoId}`; return null; }
  const veces = juego.coleccion[g.id]?.veces || 1;
  return (
    <div class={`aparicion rareza-${g.rareza}`}>
      <div class="velo" aria-hidden="true"><i class="niebla izq" /><i class="niebla der" /></div>
      <div class="cuerpo">
        <p class="titulo">{foto.gnomoNuevo ? 'Entre las setas, algo te mira…' : '¡Mira quién ha vuelto!'}</p>
        <Ilustracion g={g} />
        <p class="rareza">{RAREZA_TEXTO[g.rareza]}{foto.gnomoNuevo ? ' · ¡nuevo en tu álbum!' : ` · ${veces}.ª vez`}</p>
        <h1 class="nombre-gnomo">{mayus(g.nombre)}</h1>
        <blockquote class="susurro">«{fraseActual(g, veces)}»</blockquote>
        {!foto.gnomoNuevo && veces <= g.frases.length && <p class="nota">Has desbloqueado una frase nueva.</p>}
        {g.rareza === 'legendario' && <Sorteo primera={juego.coleccion[g.id].primera} />}
        <a class="btn btn-luz" href={`#/montaje/${fotoId}`}>Ponerlo en tu foto</a>
        <a class="btn btn-sec" href={`#/foto/${fotoId}/hecho`}>Seguir</a>
        <a class="btn btn-sec" href="#/gnomos">Ver mi álbum</a>
      </div>
    </div>
  );
}

// ---------- Álbum ----------
function pista(g) {
  if (g.rareza === 'legendario') return 'Solo en las Jornadas';
  if (g.soloNoche) return 'Solo de noche';
  return RAREZA_TEXTO[g.rareza];
}

export function Album() {
  const juego = useJuego();
  if (!juego) return <Cabecera titulo="Gnomos" />;
  const tengo = GNOMOS.filter((g) => juego.coleccion[g.id]).length;
  return (
    <>
      <Cabecera titulo="Mis gnomos" />
      <div class="cuerpo">
        <p class="cuenta"><strong>{tengo} de {GNOMOS.length}</strong> <span>gnomos en tu álbum</span></p>
        <p class="nota">A veces, al apuntar una seta, se asoma un gnomo. Si vuelve, te cuenta algo nuevo. Los gnomos son muy observadores: se asoman a quien se fija bien en las setas.</p>
        <ul class="album">
          {GNOMOS.map((g) => {
            const c = juego.coleccion[g.id];
            return (
              <li key={g.id} class={`rareza-${g.rareza}`}>
                {c ? (
                  <a href={`#/gnomos/${g.id}`} class="cromo">
                    <Ilustracion g={g} clase="cromo-img" />
                    <b>{mayus(g.nombre)}</b>
                    <span>{RAREZA_TEXTO[g.rareza]}{c.veces > 1 ? ` · ×${c.veces}` : ''}</span>
                  </a>
                ) : (
                  <div class="cromo vacio" aria-label={`Gnomo por descubrir: ${pista(g)}`}>
                    {tieneIlustracion(g.id)
                      ? <img class="cromo-img sombra" src={`/gnomos/${g.id}-cromo.webp`} alt="" />
                      : <span class="interroga" aria-hidden="true">?</span>}
                    <b>¿…?</b>
                    <span>{pista(g)}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

export function DetalleGnomo({ id }) {
  const juego = useJuego();
  const g = gnomo(id);
  if (!juego || !g) return <Cabecera titulo="Gnomos" volver="#/gnomos" />;
  const c = juego.coleccion[g.id];
  if (!c) { location.hash = '#/gnomos'; return null; }
  const desbloqueadas = g.frases.slice(0, Math.min(c.veces, g.frases.length));
  return (
    <>
      <Cabecera titulo={mayus(g.nombre)} volver="#/gnomos" />
      <div class={`cuerpo rareza-${g.rareza}`}>
        <Ilustracion g={g} />
        {g.rareza === 'legendario' && <Sorteo primera={c.primera} />}
        <p class="rareza">{RAREZA_TEXTO[g.rareza]} · le has visto {c.veces === 1 ? 'una vez' : `${c.veces} veces`}</p>
        <section class="seccion">
          <h3>Lo que te ha contado</h3>
          <ul class="frases">
            {desbloqueadas.map((f) => <li key={f}>«{f}»</li>)}
            {g.frases.length > desbloqueadas.length && (
              <li class="bloqueada">Le quedan {g.frases.length - desbloqueadas.length} cosas por contarte. Sigue haciendo fotos.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
