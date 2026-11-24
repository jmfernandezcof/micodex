// Paso 4: hacer foto, apuntarla («crees que es…») y el Micodex («Vistas» y «Mis misterios»).
import { useEffect, useRef, useState } from 'preact/hooks';
import { Icono } from './iconos.jsx';
import { MiniSeta } from './foto-seta.jsx';
import { especies, especie, nombre, buscar, confusionesMortales } from './catalogo.js';
import { guardarFoto, asignarEspecie, marcarMisterio, borrarFoto, leerFoto, useFotos, useUrl } from './fotos.js';
import { Cabecera, TiraMortal, Banda } from './pantallas.jsx';
import { ListaLogros } from './logros.jsx';

const hora = (t) => new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
function cuando(t) {
  const d = new Date(t), hoy = new Date();
  if (d.toDateString() === hoy.toDateString()) return `Hoy, ${hora(t)}`;
  return `${d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}, ${hora(t)}`;
}

export function Mini({ foto, clase = 'mini' }) {
  const url = useUrl(foto?.mini);
  return url ? <img class={clase} src={url} alt="" /> : <span class={clase} />;
}

// ---------- Botón de cámara ----------
export function BotonFoto({ texto = 'Hacer foto' }) {
  const entrada = useRef(null);
  const [estado, setEstado] = useState('');
  async function alElegir(ev) {
    const archivo = ev.currentTarget.files?.[0];
    ev.currentTarget.value = '';
    if (!archivo) return;
    setEstado('guardando');
    try {
      const { id } = await guardarFoto(archivo);
      setEstado('');
      location.hash = `#/foto/${id}`;
    } catch {
      setEstado('error');
    }
  }
  return (
    <>
      <button type="button" class="btn btn-luz" disabled={estado === 'guardando'} onClick={() => entrada.current?.click()}>
        <Icono.foto />
        {estado === 'guardando' ? 'Guardando…' : texto}
      </button>
      <input ref={entrada} class="sr" type="file" accept="image/*" capture="environment" tabindex={-1} aria-hidden="true" onChange={alElegir} />
      {estado === 'error' && <p class="nota" role="alert">No se ha podido guardar la foto. Prueba otra vez.</p>}
    </>
  );
}

// ---------- Apuntar la foto ----------
export function useFoto(id) {
  const [foto, setFoto] = useState(undefined);
  useEffect(() => { leerFoto(id).then((f) => setFoto(f || null)); }, [id]);
  return foto;
}

export function Apuntar({ id }) {
  const foto = useFoto(id);
  const [consulta, setConsulta] = useState('');
  if (foto === undefined) return <Cabecera titulo="Tu foto" />;
  if (foto === null) return <><Cabecera titulo="Tu foto" volver="#/micodex" /><div class="cuerpo"><p>Esta foto ya no está en tu móvil.</p></div></>;
  const resultados = consulta.trim() ? buscar(consulta).slice(0, 8) : [];

  async function elegir(e) {
    const { gnomo } = await asignarEspecie(id, e.id);
    location.hash = gnomo ? `#/aparicion/${id}` : `#/foto/${id}/hecho`;
  }
  async function noLoSe() {
    await marcarMisterio(id);
    location.hash = '#/micodex/misterios';
  }

  return (
    <>
      <Cabecera titulo="¿Qué seta crees que es?" volver="#/" />
      <div class="cuerpo">
        <div class="tu-foto">
          <Mini foto={foto} />
          <div>
            <b>Tu foto</b>
            <p class="nota">{cuando(foto.fecha)} · guardada en tu móvil</p>
          </div>
        </div>
        {foto.repetida && <p class="nota">Esta foto se parece mucho a otra que ya tienes.</p>}
        <label class="buscador">
          <Icono.lupa />
          <span class="sr">Busca su nombre</span>
          <input type="search" placeholder="Busca su nombre" value={consulta} onInput={(ev) => setConsulta(ev.currentTarget.value)} autocomplete="off" enterkeyhint="search" />
        </label>
        {!consulta && <p class="nota pista-voz con-icono"><Icono.micro /><span>¿Mejor hablando? Toca el micrófono de tu teclado y di el nombre.</span></p>}
        {resultados.length > 0 && (
          <ul class="lista">
            {resultados.map((e) => (
              <li key={e.id}>
                <button type="button" class={e.mortal ? 'es-mortal' : ''} onClick={() => elegir(e)}>
                  <MiniSeta e={e} />
                  <span class="txt"><b>{nombre(e)}</b><i>{e.cientifico}</i></span>
                  {e.mortal && <span class="sello-mortal">MORTAL</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        {consulta.trim() && resultados.length === 0 && <p class="nota">No está en el catálogo. Puedes guardarla en Mis misterios.</p>}
        <p class="separa">o si no la encuentras</p>
        <a class="btn btn-sec" href={`#/identificar/${id}`}>
          Identificar paso a paso
        </a>
        <button type="button" class="btn btn-sec" onClick={noLoSe}>
          <Icono.misterio />
          <span>No lo sé<small>Guardar en Mis misterios</small></span>
        </button>
      </div>
    </>
  );
}

// ---------- Foto apuntada ----------
export function Apuntada({ id }) {
  const foto = useFoto(id);
  if (!foto) return <Cabecera titulo="Apuntada" />;
  const e = especie(foto.especie);
  if (!e) return <Apuntar id={id} />;
  const mortales = confusionesMortales(e);
  return (
    <>
      <Cabecera titulo="Apuntada en tu Micodex" />
      {e.mortal && <TiraMortal>MORTAL – no tocar ni consumir</TiraMortal>}
      {!e.mortal && mortales.length > 0 && <TiraMortal>Se confunde con una seta MORTAL ({mortales.map(nombre).join(', ')}). No tocar ni consumir.</TiraMortal>}
      <Banda />
      <div class="cuerpo">
        <div class="tu-foto">
          <Mini foto={foto} />
          <div>
            <b>Has marcado que crees que es {nombre(e)}</b>
            <p class="nota">Es tu sugerencia: la app no lo comprueba.</p>
          </div>
        </div>
        <a class="btn btn-sec" href={`#/setas/${e.id}`}>Ver la ficha</a>
        <BotonFoto texto="Hacer otra foto" />
        <a class="btn btn-sec" href="#/micodex">Ir a Mi Micodex</a>
      </div>
    </>
  );
}

// ---------- Mi Micodex ----------
export function Micodex({ pestana }) {
  const fotos = useFotos();
  if (!fotos) return <Cabecera titulo="Mi Micodex" />;
  const misterios = fotos.filter((f) => !f.especie);
  const ultimaDe = new Map();
  for (const f of fotos) if (f.especie && !ultimaDe.has(f.especie)) ultimaDe.set(f.especie, f);
  const vistas = especies.filter((e) => ultimaDe.has(e.id)).length;

  return (
    <>
      <Cabecera titulo="Mi Micodex" />
      <div class="cuerpo">
        <nav class="pestanas" aria-label="Micodex">
          {[['', 'Vistas'], ['misterios', `Mis misterios (${misterios.length})`], ['fotos', `Mis fotos (${fotos.length})`], ['logros', 'Logros']].map(([p, t]) => (
            <a key={p} href={`#/micodex${p && '/' + p}`} class={(pestana || '') === p ? 'activa' : ''} aria-current={(pestana || '') === p ? 'page' : undefined}>{t}</a>
          ))}
        </nav>
        {pestana === 'logros' ? (
          <ListaLogros />
        ) : pestana === 'fotos' ? (
          fotos.length === 0 ? (
            <p class="nota">Aquí verás todas tus fotos. Toca una para verla, cambiar qué seta es o borrarla.</p>
          ) : (
            <>
              <p class="nota">Toca una foto para verla, cambiar qué seta es o borrarla.</p>
              <ul class="lista">
                {[...fotos].sort((a, b) => b.fecha - a.fecha).map((f) => {
                  const e = especie(f.especie);
                  return (
                    <li key={f.id}>
                      <a href={`#/mifoto/${f.id}/fotos`}>
                        <Mini foto={f} />
                        <span class="txt"><b>{e ? nombre(e) : 'Seta misteriosa'}</b><i>{cuando(f.fecha)}</i></span>
                        <span class="enlace">Ver</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )
        ) : pestana === 'misterios' ? (
          misterios.length === 0 ? (
            <p class="nota">Aquí van las fotos de setas que no sabes qué son. Si un micólogo te dice cuál es, podrás apuntarla.</p>
          ) : (
            <>
              <p class="nota">Que no sepas qué es no dice nada sobre si es peligrosa. No la toques ni la consumas y enséñasela a un micólogo; en las Jornadas, en la mesa de clasificación.</p>
              <ul class="lista">
                {misterios.map((f) => (
                  <li key={f.id}>
                    <a href={`#/mifoto/${f.id}/misterios`}>
                      <Mini foto={f} />
                      <span class="txt"><b>Seta misteriosa</b><i>{cuando(f.fecha)}</i></span>
                      <span class="enlace">Ver</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )
        ) : (
          <>
            {fotos.length === 0 && (
              <div class="mision">
                <b>Tu primera misión: fotografía tu primera seta</b>
                <p class="nota">Cada especie que apuntes llenará uno de estos huecos.</p>
                <BotonFoto texto="Hacer mi primera foto" />
              </div>
            )}
            <p class="cuenta"><strong>{vistas} de {especies.length}</strong> <span>especies vistas</span></p>
            <ul class="rejilla">
              {especies.map((e, i) => {
                const f = ultimaDe.get(e.id);
                return (
                  <li key={e.id}>
                    {f ? (
                      <a class="hueco vista" href={`#/setas/${e.id}`} aria-label={`${nombre(e)}: vista`}>
                        <Mini foto={f} clase="hueco-img" />
                      </a>
                    ) : (
                      <span class="hueco" aria-label={`Especie ${i + 1}: aún no vista`}>{i + 1}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

// ---------- Tus fotos (en la ficha) y una foto ----------
export function TusFotos({ especieId }) {
  const fotos = useFotos();
  const mias = (fotos || []).filter((f) => f.especie === especieId);
  if (!mias.length) return null;
  return (
    <section class="seccion">
      <h3>Tus fotos ({mias.length})</h3>
      <div class="tus-fotos">
        {mias.map((f) => (
          <a key={f.id} href={`#/mifoto/${f.id}`} aria-label={`Tu foto del ${cuando(f.fecha)}`}>
            <Mini foto={f} clase="mini grande" />
          </a>
        ))}
      </div>
    </section>
  );
}

export function MiFoto({ id, desde }) {
  const foto = useFoto(id);
  const url = useUrl(foto?.montaje || foto?.blob);
  const [confirmar, setConfirmar] = useState(false);
  if (foto === undefined) return <Cabecera titulo="Tu foto" />;
  if (foto === null) return <><Cabecera titulo="Tu foto" volver="#/micodex" /><div class="cuerpo"><p>Esta foto ya no está en tu móvil.</p></div></>;
  const e = especie(foto.especie);
  const volver = desde === 'fotos' ? '#/micodex/fotos' : desde === 'misterios' || !e ? '#/micodex/misterios' : `#/setas/${e.id}`;
  async function borrar() {
    await borrarFoto(id);
    location.hash = volver;
  }
  return (
    <>
      <Cabecera titulo={e ? nombre(e) : 'Seta misteriosa'} volver={volver} />
      <div class="cuerpo">
        <figure class="retrato">{url && <img src={url} alt="Tu foto" />}<figcaption>{cuando(foto.fecha)} · solo en tu móvil</figcaption></figure>
        {foto.gnomo && <a class="btn btn-sec" href={`#/montaje/${id}`}>{foto.montaje ? 'Mover el gnomo o compartir' : 'Poner el gnomo en la foto'}</a>}
        <a class="btn btn-sec" href={`#/foto/${id}`}>{e ? 'Cambiar qué seta es' : 'Ya sé qué es'}</a>
        {confirmar ? (
          <div class="confirmar" role="alertdialog" aria-label="¿Borrar la foto?">
            <p><b>¿Borrar esta foto?</b> No se puede deshacer.</p>
            <button type="button" class="btn btn-peligro" onClick={borrar}>Sí, borrar</button>
            <button type="button" class="btn btn-sec" onClick={() => setConfirmar(false)}>No</button>
          </div>
        ) : (
          <button type="button" class="btn btn-sec" onClick={() => setConfirmar(true)}>Borrar foto</button>
        )}
      </div>
    </>
  );
}
