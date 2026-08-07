const POSTPARTUM_SPECIFIC_IDS = new Set(['mmr_postpartum', 'varicella_postpartum', 'rhogam_pregnancy']);

function isValidDate(value) {
  if (value instanceof Date) return !Number.isNaN(value.getTime());
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const parsed = new Date(trimmed);
    return !Number.isNaN(parsed.getTime());
  }
  return false;
}

function getAgeInMonths(dob, referenceDate = new Date()) {
  if (!dob) return 0;
  const now = isValidDate(referenceDate) ? (referenceDate instanceof Date ? referenceDate : new Date(referenceDate)) : new Date();
  const birth = isValidDate(dob) ? (dob instanceof Date ? dob : new Date(dob)) : null;
  if (!birth) return 0;
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(months, 0);
}

function getAgeGroup(dob, referenceDate = new Date()) {
  const ageMonths = getAgeInMonths(dob, referenceDate);
  if (ageMonths <= 24) return 'infant';
  if (ageMonths < 144) return 'child';
  if (ageMonths < 216) return 'adolescent';
  if (ageMonths < 720) return 'adult';
  return 'elderly';
}

function getPregnancyStatus(profile) {
  if (!profile) return 'unknown';
  if (typeof profile.pregnancyStatus === 'string' && profile.pregnancyStatus) return profile.pregnancyStatus;
  if (profile.isPregnant === true) return 'pregnant';
  if (profile.isPregnant === false) return 'not_pregnant';
  return 'unknown';
}

function isPregnancySpecificEligible(vaccine, profile) {
  const pregnancyStatus = getPregnancyStatus(profile);
  if (!vaccine?.eligibility?.pregnancySpecific) return true;
  if (POSTPARTUM_SPECIFIC_IDS.has(vaccine.id)) {
    return pregnancyStatus === 'postpartum';
  }
  return pregnancyStatus === 'pregnant';
}

function isRecommendedNow(vaccine, person, referenceDate = new Date()) {
  if (!person || !vaccine) return false;

  if (person.category === 'Pet') {
    return Boolean(vaccine.petType && vaccine.petType === person.petType);
  }

  if (vaccine.petType) return false;

  if (person.gender && vaccine.gender && vaccine.gender !== 'All' && vaccine.gender !== person.gender) {
    return false;
  }

  const eligibility = vaccine.eligibility || {};
  const ageGroups = Array.isArray(eligibility.ageGroups) ? eligibility.ageGroups : [];
  const minAgeMonths = eligibility.minAgeMonths ?? 0;
  const maxAgeMonths = eligibility.maxAgeMonths ?? null;
  const ageMonths = getAgeInMonths(person.dob, referenceDate);
  const ageGroup = getAgeGroup(person.dob, referenceDate);

  if (ageGroups.length > 0 && !ageGroups.includes(ageGroup)) {
    return false;
  }

  if (ageMonths < minAgeMonths) return false;
  if (maxAgeMonths !== null && ageMonths > maxAgeMonths) return false;

  return isPregnancySpecificEligible(vaccine, person);
}

function isLoggableAsPastRecord(vaccine, person, dateAdministered = null) {
  if (!person || !vaccine) return false;

  if (person.category === 'Pet') {
    return Boolean(vaccine.petType && vaccine.petType === person.petType);
  }

  if (vaccine.petType) return false;

  if (person.gender && vaccine.gender && vaccine.gender !== 'All' && vaccine.gender !== person.gender) {
    return false;
  }

  if (!dateAdministered) return true;
  if (!isValidDate(dateAdministered)) return true;

  const eligibility = vaccine.eligibility || {};
  const minAgeMonths = eligibility.minAgeMonths ?? 0;
  const maxAgeMonths = eligibility.maxAgeMonths ?? null;
  const ageMonths = getAgeInMonths(person.dob, dateAdministered);

  if (ageMonths < minAgeMonths) return true;
  if (maxAgeMonths !== null && ageMonths > maxAgeMonths) return true;
  return true;
}

function getEligibleVaccines(profile, vaccineList, pregnancyActive = null) {
  if (!profile || !Array.isArray(vaccineList)) return [];
  return vaccineList.filter((vaccine) => isRecommendedNow(vaccine, profile));
}

function getLoggableVaccines(profile, vaccineList) {
  if (!profile || !Array.isArray(vaccineList)) return [];
  return vaccineList.filter((vaccine) => isLoggableAsPastRecord(vaccine, profile));
}

module.exports = {
  getAgeGroup,
  getAgeInMonths,
  getEligibleVaccines,
  getLoggableVaccines,
  isRecommendedNow,
  isLoggableAsPastRecord,
};
