import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buscarProhibidas } from './palabras-prohibidas.mjs';
import { leerCsv, procesar, COLUMNAS } from './catalogo.mjs';

test('palabras prohibidas: detecta comer, cocina y recetas', () => {
  for (const t of ['Con un buen aliño', 'Es comestible', 'se come en otoño', 'buena para guisos', 'una receta típica', 'COCINAR', 'muy sabrosa', 'Exquisita', 'apta para el consumo humano', 'ingerida en cantidad', 'si se ingiere', 'tras su ingestión', 'no la consumas']) {
    assert.ok(buscarProhibidas(t).length > 0, t);
  }
});

test('palabras prohibidas: deja pasar textos normales', () => {
  for (const t of ['Nombres comunes', 'Comienza a salir en octubre', 'Sin comentarios', 'Huele a patata cruda', 'Láminas blancas', 'Foto de Alina', 'Láminas alineadas']) {
    assert.deepEqual(buscarProhibidas(t), [], t);
  }
});

test('palabras prohibidas: los nombres científicos quedan exentos', () => {
  assert.deepEqual(buscarProhibidas('Se parece a Lactarius deliciosus', ['Lactarius deliciosus']), []);
  assert.ok(buscarProhibidas('Lactarius deliciosus es deliciosa', ['Lactarius deliciosus']).length > 0);
});

const cab = COLUMNAS.join(',');
const fila = (o) => COLUMNAS.map((c) => o[c] ?? '').map((v) => `"${v}"`).join(',');
const base = { silueta: 'volva', descripcion: 'Sombrero verde.', habitat: 'Encinar.', meses: '10', revision: 'pendiente', himenio: 'laminas', volva: 'si', anillo: 'si', color_laminas: 'blancas' };
const csv = (...filas) => leerCsv([cab, ...filas.map(fila)].join('\n'));
const opts = { comprobarFotos: false };

test('catálogo correcto: sin errores', () => {
  const r = procesar(csv(
    { ...base, id: 'a-mortal', nombre_cientifico: 'Amanita phalloides', nombres_comunes: 'Oronja verde', mortal: 'si', confusiones: 'b-parecida' },
    { ...base, id: 'b-parecida', nombre_cientifico: 'Amanita citrina', nombres_comunes: 'Oronja limón', mortal: 'no', confusiones: 'a-mortal' }
  ), opts);
  assert.deepEqual(r.errores, []);
  assert.equal(r.especies.length, 2);
  assert.equal(r.especies[0].mortal, true);
  assert.equal('comestible' in r.especies[0], false);
});

test('una confusión con una mortal tiene que estar en las dos fichas', () => {
  const r = procesar(csv(
    { ...base, id: 'a-mortal', nombre_cientifico: 'A a', nombres_comunes: 'x', mortal: 'si' },
    { ...base, id: 'b-parecida', nombre_cientifico: 'B b', nombres_comunes: 'y', mortal: 'no', confusiones: 'a-mortal' }
  ), opts);
  assert.ok(r.errores.some((e) => e.includes('también tiene que incluir')));
});

test('modo publicación: mortal sin revisar bloquea', () => {
  const filas = csv({ ...base, id: 'a', nombre_cientifico: 'A a', nombres_comunes: 'x', mortal: 'si' });
  assert.deepEqual(procesar(filas, opts).errores, []);
  assert.ok(procesar(filas, { ...opts, publicar: true }).errores.length > 0);
});

test('errores típicos de la hoja', () => {
  const r = procesar(csv(
    { ...base, id: 'Mal Id', nombre_cientifico: 'A a', nombres_comunes: 'Se come', mortal: 'quizá', meses: '13', foto: 'x.webp', foto_licencia: 'todos los derechos' }
  ), opts);
  const t = r.errores.join('\n');
  for (const s of ['id solo puede', 'palabras prohibidas', 'si o no', 'del 1 al 12', 'autor y licencia', 'no permitida']) assert.ok(t.includes(s), s);
});

test('falta una columna', () => {
  const r = procesar(leerCsv('id,nombre_cientifico\nx,y'), opts);
  assert.ok(r.errores.some((e) => e.includes('Falta la columna')));
});

test('CSV con punto y coma y comillas (Excel en español)', () => {
  const f = leerCsv('a;b\n"uno; dos";"con ""comillas"""\n');
  assert.deepEqual(f, [['a', 'b'], ['uno; dos', 'con "comillas"']]);
});

test('rasgos: valores y coherencia', () => {
  const r = procesar(csv(
    { ...base, id: 'a', nombre_cientifico: 'A a', nombres_comunes: 'x', mortal: 'no', himenio: 'poros', color_laminas: 'blancas' },
    { ...base, id: 'b', nombre_cientifico: 'B b', nombres_comunes: 'y', mortal: 'no', volva: 'quizá' }
  ), opts);
  const t = r.errores.join('\n');
  assert.ok(t.includes('no_aplica'));
  assert.ok(t.includes('«volva» tiene que ser'));
});
