import { useEffect, useState } from 'react';
import api from '../services/api';
import { VACCINE_REFERENCE } from '../data/vaccineReference';
import { getLoggableVaccines } from '../utils/vaccineEligibility';

const IMPORTANCE_STAMP = {
  Critical: 'overdue',
  High: 'upcoming',
  Routine: 'done',
};

export default function VaccineInfoModal({ onClose, profile }) {
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

  const vaccines = getLoggableVaccines(profile, VACCINE_REFERENCE);
  const [selectedName, setSelectedName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const normalizedSelection = (selectedName || searchQuery || '').trim().toLowerCase();
  const selected = vaccines.find((vaccine) => vaccine.name?.toLowerCase() === normalizedSelection) || null;
  const selectedImportance = selected?.importance && IMPORTANCE_STAMP[selected.importance]
    ? selected.importance
    : 'Routine';

  const filteredVaccines = vaccines.filter(v => {
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

  const handleSelectVaccine = (vaccine) => {
    setSelectedName(vaccine.name);
    setSearchQuery(vaccine.name);
    setIsFocused(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 style={{ marginBottom: 12 }}>Vaccine information</h3>

        <input
          type="text"
          placeholder="Search vaccine name or disease"
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
                  onClick={() => handleSelectVaccine(v)}
                >
                  {v.name}
                </button>
              ))
            ) : (
              <div className="search-suggestion search-suggestion--empty">No matching vaccines</div>
            )}
          </div>
        )}

        <div className="card vaccine-info-card">
          {!selected?.name ? (
            <div className="empty-state">Select a vaccine from the search list to view its details.</div>
          ) : (
            <>
              <div className="vaccine-info-card__head">
                <div style={{ minWidth: 0 }}>
                  <strong>{selected?.name}</strong>
                  <p className="vaccine-info-card__subtitle">{selected?.overview}</p>
                </div>
                <span className={`stamp ${IMPORTANCE_STAMP[selectedImportance]}`}>{selected?.importance || 'Routine'}</span>
              </div>

              {selected?.petType && (
                <span className="relationship-stamp" style={{ marginLeft: 0, marginBottom: 10, display: 'inline-block' }}>
                  {selected?.petType} vaccine
                </span>
              )}

              <div className="vaccine-info-card__section">
                <span className="field-label">What it protects against</span>
                <p>{selected?.whatItProtectsAgainst}</p>
              </div>

              <div className="vaccine-info-card__section">
                <span className="field-label">Who needs it</span>
                <p>{selected?.whoNeedsIt}</p>
              </div>

              <div className="vaccine-info-card__section">
                <span className="field-label">Typical schedule</span>
                <p>{selected?.typicalSchedule}</p>
              </div>

              <div className="vaccine-info-card__section">
                <span className="field-label">Why this matters</span>
                <p>{selected?.details}</p>
              </div>

              <div className="vaccine-info-card__section">
                <span className="field-label">Possible symptoms</span>
                <div className="symptom-tier symptom-tier--common">
                  <strong>Commonly reported</strong>
                  <p className="symptom-tier__caption">Usually resolves in 24–48 hrs</p>
                  <ul>
                    {selected.symptomsCommon?.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="symptom-tier symptom-tier--alert">
                  <strong>Seek vet/doctor care if you notice</strong>
                  <ul>
                    {selected.symptomsSeekCare?.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="source-note">{selected?.sourceNote}</div>
            </>
          )}
        </div>

        <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
