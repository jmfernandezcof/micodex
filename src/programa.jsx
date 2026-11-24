// Programa de las XXIX Jornadas (cartel que pasó José el 2026-11-20) y consejos para el monte.
// Solo texto: funciona sin cobertura. El día de hoy se resalta solo.
import { Cabecera } from './pantallas.jsx';
import { Icono } from './iconos.jsx';

const INSCRIPCION = { texto: '926 77 99 00', tel: '+34926779900' };

const DIAS = [
  {
    fecha: '2026-11-27',
    nombre: 'Viernes 27',
    lugar: 'Aula Rodríguez de la Rubia · E.T.S.I. Agronómica',
    actos: [
      { h: '17:30', t: 'Presentación de las XXIX Jornadas Micológicas y del Medio Ambiente de Saceruela' },
      { h: '18:00', t: 'Conferencia: «Introducción a la micología»', q: 'D. Juan Antonio Campos, exprofesor de la ETSIA' },
      { h: '18:45', t: 'Conferencia: «Tesoro bajo la tierra, Tuber melanosporum»', q: 'D. Emilio José Fernández Rosa, técnico en truficultura' },
      { h: '20:00', t: 'Aperitivo ofrecido por el Excmo. Ayuntamiento de Saceruela', q: 'En la cafetería del centro' }
    ]
  },
  {
    fecha: '2026-11-28',
    nombre: 'Sábado 28',
    lugar: 'Excursión micológica a los pinares y dehesas de Saceruela',
    actos: [
      { h: '9:30', t: 'Inscripción e inauguración de las Jornadas', q: 'Por el Excmo. Alcalde de Saceruela, José Fernández Teno' },
      { h: '10:00', hasta: '10:30', t: 'Charla coloquio: recomendaciones y consejos para salir a buscar setas', q: 'D. Domingo Cózar, experto micólogo' },
      { h: '10:30', t: 'Excursión a los pinares y dehesas de Saceruela', foto: true },
      { h: '13:30', t: 'Migas camperas en el Pabellón Municipal' },
      {
        h: '16:30',
        t: 'Clasificación de las setas recolectadas',
        q: 'Rodrigo Márquez, Domingo Cózar y Juan A. Campos',
        extra: [
          'Elaboración y montaje de la exposición de setas.',
          'Exposición de los trabajos de los alumnos del Colegio Virgen de las Cruces, coordinados por D. Germán Díaz Pérez.'
        ],
        cromo: true
      }
    ]
  }
];

const CONSEJOS = [
  'Avisa a alguien de por dónde vas a ir y a qué hora piensas volver.',
  'Lleva el móvil cargado, agua y ropa de abrigo: en noviembre refresca pronto.',
  'Con niebla o al caer la tarde, vuelve por caminos que conozcas.',
  'Respeta las fincas: cierra las cancelas y no molestes al ganado.',
  'Para el juego basta una foto. Si recoges, hazlo con navaja, en cesta y respetando la normativa.'
];

const hoy = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function Programa() {
  const h = hoy();
  return (
    <>
      <Cabecera titulo="Programa" volver="#/" />
      <div class="cuerpo programa">
        <div class="prog-cabecera">
          <p class="prog-edicion">XXIX Jornadas Micológicas<br />y del Medio Ambiente de Saceruela</p>
          <p class="prog-fechas">27 y 28 de noviembre de 2026</p>
        </div>

        {DIAS.map((d) => (
          <section key={d.fecha} class={`prog-dia ${d.fecha === h ? 'es-hoy' : ''}`} aria-label={d.nombre}>
            <h2>{d.nombre}{d.fecha === h && <span class="prog-hoy">Hoy</span>}</h2>
            <p class="prog-lugar">{d.lugar}</p>
            <ol class="prog-actos">
              {d.actos.map((a) => (
                <li key={a.h}>
                  <time>{a.h}{a.hasta && <><br />a {a.hasta}</>}</time>
                  <div>
                    <b>{a.t}</b>
                    {a.q && <span>{a.q}</span>}
                    {a.extra?.map((x) => <span key={x}>{x}</span>)}
                    {a.foto && <a class="prog-pista" href="#/"><Icono.foto /> Hazles fotos y apúntalas en tu Micodex</a>}
                    {a.cromo && <a class="prog-pista" href="#/gnomos"><Icono.gnomos /> ¿Tienes el cromo del Gran Setero? Enséñalo en la mesa, en la app</a>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <div class="prog-inscripcion">
          <b>Plazas limitadas, por orden de inscripción.</b>
          <a class="btn btn-sec" href={`tel:${INSCRIPCION.tel}`}>Inscripciones: <span class="nowrap">{INSCRIPCION.texto}</span></a>
        </div>
        <p class="nota">Programa de la organización. Puede haber cambios: confírmalos en el teléfono de inscripciones.</p>

        <section class="prog-consejos">
          <h2>Antes de salir al monte</h2>
          <ul>{CONSEJOS.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
      </div>
    </>
  );
}
