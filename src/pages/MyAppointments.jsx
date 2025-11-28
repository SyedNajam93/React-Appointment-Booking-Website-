import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Calendar, Clock, User, MapPin, Plus, X, Edit2,
  ChevronRight, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, parse, isPast, isToday, isFuture } from 'date-fns';

export default function MyAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [cancelDialog, setCancelDialog] = useState({ open: false, appointment: null });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const appointmentsData = await base44.entities.Appointment.filter({
          customer_email: currentUser.email
        }, '-date');
        setAppointments(appointmentsData);
      } catch (e) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const parsed = parse(timeStr, 'HH:mm', new Date());
      return format(parsed, 'h:mm a');
    } catch {
      return timeStr;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      no_show: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400'
    };
    return (
      <Badge className={styles[status] || styles.pending}>
        {status?.replace('_', ' ')}
      </Badge>
    );
  };

  const handleCancel = async () => {
    if (!cancelDialog.appointment) return;
    setCancelling(true);
    try {
      await base44.entities.Appointment.update(cancelDialog.appointment.id, {
        status: 'cancelled'
      });
      setAppointments(appointments.map(apt => 
        apt.id === cancelDialog.appointment.id 
          ? { ...apt, status: 'cancelled' }
          : apt
      ));
      setCancelDialog({ open: false, appointment: null });
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return (isFuture(aptDate) || isToday(aptDate)) && apt.status !== 'cancelled' && apt.status !== 'completed';
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return isPast(aptDate) && !isToday(aptDate) || apt.status === 'completed' || apt.status === 'cancelled';
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const AppointmentCard = ({ appointment, showActions = true }) => {
    const aptDate = new Date(appointment.date);
    const canCancel = showActions && 
      (isFuture(aptDate) || isToday(aptDate)) && 
      appointment.status !== 'cancelled' && 
      appointment.status !== 'completed';

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
        <div 
          className="h-2"
          style={{ backgroundColor: appointment.color || '#6366f1' }}
        />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                {appointment.service_name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                #{appointment.id?.slice(0, 8).toUpperCase()}
              </p>
            </div>
            {getStatusBadge(appointment.status)}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {format(aptDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300">
                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
              </span>
            </div>
            {appointment.staff_name && (
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {appointment.staff_name}
                </span>
              </div>
            )}
            {appointment.location_name && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300">
                  {appointment.location_name}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-slate-900 dark:text-white">
              ${appointment.price}
            </span>
            {canCancel && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => setCancelDialog({ open: true, appointment })}
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your upcoming and past appointments
            </p>
          </div>
          <Link to={createPageUrl('BookAppointment')}>
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4" />
              Book New
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="rounded-lg">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg">
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Calendar className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Upcoming Appointments
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  You don't have any scheduled appointments.
                </p>
                <Link to={createPageUrl('BookAppointment')}>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastAppointments.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Clock className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Past Appointments
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Your completed appointments will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pastAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} showActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel your appointment for {cancelDialog.appointment?.service_name} 
                on {cancelDialog.appointment?.date ? format(new Date(cancelDialog.appointment.date), 'MMMM d, yyyy') : ''}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-red-500 hover:bg-red-600"
              >
                {cancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Cancel Appointment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}