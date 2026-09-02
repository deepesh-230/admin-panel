import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { usePopoverPlacement } from '../../hooks/usePopoverPlacement';
import {
  addMonths,
  buildMonthGrid,
  formatDisplayDate,
  formatStoredDate,
  isSameDay,
  MONTHS,
  parseDateValue,
  WEEKDAYS,
} from '../../utils/dates';

type DatePickerProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  /** When true, stores ISO date (YYYY-MM-DD). Default stores "DD MMM YYYY". */
  isoValue?: boolean;
};

export function DatePicker({
  label,
  value,
  onChange,
  required,
  placeholder = 'Select date',
  className,
  isoValue = false,
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const placement = usePopoverPlacement(open, triggerRef, popoverRef);
  const selected = parseDateValue(value);
  const [viewDate, setViewDate] = useState(selected ?? new Date());

  useEffect(() => {
    if (selected) setViewDate(selected);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const emitChange = (date: Date) => {
    if (isoValue) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange(formatStoredDate(date));
    }
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  const days = buildMonthGrid(viewDate);
  const display = formatDisplayDate(value) || value;

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
        <span>{display || placeholder}</span>
        <Calendar size={16} className="shrink-0 text-primary/80" />
      </button>
      {required && !value ? (
        <input
          tabIndex={-1}
          required
          value=""
          onChange={() => undefined}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden
        />
      ) : null}

      {open ? (
        <div
          ref={popoverRef}
          className={cn(
            'absolute left-0 z-50 w-[280px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg',
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
                  onClick={() => emitChange(day)}
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

          <div className="mt-3 flex justify-between border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={() => emitChange(new Date())}
              className="text-xs font-medium text-primary hover:underline"
            >
              Today
            </button>
            <button
              type="button"
              onClick={clear}
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
