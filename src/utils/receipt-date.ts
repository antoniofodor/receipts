const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const pad = (value: number) => String(value).padStart(2, '0');

// Printed like a till: "01 NOV 26 · 23:41", in the phone's own time zone. The month is spelled out so
// day-first and month-first readers agree.
export function formatReceiptDate(date: Date) {
  const day = `${pad(date.getDate())} ${MONTHS[date.getMonth()]} ${pad(date.getFullYear() % 100)}`;
  return `${day} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
