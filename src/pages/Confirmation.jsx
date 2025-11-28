import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  CheckCircle, Calendar, Clock, User, MapPin, 
  ArrowRight, Download, Mail, Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format, parse } from 'date-fns';

export default function Confirmation() {
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get('id');

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppointment = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }
      try {
        const appointments = await base44.entities.Appointment.filter({ id: appointmentId });
        if (appointments.length > 0) {
          setAppointment(appointments[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAppointment();
  }, [appointmentId]);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const parsed = parse(timeStr, 'HH:mm', new Date());
      return format(parsed, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  const generateCalendarLink = (type) => {
    if (!appointment) return '#';
    
    const startDate = new Date(`${appointment.date}T${appointment.start_time}`);
    const endDate = new Date(`${appointment.date}T${appointment.end_time}`);
    
    const title = encodeURIComponent(`${appointment.service_name} Appointment`);
    const details = encodeURIComponent(
      `Service: ${appointment.service_name}\n` +
      `${appointment.staff_name ? `Provider: ${appointment.staff_name}\n` : ''}` +
      `${appointment.location_name ? `Location: ${appointment.location_name}` : ''}`
    );
    const location = encodeURIComponent(appointment.location_name || '');
    
    if (type === 'google') {
      const startStr = format(startDate, "yyyyMMdd'T'HHmmss");
      const endStr = format(endDate, "yyyyMMdd'T'HHmmss");
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
    }
    
    if (type === 'outlook') {
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();
      return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startStr}&enddt=${endStr}&body=${details}&location=${location}`;
    }
    
    return '#';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Appointment Not Found
          </h1>
          <Link to={createPageUrl('BookAppointment')}>
            <Button>Book an Appointment</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Booking {appointment.status === 'confirmed' ? 'Confirmed' : 'Received'}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {appointment.status === 'confirmed' 
              ? 'Your appointment has been confirmed. A confirmation email has been sent.'
              : 'Your appointment request has been received and is pending confirmation.'
            }
          </p>
        </div>

        {/* Appointment Details Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
            <h2 className="text-xl font-semibold mb-1">{appointment.service_name}</h2>
            <p className="text-blue-100">
              Confirmation #{appointment.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {format(new Date(appointment.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Time</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ({appointment.duration} minutes)
                </p>
              </div>
            </div>

            {appointment.staff_name && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Provider</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {appointment.staff_name}
                  </p>
                </div>
              </div>
            )}

            {appointment.location_name && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {appointment.location_name}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Amount</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${appointment.price}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Add to Calendar */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Add to Calendar
          </h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={generateCalendarLink('google')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 4H18V3c0-.55-.45-1-1-1s-1 .45-1 1v1H8V3c0-.55-.45-1-1-1s-1 .45-1 1v1H4.5C3.12 4 2 5.12 2 6.5v13C2 20.88 3.12 22 4.5 22h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 5.12 20.88 4 19.5 4zm0 15.5h-15V9h15v10.5z"/>
              </svg>
              Google Calendar
            </a>
            <a
              href={generateCalendarLink('outlook')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.5 3h-19C1.67 3 1 3.67 1 4.5v15c0 .83.67 1.5 1.5 1.5h19c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zm-8 2v14h-11V5h11zm2 7l5.5-5.5v11L15.5 12z"/>
              </svg>
              Outlook
            </a>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={createPageUrl('MyAppointments')} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              View My Appointments
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={createPageUrl('BookAppointment')} className="flex-1">
            <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600">
              Book Another
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}