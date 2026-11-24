#!/usr/bin/env node
// Convierte las ilustraciones de los gnomos (PNG de ChatGPT/Gemini) a WebP para la app.
//   contenido/gnomos/<id>-cromo.png → public/gnomos/<id>-cromo.webp  (álbum, máx. 640 px)
//   contenido/gnomos/<id>-foto.png  → public/gnomos/<id>-foto.webp   (montaje, máx. 1000 px de alto)
// Mantiene la transparencia. Los PNG originales se guardan en contenido/ (maestros, no se publican).
// Genera src/datos/gnomos-ilustraciones.json con los gnomos que tienen las DOS imágenes.
import { readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { GNOMOS } from '../src/gnomos-datos.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = join(RAIZ, 'contenido', 'gnomos');
const DESTINO = join(RAIZ, 'public', 'gnomos');
const LISTA = join(RAIZ, 'src', 'datos', 'gnomos-ilustraciones.json');
const TIPOS = { cromo: { ancho: 640, alto: 640 }, foto: { ancho: 1000, alto: 1000 } };

mkdirSync(DESTINO, { recursive: true });
mkdirSync(dirname(LISTA), { recursive: true });
const ids = new Set(GNOMOS.map((g) => g.id));
const archivos = existsSync(ORIGEN) ? readdirSync(ORIGEN).filter((f) => /\.(png|webp|jpe?g)$/i.test(f)) : [];
const avisos = [];

for (const f of archivos) {
  const m = f.match(/^(.+)-(cromo|foto)\.(png|webp|jpe?g)$/i);
  if (!m || !ids.has(m[1])) { avisos.push(`«${f}» no sigue el formato <id>-cromo.png / <id>-foto.png (id de gnomo válido).`); continue; }
  const [, id, tipo] = m;
  const t = TIPOS[tipo];
  const salida = join(DESTINO, `${id}-${tipo}.webp`);
  const meta = await sharp(join(ORIGEN, f)).metadata();
  if (!meta.hasAlpha) avisos.push(`«${f}» no tiene transparencia: revisa que el fondo sea transparente de verdad.`);
  await sharp(join(ORIGEN, f))
    .trim({ threshold: 1 }) // quita márgenes transparentes sobrantes
    .resize({ width: t.ancho, height: t.alto, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(salida);
  console.log(`  ${f} → gnomos/${id}-${tipo}.webp (${Math.round(statSync(salida).size / 1024)} KB)`);
}

const completos = GNOMOS.map((g) => g.id).filter((id) => existsSync(join(DESTINO, `${id}-cromo.webp`)) && existsSync(join(DESTINO, `${id}-foto.webp`)));
writeFileSync(LISTA, JSON.stringify(completos) + '\n');
for (const a of avisos) console.warn(`  aviso: ${a}`);
console.log(`✓ Gnomos con ilustración: ${completos.length} de ${GNOMOS.length}`);
