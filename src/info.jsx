// Paso 11: «Ver mejor», aviso de privacidad y créditos.
import { useState } from 'preact/hooks';
import { especies, nombre } from './catalogo.js';
import { borrarTodo } from './fotos.js';
import { leerLetra, aplicarLetra, olvidarLetra } from './letra.js';
import { FOTOS } from './descarga.js';
import { enDemo } from './demo.js';
import { leerPreferenciaTema, elegirTema } from './tema.js';
import { Cabecera, Banda } from './pantallas.jsx';

const CONTACTO = 'jmfernandezcfo@gmail.com';

// ---------- Ver mejor ----------
const TAMANOS = [
  { v: 0, t: 'A', d: 'Normal' },
  { v: 1, t: 'A+', d: 'Grande' },
  { v: 2, t: 'A++', d: 'Muy grande' }
];

const COLORES = [
  { v: 'auto', t: 'Automático' },
  { v: 'alba', t: 'Día' },
  { v: 'noche', t: 'Noche' }
];

export function VerMejor() {
  const [letra, setLetra] = useState(leerLetra);
  const [tema, setTema] = useState(leerPreferenciaTema);
  return (
    <>
      <Cabecera titulo="Ver mejor" volver="#/" />
      <div class="cuerpo">
        <p>Elige el tamaño de la letra. Se queda guardado en este móvil.</p>
        <div class="ver-mejor" role="group" aria-label="Tamaño de la letra">
          {TAMANOS.map((o) => (
            <button key={o.v} type="button" class={`a${o.v}`} aria-pressed={letra === o.v} aria-label={`Letra ${o.d.toLowerCase()}`} onClick={() => setLetra(aplicarLetra(o.v))}>
              {o.t}
            </button>
          ))}
        </div>
        <h2>Colores</h2>
        <div class="ver-mejor colores" role="group" aria-label="Colores">
          {COLORES.map((o) => (
            <button key={o.v} type="button" aria-pressed={tema === o.v} onClick={() => setTema(elegirTema(o.v))}>
              {o.t}
            </button>
          ))}
        </div>
        <p class="nota">En «Automático», los colores cambian solos: de noche, tonos oscuros; de día, claros para leer con sol. Se queda guardado en este móvil.</p>
        <Banda />
        <a class="btn btn-luz" href="#/">Listo</a>
      </div>
    </>
  );
}

// ---------- Privacidad ----------
export function Privacidad() {
  const [estado, setEstado] = useState('');
  async function borrar() {
    if (!confirm('¿Borrar todo lo de la app en este móvil? Tus fotos, tu Micodex, tus gnomos, tus logros, las fotos de setas descargadas, el tamaño de letra y los colores elegidos. No se puede deshacer.')) return;
    await borrarTodo();
    if (!enDemo) { // en la demostración no se tocan las fotos descargadas ni la letra reales
      try { await caches.delete(FOTOS); } catch { /* sin Cache API */ }
      olvidarLetra();
      elegirTema('auto');
    }
    setEstado('borrado');
  }
  return (
    <>
      <Cabecera titulo="Privacidad" volver="#/" />
      <div class="cuerpo legal">
        <p><b>Resumen: tus fotos y tu colección se quedan en tu móvil. No pedimos tu nombre, no usamos cookies ni contamos lo que haces.</b></p>

        <h2>Quién es el responsable</h2>
        <p>Nomad Prompters, que ha hecho esta app para las Jornadas Micológicas de Saceruela. Para cualquier duda: <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>.</p>

        <h2>Qué datos se guardan</h2>
        <ul>
          <li><b>Tus fotos, tu Micodex, tus gnomos y tus logros</b> se guardan solo en este móvil, dentro del navegador. No se envían a ningún sitio y nosotros no podemos verlos.</li>
          <li>Al guardar una foto, la app la vuelve a dibujar más pequeña. Así se borran los datos ocultos de la cámara, <b>incluida la ubicación</b>.</li>
          <li>La app no pide tu ubicación, ni tu nombre, ni crea cuentas.</li>
          <li>Sin cookies, sin estadísticas de uso y sin publicidad. Todo (también las letras y las imágenes) sale de nuestro servidor, sin servicios de terceros.</li>
          <li>El tamaño de letra elegido en «Ver mejor» se recuerda en este móvil.</li>
          <li>Para funcionar sin cobertura, la app guarda en el móvil sus fichas y los dibujos de los gnomos. Si activas «Usar sin conexión», guarda también las fotos de las setas; al desactivarlo se borran. Nada de eso contiene datos tuyos.</li>
        </ul>

        <h2>Al abrir la web</h2>
        <p>Como en cualquier web, para enviarte la app nuestro servidor recibe la dirección IP de tu conexión y el tipo de navegador. Pasan por Cloudflare, que protege y entrega la web. Esos registros técnicos solo se usan para la seguridad del servidor (por ejemplo, para bloquear ataques) y se borran solos a los 15 días como mucho.</p>

        <h2>Si compartes una foto</h2>
        <p>Solo sale del móvil cuando tú pulsas «Compartir», y va a la aplicación que tú elijas (WhatsApp, correo…). A partir de ahí se aplican las normas de esa aplicación. No fotografíes a otras personas sin su permiso.</p>

        <h2>Cómo borrarlo todo</h2>
        <p>Puedes borrar una foto desde la propia foto, o todo de golpe con este botón: tus fotos, tu Micodex, tus gnomos, tus logros, las fotos de setas descargadas, el tamaño de letra y los colores elegidos.</p>
        <p><b>Ojo: quitar el icono de la app del móvil no borra tus datos</b>, que siguen guardados en el navegador. Pulsa este botón antes de quitarla o, en Chrome: Configuración → Configuración de sitios → Todos los sitios → setas.nomadprompters.es → Borrar. En otros navegadores, busca «datos de sitios» en sus ajustes.</p>
        <button type="button" class="btn btn-sec" onClick={borrar} disabled={estado === 'borrado'}>
          {estado === 'borrado' ? 'Borrado ✓' : 'Borrar todos mis datos de este móvil'}
        </button>

        <h2>Tus derechos</h2>
        <p>Como no guardamos datos tuyos, no tenemos nada que darte ni borrar. Si tienes cualquier duda, escríbenos a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>

        <Banda />
      </div>
    </>
  );
}

// ---------- Créditos ----------
export function Creditos() {
  const conFoto = especies.filter((e) => e.foto);
  return (
    <>
      <Cabecera titulo="Créditos" volver="#/" />
      <div class="cuerpo legal">
        <h2>Las fichas</h2>
        <p>Textos redactados para esta app por Nomad Prompters a partir de las fuentes citadas en cada ficha. Las fichas con el sello «Revisada» las ha revisado Germán Díaz Pérez. Las preguntas de «Identificar paso a paso» están pendientes de revisión.</p>

        <h2>Gnomos, iconos y siluetas</h2>
        <p>Diseño propio de Nomad Prompters para las Jornadas de Saceruela. Las ilustraciones de los gnomos se han hecho con ayuda de herramientas de inteligencia artificial a partir de un diseño original.</p>

        <h2>Fotos de las setas</h2>
        <p>Gracias a quienes comparten sus fotos con licencias libres. Las fotos se han reducido de tamaño y convertido a WebP para que la app pese poco; no se han cambiado de otra forma. La licencia exacta de cada una está en su enlace.</p>
        {conFoto.length === 0 ? (
          <p class="nota">Todavía no hay fotos en el catálogo.</p>
        ) : (
          <ul class="creditos">
            {conFoto.map((e) => (
              <li key={e.id}>
                <b>{nombre(e)}</b>
                <i>{e.cientifico}</i>
                <small>
                  Foto: {e.foto.autor} · {e.foto.licencia}
                  {e.foto.fuente && <> · <a href={e.foto.fuente} rel="noopener noreferrer" target="_blank">ver original</a></>}
                </small>
              </li>
            ))}
          </ul>
        )}

        <h2>Programas</h2>
        <p>Hecha con software libre: Preact (MIT), Vite (MIT), Workbox (MIT) e idb (ISC).</p>
      </div>
    </>
  );
}
