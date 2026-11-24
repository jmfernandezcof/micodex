import { useEffect, useState } from 'preact/hooks';
import { Icono, Silueta } from './iconos.jsx';
import { especies, especie, nombre, buscar, confusionesMortales, textoMeses } from './catalogo.js';
import { useSinConexion } from './descarga.js';
import { MiniSeta, miniatura } from './foto-seta.jsx';

// Anfitrión de la portada: el Caballero Saceruelo (maestro de ceremonias, NO coleccionable; no está en GNOMOS).
// WebP en public/anfitrion/ (maestro PNG en contenido/anfitrion/, original de Gemini en contenido/gnomos/originales/).
const ANFITRION = '/anfitrion/caballero-saceruelo.webp';
const MB_FOTOS = __MB_FOTOS__; // calculado en el build (vite.config.js)
import { BotonFoto, TusFotos } from './micodex.jsx';
import { anotarMortalLeida } from './fotos.js';
import { EnlaceUrgencias } from './urgencias.jsx';

export const TEXTO_BANDA = 'Esta app nunca indica si una seta se puede comer. Consulta siempre a un micólogo.';

export function Banda() {
  return (
    <div class="banda" role="note">
      <Icono.escudo />
      <span>{TEXTO_BANDA}</span>
    </div>
  );
}

export function TiraMortal({ children }) {
  return (
    <div class="mortal-tira" role="alert">
      <Icono.mortal />
      <span>{children}</span>
    </div>
  );
}

export function Cabecera({ titulo, volver }) {
  return (
    <header class="cab">
      {volver && (
        <a class="volver" href={volver} aria-label="Volver">
          <Icono.volver />
        </a>
      )}
      <h1>{titulo}</h1>
    </header>
  );
}

// ---------- Inicio ----------
function SinConexion() {
  const { estado, hechas, total, cambiar, reintentar } = useSinConexion();
  if (estado === 'sin-soporte' || estado === 'comprobando') return null;
  const si = estado !== 'no';
  const pct = total ? Math.round((hechas / total) * 100) : 0;
  return (
    <section class="descarga" aria-live="polite">
      <div class="tit">
        <span id="sin-conexion">Usar sin conexión</span>
        <button type="button" role="switch" aria-checked={si} aria-labelledby="sin-conexion" class={`interruptor ${si ? 'si' : ''}`} onClick={() => cambiar(!si)}>
          <i aria-hidden="true" />
          <b>{si ? 'Sí' : 'No'}</b>
        </button>
      </div>
      {estado === 'no' && (
        <p class="nota">Las fichas y los avisos funcionan siempre. Actívalo antes de salir al monte para tener también las fotos de las setas sin cobertura (unos {MB_FOTOS} MB, mejor con wifi).</p>
      )}
      {(estado === 'descargando' || estado === 'cortado') && (
        <>
          <div class="carga" role="progressbar" aria-label="Fotos de las setas descargadas" aria-valuemin="0" aria-valuemax={total} aria-valuenow={hechas}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <p class="nota">
            {estado === 'descargando'
              ? `Descargando fotos de las setas: ${hechas} de ${total}… Mejor con wifi. Si cierras la app, sigue al volver a abrirla.`
              : `Se ha cortado la descarga (${hechas} de ${total}). Seguirá sola cuando vuelvas a tener conexión.`}
          </p>
          {estado === 'cortado' && <button type="button" class="btn btn-sec" onClick={reintentar}>Reintentar ahora</button>}
        </>
      )}
      {estado === 'listo' && (
        <p class="nota con-icono"><Icono.hecho /><span>Listo: ya puedes usarla sin conexión.</span></p>
      )}
      <p class="nota">Tus fotos se quedan solo en tu móvil.</p>
    </section>
  );
}

export function Inicio() {
  return (
    <>
      <div class="monte">
        <svg class="pinos" viewBox="0 0 390 76" preserveAspectRatio="none" aria-hidden="true">
          <path class="p1" d="M0 76V52l14-14 8 8 10-22 12 18 9-12 13 20 10-30 12 24 9-10 12 18 11-26 13 22 8-8 12 16 10-28 13 26 9-12 12 16 11-22 12 20 10-14 13 18 9-20 12 22 10-12 12 16 10-26 12 24 9-8 12 14 11-18 11 16 8-6V76z" />
          <path class="p2" d="M0 76V64l18-10 14 8 20-12 16 10 22-8 18 10 20-12 18 10 24-8 16 10 20-12 18 8 22-10 18 12 20-8 18 10 22-12 20 10 18-6 16 8 12-4V76z" />
        </svg>
        <div class="monte-fila">
          <div>
            <h1>Setas de<br />Saceruela</h1>
            <p>Jornadas Micológicas · 27 y 28 de noviembre de 2026</p>
          </div>
          <img class="anfitrion" src={ANFITRION} alt="" />
        </div>
      </div>
      <div class="cuerpo">
        <p>Haz una foto a una seta y apúntala en tu Micodex. A veces, entre las setas, se asoma un gnomo.</p>
        <div class="aviso" role="note">
          <Icono.aviso />
          <div>
            <strong>Esta app no te dice si una seta se puede comer.</strong>
            <p>Puede equivocarse. Ante cualquier duda, pregunta a un micólogo.</p>
          </div>
        </div>
        <BotonFoto />
        <ol class="pasos">
          <li>Haz una foto a una seta, sin arrancarla.</li>
          <li>Dices qué seta crees que es. Si no lo sabes, va a «Mis misterios».</li>
          <li>Se apunta en tu Micodex… y a veces se asoma un gnomo.</li>
        </ol>
        <a class="btn btn-sec btn-programa" href="#/programa"><Icono.calendario /> Programa de las Jornadas</a>
        <SinConexion />
        <p class="nota con-icono">
          <Icono.cesta />
          <span>Para el juego basta una foto. Si recoges, hazlo con navaja, en cesta y respetando la normativa.</span>
        </p>
        <EnlaceUrgencias />
        <a class="btn btn-sec btn-letra" href="#/ver-mejor"><span aria-hidden="true">Aa</span> Ver mejor: letra y colores</a>
        <nav class="pie" aria-label="Información">
          <a href="#/privacidad">Privacidad</a>
          <a href="#/creditos">Créditos</a>
        </nav>
      </div>
    </>
  );
}

// ---------- Catálogo ----------
const Miniatura = MiniSeta;

export function Catalogo() {
  const [consulta, setConsulta] = useState('');
  const lista = buscar(consulta);
  return (
    <>
      <Cabecera titulo="Setas" />
      <div class="cuerpo">
        <label class="buscador">
          <Icono.lupa />
          <span class="sr">Buscar una seta</span>
          <input
            type="search"
            placeholder="Buscar una seta"
            value={consulta}
            onInput={(ev) => setConsulta(ev.currentTarget.value)}
            autocomplete="off"
            enterkeyhint="search"
          />
        </label>
        {!consulta && <p class="nota pista-voz con-icono"><Icono.micro /><span>¿Mejor hablando? Toca el micrófono de tu teclado y di el nombre.</span></p>}
        <p class="nota" aria-live="polite">
          {lista.length === especies.length ? `${especies.length} setas en el catálogo` : `${lista.length} de ${especies.length}`}
        </p>
        {lista.length === 0 && (
          <div class="aviso" role="note">
            <Icono.aviso />
            <div>
              <strong>No está en el catálogo de la app.</strong>
              <p>Eso no dice nada sobre si es peligrosa. No la toques ni la consumas y enséñasela a un micólogo.</p>
            </div>
          </div>
        )}
        <a class="btn btn-sec" href="#/identificar">¿No sabes cuál es? Identificar paso a paso</a>
        <ul class="lista">
          {lista.map((e) => (
            <li key={e.id}>
              <a href={`#/setas/${e.id}`} class={e.mortal ? 'es-mortal' : ''}>
                <Miniatura e={e} />
                <span class="txt">
                  <b>{nombre(e)}</b>
                  <i>{e.cientifico}</i>
                </span>
                {e.mortal && <span class="sello-mortal">MORTAL</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ---------- Ficha ----------
function Meses({ meses }) {
  return (
    <div class="meses" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <i key={i} class={meses.includes(i + 1) ? 'si' : ''} />
      ))}
    </div>
  );
}

// Foto grande de la ficha. Sin red y sin «Usar sin conexión», la miniatura ampliada (siempre está).
// Componente propio con key={e.id}: el estado de «falla» empieza limpio en cada ficha sin carreras.
function RetratoSeta({ e }) {
  const [falla, setFalla] = useState(false);
  if (!e.foto) {
    return (
      <figure class="retrato">
        <Silueta forma={e.silueta} clase="glifo" />
        <figcaption>Foto pendiente</figcaption>
      </figure>
    );
  }
  return (
    <figure class="retrato">
      {falla
        ? <img class="baja" src={miniatura(e)} alt={`Foto de ${nombre(e)}`} decoding="async" />
        : <img src={`/fotos/${e.foto.archivo}`} alt={`Foto de ${nombre(e)}`} decoding="async" onError={() => setFalla(true)} />}
      <figcaption>
        Foto: {e.foto.autor} · {e.foto.licencia}
        {falla && '. Se ve en pequeño porque no tienes conexión. Para verla bien sin conexión, activa «Usar sin conexión» en Inicio.'}
      </figcaption>
    </figure>
  );
}

export function Ficha({ id }) {
  const e = especie(id);
  // Logro «Sabe lo que no se toca»: abrir la ficha de cada mortal.
  useEffect(() => { if (e?.mortal) anotarMortalLeida(e.id); }, [id]);
  if (!e) {
    return (
      <>
        <Cabecera titulo="No encontrada" volver="#/setas" />
        <div class="cuerpo"><p>Esta seta no está en el catálogo.</p></div>
      </>
    );
  }
  const mortalesParecidas = confusionesMortales(e);
  return (
    <>
      <Cabecera titulo={nombre(e)} volver="#/setas" />
      {e.mortal && <TiraMortal>MORTAL – no tocar ni consumir</TiraMortal>}
      {!e.mortal && mortalesParecidas.length > 0 && (
        <TiraMortal>
          Se confunde con una seta MORTAL ({mortalesParecidas.map(nombre).join(', ')}). No tocar ni consumir.
        </TiraMortal>
      )}
      <Banda />
      <div class="cuerpo ficha">
        <RetratoSeta key={e.id} e={e} />
        <div class="nombres">
          <h2 lang="la">{e.cientifico}</h2>
          {e.revisada ? (
            <span class="revision ok">Revisada por {e.revisada.por}</span>
          ) : (
            <span class="revision">Pendiente de revisión</span>
          )}
          <p>{e.comunes.join(', ')}</p>
        </div>
        <section class="seccion">
          <p><span class="entrada">Cómo es.</span> {e.descripcion}</p>
        </section>
        <div class="datos">
          <div><b>Hábitat</b><span>{e.habitat}</span></div>
          <div>
            <b>Temporada</b>
            <span>{textoMeses(e.meses)}</span>
            <Meses meses={e.meses} />
          </div>
        </div>
        {e.confusiones.length > 0 && (
          <section class="seccion">
            <h3>Se confunde con…</h3>
            <div class="confunden">
              {e.confusiones.map(especie).filter(Boolean).map((o) => (
                <a key={o.id} class={`confunde ${o.mortal ? 'es-mortal' : ''}`} href={`#/setas/${o.id}`}>
                  <MiniSeta e={o} />
                  <div>
                    <b>{nombre(o)}</b>
                    <span>{o.cientifico}</span>
                    {o.mortal && <em class="sello-mortal">MORTAL</em>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
        <TusFotos especieId={e.id} />
        {(e.mortal || mortalesParecidas.length > 0) && <EnlaceUrgencias />}
        {e.revisada && <p class="nota">Ficha revisada por {e.revisada.por} el {e.revisada.fecha.split('-').reverse().join('/')}.</p>}
      </div>
    </>
  );
}

// ---------- Provisionales ----------
export function Provisional({ titulo, texto }) {
  return (
    <>
      <Cabecera titulo={titulo} />
      <div class="cuerpo"><p>{texto}</p></div>
    </>
  );
}
