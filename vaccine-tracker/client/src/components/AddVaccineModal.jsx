import { useState } from 'react';
import api from '../services/api';
 

const VACCINES = [
  { name: 'BCG', totalDoses: 1, gender: 'All' },
  { name: 'Hepatitis B', totalDoses: 3, gender: 'All' },
  { name: 'Oral Polio Vaccine (OPV)', totalDoses: 5, gender: 'All' },
  { name: 'Inactivated Polio Vaccine (IPV)', totalDoses: 2, gender: 'All' },
  { name: 'DTP (Diphtheria, Tetanus, Pertussis)', totalDoses: 5, gender: 'All' },
  { name: 'Hib (Haemophilus influenzae type b)', totalDoses: 4, gender: 'All' },
  { name: 'PCV (Pneumococcal Conjugate Vaccine)', totalDoses: 3, gender: 'All' },
  { name: 'PPSV23 (Pneumococcal Polysaccharide)', totalDoses: 1, gender: 'All' },
  { name: 'Rotavirus Vaccine', totalDoses: 3, gender: 'All' },
  { name: 'MMR (Measles, Mumps, Rubella)', totalDoses: 2, gender: 'All' },
  { name: 'Varicella (Chickenpox)', totalDoses: 2, gender: 'All' },
  { name: 'Hepatitis A', totalDoses: 2, gender: 'All' },
  { name: 'Typhoid Conjugate Vaccine', totalDoses: 1, gender: 'All' },
  { name: 'Japanese Encephalitis (JE)', totalDoses: 2, gender: 'All' },
  { name: 'Measles-Rubella (MR)', totalDoses: 2, gender: 'All' },
  { name: 'Tdap Booster', totalDoses: 1, gender: 'All' },
  { name: 'HPV (Human Papillomavirus)', totalDoses: 2, gender: 'All' },
  { name: 'Meningococcal (MenACWY)', totalDoses: 2, gender: 'All' },
  { name: 'Influenza (Flu)', totalDoses: 1, gender: 'All' },
  { name: 'Rabies (Post-Exposure Prophylaxis)', totalDoses: 4, gender: 'All' },
  { name: 'Yellow Fever', totalDoses: 1, gender: 'All' },
  { name: 'Oral Cholera Vaccine', totalDoses: 2, gender: 'All' },
  { name: 'Zoster (Shingles) Vaccine', totalDoses: 2, gender: 'All' },
  { name: 'Td/TT in Pregnancy', totalDoses: 2, gender: 'Female' },
  { name: 'Rubella (Pre-marital / Pre-conception)', totalDoses: 1, gender: 'Female' },
];
 
export default function AddVaccineModal({ profileId, profile, onClose, onAdded }) {
  // Only show vaccines that apply to this profile's gender
  const availableVaccines = VACCINES.filter(
    v => v.gender === 'All' || v.gender === profile?.gender
  );
 
  const [vaccineName, setVaccineName] = useState(availableVaccines[0]?.name || '');
  const [searchQuery, setSearchQuery] = useState(availableVaccines[0]?.name || '');
  const [isFocused, setIsFocused] = useState(false);
  const [doseNumber, setDoseNumber] = useState(1);
  const [dateTaken, setDateTaken] = useState('');
  const [error, setError] = useState('');
 
  const selectedVaccine = availableVaccines.find(v => v.name === vaccineName) || availableVaccines[0];
  const doseOptions = Array.from({ length: selectedVaccine?.totalDoses || 0 }, (_, i) => i + 1);
  const filteredVaccines = availableVaccines.filter(v => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const name = v.name.toLowerCase();
    return name.startsWith(query) || name.includes(query);
  });
 
  const handleVaccineChange = (name) => {
    setVaccineName(name);
    setSearchQuery(name);
    setDoseNumber(1); // reset dose number whenever the vaccine changes
    setIsFocused(false);
  };
 
  const handleSubmit = async () => {
    if (!dateTaken) return setError('Please pick a date');
    try {
      await api.post(`/records/${profileId}`, { vaccineName, doseNumber, dateTaken });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record');
    }
  };
 
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 style={{ marginBottom: 16 }}>Add vaccination record</h3>
 
        <label className="field-label">Vaccine</label>
        <input
          type="text"
          placeholder="Search vaccine name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 120)}
        />
        {isFocused && (
          <div className="search-suggestions">
            {filteredVaccines.length > 0 ? (
              filteredVaccines.map(v => (
                <button
                  key={v.name}
                  type="button"
                  className="search-suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleVaccineChange(v.name)}
                >
                  {v.name}
                </button>
              ))
            ) : (
              <div className="search-suggestion search-suggestion--empty">No matching vaccines</div>
            )}
          </div>
        )}
 
        <label className="field-label">Dose</label>
        <select value={doseNumber} onChange={(e) => setDoseNumber(Number(e.target.value))}>
          {doseOptions.map(n => (
            <option key={n} value={n}>
              {selectedVaccine?.totalDoses === 1 ? 'Single dose' : `Dose ${n} of ${selectedVaccine?.totalDoses || 0}`}
            </option>
          ))}
        </select>
 
        <label className="field-label">Date taken</label>
        <input type="date" value={dateTaken} onChange={(e) => setDateTaken(e.target.value)} />
 
        {error && <p style={{ color: 'var(--stamp-red)', fontSize: 13, marginTop: 4 }}>{error}</p>}
 
        <div className="topbar-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>Add record</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}