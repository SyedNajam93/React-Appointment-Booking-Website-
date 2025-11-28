import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Calendar, List, Search, Filter, Plus, X, Loader2,
  ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, parse, addMinutes } from 'date-fns';

import AppointmentTable from '@/components/admin/AppointmentTable';
import CalendarView from '@/components/admin/CalendarView';

export default function AdminAppointments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [view, setView] = useState('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    service_id: '',
    staff_id: '',
    date: '',
    start_time: '',
    notes: '',
    admin_notes: '',
    status: 'confirmed'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }

        const [appointmentsData, servicesData, staffData, customersData] = await Promise.all([
          base44.entities.Appointment.list('-date', 200),
          base44.entities.Service.list(),
          base44.entities.Staff.list(),
          base44.entities.Customer.list()
        ]);

        setAppointments(appointmentsData);
        setServices(servicesData);
        setStaff(staffData);
        setCustomers(customersData);
      } catch (e) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusChange = async (appointment, newStatus) => {
    try {
      await base44.entities.Appointment.update(appointment.id, { status: newStatus });
      setAppointments(appointments.map(apt => 
        apt.id === appointment.id ? { ...apt, status: newStatus } : apt
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAppointment = async () => {
    setSaving(true);
    try {
      const service = services.find(s => s.id === newAppointment.service_id);
      if (!service || !newAppointment.date || !newAppointment.start_time) {
        setSaving(false);
        return;
      }

      const endTime = format(
        addMinutes(parse(newAppointment.start_time, 'HH:mm', new Date()), service.duration),
        'HH:mm'
      );

      const staffMember = staff.find(s => s.id === newAppointment.staff_id);

      const appointmentData = {
        ...newAppointment,
        service_name: service.name,
        staff_name: staffMember?.name,
        end_time: endTime,
        duration: service.duration,
        price: service.price,
        color: service.color
      };

      if (selectedAppointment) {
        await base44.entities.Appointment.update(selectedAppointment.id, appointmentData);
        setAppointments(appointments.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, ...appointmentData } : apt
        ));
      } else {
        const created = await base44.entities.Appointment.create(appointmentData);
        setAppointments([created, ...appointments]);
      }

      setSheetOpen(false);
      setSelectedAppointment(null);
      setNewAppointment({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        service_id: '',
        staff_id: '',
        date: '',
        start_time: '',
        notes: '',
        admin_notes: '',
        status: 'confirmed'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const openEditSheet = (appointment) => {
    setSelectedAppointment(appointment);
    setNewAppointment({
      customer_name: appointment.customer_name,
      customer_email: appointment.customer_email,
      customer_phone: appointment.customer_phone || '',
      service_id: appointment.service_id,
      staff_id: appointment.staff_id || '',
      date: appointment.date,
      start_time: appointment.start_time,
      notes: appointment.notes || '',
      admin_notes: appointment.admin_notes || '',
      status: appointment.status
    });
    setSheetOpen(true);
  };

  const openNewSheet = () => {
    setSelectedAppointment(null);
    setNewAppointment({
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      service_id: '',
      staff_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '',
      notes: '',
      admin_notes: '',
      status: 'confirmed'
    });
    setSheetOpen(true);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchQuery || 
      apt.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.customer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesService = serviceFilter === 'all' || apt.service_id === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage all appointments and bookings
          </p>
        </div>
        <Button onClick={openNewSheet} className="gap-2 bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            {services.map(service => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Toggle */}
      <Tabs value={view} onValueChange={setView} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1">
          <TabsTrigger value="list" className="gap-2">
            <List className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <AppointmentTable
            appointments={filteredAppointments}
            onStatusChange={handleStatusChange}
            onView={openEditSheet}
            onEdit={openEditSheet}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CalendarView
            appointments={filteredAppointments}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onDayClick={(day) => {
              setNewAppointment({ ...newAppointment, date: format(day, 'yyyy-MM-dd') });
              openNewSheet();
            }}
            onAppointmentClick={openEditSheet}
          />
        </TabsContent>
      </Tabs>

      {/* Appointment Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </SheetTitle>
            <SheetDescription>
              {selectedAppointment ? 'Update appointment details' : 'Create a new appointment'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Customer Name *</Label>
                <Input
                  value={newAppointment.customer_name}
                  onChange={(e) => setNewAppointment({ ...newAppointment, customer_name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newAppointment.customer_email}
                  onChange={(e) => setNewAppointment({ ...newAppointment, customer_email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={newAppointment.customer_phone}
                  onChange={(e) => setNewAppointment({ ...newAppointment, customer_phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Service *</Label>
              <Select
                value={newAppointment.service_id}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, service_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration} min - ${service.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Staff Member</Label>
              <Select
                value={newAppointment.staff_id}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, staff_id: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Any available</SelectItem>
                  {staff.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={newAppointment.start_time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, start_time: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={newAppointment.status}
                onValueChange={(value) => setNewAppointment({ ...newAppointment, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Customer Notes</Label>
              <Textarea
                value={newAppointment.notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label>Admin Notes (Internal)</Label>
              <Textarea
                value={newAppointment.admin_notes}
                onChange={(e) => setNewAppointment({ ...newAppointment, admin_notes: e.target.value })}
                className="mt-1"
                rows={2}
                placeholder="Internal notes (not visible to customer)"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAppointment}
                disabled={saving || !newAppointment.customer_name || !newAppointment.customer_email || !newAppointment.service_id || !newAppointment.date || !newAppointment.start_time}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}