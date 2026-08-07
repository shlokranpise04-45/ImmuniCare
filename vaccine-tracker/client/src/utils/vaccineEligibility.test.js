import test from 'node:test';
import assert from 'node:assert/strict';
import { getAgeGroup } from './vaccineEligibility.js';

test('getAgeGroup handles invalid dates without falling through to elderly', () => {
  assert.equal(getAgeGroup('not-a-date'), 'infant');
});
