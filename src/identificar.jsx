// Paso 5: «Identificar paso a paso». Ayuda a buscar en el catálogo con lo que se ve SIN TOCAR la seta.
// Nunca da un veredicto: muestra «podría ser una de estas» o «No lo sé».
import { useEffect, useState } from 'preact/hooks';
import { Icono } from './iconos.jsx';
import { MiniSeta } from './foto-seta.jsx';
import { especies, nombre } from './catalogo.js';
import { asignarEspecie, marcarMisterio, anotarIdentificar } from './fotos.js';
import { TiraMortal, Banda } from './pantallas.jsx';

// Las preguntas y reglas de esta ayuda aún no las ha revisado un micólogo (sí los datos de cada ficha).
// Poner a true cuando las revise.
const PREGUNTAS_REVISADAS = false;
const AVISO_SIN_REVISAR = 'Estas preguntas no las ha revisado un micólogo. Úsalas solo como pista.';

const NOSE = 'nose';

const PREGUNTAS = [
  {
    id: 'himenio',
    texto: 'Mira debajo del sombrero, sin tocarla. ¿Qué ves?',
    opciones: [
      { v: 'laminas', t: 'Láminas', d: 'Como hojas finas, en fila' },
      { v: 'poros', t: 'Poros', d: 'Como una esponja' },
      { v: 'aguijones', t: 'Pinchos', d: 'Como pequeños dientes' },
      { v: 'otro', t: 'No tiene sombrero normal', d: 'Bola, repisa en un árbol, coral…' },
      { v: NOSE, t: 'No lo sé' }
    ]
  },
  {
    id: 'volva',
    texto: '¿Se ve una bolsa o un bulbo con reborde en la base del pie?',
    ayuda: 'No la arranques ni escarbes: mira solo lo que se ve.',
    soloSi: (r) => r.himenio === 'laminas' || r.himenio === NOSE,
    opciones: [
      { v: 'si', t: 'Sí, se ve' },
      { v: 'no', t: 'No, el pie es normal' },
      { v: NOSE, t: 'No se ve', d: 'Está enterrada o tapada' }
    ]
  },
  {
    id: 'anillo',
    texto: '¿Tiene un anillo o una faldita en el pie?',
    soloSi: (r) => r.himenio === 'laminas' || r.himenio === NOSE,
    opciones: [
      { v: 'si', t: 'Sí' },
      { v: 'no', t: 'No' },
      { v: NOSE, t: 'No lo sé' }
    ]
  },
  {
    id: 'laminas',
    texto: '¿De qué color son las láminas?',
    soloSi: (r) => r.himenio === 'laminas' || r.himenio === NOSE,
    opciones: [
      { v: 'blancas', t: 'Blancas', d: 'O casi blancas' },
      { v: 'color', t: 'De color', d: 'Rosa, marrón, violeta, negro…' },
      { v: NOSE, t: 'No lo sé' }
    ]
  }
];

// Regla de la volva (aprobada) + extensión prudente: volva que no se ve con láminas blancas.
export function puedeSerMortal(r) {
  const conLaminas = r.himenio === 'laminas' || r.himenio === NOSE;
  if (!conLaminas) return false;
  if (r.volva === 'si') return true;
  if (r.anillo === 'si' && r.laminas === 'blancas') return true;
  if (r.volva === NOSE && r.laminas === 'blancas') return true;
  return false;
}

// Filtra el catálogo. Las mortales solo se descartan por lo que hay bajo el sombrero:
// la volva puede estar enterrada y el anillo puede perderse.
export function candidatas(r, lista = especies) {
  return lista
    .filter((e) => {
      const x = e.rasgos;
      if (r.himenio && r.himenio !== NOSE && x.himenio !== r.himenio) return false;
      if (e.mortal) return true;
      if (r.volva === 'si' && !x.volva) return false;
      if (r.volva === 'no' && x.volva) return false;
      if (r.anillo === 'si' && !x.anillo) return false;
      if (r.anillo === 'no' && x.anillo) return false;
      if (r.laminas && r.laminas !== NOSE && x.laminas !== r.laminas) return false;
      return true;
    })
    .sort((a, b) => Number(b.mortal) - Number(a.mortal));
}

const MAX = 8;

export function Identificar({ fotoId }) {
  const [resp, setResp] = useState({});
  const [paso, setPaso] = useState(0);
  const [todas, setTodas] = useState(false);
  const pendientes = PREGUNTAS.filter((p) => !p.soloSi || p.soloSi(resp));
  const p = pendientes[paso];
  const salir = fotoId ? `#/foto/${fotoId}` : '#/setas';
  // Logro «Detective de setas»: cuenta cada vez que se llega al resultado.
  const terminado = !p;
  useEffect(() => { if (terminado) anotarIdentificar(); }, [terminado]);

  function responder(v) {
    setResp({ ...resp, [p.id]: v });
    setPaso(paso + 1);
    window.scrollTo(0, 0);
  }
  function atras() {
    if (paso === 0) { location.hash = salir; return; }
    const anterior = pendientes[paso - 1];
    const r = { ...resp };
    delete r[anterior.id];
    setResp(r);
    setPaso(paso - 1);
  }

  if (p) {
    return (
      <>
        <header class="cab">
          <button type="button" class="volver" aria-label="Atrás" onClick={atras}><Icono.volver /></button>
          <h1>Paso a paso</h1>
        </header>
        <div class="cuerpo">
          <p class="nota">Pregunta {paso + 1} de {pendientes.length}</p>
          {paso === 0 && !PREGUNTAS_REVISADAS && <p class="nota">{AVISO_SIN_REVISAR}</p>}
          <h2 class="pregunta">{p.texto}</h2>
          {p.ayuda && <p class="nota">{p.ayuda}</p>}
          <div class="opciones">
            {p.opciones.map((o) => (
              <button key={o.v} type="button" class={`btn btn-sec opcion ${o.v === NOSE ? 'tenue' : ''}`} onClick={() => responder(o.v)}>
                <span>{o.t}{o.d && <small>{o.d}</small>}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  const peligro = puedeSerMortal(resp);
  const lista = candidatas(resp);

  async function esEsta(e) {
    const { gnomo } = await asignarEspecie(fotoId, e.id);
    location.hash = gnomo ? `#/aparicion/${fotoId}` : `#/foto/${fotoId}/hecho`;
  }
  async function misterio() {
    await marcarMisterio(fotoId);
    location.hash = '#/micodex/misterios';
  }

  const mortales = lista.filter((e) => e.mortal);
  const otras = lista.filter((e) => !e.mortal);
  const fila = (e) => (
    <li key={e.id} class="candidata">
      <a href={`#/setas/${e.id}`} class={e.mortal ? 'es-mortal' : ''}>
        <MiniSeta e={e} />
        <span class="txt"><b>{nombre(e)}</b><i>{e.cientifico}</i></span>
        {e.mortal && <span class="sello-mortal">MORTAL</span>}
      </a>
      {fotoId && <button type="button" class="btn btn-sec es-esta" onClick={() => esEsta(e)}>Creo que es esta</button>}
    </li>
  );

  return (
    <>
      <header class="cab">
        <button type="button" class="volver" aria-label="Atrás" onClick={atras}><Icono.volver /></button>
        <h1>Podría ser…</h1>
      </header>
      {peligro && <TiraMortal>Las setas con estas características pueden ser MORTALES. No la toques ni la consumas.</TiraMortal>}
      <Banda />
      <div class="cuerpo">
        {lista.length === 0 ? (
          <div class="aviso" role="note">
            <Icono.aviso />
            <div>
              <strong>No lo sé.</strong>
              <p>No encaja con ninguna seta del catálogo. Eso no dice nada sobre si es peligrosa: enséñasela a un micólogo; en las Jornadas, en la mesa de clasificación.</p>
            </div>
          </div>
        ) : (
          <>
            <p>Encaja con {lista.length === 1 ? 'esta seta' : `estas ${lista.length} setas`} del catálogo. <b>Es solo una ayuda: no lo confirma.</b> Compárala con cada ficha.</p>
            {mortales.length > 0 && (
              <>
                <h2 class="subtitulo-mortal">Antes de nada, comprueba que no es una de estas MORTALES</h2>
                <p class="nota">Salen siempre, aunque no se vea la volva o el anillo: la volva puede estar enterrada y el anillo puede perderse.</p>
                <ul class="lista">{mortales.map(fila)}</ul>
              </>
            )}
            <h2 class="subtitulo">{mortales.length > 0 ? 'Otras setas que encajan' : 'Setas que encajan'}</h2>
            {otras.length === 0 && <p class="nota">Ninguna otra seta del catálogo encaja.</p>}
            <ul class="lista">{(todas ? otras : otras.slice(0, MAX)).map(fila)}</ul>
            {otras.length > MAX && !todas && <button type="button" class="btn btn-sec" onClick={() => setTodas(true)}>Ver las {otras.length}</button>}
          </>
        )}
        {!PREGUNTAS_REVISADAS && <p class="nota">{AVISO_SIN_REVISAR}</p>}
        {fotoId && (
          <button type="button" class="btn btn-sec" onClick={misterio}>
            <Icono.misterio />
            <span>No lo sé<small>Guardar en Mis misterios</small></span>
          </button>
        )}
        <button type="button" class="btn btn-sec" onClick={() => { setResp({}); setPaso(0); setTodas(false); }}>Empezar otra vez</button>
      </div>
    </>
  );
}
