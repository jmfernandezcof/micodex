import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularLogros, LOGROS } from '../src/logros.js';
import { buscarProhibidas } from './palabras-prohibidas.mjs';

const por = (lista, id) => lista.find((l) => l.id === id);

test('hay 12 logros y sus textos pasan el filtro de palabras prohibidas', () => {
  assert.equal(LOGROS.length, 12);
  for (const l of LOGROS) assert.deepEqual(buscarProhibidas(`${l.titulo} ${l.texto}`), [], l.id);
});

test('sin datos no hay ningún logro', () => {
  assert.ok(calcularLogros({ mortales: ['a'] }).every((l) => !l.hecho));
});

test('las especies cuentan distintas y las fotos repetidas no cuentan', () => {
  const fotos = [
    ...['a', 'b', 'c', 'd'].map((especie) => ({ especie })),
    { especie: 'a' }, { especie: 'a' },
    { especie: 'e', repetida: true }
  ];
  const l = calcularLogros({ fotos });
  assert.equal(por(l, 'primer-paso').hecho, true);
  assert.equal(por(l, 'ojo-setero').n, 4);
  assert.equal(por(l, 'ojo-setero').hecho, false);
  const l2 = calcularLogros({ fotos: [...fotos, { especie: 'f' }] });
  assert.equal(por(l2, 'ojo-setero').hecho, true);
});

test('«Sabe lo que no se toca» exige todas las mortales actuales del catálogo', () => {
  const marcas = { mortalesLeidas: ['m1', 'm2', 'vieja'] };
  assert.equal(por(calcularLogros({ marcas, mortales: ['m1', 'm2'] }), 'lo-que-no-se-toca').hecho, true);
  const l = por(calcularLogros({ marcas, mortales: ['m1', 'm2', 'm3'] }), 'lo-que-no-se-toca');
  assert.equal(l.hecho, false);
  assert.equal(l.n, 2);
  // Sin mortales en el catálogo no se regala.
  assert.equal(por(calcularLogros({ marcas, mortales: [] }), 'lo-que-no-se-toca').hecho, false);
});

test('logros de gnomos por rareza', () => {
  const coleccion = Object.fromEntries(['cronista', 'grunon', 'lucera', 'guarda-del-monte', 'dama-de-la-dehesa'].map((id) => [id, { veces: 1 }]));
  const l = calcularLogros({ juego: { coleccion } });
  assert.equal(por(l, 'amigo-gnomos').hecho, true);
  assert.equal(por(l, 'nunca-visto').hecho, true);
  assert.equal(por(l, 'album-pueblo').n, 2);
  assert.equal(por(l, 'gran-setero').hecho, false);
});

test('marcas: descarga, identificar y misterio resuelto', () => {
  const l = calcularLogros({ marcas: { descarga: 1, identificar: 3 }, fotos: [{ especie: 'a', misterioResuelto: 5 }] });
  assert.equal(por(l, 'sin-cobertura').hecho, true);
  assert.equal(por(l, 'detective').hecho, true);
  assert.equal(por(l, 'misterio-resuelto').hecho, true);
});
