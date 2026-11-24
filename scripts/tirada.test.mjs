import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tirar, estadoInicial, REGLAS, esJornadas, probAparicion, daSorteo } from '../src/tirada.js';
import { GNOMOS } from '../src/gnomos-datos.js';
import { buscarProhibidas } from './palabras-prohibidas.mjs';

const DIA = new Date('2026-11-20T12:00:00').getTime(); // fuera de las Jornadas
const JORNADA = new Date('2026-11-27T12:00:00').getTime();
const fijo = (...valores) => { let i = 0; return () => valores[Math.min(i++, valores.length - 1)]; };

test('hay 12 gnomos: 8 comunes, 3 raros y 1 legendario, con 4 frases o más', () => {
  assert.equal(GNOMOS.length, 12);
  const n = (r) => GNOMOS.filter((g) => g.rareza === r).length;
  assert.deepEqual([n('comun'), n('raro'), n('legendario')], [8, 3, 1]);
  for (const g of GNOMOS) assert.ok(g.frases.length >= 4, g.id);
});

test('las frases de los gnomos no tienen palabras prohibidas', () => {
  for (const g of GNOMOS) for (const f of g.frases) assert.deepEqual(buscarProhibidas(f), [], `${g.id}: ${f}`);
});

test('suerte creciente: sin número fijo, la probabilidad sube con cada foto sin gnomo', () => {
  assert.equal(probAparicion(0), REGLAS.probBase);
  for (let n = 1; n < 20; n++) assert.ok(probAparicion(n) >= probAparicion(n - 1));
  assert.equal(probAparicion(20), 1);
  // con la misma suerte (0.3): no sale en las primeras, sí cuando la probabilidad supera 0.3
  let e = estadoInicial(); let foto = 0; let r;
  do { r = tirar(e, { ahora: DIA, aleatorio: () => 0.3 }); e = r.estado; foto++; } while (!r.gnomo && foto < 30);
  assert.ok(foto > 1 && foto < 10, `salió en la foto ${foto}`);
  assert.equal(r.estado.sinGnomo, 0);
});

test('reparto realista: el primer gnomo no sale siempre en la misma foto', () => {
  const vistas = new Set();
  for (let i = 0; i < 500; i++) {
    let e = estadoInicial(); let foto = 0; let r;
    do { r = tirar(e, { ahora: DIA, aleatorio: Math.random }); e = r.estado; foto++; } while (!r.gnomo);
    vistas.add(foto);
  }
  assert.ok(vistas.size >= 6, `posiciones distintas: ${[...vistas]}`);
});

test('máximo 15 tiradas al día; al día siguiente se reinicia', () => {
  let e = estadoInicial();
  for (let i = 0; i < REGLAS.maxDia; i++) e = tirar(e, { ahora: DIA, aleatorio: () => 0.99 }).estado;
  assert.equal(tirar(e, { ahora: DIA, aleatorio: () => 0 }).limite, true);
  assert.notEqual(tirar(e, { ahora: DIA + 86400000, aleatorio: () => 0 }).limite, true);
});

test('la Lucera nunca sale de día', () => {
  for (let i = 0; i < 300; i++) {
    const r = tirar(estadoInicial(), { ahora: DIA, noche: false, aleatorio: Math.random });
    assert.notEqual(r.gnomo, 'lucera');
  }
  // de noche, forzando raro y la 1.ª posición, puede salir
  const raros = GNOMOS.filter((g) => g.rareza === 'raro').map((g) => g.id);
  assert.equal(tirar(estadoInicial(), { ahora: DIA, noche: true, aleatorio: fijo(0, 0.1, 0.1, raros.indexOf('lucera') / raros.length + 0.01) }).gnomo, 'lucera');
});

const con = (n) => ({ ...estadoInicial(), coleccion: Object.fromEntries(GNOMOS.filter((g) => g.rareza === 'comun').slice(0, n).map((g) => [g.id, { veces: 1, primera: DIA }])) });

test('el Gran Setero: solo en las Jornadas, con 4 gnomos distintos y un 50 %', () => {
  assert.equal(esJornadas(JORNADA), true);
  assert.equal(esJornadas(DIA), false);
  // fuera de las Jornadas, nunca
  for (let i = 0; i < 300; i++) assert.notEqual(tirar(con(4), { ahora: DIA, aleatorio: Math.random }).gnomo, 'gran-setero');
  // en las Jornadas con 3 gnomos, nunca
  for (let i = 0; i < 300; i++) assert.notEqual(tirar(con(3), { ahora: JORNADA, aleatorio: Math.random }).gnomo, 'gran-setero');
  // con 4: aparece (0) y gana el 50 % (0.4) → legendario; si pierde (0.6) → otro
  assert.equal(tirar(con(4), { ahora: JORNADA, aleatorio: fijo(0, 0.4) }).gnomo, 'gran-setero');
  assert.notEqual(tirar(con(4), { ahora: JORNADA, aleatorio: fijo(0, 0.6, 0.5, 0.99, 0) }).gnomo, 'gran-setero');
});

test('repetido: suma veces y no es nuevo', () => {
  const e = { ...estadoInicial(), coleccion: { cronista: { veces: 1, primera: DIA } } };
  // aparece (0), común (0.5), no busca nuevo (0.99), primera posición de los comunes (0) = el Cronista
  const r = tirar(e, { ahora: DIA, aleatorio: fijo(0, 0.5, 0.99, 0) });
  assert.equal(r.gnomo, 'cronista');
  assert.equal(r.nuevo, false);
  assert.equal(r.estado.coleccion.cronista.veces, 2);
  assert.equal(e.coleccion.cronista.veces, 1, 'no modifica el estado recibido');
});

test('con un 70 % prefiere uno que no tienes', () => {
  const comunes = GNOMOS.filter((g) => g.rareza === 'comun').map((g) => g.id);
  const coleccion = Object.fromEntries(comunes.slice(0, 7).map((id) => [id, { veces: 1, primera: DIA }]));
  const r = tirar({ ...estadoInicial(), coleccion }, { ahora: DIA, aleatorio: fijo(0, 0.5, 0.1, 0) });
  assert.equal(r.gnomo, comunes[7]);
  assert.equal(r.nuevo, true);
});

// ---------- Regla contra fotos al azar (daSorteo) ----------
test('daSorteo: sin especie («No lo sé») no sortea', () => {
  assert.equal(daSorteo({ id: 1 }, [], null), false);
});
test('daSorteo: la primera foto de una especie sortea; la segunda, no', () => {
  const a = { id: 1, sorteo: { especie: 'agaricus-campestris' } };
  assert.equal(daSorteo({ id: 2 }, [a], 'agaricus-campestris'), false);
  assert.equal(daSorteo({ id: 2 }, [a], 'boletus-edulis'), true);
});
test('daSorteo: fotos repetidas o que ya sortearon no vuelven a sortear', () => {
  assert.equal(daSorteo({ id: 1, repetida: true }, [], 'boletus-edulis'), false);
  assert.equal(daSorteo({ id: 1, sorteo: { especie: 'x' } }, [], 'boletus-edulis'), false);
  assert.equal(daSorteo({ id: 1, gnomo: 'cronista' }, [], 'boletus-edulis'), false);
});
test('daSorteo: un misterio resuelto sortea si es la primera de su especie', () => {
  const misterio = { id: 3, especie: null, marcadaMisterio: true };
  assert.equal(daSorteo(misterio, [misterio], 'boletus-edulis'), true);
});
