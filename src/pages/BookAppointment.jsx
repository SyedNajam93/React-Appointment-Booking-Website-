import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, ArrowRight, Check, Loader2, MapPin,
  Calendar as CalendarIcon, User, Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format, addMinutes, parse, addDays } from 'date-fns';

import ServiceCard from '@/components/booking/ServiceCard';
import StaffCard from '@/components/booking/StaffCard';
import BookingCalendar from '@/components/booking/BookingCalendar';
import TimeSlotPicker from '@/components/booking/TimeSlotPicker';
import BookingSummary from '@/components/booking/BookingSummary';

const STEPS = [
  { id: 'service', title: 'Service', icon: Briefcase },
  { id: 'staff', title: 'Provider', icon: User },
  { id: 'datetime', title: 'Date & Time', icon: CalendarIcon },
  { id: 'details', title: 'Your Details', icon: User },
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedService = urlParams.get('service');
  const preselectedStaff = urlParams.get('staff');

  const [currentStep, setCurrentStep] = useState(0);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [locations, setLocations] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, staffData, locationsData, settingsData] = await Promise.all([
          base44.entities.Service.filter({ is_active: true }),
          base44.entities.Staff.filter({ is_active: true }),
          base44.entities.Location.filter({ is_active: true }),
          base44.entities.Settings.list()
        ]);

        setServices(servicesData);
        setStaff(staffData);
        setLocations(locationsData);
        setSettings(settingsData[0] || {});

        if (preselectedService) {
          const service = servicesData.find(s => s.id === preselectedService);
          if (service) {
            setSelectedService(service);
            setCurrentStep(1);
          }
        }

        if (preselectedStaff) {
          const staffMember = staffData.find(s => s.id === preselectedStaff);
          if (staffMember) {
            setSelectedStaff(staffMember);
          }
        }

        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setFormData({
            name: currentUser.full_name || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            notes: ''
          });
        } catch (e) {
          // Not logged in
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedService, selectedStaff]);

  const loadAvailableSlots = async () => {
    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const [appointmentsData, blockedData] = await Promise.all([
        base44.entities.Appointment.filter({ 
          date: dateStr,
          status: { $ne: 'cancelled' }
        }),
        base44.entities.BlockedTime.filter({ date: dateStr })
      ]);

      setAppointments(appointmentsData);
      setBlockedTimes(blockedData);

      const slots = generateTimeSlots(
        appointmentsData, 
        blockedData, 
        selectedService.duration,
        selectedStaff
      );
      setAvailableSlots(slots);
    } catch (e) {
      console.error(e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateTimeSlots = (existingAppointments, blocked, duration, staffMember) => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    const interval = 30;

    const dayOfWeek = format(selectedDate, 'EEEE').toLowerCase();
    
    let dayStart = startHour;
    let dayEnd = endHour;

    if (staffMember?.availability?.[dayOfWeek]) {
      const avail = staffMember.availability[dayOfWeek];
      if (!avail.enabled) return [];
      if (avail.start) dayStart = parseInt(avail.start.split(':')[0]);
      if (avail.end) dayEnd = parseInt(avail.end.split(':')[0]);
    }

    for (let hour = dayStart; hour < dayEnd; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotStart = parse(timeStr, 'HH:mm', selectedDate);
        const slotEnd = addMinutes(slotStart, duration);

        // Check if slot is in the past
        if (slotStart < new Date()) continue;

        // Check if slot end is within business hours
        if (slotEnd.getHours() > dayEnd || 
            (slotEnd.getHours() === dayEnd && slotEnd.getMinutes() > 0)) continue;

        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          if (staffMember && apt.staff_id !== staffMember.id) return false;
          
          const aptStart = parse(apt.start_time, 'HH:mm', selectedDate);
          const aptEnd = parse(apt.end_time, 'HH:mm', selectedDate);
          
          return (slotStart < aptEnd && slotEnd > aptStart);
        });

        // Check for blocked times
        const isBlocked = blocked.some(block => {
          if (block.is_all_day) return true;
          if (staffMember && block.staff_id && block.staff_id !== staffMember.id) return false;
          
          const blockStart = parse(block.start_time, 'HH:mm', selectedDate);
          const blockEnd = parse(block.end_time, 'HH:mm', selectedDate);
          
          return (slotStart < blockEnd && slotEnd > blockStart);
        });

        if (!hasConflict && !isBlocked) {
          slots.push(timeStr);
        }
      }
    }

    return slots;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const endTime = format(
        addMinutes(parse(selectedTime, 'HH:mm', new Date()), selectedService.duration),
        'HH:mm'
      );

      const appointmentData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_id: user?.id,
        service_id: selectedService.id,
        service_name: selectedService.name,
        staff_id: selectedStaff?.id,
        staff_name: selectedStaff?.name,
        location_id: selectedLocation?.id,
        location_name: selectedLocation?.name,
        date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        end_time: endTime,
        duration: selectedService.duration,
        price: selectedService.price,
        status: settings?.auto_confirm ? 'confirmed' : 'pending',
        notes: formData.notes,
        color: selectedService.color
      };

      const appointment = await base44.entities.Appointment.create(appointmentData);

      // Update or create customer record
      const existingCustomers = await base44.entities.Customer.filter({ email: formData.email });
      if (existingCustomers.length > 0) {
        await base44.entities.Customer.update(existingCustomers[0].id, {
          total_appointments: (existingCustomers[0].total_appointments || 0) + 1,
          total_spent: (existingCustomers[0].total_spent || 0) + selectedService.price,
          last_visit: format(selectedDate, 'yyyy-MM-dd')
        });
      } else {
        await base44.entities.Customer.create({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          user_id: user?.id,
          total_appointments: 1,
          total_spent: selectedService.price,
          last_visit: format(selectedDate, 'yyyy-MM-dd')
        });
      }

      // Send confirmation email
      if (settings?.send_email_confirmations) {
        try {
          await base44.integrations.Core.SendEmail({
            to: formData.email,
            subject: `Appointment Confirmation - ${selectedService.name}`,
            body: `
              <h2>Your appointment has been ${settings?.auto_confirm ? 'confirmed' : 'received'}!</h2>
              <p><strong>Service:</strong> ${selectedService.name}</p>
              <p><strong>Date:</strong> ${format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> ${format(parse(selectedTime, 'HH:mm', new Date()), 'h:mm a')}</p>
              ${selectedStaff ? `<p><strong>Provider:</strong> ${selectedStaff.name}</p>` : ''}
              ${selectedLocation ? `<p><strong>Location:</strong> ${selectedLocation.name}, ${selectedLocation.address}</p>` : ''}
              <p><strong>Total:</strong> $${selectedService.price}</p>
              <br>
              <p>Thank you for booking with us!</p>
            `
          });
        } catch (e) {
          console.error('Email sending failed:', e);
        }
      }

      navigate(createPageUrl('Confirmation') + `?id=${appointment.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!selectedService;
      case 1: return true; // Staff is optional
      case 2: return !!selectedDate && !!selectedTime;
      case 3: return formData.name && formData.email;
      default: return false;
    }
  };

  const filteredStaff = selectedService 
    ? staff.filter(s => !s.services || s.services.length === 0 || s.services.includes(selectedService.id))
    : staff;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => index < currentStep && setCurrentStep(index)}
                  disabled={index > currentStep}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                    index === currentStep
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : index < currentStep
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`w-8 sm:w-12 h-0.5 ${
                    index < currentStep ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Select Service */}
            {currentStep === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Select a Service
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Choose the service you'd like to book
                </p>
                <div className="grid gap-4">
                  {services.map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      selected={selectedService?.id === service.id}
                      onSelect={setSelectedService}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Staff */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Choose a Provider
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Select your preferred provider or skip to see all availability
                </p>
                
                <button
                  onClick={() => setSelectedStaff(null)}
                  className={`w-full p-4 rounded-2xl border-2 text-left mb-4 transition-all ${
                    selectedStaff === null
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        No Preference
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Any available provider
                      </p>
                    </div>
                  </div>
                </button>

                <div className="grid gap-4">
                  {filteredStaff.map(member => (
                    <StaffCard
                      key={member.id}
                      staff={member}
                      selected={selectedStaff?.id === member.id}
                      onSelect={setSelectedStaff}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Select Date & Time */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Select Date & Time
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Choose your preferred appointment date and time
                </p>

                {locations.length > 1 && (
                  <div className="mb-6">
                    <Label className="text-sm font-medium mb-2 block">Location</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {locations.map(location => (
                        <button
                          key={location.id}
                          onClick={() => setSelectedLocation(location)}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedLocation?.id === location.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{location.name}</p>
                              <p className="text-sm text-slate-500">{location.address}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                    <BookingCalendar
                      selectedDate={selectedDate}
                      onSelectDate={(date) => {
                        setSelectedDate(date);
                        setSelectedTime(null);
                      }}
                      minDate={new Date()}
                      maxDate={addDays(new Date(), settings?.booking_window_days || 30)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {selectedDate ? `Available Times for ${format(selectedDate, 'MMM d')}` : 'Select a date first'}
                    </Label>
                    {selectedDate ? (
                      <TimeSlotPicker
                        slots={availableSlots}
                        selectedTime={selectedTime}
                        onSelect={setSelectedTime}
                        loading={slotsLoading}
                      />
                    ) : (
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center">
                        <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">
                          Please select a date to see available times
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Your Details */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Your Details
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Please provide your contact information
                </p>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any special requests or information..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingSummary
                service={selectedService}
                staff={selectedStaff}
                location={selectedLocation}
                date={selectedDate}
                time={selectedTime}
              />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2 bg-blue-500 hover:bg-blue-600"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="gap-2 bg-green-500 hover:bg-green-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}