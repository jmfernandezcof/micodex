#!/usr/bin/env node
// Miniaturas de las fotos del catálogo: public/fotos/<archivo> → public/miniaturas/<archivo>.webp
// Van SIEMPRE en el precache (≈1 MB las 200), para que en todas las listas salga la foto de la seta
// también sin cobertura y sin «Usar sin conexión». La foto grande sigue en public/fotos/.
import { readdirSync, existsSync, mkdirSync, statSync, rmSync } from 'node:fs';
import { join, dirname, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEN = join(RAIZ, 'public', 'fotos');
const DESTINO = join(RAIZ, 'public', 'miniaturas');
const LADO = 160; // se ve a 56-80 px en las listas; ampliada (algo borrosa) en la ficha sin red

mkdirSync(DESTINO, { recursive: true });
const fotos = existsSync(ORIGEN) ? readdirSync(ORIGEN).filter((f) => /\.(webp|jpe?g|png)$/i.test(f)) : [];
const esperadas = new Set(fotos.map((f) => `${parse(f).name}.webp`));
for (const f of readdirSync(DESTINO)) if (!esperadas.has(f)) rmSync(join(DESTINO, f)); // huérfanas
let hechas = 0, total = 0;
for (const f of fotos) {
  const salida = join(DESTINO, `${parse(f).name}.webp`);
  if (!existsSync(salida) || statSync(salida).mtimeMs < statSync(join(ORIGEN, f)).mtimeMs) {
    await sharp(join(ORIGEN, f)).resize({ width: LADO, height: LADO, fit: 'cover', position: 'attention' }).webp({ quality: 60, effort: 6 }).toFile(salida);
    hechas++;
  }
  total += statSync(salida).size;
}
console.log(`✓ Miniaturas: ${fotos.length} (${hechas} nuevas), ${(total / 1e6).toFixed(2)} MB en public/miniaturas/`);
