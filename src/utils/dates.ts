const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function parseDateValue(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value.trim());
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return null;
}

export function toInputDate(value: string | null | undefined): string {
  const date = parseDateValue(value);
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatStoredDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDisplayDate(value: string | null | undefined): string {
  const date = parseDateValue(value);
  if (!date) return '';
  return formatStoredDate(date);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function buildMonthGrid(viewDate: Date): Date[] {
  const first = startOfMonth(viewDate);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

export function toDateTimeLocalValue(value: string | null | undefined): string {
  if (!value?.trim()) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function formatDashDate(value: string | null | undefined): string {
  const date = parseDateValue(value);
  if (!date) return '—';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export function isDateExpired(value: string | null | undefined): boolean {
  const date = parseDateValue(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end < today;
}

export function formatCreatedTime(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function dateSortValue(value: string | null | undefined): number {
  const date = parseDateValue(value);
  return date ? date.getTime() : 0;
}

export { MONTHS, WEEKDAYS };
