import { formatDate, formatMonths } from '../utils/dateHelpers';
import StatusBadge from './StatusBadge';

export default function VaccineRow({ vaccine, type }) {
  const doseLabel = vaccine.totalDoses > 1
    ? `${vaccine.dosesTaken || 0}/${vaccine.totalDoses} doses`
    : null;

  return (
    <div className="record-item">
      <div className="record-item__left">
        <strong>{vaccine.name}</strong>
        {doseLabel && <span className="record-dose"> {doseLabel}</span>}
        <div className="record-meta">
          {type === 'completed' && vaccine.dateTaken && (
            <span>taken {formatDate(vaccine.dateTaken)}</span>
          )}
          {type !== 'completed' && vaccine.nextDoseLabel && (
            <span>next: {vaccine.nextDoseLabel}</span>
          )}
          {type !== 'completed' && !vaccine.nextDoseLabel && (
            <span>recommended at {formatMonths(vaccine.recommendedAgeMonths)}</span>
          )}
        </div>
      </div>

      <StatusBadge type={type} />
    </div>
  );
}