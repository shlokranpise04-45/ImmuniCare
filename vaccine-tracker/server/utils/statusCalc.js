const vaccineReference = require('../data/vaccineReference');
const petVaccineReference = require('../data/petVaccineReference');
const { isRecommendedNow } = require('./vaccineEligibility');
 

const SITUATIONAL_VACCINE_IDS = new Set(['rabies_pep', 'tt_pregnancy']);

function getAgeInMonths(dob) {
  const now = new Date();
  const birth = new Date(dob);
  let months = (now.getFullYear() - birth.getFullYear()) * 12;
  months += now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  return Math.max(months, 0);
}
 
function daysBetween(dateA, dateB) {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((dateB.getTime() - dateA.getTime()) / MS_PER_DAY);
}
 

function getVaccineStatus(profile, records) {
  const reference = profile.category === 'Pet'
    ? petVaccineReference.filter(vaccine => vaccine.petType === profile.petType)
    : vaccineReference;
  const ageMonths = getAgeInMonths(profile.dob);
  const today = new Date();
 
  const completed = [];
  const upcoming = [];
  const overdue = [];
 
  for (const vaccine of reference) {

    if (profile.category !== 'Pet' && vaccine.gender !== 'All' && vaccine.gender !== profile.gender) continue;
 
    
    const recordsForVaccine = records
      .filter(r => r.vaccineName === vaccine.name)
      .sort((a, b) => a.doseNumber - b.doseNumber);
 
    const dosesTaken = recordsForVaccine.length;
    const totalDoses = vaccine.totalDoses || 1;
 
    if (dosesTaken >= totalDoses) {
      completed.push({
        ...vaccine,
        dosesTaken,
        totalDoses,
        records: recordsForVaccine,
        dateTaken: recordsForVaccine[recordsForVaccine.length - 1].dateTaken, 
      });
      continue;
    }
 
   
    if (SITUATIONAL_VACCINE_IDS.has(vaccine.id) && dosesTaken === 0) continue;
    if (!isRecommendedNow(vaccine, profile, today)) continue;
 
    const nextDose = vaccine.doseSchedule[dosesTaken];
    if (!nextDose) continue;
    const lastRecord = recordsForVaccine[recordsForVaccine.length - 1];
 
    let intervalFloorMet = true;
    if (lastRecord) {
      const gapSoFar = daysBetween(new Date(lastRecord.dateTaken), today);
      intervalFloorMet = gapSoFar >= nextDose.minIntervalDaysFromPrevious;
    }
 
    const entry = {
      ...vaccine,
      dosesTaken,
      totalDoses,
      nextDoseNumber: nextDose.doseNumber,
      nextDoseLabel: nextDose.label,
      nextDose,
      records: recordsForVaccine,
    };
    const ageReached = ageMonths >= nextDose.ageMonths;
 
    if (ageReached && intervalFloorMet) {
      overdue.push(entry);
    } else if (nextDose.ageMonths - ageMonths <= 6 || (dosesTaken > 0 && !intervalFloorMet)) {
     
      upcoming.push(entry);
    }
  
  }
 
  return { completed, upcoming, overdue, ageMonths };
}
 
module.exports = { getAgeInMonths, getVaccineStatus };
