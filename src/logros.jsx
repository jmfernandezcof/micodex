// Paso 7: pantalla de logros (pestaña de Mi Micodex) y aviso de logro nuevo.
import { useEffect, useMemo } from 'preact/hooks';
import { Icono } from './iconos.jsx';
import { especies } from './catalogo.js';
import { useFotos, useJuego, useMarcas, anotarLogrosVistos } from './fotos.js';
import { calcularLogros } from './logros.js';

const MORTALES = especies.filter((e) => e.mortal).map((e) => e.id);

export function useLogros() {
  const fotos = useFotos();
  const juego = useJuego();
  const marcas = useMarcas();
  return useMemo(
    () => (fotos && juego && marcas ? { lista: calcularLogros({ fotos, juego, marcas, mortales: MORTALES }), marcas } : null),
    [fotos, juego, marcas]
  );
}

export function ListaLogros() {
  const l = useLogros();
  // Al ver la lista, los conseguidos dejan de salir como «nuevos».
  useEffect(() => {
    if (l) anotarLogrosVistos(l.lista.filter((x) => x.hecho).map((x) => x.id));
  }, [l]);
  if (!l) return null;
  const hechos = l.lista.filter((x) => x.hecho).length;
  return (
    <>
      <p class="cuenta"><strong>{hechos} de {l.lista.length}</strong> <span>logros</span></p>
      <ul class="logros">
        {l.lista.map((x) => (
          <li key={x.id} class={x.hecho ? 'hecho' : ''}>
            <span class="medalla" aria-hidden="true">{x.hecho ? <Icono.hecho /> : `${x.n}/${x.meta}`}</span>
            <span class="txt">
              <b>{x.titulo}</b>
              <i>{x.texto}</i>
              {!x.hecho && x.meta > 1 && (
                <span class="barra" role="progressbar" aria-label={x.titulo} aria-valuemin="0" aria-valuemax={x.meta} aria-valuenow={x.n}>
                  <i style={{ width: `${(100 * x.n) / x.meta}%` }} />
                </span>
              )}
            </span>
            <span class="solo-lector">{x.hecho ? 'Conseguido' : 'Sin conseguir'}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

// Aviso flotante cuando se consigue un logro (se muestra en cualquier pantalla menos en la de logros).
export function AvisoLogro({ oculto }) {
  const l = useLogros();
  const nuevos = l && !oculto ? l.lista.filter((x) => x.hecho && !l.marcas.logrosVistos.includes(x.id)) : [];
  const clave = nuevos.map((x) => x.id).join();
  const cerrar = () => anotarLogrosVistos(nuevos.map((x) => x.id));
  // Se cierra solo a los 8 s (siguen en la lista de logros); así no tapa avisos de la pantalla.
  useEffect(() => {
    if (!clave) return undefined;
    const t = setTimeout(cerrar, 8000);
    return () => clearTimeout(t);
  }, [clave]);
  if (!nuevos.length) return null;
  const ultimo = nuevos[nuevos.length - 1];
  return (
    <div class="aviso-logro" role="status">
      <Icono.hecho />
      <a href="#/micodex/logros" onClick={cerrar}>
        <small>¡Logro conseguido!</small>
        <b>{ultimo.titulo}{nuevos.length > 1 && <span class="mas"> y {nuevos.length - 1} más</span>}</b>
      </a>
      <button type="button" class="cerrar" onClick={cerrar} aria-label="Cerrar aviso">×</button>
    </div>
  );
}
