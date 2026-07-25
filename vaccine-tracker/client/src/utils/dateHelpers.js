// Shared date-math used by ProfileCard, VaccineRow, and the dashboard chart,
// so age/date logic doesn't get reimplemented slightly differently everywhere.

export function getAgeLabel(dob) {
  const now = new Date();
  const birth = new Date(dob);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years}y ${months}m`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
