import { useState } from 'react';
import { getAgeLabel } from '../utils/dateHelpers';
import ConfirmDeleteModal from './ConfirmDeleteModal';
 
export default function ProfileCard({ profile, stats, onOpen, onDelete }) {
  const initial = profile.name?.charAt(0)?.toUpperCase() || '?';
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    onDelete(profile._id);
  };
 
  return (
    <>
    <div className="profile-list-item" onClick={() => onOpen(profile)}>
      <div className="profile-list-item__left">
        <div className="profile-avatar">{initial}</div>
        <div>
          <strong>{profile.name}</strong>
          <div className="profile-list-item__meta" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{getAgeLabel(profile.dob)}</span>
            <span className="relationship-stamp">{profile.category === 'Pet' ? `${profile.petType}${profile.breed ? ` · ${profile.breed}` : ''}` : profile.relationship}</span>
          </div>
          <div className="profile-card-stats">
            <span className="profile-card-stat badge-overdue">{stats?.overdue || 0} overdue</span>
            <span className="profile-card-stat badge-upcoming">{stats?.upcoming || 0} upcoming</span>
            <span className="profile-card-stat badge-completed">{stats?.completed || 0} completed</span>
          </div>
        </div>
      </div>
      <div className="profile-list-item__right" style={{ gap: 10 }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '6px 12px' }}
          onClick={handleDeleteClick}
        >
          Delete
        </button>
        <span className="profile-list-item__arrow">→</span>
      </div>
    </div>

    {showConfirm && <ConfirmDeleteModal
      message="Are you sure you want to delete this profile? All data will be lost."
      confirmLabel="Delete profile"
      onConfirm={confirmDelete}
      onCancel={() => setShowConfirm(false)}
    />}
    </>
  );
}
