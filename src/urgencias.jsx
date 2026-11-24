// «Si alguien se encuentra mal»: teléfonos de urgencias. Solo texto: funciona sin cobertura de datos
// (las llamadas van por la red de voz). Número del SIT comprobado en mjusticia.gob.es el 2026-11-20.
import { Cabecera, Banda } from './pantallas.jsx';

export const TOXICOLOGIA = { texto: '91 562 04 20', tel: '+34915620420' };

export function Urgencias() {
  return (
    <>
      <Cabecera titulo="Si alguien se encuentra mal" volver="#/" />
      <div class="cuerpo legal">
        <a class="btn btn-urgencia" href="tel:112">Llamar al 112</a>
        <p>Emergencias, gratis, desde cualquier móvil.</p>
        <a class="btn btn-sec" href={`tel:${TOXICOLOGIA.tel}`}>Toxicología: <span class="nowrap">{TOXICOLOGIA.texto}</span></a>
        <p>Servicio de Información Toxicológica, las 24 horas.</p>

        <h2>Qué hacer</h2>
        <ul>
          <li><b>Si alguien ha tomado setas que no conoce, llama aunque se encuentre bien.</b> Las setas mortales pueden tardar muchas horas en dar síntomas.</li>
          <li>Guarda los restos de las setas y, si tienes, una foto. Ayudan a saber cuál era.</li>
          <li>No des remedios caseros ni provoques el vómito si no te lo dicen.</li>
        </ul>
        <Banda />
      </div>
    </>
  );
}

// Enlace corto para el final de la portada y de las fichas mortales.
export function EnlaceUrgencias() {
  return (
    <a class="enlace-urgencias" href="#/urgencias">
      Si alguien se encuentra mal: <b>112</b> · Toxicología <b>{TOXICOLOGIA.texto}</b>
    </a>
  );
}
