import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';

const FAMILY_RELATIONSHIPS = ['Self', 'Spouse', 'Child', 'Parent', 'Sibling', 'Other'];

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [profileStats, setProfileStats] = useState({});
  const [category, setCategory] = useState('Family');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [relationship, setRelationship] = useState('');
  const [petType, setPetType] = useState('');
  const [breed, setBreed] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState('');
  const { user, logout, updateEmail } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setName(''); setDob(''); setGender(''); setRelationship(''); setPetType(''); setBreed('');
  };

  const loadProfiles = async (activeCategory = category) => {
    const { data } = await api.get('/profiles', { params: { category: activeCategory } });
    setProfiles(data);
    const stats = await Promise.all(data.map(async (profile) => {
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
    }));
    setProfileStats(Object.fromEntries(stats));
  };

  useEffect(() => { loadProfiles(category); }, [category]);
  useEffect(() => { setEmailDraft(user?.email || ''); }, [user?.email]);

  const handleAddProfile = async (event) => {
    event.preventDefault();
    if (!name || !dob || !gender || (category === 'Family' && !relationship) || (category === 'Pet' && !petType)) {
      setFormError(`Please complete all required ${isPets ? 'pet' : 'profile'} fields.`);
      return;
    }
    setIsSaving(true);
    setFormError('');
    try {
      const payload = isPets
        ? { name, dob, gender, petType, ...(breed.trim() ? { breed: breed.trim() } : {}) }
        : { name, dob, gender, relationship };
      await api.post(isPets ? '/pets' : '/profiles', payload);
      resetForm();
      setShowAdd(false);
      await loadProfiles(category);
    } catch (err) {
      console.error('Failed to create profile:', err);
      setFormError(err.response?.data?.message || 'Could not save this profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/profiles/${id}`);
    loadProfiles();
  };

  const handleUpdateEmail = async (event) => {
    event.preventDefault();
    const trimmedEmail = emailDraft.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter an email address.');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError('');
    setEmailNotice('');
    try {
      await updateEmail(trimmedEmail);
      setEmailNotice('Email updated successfully.');
      setShowEmailModal(false);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Could not update your email address.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const isPets = category === 'Pet';
  const groupLabel = isPets ? 'pets' : 'family';

  return (
    <div className="page-shell">
      <div className="container">
        <div className="topbar">
          <div className="brand-block">
            <div className="brand-icon">IC</div>
            <div><h3>ImmuniCare</h3><p>{user?.name}'s {groupLabel} records</p></div>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-ghost" onClick={() => { setEmailDraft(user?.email || ''); setEmailError(''); setShowEmailModal(true); }}>Update email</button>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowAdd(true); }}>+ Add {isPets ? 'pet' : 'profile'}</button>
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="dashboard-hero">
          <span className="eyebrow">Welcome back</span>
          <h1>{isPets ? 'Every pet, protected.' : 'Every profile, one record.'}</h1>
          <p>{isPets ? 'Track dog and cat vaccinations in one place.' : "Pick a profile below to see what's complete, what's coming up, and what's overdue."}</p>
        </div>

        <div className="profile-switch" role="tablist" aria-label="Profile category">
          <button className={category === 'Family' ? 'profile-switch__option active' : 'profile-switch__option'} onClick={() => setCategory('Family')} role="tab" aria-selected={category === 'Family'}>Family</button>
          <button className={category === 'Pet' ? 'profile-switch__option active' : 'profile-switch__option'} onClick={() => setCategory('Pet')} role="tab" aria-selected={category === 'Pet'}>Pets</button>
        </div>

        {emailNotice && <div className="card" style={{ marginBottom: 16 }}><p className="empty-state">{emailNotice}</p></div>}

        <div className="dashboard-section-head">
          <h3>Your {groupLabel}</h3>
          <span className="dashboard-count">{profiles.length} {profiles.length === 1 ? (isPets ? 'pet' : 'profile') : (isPets ? 'pets' : 'profiles')}</span>
        </div>

        {profiles.length === 0 && <div className="card"><p className="empty-state">No {groupLabel} yet — add your first {isPets ? 'pet' : 'profile'} to start tracking.</p></div>}
        <div className="profile-list">
          {profiles.map(profile => <ProfileCard key={profile._id} profile={profile} stats={profileStats[profile._id]} onOpen={() => navigate(`/profile/${profile._id}`)} onDelete={handleDelete} />)}
        </div>
      </div>

      {showEmailModal && (
        <div className="modal-overlay">
          <form className="modal-box" onSubmit={handleUpdateEmail}>
            <h3 style={{ marginBottom: 16 }}>Update email address</h3>
            <p className="empty-state" style={{ marginBottom: 12 }}>Use this if you signed up with the wrong address or want to change it later.</p>
            <label className="field-label">Email</label>
            <input type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} placeholder="name@example.com" />
            <div className="topbar-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" type="submit" disabled={isUpdatingEmail}>{isUpdatingEmail ? 'Saving…' : 'Save email'}</button>
              <button className="btn btn-ghost" type="button" onClick={() => { setShowEmailModal(false); setEmailError(''); }}>Cancel</button>
            </div>
            {emailError && <p className="form-error" role="alert">{emailError}</p>}
          </form>
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay">
          <form className="modal-box" onSubmit={handleAddProfile}>
            <h3 style={{ marginBottom: 16 }}>Add new {isPets ? 'pet' : 'profile'}</h3>
            <label className="field-label">Name</label>
            <input placeholder={isPets ? 'Pet name' : 'Full name'} value={name} onChange={(e) => setName(e.target.value)} />
            <label className="field-label">Date of birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            <label className="field-label">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
            {isPets ? <>
              <label className="field-label">Pet type</label>
              <select value={petType} onChange={(e) => setPetType(e.target.value)}><option value="">Select pet type</option><option value="Dog">Dog</option><option value="Cat">Cat</option></select>
              <label className="field-label">Breed <span className="field-label__optional">(optional)</span></label>
              <input placeholder="e.g. Labrador Retriever" value={breed} onChange={(e) => setBreed(e.target.value)} />
            </> : <>
              <label className="field-label">Relationship</label>
              <select value={relationship} onChange={(e) => setRelationship(e.target.value)}><option value="">Select relationship</option>{FAMILY_RELATIONSHIPS.map(item => <option key={item} value={item}>{item}</option>)}</select>
            </>}
            <div className="topbar-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving…' : `Add ${isPets ? 'pet' : 'profile'}`}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
            {formError && <p className="form-error" role="alert">{formError}</p>}
          </form>
        </div>
      )}
    </div>
  );
}
