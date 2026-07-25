import { useState } from 'react';
 
 
const VACCINE_INFO = [
  { name: 'BCG', diseasePrevented: 'Tuberculosis (severe childhood forms)', gender: 'All', importance: 'Critical', totalDoses: 1, doses: '1 dose — Birth', details: 'Given once, ideally within days of birth.', complications: 'TB meningitis, disseminated TB, death in severe untreated cases.' },
  { name: 'Hepatitis B', diseasePrevented: 'Hepatitis B', gender: 'All', importance: 'Critical', totalDoses: 3, doses: '3 doses — Birth, +1.5mo (min 4wk gap), +6mo (min 8wk gap)', details: 'First dose within 24 hours of birth blocks mother-to-child transmission.', complications: 'Chronic liver infection, cirrhosis, liver cancer, liver failure.' },
  { name: 'Oral Polio Vaccine (OPV)', diseasePrevented: 'Poliomyelitis', gender: 'All', importance: 'Critical', totalDoses: 5, doses: '5 doses — Birth, 1.5mo, 2.5mo, 3.5mo (4wk gaps), booster at 16mo (6mo gap)', details: 'Given as drops. Multiple doses build strong gut immunity.', complications: 'Paralysis (often permanent), breathing muscle paralysis, death.' },
  { name: 'Inactivated Polio Vaccine (IPV)', diseasePrevented: 'Poliomyelitis', gender: 'All', importance: 'High', totalDoses: 2, doses: '2 doses — 3.5mo, 9mo (min 4mo gap)', details: 'Injectable polio vaccine given alongside OPV for extra protection.', complications: 'Paralysis, breathing muscle paralysis, death.' },
  { name: 'DTP (Diphtheria, Tetanus, Pertussis)', diseasePrevented: 'Diphtheria, Tetanus, Whooping Cough', gender: 'All', importance: 'Critical', totalDoses: 5, doses: '5 doses — 1.5, 2.5, 3.5mo (4wk gaps), boosters at 16mo (6mo gap) & 5yr (1yr gap)', details: 'Boosters are essential — immunity fades without them.', complications: 'Heart failure, paralysis, choking spasms, lockjaw, death.' },
  { name: 'Hib (Haemophilus influenzae type b)', diseasePrevented: 'Hib meningitis & pneumonia', gender: 'All', importance: 'High', totalDoses: 4, doses: '4 doses — 1.5, 2.5, 3.5mo (4wk gaps), booster at 16mo (6mo gap)', details: 'Protects against a leading cause of bacterial meningitis under age 5.', complications: 'Meningitis, pneumonia, epiglottitis, hearing loss, death.' },
  { name: 'PCV (Pneumococcal Conjugate Vaccine)', diseasePrevented: 'Pneumococcal disease (pneumonia, meningitis)', gender: 'All', importance: 'High', totalDoses: 3, doses: '3 doses — 1.5mo, 3.5mo (4wk gap), booster at 9mo (2mo gap)', details: 'Reduces pneumonia/meningitis risk in the first year of life.', complications: 'Pneumonia, bacteremia, meningitis, hearing loss, death.' },
  { name: 'PPSV23 (Pneumococcal Polysaccharide)', diseasePrevented: 'Pneumococcal disease (older/high-risk children)', gender: 'All', importance: 'Routine', totalDoses: 1, doses: '1 dose — 24mo (high-risk groups)', details: 'Given in addition to PCV for children with chronic illness or weak immunity.', complications: 'Pneumonia, bacteremia, meningitis, especially in high-risk children.' },
  { name: 'Rotavirus Vaccine', diseasePrevented: 'Rotavirus diarrhea', gender: 'All', importance: 'High', totalDoses: 3, doses: '3 doses — 1.5, 2.5, 3.5mo (4wk gaps)', details: 'Must be started before 15 weeks and completed before 8 months — a strict cutoff.', complications: 'Severe dehydration, hospitalization, death in severe cases.' },
  { name: 'MMR (Measles, Mumps, Rubella)', diseasePrevented: 'Measles, Mumps, Rubella', gender: 'All', importance: 'Critical', totalDoses: 2, doses: '2 doses — 9mo, 16mo (min 3mo gap)', details: 'Can be given as early as 6mo in outbreak settings.', complications: 'Encephalitis, pneumonia, deafness, birth defects if rubella caught in pregnancy.' },
  { name: 'Varicella (Chickenpox)', diseasePrevented: 'Chickenpox', gender: 'All', importance: 'Routine', totalDoses: 2, doses: '2 doses — 15mo, 5yr (min 3mo gap)', details: 'Two doses give much better protection than one.', complications: 'Skin infections, pneumonia, encephalitis, scarring.' },
  { name: 'Hepatitis A', diseasePrevented: 'Hepatitis A', gender: 'All', importance: 'Routine', totalDoses: 2, doses: '2 doses — 12mo, 18mo (min 6mo gap)', details: 'Spread through contaminated food/water.', complications: 'Acute liver inflammation, jaundice, rarely liver failure.' },
  { name: 'Typhoid Conjugate Vaccine', diseasePrevented: 'Typhoid fever', gender: 'All', importance: 'High', totalDoses: 1, doses: '1 dose — 9mo (booster every 2-3yr in high-exposure areas)', details: 'Single dose gives multi-year protection.', complications: 'Intestinal perforation, sepsis, death if untreated.' },
  { name: 'Japanese Encephalitis (JE)', diseasePrevented: 'Japanese Encephalitis', gender: 'All', importance: 'High', totalDoses: 2, doses: '2 doses — 9mo, 16mo (min 3mo gap)', details: 'Recommended in JE-endemic regions of India; mosquito-borne.', complications: 'Brain swelling, seizures, permanent neurological damage, death.' },
  { name: 'Measles-Rubella (MR)', diseasePrevented: 'Measles, Rubella', gender: 'All', importance: 'Critical', totalDoses: 2, doses: '2 doses — 9mo, 16mo (min 3mo gap)', details: "Used in India's UIP as a standalone shot alongside/instead of MMR.", complications: 'Measles pneumonia/encephalitis, congenital rubella syndrome in pregnancy.' },
  { name: 'Tdap Booster', diseasePrevented: 'Tetanus, Diphtheria, Pertussis (adolescent booster)', gender: 'All', importance: 'Routine', totalDoses: 1, doses: '1 dose — 11yr', details: 'Tops up fading childhood immunity around pre-teen years.', complications: 'Heart complications, lockjaw, choking spasms.' },
  { name: 'HPV (Human Papillomavirus)', diseasePrevented: 'Cervical & other HPV-related cancers', gender: 'All', importance: 'High', totalDoses: 2, doses: '2 doses — 9yr, +6mo gap (3-dose schedule if started after age 15)', details: 'Historically girls-only; now recommended for all genders.', complications: 'Cervical cancer and other HPV-related cancers later in life.' },
  { name: 'Meningococcal (MenACWY)', diseasePrevented: 'Meningococcal meningitis & bloodstream infection', gender: 'All', importance: 'Routine', totalDoses: 2, doses: '2 doses — 11yr, booster at 16yr (min 5yr gap)', details: 'Disease can progress from healthy to critical within hours.', complications: 'Sepsis, meningitis, limb loss, death within hours of onset.' },
  { name: 'Influenza (Flu)', diseasePrevented: 'Seasonal Influenza', gender: 'All', importance: 'Routine', totalDoses: 1, doses: '1 dose — annually from 6mo (2 doses, 4wk apart, for first-timers under 9yr)', details: 'Given yearly, not once.', complications: 'Pneumonia, worsening of chronic conditions, hospitalization, death in high-risk children.' },
  { name: 'Rabies (Post-Exposure Prophylaxis)', diseasePrevented: 'Rabies', gender: 'All', importance: 'Critical', totalDoses: 4, doses: '4 doses — Day 0, 3, 7, 28 after a bite/scratch (not age-based)', details: 'Given after an animal bite/scratch on a strict day-count schedule, any age.', complications: 'Rabies is fatal once symptoms appear — nearly 100% mortality without timely PEP.' },
  { name: 'Yellow Fever', diseasePrevented: 'Yellow Fever', gender: 'All', importance: 'Routine', totalDoses: 1, doses: '1 dose — 9mo (mainly for international travel)', details: 'Not part of routine Indian schedule; relevant for travel to endemic countries.', complications: 'Liver failure, hemorrhagic fever, death in severe cases.' },
  { name: 'Oral Cholera Vaccine', diseasePrevented: 'Cholera', gender: 'All', importance: 'Routine', totalDoses: 2, doses: '2 doses — 12mo, +2 weeks gap', details: 'Used mainly in outbreak-prone or flood-affected areas.', complications: 'Severe dehydration, hypovolemic shock, death if untreated.' },
  { name: 'Zoster (Shingles) Vaccine', diseasePrevented: 'Shingles (Herpes Zoster)', gender: 'All', importance: 'Routine', totalDoses: 2, doses: '2 doses — 50yr+, ~2 months apart', details: 'Adult vaccine, included for full family lifecycle tracking.', complications: 'Chronic nerve pain (post-herpetic neuralgia), vision loss if it affects the eye.' },
  { name: 'Td/TT in Pregnancy', diseasePrevented: 'Neonatal & Maternal Tetanus', gender: 'Female', importance: 'Critical', totalDoses: 2, doses: '2 doses during pregnancy (min 4wk gap) — only 1 booster needed if Td/TT given within last 5yr', details: 'Given during pregnancy regardless of age, to protect mother and newborn.', complications: 'Neonatal tetanus (often fatal), maternal tetanus.' },
  { name: 'Rubella (Pre-marital / Pre-conception)', diseasePrevented: 'Congenital Rubella Syndrome', gender: 'Female', importance: 'High', totalDoses: 1, doses: '1 dose — before marriage/pregnancy if immunity unconfirmed', details: 'Must NOT be given during pregnancy itself — only before conceiving.', complications: 'Congenital Rubella Syndrome in the baby if mother catches rubella while pregnant.' },
];
 
const IMPORTANCE_STAMP = {
  Critical: 'overdue',
  High: 'upcoming',
  Routine: 'done',
};
 
export default function VaccineInfoModal({ onClose }) {
  const [selected, setSelected] = useState(VACCINE_INFO[0]);
 
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ width: 460 }}>
        <h3 style={{ marginBottom: 12 }}>Vaccine information</h3>
 
        <select onChange={(e) => setSelected(VACCINE_INFO.find(v => v.name === e.target.value))}>
          {VACCINE_INFO.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
        </select>
 
        <div className="card vaccine-info-card">
          <div className="vaccine-info-card__head">
            <strong>{selected.name}</strong>
            <span className={`stamp ${IMPORTANCE_STAMP[selected.importance]}`}>{selected.importance}</span>
          </div>
 
          {selected.gender !== 'All' && (
            <span className="relationship-stamp" style={{ marginLeft: 0, marginBottom: 10, display: 'inline-block' }}>
              {selected.gender} only
            </span>
          )}
 
          <label className="field-label">Protects against</label>
          <p>{selected.diseasePrevented}</p>
 
          <label className="field-label">Dose schedule</label>
          <p>{selected.doses}</p>
 
          <label className="field-label">Details</label>
          <p>{selected.details}</p>
 
          <label className="field-label">If not vaccinated</label>
          <p>{selected.complications}</p>
        </div>
 
        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}