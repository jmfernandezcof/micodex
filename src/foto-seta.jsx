// Foto de una seta del catálogo en listas (catálogo, buscador, «Podría ser…», «Se confunde con…»).
// Usa la miniatura (public/miniaturas/, scripts/miniaturas.mjs), que va siempre en el precache:
// sale también sin cobertura y sin «Usar sin conexión». La silueta, solo si la especie no tiene foto.
import { Silueta } from './iconos.jsx';

export const miniatura = (e) => (e?.foto ? `/miniaturas/${e.foto.archivo.replace(/\.[^.]+$/, '')}.webp` : null);

export function MiniSeta({ e, clase = 'mini' }) {
  const src = miniatura(e);
  return src
    ? <img class={clase} src={src} alt="" loading="lazy" decoding="async" width="56" height="56" />
    : <span class={clase}><Silueta forma={e.silueta} /></span>;
}
