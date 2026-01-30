import React, { useState } from 'react';
import { Clock, Plus, X, Check } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface AvailabilitySchedulePickerProps {
  schedule: DaySchedule[];
  onChange: (schedule: DaySchedule[]) => void;
  className?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '17:00' };

const generateTimeOptions = () => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const formatTime = (time: string) => {
  const [hour, minute] = time.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${minute} ${ampm}`;
};

const AvailabilitySchedulePicker: React.FC<AvailabilitySchedulePickerProps> = ({
  schedule,
  onChange,
  className = '',
}) => {
  const [expandedDays, setExpandedDays] = useState<string[]>([]);

  const initializeSchedule = (): DaySchedule[] => {
    if (schedule.length > 0) return schedule;
    return DAYS.map(day => ({
      day,
      enabled: false,
      slots: [],
    }));
  };

  const currentSchedule = initializeSchedule();

  const toggleDay = (day: string) => {
    const updated = currentSchedule.map(d => {
      if (d.day === day) {
        const enabled = !d.enabled;
        return {
          ...d,
          enabled,
          slots: enabled && d.slots.length === 0 ? [{ ...DEFAULT_SLOT }] : d.slots,
        };
      }
      return d;
    });
    onChange(updated);

    // Expand day when enabled
    if (!currentSchedule.find(d => d.day === day)?.enabled) {
      setExpandedDays([...expandedDays, day]);
    }
  };

  const toggleExpand = (day: string) => {
    if (expandedDays.includes(day)) {
      setExpandedDays(expandedDays.filter(d => d !== day));
    } else {
      setExpandedDays([...expandedDays, day]);
    }
  };

  const addSlot = (day: string) => {
    const updated = currentSchedule.map(d => {
      if (d.day === day) {
        const lastSlot = d.slots[d.slots.length - 1];
        const newStart = lastSlot ? lastSlot.end : '09:00';
        const newEnd = '17:00';
        return {
          ...d,
          slots: [...d.slots, { start: newStart, end: newEnd }],
        };
      }
      return d;
    });
    onChange(updated);
  };

  const removeSlot = (day: string, slotIndex: number) => {
    const updated = currentSchedule.map(d => {
      if (d.day === day) {
        const newSlots = d.slots.filter((_, i) => i !== slotIndex);
        return {
          ...d,
          slots: newSlots,
          enabled: newSlots.length > 0,
        };
      }
      return d;
    });
    onChange(updated);
  };

  const updateSlot = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const updated = currentSchedule.map(d => {
      if (d.day === day) {
        const newSlots = d.slots.map((slot, i) => {
          if (i === slotIndex) {
            return { ...slot, [field]: value };
          }
          return slot;
        });
        return { ...d, slots: newSlots };
      }
      return d;
    });
    onChange(updated);
  };

  const copyToAllDays = (sourceDay: string) => {
    const source = currentSchedule.find(d => d.day === sourceDay);
    if (!source) return;

    const updated = currentSchedule.map(d => ({
      ...d,
      enabled: source.enabled,
      slots: source.slots.map(s => ({ ...s })),
    }));
    onChange(updated);
    setExpandedDays(DAYS);
  };

  const getEnabledDaysCount = () => currentSchedule.filter(d => d.enabled).length;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-deep-slate">Availability Schedule</h3>
        </div>
        <span className="text-sm text-deep-slate/60">
          {getEnabledDaysCount()} days selected
        </span>
      </div>

      {/* Days */}
      <div className="space-y-2">
        {currentSchedule.map(daySchedule => (
          <div
            key={daySchedule.day}
            className={`card overflow-hidden ${daySchedule.enabled ? 'border-primary/30' : ''}`}
          >
            {/* Day Header */}
            <div
              className="flex items-center justify-between p-3 sm:p-4 cursor-pointer"
              onClick={() => toggleExpand(daySchedule.day)}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDay(daySchedule.day);
                  }}
                  className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                    daySchedule.enabled
                      ? 'bg-primary text-white'
                      : 'border-2 border-gray-300 hover:border-primary'
                  }`}
                >
                  {daySchedule.enabled && <Check className="w-4 h-4" />}
                </button>
                <span className={`font-medium ${
                  daySchedule.enabled ? 'text-deep-slate' : 'text-deep-slate/50'
                }`}>
                  {daySchedule.day}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {daySchedule.enabled && daySchedule.slots.length > 0 && (
                  <span className="text-sm text-deep-slate/60 hidden sm:block">
                    {daySchedule.slots.map(s => 
                      `${formatTime(s.start)} - ${formatTime(s.end)}`
                    ).join(', ')}
                  </span>
                )}
                <svg
                  className={`w-5 h-5 text-deep-slate/40 transition-transform ${
                    expandedDays.includes(daySchedule.day) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Time Slots */}
            {expandedDays.includes(daySchedule.day) && daySchedule.enabled && (
              <div className="border-t border-gray-100 p-3 sm:p-4 bg-gray-50/50 space-y-3">
                {daySchedule.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="flex flex-wrap items-center gap-2">
                    <select
                      value={slot.start}
                      onChange={(e) => updateSlot(daySchedule.day, slotIndex, 'start', e.target.value)}
                      className="input-field py-2 px-3 text-sm flex-1 min-w-[100px]"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                    <span className="text-deep-slate/40">to</span>
                    <select
                      value={slot.end}
                      onChange={(e) => updateSlot(daySchedule.day, slotIndex, 'end', e.target.value)}
                      className="input-field py-2 px-3 text-sm flex-1 min-w-[100px]"
                    >
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{formatTime(time)}</option>
                      ))}
                    </select>
                    {daySchedule.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(daySchedule.day, slotIndex)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => addSlot(daySchedule.day)}
                    className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add time slot
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToAllDays(daySchedule.day)}
                    className="text-sm text-deep-slate/60 hover:text-deep-slate"
                  >
                    Copy to all days
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailabilitySchedulePicker;
