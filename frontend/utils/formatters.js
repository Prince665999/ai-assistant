export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatCurrency(value) {
  const num = Number(value) || 0;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value) {
  const num = Number(value) || 0;
  return num.toLocaleString();
}

export function formatPercent(value) {
  const num = Number(value) || 0;
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
}

export function truncate(text, maxLength = 80) {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export default { formatDate, formatShortDate, formatCurrency, formatNumber, formatPercent, truncate };
