import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
 
export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [profileStats, setProfileStats] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
 
  const loadProfiles = async () => {
    const { data } = await api.get('/profiles');
    setProfiles(data);

    const stats = await Promise.all(
      data.map(async (profile) => {
        try {
          const { data: recordData } = await api.get(`/records/${profile._id}`);
          return [profile._id, {
            overdue: recordData.status?.overdue?.length || 0,
            upcoming: recordData.status?.upcoming?.length || 0,
            completed: recordData.status?.completed?.length || 0,
          }];
        } catch {
          return [profile._id, { overdue: 0, upcoming: 0, completed: 0 }];
        }
      })
    );

    setProfileStats(Object.fromEntries(stats));
  };
 
  useEffect(() => { loadProfiles(); }, []);
 
  const handleAddProfile = async () => {
    if (!name || !dob || !gender || !relationship) return;
    await api.post('/profiles', { name, dob, gender, relationship });
    setName(''); setDob(''); setGender(''); setRelationship(''); setShowAdd(false);
    loadProfiles();
  };
 
  const handleDelete = async (id) => {
    await api.delete(`/profiles/${id}`);
    loadProfiles();
  };
 
  return (
    <div className="page-shell">
      <div className="container">
 
        <div className="topbar">
          <div className="brand-block">
            <div className="brand-icon">IC</div>
            <div>
              <h3>ImmuniCare</h3>
              <p>{user?.name}'s family record</p>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add profile</button>
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
          </div>
        </div>
 
        <div className="dashboard-hero">
          <span className="eyebrow">Welcome back</span>
          <h1>Every profile, one record.</h1>
          <p>Pick a profile below to see what's complete, what's coming up, and what's overdue.</p>
        </div>
 
        <div className="dashboard-section-head">
          <h3>Your profiles</h3>
          <span className="dashboard-count">
            {profiles.length} {profiles.length === 1 ? 'profile' : 'profiles'}
          </span>
        </div>
 
        {profiles.length === 0 && (
          <div className="card">
            <p className="empty-state">No profiles yet — add your first one to start tracking.</p>
          </div>
        )}
 
        <div className="profile-list">
          {profiles.map(p => (
            <ProfileCard
              key={p._id}
              profile={p}
              stats={profileStats[p._id]}
              onOpen={(profile) => navigate(`/profile/${profile._id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
 
      {showAdd && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ marginBottom: 16 }}>Add new profile</h3>
 
            <label className="field-label">Name</label>
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
 
            <label className="field-label">Date of birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
 
            <label className="field-label">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
 
            <label className="field-label">Relationship</label>
            <select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
              <option value="">Select relationship</option>
              <option value="Self">Self</option>
              <option value="Spouse">Spouse</option>
              <option value="Child">Child</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Other">Other</option>
            </select>
 
            <div className="topbar-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={handleAddProfile}>Add profile</button>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 