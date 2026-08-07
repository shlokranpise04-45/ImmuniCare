import { useEffect, useState } from 'react';
import api from '../services/api';
import { VACCINE_REFERENCE } from '../data/vaccineReference';
import { getLoggableVaccines, getAgeWindowWarning } from '../utils/vaccineEligibility';
 
export default function AddVaccineModal({ profileId, profile, onClose, onAdded }) {
  const [familyEntries, setFamilyEntries] = useState([]);

  useEffect(() => {
    let active = true;
    if (!profile?._id || profile.category === 'Pet' || profile.gender !== 'Female') {
      setFamilyEntries([]);
      return () => { active = false; };
    }

    api.get(`/profiles/${profile._id}/entries`)
      .then(({ data }) => {
        if (active) setFamilyEntries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setFamilyEntries([]);
      });

    return () => { active = false; };
  }, [profile?._id, profile?.category, profile?.gender]);

  const availableVaccines = getLoggableVaccines(profile, VACCINE_REFERENCE);
  const [vaccineName, setVaccineName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [doseNumber, setDoseNumber] = useState(1);
  const [dateTaken, setDateTaken] = useState('');
  const [error, setError] = useState('');

  const selectedVaccine = availableVaccines.find(v => v.name === vaccineName) || availableVaccines[0];
  const doseOptions = Array.from({ length: selectedVaccine?.totalDoses || 0 }, (_, i) => i + 1);
  const isDateTakenValid = (value) => {
    if (!value) return false;
    const parsed = new Date(`${value}T00:00:00`);
    return !Number.isNaN(parsed.getTime());
  };
  const warning = dateTaken && isDateTakenValid(dateTaken)
    ? getAgeWindowWarning(selectedVaccine, profile, dateTaken)
    : null;
  const filteredVaccines = availableVaccines.filter(v => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const searchable = [
      v.name,
      v.diseasePrevented,
      v.overview,
      v.whatItProtectsAgainst,
      ...(Array.isArray(v.keywords) ? v.keywords : []),
    ].join(' ').toLowerCase();
    return searchable.includes(query);
  });
 
  const handleVaccineChange = (name) => {
    setVaccineName(name);
    setSearchQuery(name);
    setDoseNumber(1); // reset dose number whenever the vaccine changes
    setIsFocused(false);
  };
 
  const handleSubmit = async () => {
    if (!dateTaken) return setError('Please pick a date');
    if (!isDateTakenValid(dateTaken)) return setError('Please pick a valid date');

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
        <input
          type="date"
          value={dateTaken}
          onChange={(e) => {
            setDateTaken(e.target.value);
            if (error) setError('');
          }}
        />
        {warning && <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>{warning}</p>}
 
        {error && <p style={{ color: 'var(--stamp-red)', fontSize: 13, marginTop: 4 }}>{error}</p>}
 
        <div className="topbar-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>Add record</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
