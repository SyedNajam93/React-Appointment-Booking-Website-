import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, parse } from 'date-fns';

export default function TimeSlotPicker({ slots, selectedTime, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No available time slots for this date</p>
      </div>
    );
  }

  const formatTime = (time) => {
    try {
      const parsed = parse(time, 'HH:mm', new Date());
      return format(parsed, 'h:mm a');
    } catch {
      return time;
    }
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={cn(
            "py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200",
            "hover:scale-105",
            selectedTime === slot
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600"
          )}
        >
          {formatTime(slot)}
        </button>
      ))}
    </div>
  );
}