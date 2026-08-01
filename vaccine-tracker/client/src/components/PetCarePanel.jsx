import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const RECORD_TYPES = [
  ['medical', 'Medical history'],
  ['weight', 'Weight'],
  ['document', 'Document'],
  ['note', 'Note'],
];

const today = () => new Date().toISOString().slice(0, 10);

export default function PetCarePanel({ pet, onUpdated }) {
  const [entries, setEntries] = useState([]);
  const [type, setType] = useState('medical');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [details, setDetails] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState({ name: pet.name, dob: pet.dob?.slice(0, 10), gender: pet.gender, petType: pet.petType, breed: pet.breed || '' });

  const loadEntries = async () => {
    try {
      const { data } = await api.get(`/pets/${pet._id}/entries`);
      setEntries(data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not load pet records.');
    }
  };

  useEffect(() => { loadEntries(); }, [pet._id]);

  const latestWeight = useMemo(() => entries.find(entry => entry.type === 'weight'), [entries]);

  const addEntry = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post(`/pets/${pet._id}/entries`, { type, title, date, details, weightKg: type === 'weight' ? Number(weightKg) : undefined, documentUrl });
      setTitle(''); setDetails(''); setWeightKg(''); setDocumentUrl(''); setDate(today());
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not save this pet record.');
    }
  };

  const removeEntry = async (entryId) => {
    try {
      await api.delete(`/pets/${pet._id}/entries/${entryId}`);
      await loadEntries();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not delete this pet record.');
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      const { data } = await api.patch(`/pets/${pet._id}`, editValues);
      onUpdated(data);
      setEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not update this pet.');
    }
  };

  return (
    <>
      <div className="card">
        <div className="section-actions"><h3>Pet profile</h3><button className="btn btn-ghost" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit profile'}</button></div>
        {editing ? <form onSubmit={saveProfile} className="pet-form-grid">
          <input aria-label="Pet name" value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} required />
          <input aria-label="Date of birth" type="date" value={editValues.dob || ''} onChange={(e) => setEditValues({ ...editValues, dob: e.target.value })} required />
          <select value={editValues.petType} onChange={(e) => setEditValues({ ...editValues, petType: e.target.value })} required><option value="Dog">Dog</option><option value="Cat">Cat</option></select>
          <select value={editValues.gender} onChange={(e) => setEditValues({ ...editValues, gender: e.target.value })} required><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
          <input aria-label="Breed" placeholder="Breed (optional)" value={editValues.breed} onChange={(e) => setEditValues({ ...editValues, breed: e.target.value })} />
          <button className="btn btn-primary" type="submit">Save changes</button>
        </form> : <p className="empty-state">{pet.petType}{pet.breed ? ` · ${pet.breed}` : ''}{latestWeight ? ` · Latest weight: ${latestWeight.weightKg} kg` : ''}</p>}
      </div>

      <div className="card">
        <h3>Add pet record</h3>
        <form onSubmit={addEntry} className="pet-form-grid">
          <select value={type} onChange={(e) => setType(e.target.value)}>{RECORD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <input placeholder={type === 'weight' ? 'e.g. Monthly weigh-in' : type === 'document' ? 'e.g. Rabies certificate' : 'Record title'} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          {type === 'weight' && <input type="number" min="0" step="0.01" placeholder="Weight (kg)" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />}
          {type === 'document' && <input type="url" placeholder="Document URL" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} required />}
          <input className="pet-form-grid__wide" placeholder="Details (optional)" value={details} onChange={(e) => setDetails(e.target.value)} />
          <button className="btn btn-primary" type="submit">Save record</button>
        </form>
        {message && <p className="form-error" role="alert">{message}</p>}
      </div>

      <div className="card">
        <h3>Pet history</h3>
        {entries.length === 0 ? <p className="empty-state">No medical history, weight records, documents, or notes yet.</p> : <div className="record-list">
          {entries.map(entry => <div className="record-item" key={entry._id}>
            <div><strong>{entry.title}</strong><div className="record-meta">{RECORD_TYPES.find(([value]) => value === entry.type)?.[1]} · {new Date(entry.date).toLocaleDateString()}{entry.weightKg !== undefined ? ` · ${entry.weightKg} kg` : ''}</div>{entry.details && <div className="record-meta">{entry.details}</div>}{entry.documentUrl && <a className="text-link" href={entry.documentUrl} target="_blank" rel="noreferrer">Open document</a>}</div>
            <button className="btn btn-ghost" type="button" onClick={() => removeEntry(entry._id)}>Delete</button>
          </div>)}
        </div>}
      </div>
    </>
  );
}
