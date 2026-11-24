// Paso 6b: el gnomo asomando en tu foto. Todo en el móvil (canvas): mover con el dedo, pellizcar
// para agrandar, guardar en IndexedDB y compartir con la Web Share API. Sin servidor.
// La imagen final lleva SIEMPRE la banda de seguridad (regla dura: «fichas y capturas»).
import { useEffect, useRef, useState } from 'preact/hooks';
import { gnomo } from './gnomos-datos.js';
import { guardarMontaje } from './fotos.js';
import { useFoto } from './micodex.jsx';
import { tieneIlustracion } from './gnomos.jsx';
import { Cabecera, TEXTO_BANDA } from './pantallas.jsx';

// Aura por rareza: turquesa (común), ámbar (raro) y oro muy claro, casi blanco, más grande y doble (legendario).
const BRILLO = { comun: 'rgba(99,230,203,.85)', raro: 'rgba(244,190,98,.9)', legendario: 'rgba(255,246,214,1)' };
const DIFUMINADO = { comun: 28, raro: 28, legendario: 46 };

// Gnomo provisional dibujado (hasta que estén las ilustraciones). Caja de 100×130, base en y=130.
function dibujarProvisional(ctx) {
  ctx.fillStyle = '#B23A2E'; // gorro
  ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(88, 52); ctx.lineTo(12, 52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#F2C9A0'; // cara
  ctx.beginPath(); ctx.arc(50, 64, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#F4F1EA'; // barba
  ctx.beginPath(); ctx.moveTo(30, 66); ctx.quadraticCurveTo(50, 118, 70, 66); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2D5A3D'; // cuerpo
  ctx.beginPath(); ctx.moveTo(26, 88); ctx.lineTo(74, 88); ctx.lineTo(86, 130); ctx.lineTo(14, 130); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1B2B22'; // ojos
  ctx.beginPath(); ctx.arc(43, 62, 2.6, 0, Math.PI * 2); ctx.arc(57, 62, 2.6, 0, Math.PI * 2); ctx.fill();
}

function cargarImagen(src) {
  return new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });
}

function bandaSeguridad(ctx, w, h) {
  const alto = Math.round(Math.max(44, w * 0.06));
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#F6E4B3';
  ctx.fillRect(0, h - alto, w, alto);
  ctx.fillStyle = '#2A1B04';
  let fuente = Math.round(alto * 0.36);
  ctx.font = `700 ${fuente}px system-ui, sans-serif`;
  while (ctx.measureText(TEXTO_BANDA).width > w * 0.94 && fuente > 10) { fuente--; ctx.font = `700 ${fuente}px system-ui, sans-serif`; }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(TEXTO_BANDA, w / 2, h - alto / 2);
  ctx.font = `600 ${Math.round(fuente * 0.85)}px system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,.92)';
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4;
  ctx.fillText('Setas de Saceruela', w - 12, h - alto - 14);
  ctx.restore();
  return alto;
}

export function Montaje({ fotoId }) {
  const foto = useFoto(fotoId);
  const lienzo = useRef(null);
  const recursos = useRef(null); // { foto: ImageBitmap|Image, gnomo: Image|null }
  const [pos, setPos] = useState(null); // { x, y, escala } en píxeles del lienzo (base del gnomo)
  const [estado, setEstado] = useState('');
  const punteros = useRef(new Map());
  const gesto = useRef(null);
  const g = foto ? gnomo(foto.gnomo) : null;

  // Cargar foto e ilustración
  useEffect(() => {
    if (!foto || !g) return;
    let vivo = true;
    (async () => {
      const url = URL.createObjectURL(foto.blob);
      const img = await cargarImagen(url);
      URL.revokeObjectURL(url);
      let ilus = null;
      if (tieneIlustracion(g.id)) ilus = await cargarImagen(`/gnomos/${g.id}-foto.webp`).catch(() => null);
      if (!vivo) return;
      recursos.current = { foto: img, gnomo: ilus };
      const c = lienzo.current;
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      setPos({ x: c.width * 0.5, y: c.height, escala: (c.height * 0.45) / 130 });
    })();
    return () => { vivo = false; };
  }, [foto, g]);

  // Pintar
  useEffect(() => {
    const r = recursos.current;
    if (!r || !pos) return;
    const c = lienzo.current;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(r.foto, 0, 0, c.width, c.height);
    ctx.save();
    ctx.shadowColor = BRILLO[g.rareza];
    ctx.shadowBlur = DIFUMINADO[g.rareza] * pos.escala;
    if (r.gnomo) {
      const w = r.gnomo.naturalWidth * (pos.escala * 130 / r.gnomo.naturalHeight);
      const h = 130 * pos.escala;
      ctx.drawImage(r.gnomo, pos.x - w / 2, pos.y - h, w, h);
      if (g.rareza === 'legendario') ctx.drawImage(r.gnomo, pos.x - w / 2, pos.y - h, w, h); // segunda pasada: aura más intensa
    } else {
      ctx.translate(pos.x - 50 * pos.escala, pos.y - 130 * pos.escala);
      ctx.scale(pos.escala, pos.escala);
      dibujarProvisional(ctx);
    }
    ctx.restore();
    bandaSeguridad(ctx, c.width, c.height); // la banda va encima de todo: nunca la tapa el gnomo
  }, [pos, g]);

  // Gestos: arrastrar con un dedo, pellizcar con dos
  const aLienzo = (ev) => {
    const c = lienzo.current, b = c.getBoundingClientRect();
    return { x: (ev.clientX - b.left) * (c.width / b.width), y: (ev.clientY - b.top) * (c.height / b.height) };
  };
  const limitar = (p) => {
    const c = lienzo.current;
    const escala = Math.min(Math.max(p.escala, (c.height * 0.15) / 130), (c.height * 1.1) / 130);
    return { escala, x: Math.min(Math.max(p.x, 0), c.width), y: Math.min(Math.max(p.y, c.height * 0.25), c.height * 1.3) };
  };
  function abajo(ev) {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    punteros.current.set(ev.pointerId, aLienzo(ev));
    gesto.current = { inicio: pos, puntos: new Map(punteros.current) };
  }
  function mover(ev) {
    if (!punteros.current.has(ev.pointerId) || !gesto.current) return;
    punteros.current.set(ev.pointerId, aLienzo(ev));
    const [a0, b0] = [...gesto.current.puntos.values()];
    const [a1, b1] = [...punteros.current.values()];
    const ini = gesto.current.inicio;
    if (punteros.current.size === 1) {
      setPos(limitar({ ...ini, x: ini.x + (a1.x - a0.x), y: ini.y + (a1.y - a0.y) }));
    } else if (b0 && b1) {
      const d0 = Math.hypot(b0.x - a0.x, b0.y - a0.y), d1 = Math.hypot(b1.x - a1.x, b1.y - a1.y);
      const m0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 }, m1 = { x: (a1.x + b1.x) / 2, y: (a1.y + b1.y) / 2 };
      setPos(limitar({ escala: ini.escala * (d1 / d0), x: ini.x + (m1.x - m0.x), y: ini.y + (m1.y - m0.y) }));
    }
  }
  function arriba(ev) {
    punteros.current.delete(ev.pointerId);
    gesto.current = punteros.current.size ? { inicio: pos, puntos: new Map(punteros.current) } : null;
  }
  const zoom = (k) => setPos((p) => limitar({ ...p, escala: p.escala * k }));

  async function blobFinal() {
    return new Promise((ok) => lienzo.current.toBlob(ok, 'image/jpeg', 0.85));
  }
  async function guardar() {
    setEstado('guardando');
    await guardarMontaje(fotoId, await blobFinal());
    setEstado('guardado');
  }
  async function compartir() {
    const blob = await blobFinal();
    await guardarMontaje(fotoId, blob);
    const archivo = new File([blob], `gnomo-${g.id}.jpg`, { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [archivo] })) {
      try { await navigator.share({ files: [archivo], title: 'Setas de Saceruela' }); setEstado('compartido'); }
      catch { setEstado(''); } // el usuario canceló
    } else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = archivo.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      setEstado('descargado');
    }
  }

  if (foto === undefined) return <Cabecera titulo="Tu foto con gnomo" />;
  if (!foto || !g) return <><Cabecera titulo="Tu foto con gnomo" volver="#/gnomos" /><div class="cuerpo"><p>Esta foto no tiene gnomo.</p></div></>;

  return (
    <>
      <Cabecera titulo={`Tu foto con ${g.nombre}`} volver={`#/aparicion/${fotoId}`} />
      <div class="cuerpo">
        <p class="nota">Arrastra el gnomo con el dedo. Con dos dedos, o con los botones, lo haces más grande o más pequeño.</p>
        <canvas
          ref={lienzo}
          class="lienzo"
          role="img"
          aria-label={`Tu foto con ${g.nombre} asomando`}
          onPointerDown={abajo}
          onPointerMove={mover}
          onPointerUp={arriba}
          onPointerCancel={arriba}
        />
        <div class="zoom">
          <button type="button" class="btn btn-sec" onClick={() => zoom(1 / 1.15)} aria-label="Gnomo más pequeño">−</button>
          <button type="button" class="btn btn-sec" onClick={() => zoom(1.15)} aria-label="Gnomo más grande">+</button>
        </div>
        <button type="button" class="btn btn-luz" onClick={compartir}>Compartir</button>
        <button type="button" class="btn btn-sec" onClick={guardar} disabled={estado === 'guardando'}>
          {estado === 'guardado' ? 'Guardada en tu Micodex ✓' : 'Guardar en mi Micodex'}
        </button>
        {estado === 'descargado' && <p class="nota" role="status">Tu móvil no permite compartir desde aquí: la foto se ha descargado.</p>}
        <a class="btn btn-sec" href={`#/foto/${fotoId}/hecho`}>Seguir</a>
      </div>
    </>
  );
}
