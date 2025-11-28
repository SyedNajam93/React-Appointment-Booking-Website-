import React from 'react';
import { Calendar, Clock, User, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { format, parse } from 'date-fns';

export default function BookingSummary({ service, staff, location, date, time }) {
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Booking Summary</h3>
      
      <div className="space-y-4">
        {service && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Service</p>
              <p className="font-medium text-slate-900 dark:text-white">{service.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{service.duration} min</p>
            </div>
          </div>
        )}

        {staff && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Provider</p>
              <p className="font-medium text-slate-900 dark:text-white">{staff.name}</p>
              {staff.title && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{staff.title}</p>
              )}
            </div>
          </div>
        )}

        {location && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
              <p className="font-medium text-slate-900 dark:text-white">{location.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{location.address}</p>
            </div>
          </div>
        )}

        {date && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Date & Time</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {format(date, 'EEEE, MMMM d, yyyy')}
              </p>
              {time && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatTime(time)}</p>
              )}
            </div>
          </div>
        )}

        {service && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                ${service.price}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}