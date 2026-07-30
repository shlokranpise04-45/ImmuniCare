import { useState } from 'react';
import { getAgeLabel } from '../utils/dateHelpers';
 
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
            <span className="relationship-stamp">{profile.relationship}</span>
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

    {showConfirm && (
      <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360 }}>
          <h3 style={{ marginBottom: 8 }}>ImmuniCare says</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--ink-soft)' }}>
            Are you sure you want to delete this profile? All data will be lost.
          </p>
          <div className="topbar-actions">
            <button className="btn btn-red" onClick={confirmDelete}>Delete profile</button>
            <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
 