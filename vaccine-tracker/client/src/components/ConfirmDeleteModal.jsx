export default function ConfirmDeleteModal({ message, confirmLabel, onConfirm, onCancel, isDeleting = false }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(event) => event.stopPropagation()} style={{ maxWidth: 360 }}>
        <h3 style={{ marginBottom: 8 }}>ImmuniCare says</h3>
        <p style={{ margin: '0 0 16px', color: 'var(--ink-soft)' }}>{message}</p>
        <div className="topbar-actions">
          <button className="btn btn-red" type="button" onClick={onConfirm} disabled={isDeleting}>{isDeleting ? 'Deleting…' : confirmLabel}</button>
          <button className="btn btn-ghost" type="button" onClick={onCancel} disabled={isDeleting}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
