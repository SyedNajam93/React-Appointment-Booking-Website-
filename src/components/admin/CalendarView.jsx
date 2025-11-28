import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
  parse
} from 'date-fns';

export default function CalendarView({ 
  appointments, 
  currentMonth, 
  onMonthChange, 
  onDayClick, 
  onAppointmentClick 
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAppointmentsForDay = (day) => {
    return appointments.filter(apt => 
      apt.date === format(day, 'yyyy-MM-dd')
    );
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const parsed = parse(timeStr, 'HH:mm', new Date());
      return format(parsed, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="p-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayAppointments = getAppointmentsForDay(day);
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={cn(
                "min-h-[100px] p-2 border-b border-r border-slate-200 dark:border-slate-700 cursor-pointer transition-colors",
                !inMonth && "bg-slate-50 dark:bg-slate-900/30",
                inMonth && "hover:bg-slate-50 dark:hover:bg-slate-900/30"
              )}
            >
              <div className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full text-sm mb-1",
                today && "bg-blue-500 text-white",
                !today && !inMonth && "text-slate-400 dark:text-slate-500",
                !today && inMonth && "text-slate-900 dark:text-white"
              )}>
                {format(day, 'd')}
              </div>

              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((apt) => (
                  <button
                    key={apt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAppointmentClick?.(apt);
                    }}
                    className={cn(
                      "w-full text-left text-xs p-1 rounded truncate",
                      apt.status === 'cancelled' && "opacity-50 line-through"
                    )}
                    style={{ 
                      backgroundColor: `${apt.color || '#6366f1'}20`,
                      color: apt.color || '#6366f1'
                    }}
                  >
                    {formatTime(apt.start_time)} {apt.service_name}
                  </button>
                ))}
                {dayAppointments.length > 3 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                    +{dayAppointments.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}