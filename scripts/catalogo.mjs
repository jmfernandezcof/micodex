#!/usr/bin/env node
// Importa contenido/catalogo.csv (exportado de la hoja de cálculo) y lo valida.
// Si todo está bien, escribe src/datos/catalogo.json, que es lo que lee la app.
// Si hay errores, no escribe nada y sale con código 1 (el build se para).
//
// Uso:  node scripts/catalogo.mjs            → valida y genera (los pendientes de revisión, como aviso)
//       PUBLICAR=1 node scripts/catalogo.mjs → modo publicación: las mortales y sus confusiones
//                                              tienen que estar revisadas o el build falla.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscarProhibidas } from './palabras-prohibidas.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRADA = join(RAIZ, 'contenido', 'catalogo.csv');
const SALIDA = join(RAIZ, 'src', 'datos', 'catalogo.json');
const CARPETA_FOTOS = join(RAIZ, 'public', 'fotos');
const PUBLICAR = process.env.PUBLICAR === '1';

export const COLUMNAS = [
  'id', 'nombre_cientifico', 'nombres_comunes', 'silueta', 'descripcion', 'habitat', 'meses',
  'mortal', 'confusiones', 'himenio', 'volva', 'anillo', 'color_laminas', 'foto', 'foto_autor', 'foto_licencia', 'foto_fuente',
  'revision', 'revisada_por', 'revisada_fecha', 'fuentes'
];
const OBLIGATORIAS = ['id', 'nombre_cientifico', 'nombres_comunes', 'silueta', 'descripcion', 'habitat', 'meses', 'mortal', 'himenio', 'volva', 'anillo', 'color_laminas', 'revision'];
// Rasgos para «Identificar paso a paso» (lo que se ve sin tocar la seta).
export const RASGOS = {
  himenio: ['laminas', 'poros', 'aguijones', 'otro'],
  volva: ['si', 'no'],
  anillo: ['si', 'no'],
  color_laminas: ['blancas', 'color', 'no_aplica']
};
const SILUETAS = ['volva', 'parasol', 'plana', 'embudo', 'boleto', 'repisa', 'bola', 'otra'];
const LICENCIAS = ['CC0', 'CC BY', 'CC BY-SA', 'cedida'];
// foto_autor no se filtra: son nombres propios (p. ej. «Alina» activaba «aliño»; aviso de Nyx, 17-nov).
const TEXTOS = ['nombres_comunes', 'descripcion', 'habitat', 'fuentes'];

// --- CSV (coma o punto y coma, comillas dobles, saltos de línea dentro de comillas) ---
export function leerCsv(texto) {
  texto = texto.replace(/^﻿/, '');
  const primera = texto.split(/\r?\n/, 1)[0];
  const sep = (primera.match(/;/g) || []).length > (primera.match(/,/g) || []).length ? ';' : ',';
  const filas = [];
  let fila = [], campo = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(campo); filas.push(fila); fila = []; campo = '';
    } else campo += c;
  }
  if (campo !== '' || fila.length) { fila.push(campo); filas.push(fila); }
  return filas.filter((f) => f.some((x) => x.trim() !== ''));
}

const lista = (s) => (s || '').split('|').map((x) => x.trim()).filter(Boolean);

export function procesar(filas, { publicar = false, comprobarFotos = true } = {}) {
  const errores = [];
  const avisos = [];
  const [cab, ...datos] = filas;
  const cabecera = cab.map((c) => c.trim());
  for (const c of COLUMNAS) if (!cabecera.includes(c)) errores.push(`Falta la columna «${c}» en la cabecera.`);
  for (const c of cabecera) if (!COLUMNAS.includes(c)) errores.push(`Columna desconocida «${c}». ¿Está bien escrita?`);
  if (errores.length) return { errores, avisos, especies: [] };

  const especies = datos.map((f, n) => {
    const o = Object.fromEntries(cabecera.map((c, i) => [c, (f[i] ?? '').trim()]));
    o._fila = n + 2; // fila en la hoja (la 1 es la cabecera)
    return o;
  });

  const porId = new Map();
  for (const e of especies) {
    const donde = `Fila ${e._fila} (${e.id || 'sin id'})`;
    for (const c of OBLIGATORIAS) if (!e[c]) errores.push(`${donde}: falta «${c}».`);
    if (e.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) errores.push(`${donde}: el id solo puede tener minúsculas, números y guiones (p. ej. amanita-phalloides).`);
    if (porId.has(e.id)) errores.push(`${donde}: id repetido.`);
    porId.set(e.id, e);
    if (e.silueta && !SILUETAS.includes(e.silueta)) errores.push(`${donde}: silueta «${e.silueta}» no válida. Opciones: ${SILUETAS.join(', ')}.`);
    if (e.mortal && !['si', 'no'].includes(e.mortal.toLowerCase())) errores.push(`${donde}: «mortal» tiene que ser si o no.`);
    const meses = lista(e.meses.replace(/,/g, '|')).map(Number);
    if (e.meses && (!meses.length || meses.some((m) => !Number.isInteger(m) || m < 1 || m > 12))) errores.push(`${donde}: «meses» tiene que ser una lista de números del 1 al 12 (p. ej. 9|10|11).`);
    e._meses = [...new Set(meses)].sort((a, b) => a - b);
    for (const [r, valores] of Object.entries(RASGOS)) {
      if (e[r] && !valores.includes(e[r])) errores.push(`${donde}: «${r}» tiene que ser ${valores.join(', ')}.`);
    }
    if (e.himenio && e.himenio !== 'laminas' && e.color_laminas && e.color_laminas !== 'no_aplica') errores.push(`${donde}: sin láminas, «color_laminas» tiene que ser no_aplica.`);
    if (e.himenio === 'laminas' && e.color_laminas === 'no_aplica') errores.push(`${donde}: tiene láminas, así que «color_laminas» tiene que ser blancas o color.`);
    if (e.revision && !['pendiente', 'revisada'].includes(e.revision)) errores.push(`${donde}: «revision» tiene que ser pendiente o revisada.`);
    if (e.revision === 'revisada' && (!e.revisada_por || !/^\d{4}-\d{2}-\d{2}$/.test(e.revisada_fecha))) errores.push(`${donde}: una ficha revisada necesita «revisada_por» y «revisada_fecha» (AAAA-MM-DD).`);
    if (e.foto) {
      if (!e.foto_autor || !e.foto_licencia) errores.push(`${donde}: la foto necesita autor y licencia.`);
      if (e.foto_licencia && !LICENCIAS.includes(e.foto_licencia)) errores.push(`${donde}: licencia «${e.foto_licencia}» no permitida. Solo: ${LICENCIAS.join(', ')}.`);
      if (!/^[a-z0-9-]+\.(webp|jpg)$/.test(e.foto)) errores.push(`${donde}: el nombre de la foto tiene que ser como amanita-phalloides.webp.`);
      else if (comprobarFotos && !existsSync(join(CARPETA_FOTOS, e.foto))) errores.push(`${donde}: no encuentro public/fotos/${e.foto}.`);
    } else avisos.push(`${donde}: sin foto.`);
  }

  // Palabras prohibidas (los nombres científicos del catálogo quedan exentos).
  const cientificos = especies.map((e) => e.nombre_cientifico).filter(Boolean);
  for (const e of especies) {
    for (const c of TEXTOS) {
      const malas = buscarProhibidas(e[c], cientificos);
      if (malas.length) errores.push(`Fila ${e._fila} (${e.id}): «${c}» contiene palabras prohibidas: ${malas.join(', ')}.`);
    }
  }

  // Confusiones: tienen que existir y, si una de las dos es mortal, estar en las dos fichas.
  for (const e of especies) {
    e._confusiones = lista(e.confusiones);
    for (const otra of e._confusiones) {
      if (otra === e.id) errores.push(`Fila ${e._fila} (${e.id}): se confunde consigo misma.`);
      else if (!porId.has(otra)) errores.push(`Fila ${e._fila} (${e.id}): se confunde con «${otra}», que no está en el catálogo.`);
    }
  }
  const esMortal = (e) => e?.mortal?.toLowerCase() === 'si';
  for (const e of especies) {
    for (const otra of e._confusiones) {
      const o = porId.get(otra);
      if (o && (esMortal(e) || esMortal(o)) && !lista(o.confusiones).includes(e.id)) {
        errores.push(`«${e.id}» se confunde con «${otra}» y una de las dos es mortal: «${otra}» también tiene que incluir a «${e.id}» en sus confusiones.`);
      }
    }
  }

  // Revisión: las mortales y las que se confunden con una mortal son las críticas.
  for (const e of especies) {
    const critica = esMortal(e) || e._confusiones.some((x) => esMortal(porId.get(x)));
    if (critica && e.revision !== 'revisada') {
      const msg = `Fila ${e._fila} (${e.id}): ${esMortal(e) ? 'es mortal' : 'se confunde con una mortal'} y está pendiente de revisión por un micólogo.`;
      (publicar ? errores : avisos).push(msg);
    }
  }
  if (!especies.some(esMortal)) avisos.push('El catálogo no tiene ninguna especie mortal. ¿Seguro?');

  const salida = especies.map((e) => ({
    id: e.id,
    cientifico: e.nombre_cientifico,
    comunes: lista(e.nombres_comunes),
    silueta: e.silueta,
    descripcion: e.descripcion,
    habitat: e.habitat,
    meses: e._meses,
    mortal: esMortal(e),
    confusiones: e._confusiones,
    rasgos: { himenio: e.himenio, volva: e.volva === 'si', anillo: e.anillo === 'si', laminas: e.color_laminas },
    foto: e.foto ? { archivo: e.foto, autor: e.foto_autor, licencia: e.foto_licencia, fuente: e.foto_fuente || null } : null,
    revisada: e.revision === 'revisada' ? { por: e.revisada_por, fecha: e.revisada_fecha } : null,
    fuentes: lista(e.fuentes)
  }));
  return { errores, avisos, especies: salida };
}

// --- Ejecución directa ---
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { errores, avisos, especies } = procesar(leerCsv(readFileSync(ENTRADA, 'utf8')), { publicar: PUBLICAR });
  for (const a of avisos) console.warn(`  aviso: ${a}`);
  if (errores.length) {
    console.error(`\n✗ Catálogo con ${errores.length} error(es). No se genera nada:`);
    for (const e of errores) console.error(`  - ${e}`);
    process.exit(1);
  }
  mkdirSync(dirname(SALIDA), { recursive: true });
  writeFileSync(SALIDA, JSON.stringify({ version: 1, generado: new Date().toISOString(), especies }, null, 1) + '\n');
  console.log(`✓ Catálogo válido: ${especies.length} especies (${especies.filter((e) => e.mortal).length} mortales) → src/datos/catalogo.json${PUBLICAR ? ' [modo publicación]' : ''}`);
}
