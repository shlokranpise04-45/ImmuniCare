const test = require('node:test');
const assert = require('node:assert/strict');
const { getAgeGroup, getEligibleVaccines, isRecommendedNow, isLoggableAsPastRecord } = require('../utils/vaccineEligibility');

test('getAgeGroup buckets ages correctly', () => {
  const now = new Date();
  const infantDob = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const childDob = new Date(now.getFullYear() - 8, now.getMonth(), now.getDate());
  const adolescentDob = new Date(now.getFullYear() - 15, now.getMonth(), now.getDate());
  const adultDob = new Date(now.getFullYear() - 30, now.getMonth(), now.getDate());
  const elderlyDob = new Date(now.getFullYear() - 70, now.getMonth(), now.getDate());

  assert.equal(getAgeGroup(infantDob), 'infant');
  assert.equal(getAgeGroup(childDob), 'child');
  assert.equal(getAgeGroup(adolescentDob), 'adolescent');
  assert.equal(getAgeGroup(adultDob), 'adult');
  assert.equal(getAgeGroup(elderlyDob), 'elderly');
});

test('pregnant adults see both adult and pregnancy-specific vaccines', () => {
  const profile = {
    category: 'Family',
    gender: 'Female',
    dob: new Date(new Date().getFullYear() - 30, 0, 1),
    isPregnant: true,
  };

  const vaccineList = [
    {
      id: 'influenza',
      name: 'Influenza',
      eligibility: { ageGroups: ['infant', 'child', 'adolescent', 'adult', 'elderly'], minAgeMonths: 6, maxAgeMonths: null, pregnancySpecific: false },
    },
    {
      id: 'tt_pregnancy',
      name: 'Td/TT in Pregnancy',
      eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true },
    },
    {
      id: 'bcg',
      name: 'BCG',
      eligibility: { ageGroups: ['infant'], minAgeMonths: 0, maxAgeMonths: 24, pregnancySpecific: false },
    },
  ];

  const eligible = getEligibleVaccines(profile, vaccineList);
  assert.equal(eligible.length, 2);
  assert.deepEqual(eligible.map(v => v.id).sort(), ['influenza', 'tt_pregnancy']);
});

test('pregnant adults see pregnancy-specific vaccines but not postpartum-only ones', () => {
  const profile = {
    category: 'Family',
    gender: 'Female',
    dob: new Date(new Date().getFullYear() - 30, 0, 1),
    isPregnant: true,
  };

  const vaccineList = [
    { id: 'influenza', name: 'Influenza', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: false } },
    { id: 'tt_pregnancy', name: 'Td/TT in Pregnancy', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'tdap_pregnancy', name: 'Tdap in Pregnancy', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'rsv_pregnancy', name: 'RSV in Pregnancy', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'hepb_pregnancy', name: 'Hepatitis B in Pregnancy', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'mmr_postpartum', name: 'MMR Postpartum', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'varicella_postpartum', name: 'Varicella Postpartum', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'rhogam_pregnancy', name: 'RhoGAM', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'covid_pregnancy', name: 'COVID-19 in Pregnancy', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
    { id: 'influenza_pregnancy', name: 'Influenza in Pregnancy', eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true } },
  ];

  const eligible = getEligibleVaccines(profile, vaccineList);
  const eligibleIds = eligible.map(v => v.id).sort();

  assert.deepEqual(eligibleIds, ['covid_pregnancy', 'hepb_pregnancy', 'influenza', 'influenza_pregnancy', 'rsv_pregnancy', 'tdap_pregnancy', 'tt_pregnancy']);
});

test('recommended-now excludes age-out vaccines while historical logging still allows them', () => {
  const now = new Date();
  const profile = {
    category: 'Family',
    gender: 'Female',
    dob: new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()),
    pregnancyStatus: 'not_pregnant',
  };

  const polioVaccine = {
    id: 'polio',
    name: 'Polio',
    eligibility: { ageGroups: ['infant'], minAgeMonths: 0, maxAgeMonths: 24, pregnancySpecific: false },
  };

  const rhogamVaccine = {
    id: 'rhogam',
    name: 'RhoGAM',
    eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 216, maxAgeMonths: null, pregnancySpecific: true },
  };

  assert.equal(isRecommendedNow(polioVaccine, profile), false);
  assert.equal(isRecommendedNow(rhogamVaccine, profile), false);

  const administeredDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
  assert.equal(isLoggableAsPastRecord(polioVaccine, profile, administeredDate), true);
  assert.equal(isLoggableAsPastRecord(rhogamVaccine, profile, administeredDate), true);
});

test('postpartum status switches pregnancy-specific recommendations without blocking historical logging', () => {
  const now = new Date();
  const profile = {
    category: 'Family',
    gender: 'Female',
    dob: new Date(now.getFullYear() - 30, now.getMonth(), now.getDate()),
    pregnancyStatus: 'postpartum',
  };

  const pregnancyVaccine = {
    id: 'tdap_pregnancy',
    name: 'Tdap in Pregnancy',
    eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true },
  };
  const postpartumVaccine = {
    id: 'mmr_postpartum',
    name: 'MMR Postpartum',
    eligibility: { ageGroups: ['adult', 'elderly'], minAgeMonths: 180, maxAgeMonths: null, pregnancySpecific: true },
  };

  assert.equal(isRecommendedNow(pregnancyVaccine, profile), false);
  assert.equal(isRecommendedNow(postpartumVaccine, profile), true);
  assert.equal(isLoggableAsPastRecord(pregnancyVaccine, profile, new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())), true);
});
