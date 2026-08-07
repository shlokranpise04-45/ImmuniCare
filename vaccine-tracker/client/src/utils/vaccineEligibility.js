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

function normalizeDate(value, fallback = new Date()) {
  if (isValidDate(value)) {
    return value instanceof Date ? value : new Date(value);
  }
  return isValidDate(fallback) ? (fallback instanceof Date ? fallback : new Date(fallback)) : null;
}

function getAgeInMonths(dob, referenceDate = new Date()) {
  if (!dob) return 0;
  const birth = normalizeDate(dob, null);
  const now = normalizeDate(referenceDate, new Date());
  if (!birth || !now) return 0;
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(months, 0);
}

export function getAgeGroup(dob, referenceDate = new Date()) {
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
  if (!vaccine?.eligibility?.pregnancySpecific) return true;
  const pregnancyStatus = getPregnancyStatus(profile);
  if (POSTPARTUM_SPECIFIC_IDS.has(vaccine.id)) {
    return pregnancyStatus === 'postpartum';
  }
  return pregnancyStatus === 'pregnant';
}

export function isRecommendedNow(vaccine, person, referenceDate = new Date()) {
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

export function isLoggableAsPastRecord(vaccine, person) {
  if (!person || !vaccine) return false;

  if (person.category === 'Pet') {
    return Boolean(vaccine.petType && vaccine.petType === person.petType);
  }

  if (vaccine.petType) return false;

  if (person.gender && vaccine.gender && vaccine.gender !== 'All' && vaccine.gender !== person.gender) {
    return false;
  }

  return true;
}

export function getEligibleVaccines(profile, vaccineList) {
  if (!profile || !Array.isArray(vaccineList)) return [];
  return vaccineList.filter((vaccine) => isRecommendedNow(vaccine, profile));
}

export function getLoggableVaccines(profile, vaccineList) {
  if (!profile || !Array.isArray(vaccineList)) return [];
  return vaccineList.filter((vaccine) => isLoggableAsPastRecord(vaccine, profile));
}

export function getAgeWindowWarning(vaccine, person, dateAdministered) {
  if (!vaccine || !person || !dateAdministered) return null;
  if (!isValidDate(dateAdministered)) return null;

  const eligibility = vaccine.eligibility || {};
  const minAgeMonths = eligibility.minAgeMonths ?? 0;
  const maxAgeMonths = eligibility.maxAgeMonths ?? null;
  const ageMonths = getAgeInMonths(person.dob, dateAdministered);

  if (maxAgeMonths !== null && ageMonths > maxAgeMonths) {
    return 'This date puts the recipient outside the typical age range for this vaccine.';
  }

  if (ageMonths < minAgeMonths) {
    return 'This date puts the recipient outside the typical age range for this vaccine.';
  }

  return null;
}

