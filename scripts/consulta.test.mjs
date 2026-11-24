import { test } from 'node:test';
import assert from 'node:assert/strict';
import { palabrasConsulta } from '../src/consulta.js';

test('dictado: signos, mayúsculas y tildes fuera', () => {
  assert.deepEqual(palabrasConsulta('Níscalo.'), ['niscalo']);
  assert.deepEqual(palabrasConsulta('¿Oronja verde?'), ['oronja', 'verde']);
});
test('dictado: palabras de relleno fuera', () => {
  assert.deepEqual(palabrasConsulta('es un níscalo'), ['niscalo']);
  assert.deepEqual(palabrasConsulta('La seta de los caballeros'), ['caballeros']);
  assert.deepEqual(palabrasConsulta('creo que es la amanita phalloides'), ['amanita', 'phalloides']);
});
test('si solo hay relleno, busca lo que hay', () => {
  assert.deepEqual(palabrasConsulta('seta'), ['seta']);
  assert.deepEqual(palabrasConsulta('   '), []);
});
