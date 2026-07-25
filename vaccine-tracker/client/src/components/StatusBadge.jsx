export default function StatusBadge({ type }) {
  const styles = {
    overdue: { label: 'Overdue', className: 'overdue' },
    upcoming: { label: 'Upcoming', className: 'upcoming' },
    completed: { label: 'Completed', className: 'done' },
  };
  const style = styles[type] || styles.completed;
  return <span className={`stamp ${style.className}`}>{style.label}</span>;
}
