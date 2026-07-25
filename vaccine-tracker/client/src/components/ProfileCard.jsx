import { getAgeLabel } from '../utils/dateHelpers';
 
export default function ProfileCard({ profile, onOpen, onDelete }) {
  const initial = profile.name?.charAt(0)?.toUpperCase() || '?';
 
  return (
    <div className="profile-list-item" onClick={() => onOpen(profile)}>
      <div className="profile-list-item__left">
        <div className="profile-avatar">{initial}</div>
        <div>
          <strong>{profile.name}</strong>
          <div className="profile-list-item__meta">
            {getAgeLabel(profile.dob)}
            <span className="relationship-stamp">{profile.relationship}</span>
          </div>
        </div>
      </div>
      <div className="profile-list-item__right">
        <button
          className="btn btn-ghost"
          style={{ padding: '6px 12px' }}
          onClick={(e) => { e.stopPropagation(); onDelete(profile._id); }}
        >
          Delete
        </button>
        <span className="profile-list-item__arrow">→</span>
      </div>
    </div>
  );
}
 