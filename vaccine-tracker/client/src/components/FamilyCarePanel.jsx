import { useEffect, useState } from 'react';
import api from '../services/api';

const RECORD_TYPES = [
  ['medical_history', 'Medical History'],
  ['pregnancy', 'Pregnancy'],
  ['prescription', 'Prescription'],
  ['allergy', 'Allergy'],
  ['lab_report', 'Lab Report'],
  ['surgery', 'Surgery'],
  ['hospital_visit', 'Hospital Visit'],
  ['insurance', 'Insurance'],
  ['note', 'Note'],
  ['other', 'Other'],
];

const today = () => new Date().toISOString().slice(0, 10);
const emptyRecord = () => ({ type: 'medical_history', title: '', date: today(), details: '' });

export default function FamilyCarePanel({ profile, onUpdated }) {
  const [entries, setEntries] = useState([]);
  const [record, setRecord] = useState(emptyRecord);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileValues, setProfileValues] = useState({
    name: profile.name,
    dob: profile.dob?.slice(0, 10),
    gender: profile.gender,
    relationship: profile.relationship,
    pregnancyStatus: profile.pregnancyStatus || (profile.isPregnant ? 'pregnant' : 'not_pregnant'),
  });
  const [message, setMessage] = useState('');

  const loadEntries = async () => {
    try {
      const { data } = await api.get(`/profiles/${profile._id}/entries`);
      setEntries(data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load family records.');
    }
  };

  useEffect(() => { loadEntries(); }, [profile._id]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const payload = {
        ...profileValues,
        isPregnant: profileValues.pregnancyStatus === 'pregnant',
      };
      const { data } = await api.patch(`/profiles/${profile._id}`, payload);
      onUpdated(data);
      setEditingProfile(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update this family profile.');
    }
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      if (editingEntryId) {
        await api.patch(`/profiles/${profile._id}/entries/${editingEntryId}`, record);
      } else {
        await api.post(`/profiles/${profile._id}/entries`, record);
      }
      setRecord(emptyRecord());
      setEditingEntryId(null);
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save this family record.');
    }
  };

  const editRecord = (entry) => {
    setEditingEntryId(entry._id);
    setRecord({ type: entry.type, title: entry.title, date: entry.date.slice(0, 10), details: entry.details || '' });
  };

  const deleteRecord = async (entryId) => {
    try {
      await api.delete(`/profiles/${profile._id}/entries/${entryId}`);
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not delete this family record.');
    }
  };

  return (
    <>
      <div className="card">
        <div className="section-actions"><h3>Family Profile</h3><button className="btn btn-ghost" type="button" onClick={() => setEditingProfile(!editingProfile)}>{editingProfile ? 'Cancel' : 'Edit profile'}</button></div>
        {editingProfile ? <form onSubmit={saveProfile} className="pet-form-grid">
          <input aria-label="Family member name" value={profileValues.name} onChange={(e) => setProfileValues({ ...profileValues, name: e.target.value })} required />
          <input aria-label="Date of birth" type="date" value={profileValues.dob || ''} onChange={(e) => setProfileValues({ ...profileValues, dob: e.target.value })} required />
          <select value={profileValues.gender} onChange={(e) => setProfileValues({ ...profileValues, gender: e.target.value })} required><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
          <select value={profileValues.relationship} onChange={(e) => setProfileValues({ ...profileValues, relationship: e.target.value })} required><option value="Self">Self</option><option value="Spouse">Spouse</option><option value="Child">Child</option><option value="Parent">Parent</option><option value="Sibling">Sibling</option><option value="Other">Other</option></select>
          {profileValues.gender === 'Female' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="field-label">Pregnancy status</span>
              <select value={profileValues.pregnancyStatus} onChange={(e) => setProfileValues({ ...profileValues, pregnancyStatus: e.target.value })}>
                <option value="not_pregnant">Not pregnant</option>
                <option value="pregnant">Pregnant</option>
                <option value="postpartum">Postpartum</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
          )}
          <button className="btn btn-primary" type="submit">Save changes</button>
        </form> : <p className="empty-state">{profile.relationship} · {profile.gender}</p>}
      </div>

      <div className="card">
        <h3>Family Record</h3>
        <form onSubmit={saveRecord} className="pet-form-grid">
          <select value={record.type} onChange={(e) => setRecord({ ...record, type: e.target.value })}>{RECORD_TYPES.filter(([value]) => value !== 'pregnancy' || profile.gender === 'Female').map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <input placeholder="Record title" value={record.title} onChange={(e) => setRecord({ ...record, title: e.target.value })} required />
          <input type="date" value={record.date} onChange={(e) => setRecord({ ...record, date: e.target.value })} required />
          <input className="pet-form-grid__wide" placeholder="Details (optional)" value={record.details} onChange={(e) => setRecord({ ...record, details: e.target.value })} />
          <div className="topbar-actions"><button className="btn btn-primary" type="submit">{editingEntryId ? 'Save changes' : 'Save record'}</button>{editingEntryId && <button className="btn btn-ghost" type="button" onClick={() => { setEditingEntryId(null); setRecord(emptyRecord()); }}>Cancel</button>}</div>
        </form>
        {message && <p className="form-error" role="alert">{message}</p>}
      </div>

      <div className="card">
        <h3>Family History</h3>
        {entries.length === 0 ? <p className="empty-state">No family records yet.</p> : <div className="record-list">
          {entries.map(entry => <div className="record-item" key={entry._id}>
            <div><strong>{entry.title}</strong><div className="record-meta">{RECORD_TYPES.find(([value]) => value === entry.type)?.[1]} · {new Date(entry.date).toLocaleDateString()}</div>{entry.details && <div className="record-meta">{entry.details}</div>}</div>
            <div className="topbar-actions"><button className="btn btn-ghost" type="button" onClick={() => editRecord(entry)}>Edit</button><button className="btn btn-ghost" type="button" onClick={() => deleteRecord(entry._id)}>Delete</button></div>
          </div>)}
        </div>}
      </div>
    </>
  );
}
