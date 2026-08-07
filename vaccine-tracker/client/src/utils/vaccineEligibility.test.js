import test from 'node:test';
import assert from 'node:assert/strict';
import { getAgeGroup, getSelectedVaccine } from './vaccineEligibility.js';

test('getAgeGroup handles invalid dates without falling through to elderly', () => {
  assert.equal(getAgeGroup('not-a-date'), 'infant');
});

test('getSelectedVaccine stays empty until the user chooses or searches for a vaccine', () => {
  const profile = { category: 'Person', gender: 'Female', dob: '2010-01-01' };
  const vaccines = [
    { name: 'MMR', diseasePrevented: 'Measles', overview: 'Live vaccine', whatItProtectsAgainst: 'Measles', keywords: ['measles'] },
    { name: 'Tdap', diseasePrevented: 'Whooping cough', overview: 'Boosters', whatItProtectsAgainst: 'Diphtheria', keywords: ['whooping cough'] },
  ];

  assert.equal(getSelectedVaccine(profile, vaccines, '', ''), null);
  assert.deepEqual(getSelectedVaccine(profile, vaccines, 'MMR', ''), { name: 'MMR', diseasePrevented: 'Measles', overview: 'Live vaccine', whatItProtectsAgainst: 'Measles', keywords: ['measles'] });
});
