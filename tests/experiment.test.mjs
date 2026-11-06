import test from 'node:test';
import assert from 'node:assert/strict';
import { assignVariant, fnv1a32, conversionRate, formatRate, formatDifference, CONTENT } from '../lib/experiment.ts';

test('hash determinístico de identificador de prueba', () => {
  const id = 'lab-visitor-demo-01';
  assert.equal(fnv1a32(id), fnv1a32(id));
  assert.equal(assignVariant(id), assignVariant(id));
  assert.ok(['a', 'b'].includes(assignVariant(id)));
});
test('caso fijo y diferencia calculados por fórmula', () => {
  const a = conversionRate(240, 18);
  const b = conversionRate(236, 31);
  assert.equal(formatRate(a), '7,50%');
  assert.equal(formatRate(b), '13,14%');
  assert.equal(formatDifference(a,b), '5,64 pp');
});
test('sin impresiones la tasa no existe', () => {
  assert.equal(conversionRate(0,0), null);
  assert.equal(formatRate(null), 'Sin tasa');
});
test('metadatos dentro de rangos indicados', () => {
  for (const v of Object.values(CONTENT)) {
    assert.ok(v.title.length >= 50 && v.title.length <= 60, `title: ${v.title.length}`);
    assert.ok(v.description.length >= 140 && v.description.length <= 160, `desc: ${v.description.length}`);
  }
});
