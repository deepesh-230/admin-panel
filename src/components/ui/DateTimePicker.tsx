import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePopoverPlacement } from '../../hooks/usePopoverPlacement';
import {
  addMonths,
  buildMonthGrid,
  isSameDay,
  MONTHS,
  parseDateValue,
  WEEKDAYS,
} from '../../utils/dates';

type DateTimePickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function formatDateTimeDisplay(value: string): string {
  if (!value?.trim()) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function DateTimePicker({ label, value, onChange, className }: DateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const placement = usePopoverPlacement(open, triggerRef, popoverRef);
  const selected = parseDateValue(value);
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const [time, setTime] = useState(() => {
    const date = parseDateValue(value);
    if (!date) return '12:00';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const date = parseDateValue(value);
    if (date) {
      setViewDate(date);
      setTime(
        `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      );
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const applyDateTime = (date: Date, timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    date.setHours(hours || 0, minutes || 0, 0, 0);
    onChange(date.toISOString());
    setOpen(false);
  };

  const days = buildMonthGrid(viewDate);
  const display = formatDateTimeDisplay(value);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      {label ? <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label> : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-left text-sm',
          !display && 'text-gray-400',
        )}
      >
        <span>{display || 'Select date & time'}</span>
        <Calendar size={16} className="shrink-0 text-primary/80" />
      </button>

      {open ? (
        <div
          ref={popoverRef}
          className={cn(
            'absolute left-0 z-50 w-[300px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg',
            placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1',
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, -1))}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-gray-800">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewDate((d) => addMonths(d, 1))}
              className="rounded p-1 text-gray-500 hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-[11px] font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewDate.getMonth();
              const isSelected = selected ? isSameDay(day, selected) : false;
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => applyDateTime(new Date(day), time)}
                  className={cn(
                    'h-8 rounded text-sm',
                    !inMonth && 'text-gray-300',
                    inMonth && 'text-gray-700 hover:bg-primary/10',
                    isToday && !isSelected && 'font-semibold text-primary',
                    isSelected && 'bg-primary text-white hover:bg-primary',
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
            <Clock size={14} className="text-gray-400" />
            <input
              type="time"
              value={time}
              onChange={(e) => {
                const nextTime = e.target.value;
                setTime(nextTime);
                const base = selected ?? new Date();
                applyDateTime(new Date(base), nextTime);
              }}
              className="h-9 flex-1 rounded-md border border-gray-300 px-2 text-sm"
            />
          </div>

          <div className="mt-2 flex justify-between">
            <button
              type="button"
              onClick={() => applyDateTime(new Date(), time)}
              className="text-xs font-medium text-primary hover:underline"
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="text-xs font-medium text-gray-500 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
