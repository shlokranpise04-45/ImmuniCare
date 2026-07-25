import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getAgeLabel } from '../utils/dateHelpers';
import VaccineRow from '../components/VaccineRow';
import VaccineChart from '../components/VaccineChart';
import VaccineInfoModal from '../components/VaccineInfoModal';
import AddVaccineModal from '../components/AddVaccineModal';

export default function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');

  const load = async () => {
    const { data } = await api.get(`/records/${id}`);
    setProfile(data.profile);
    setStatus(data.status);
  };

  useEffect(() => { load(); }, [id]);

  const handleSendReminder = async () => {
    setNotifyMsg('Sending...');
    try {
      const { data } = await api.post(`/notify/${id}`);
      setNotifyMsg(data.message);
    } catch (err) {
      setNotifyMsg(err.response?.data?.message || 'Failed to send');
    }
  };

  if (!profile || !status) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div className="card">
        <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← Back</button>
        <h2 style={{ marginTop: 12 }}>{profile.name}</h2>
        <p className="empty-state">Age: {getAgeLabel(profile.dob)}</p>
        <VaccineChart status={status} />
      </div>

      <div className="card">
        <h3>Vaccination Records</h3>
        {status.completed.length === 0 && <p className="empty-state">No records yet.</p>}
        <div className="record-list">
          {status.completed.map(v => <VaccineRow key={v.name} vaccine={v} type="completed" />)}
        </div>
      </div>

      <div className="status-row">
        <div className="status-col">
          <h4 className="badge-upcoming">Upcoming</h4>
          <div className="record-list">
            {status.upcoming.map(v => <VaccineRow key={v.name} vaccine={v} type="upcoming" />)}
            {status.upcoming.length === 0 && <p className="empty-state">None</p>}
          </div>
        </div>
        <div className="status-col">
          <h4 className="badge-overdue">Overdue</h4>
          <div className="record-list">
            {status.overdue.map(v => <VaccineRow key={v.name} vaccine={v} type="overdue" />)}
            {status.overdue.length === 0 && <p className="empty-state">None</p>}
          </div>
        </div>
        <div className="status-col">
          <h4 className="badge-completed">Completed</h4>
          <div className="record-list">
            {status.completed.map(v => <VaccineRow key={v.name} vaccine={v} type="completed" />)}
            {status.completed.length === 0 && <p className="empty-state">None</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => setShowAddVaccine(true)}>+ Add Vaccination</button>
          <button className="btn btn-ghost" onClick={() => setShowInfo(true)}>Vaccine Info</button>
          <button className="btn btn-red" onClick={handleSendReminder}>Email Report</button>
        </div>
        {notifyMsg && <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>{notifyMsg}</p>}
      </div>

      {showInfo && <VaccineInfoModal onClose={() => setShowInfo(false)} />}
      {showAddVaccine && (
        <AddVaccineModal profileId={id} profile={profile} onClose={() => setShowAddVaccine(false)} onAdded={load} />
      )}
    </div>
  );
}
