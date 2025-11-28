import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Calendar, Clock, CheckCircle, Star, ArrowRight, 
  Users, Shield, Zap, ChevronRight, MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

export default function Home() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, staffData] = await Promise.all([
          base44.entities.Service.filter({ is_active: true }),
          base44.entities.Staff.filter({ is_active: true })
        ]);
        setServices(servicesData.slice(0, 6));
        setStaff(staffData.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book your appointment in seconds with our intuitive calendar interface'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'See live availability and never worry about double bookings'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: Zap,
      title: 'Instant Confirmations',
      description: 'Receive immediate confirmation via email after booking'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now accepting appointments
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Book Your Perfect
              <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
                Appointment
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl">
              Schedule appointments effortlessly with our modern booking system. 
              Real-time availability, instant confirmations, and seamless experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('BookAppointment')}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 rounded-xl px-8 h-12 text-base font-semibold shadow-lg shadow-white/20">
                  Book Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('BookAppointment')}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl px-8 h-12 text-base font-semibold border-white/30 text-white hover:bg-white/10">
                  View Services
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm text-slate-400">Happy Clients</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-bold">4.9</p>
                <p className="text-sm text-slate-400">Average Rating</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div>
                <p className="text-3xl font-bold">24/7</p>
                <p className="text-sm text-slate-400">Online Booking</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Us
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Experience the future of appointment booking with our cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      {services.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                  Our Services
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Choose from our wide range of professional services
                </p>
              </div>
              <Link 
                to={createPageUrl('BookAppointment')}
                className="hidden sm:flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:gap-3 transition-all"
              >
                View all services
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Link 
                  key={service.id}
                  to={createPageUrl('BookAppointment') + `?service=${service.id}`}
                  className="group bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: service.color ? `${service.color}20` : '#e0e7ff' }}
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: service.color || '#6366f1' }}
                      />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      ${service.price}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration} min
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {staff.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Meet Our Team
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Expert professionals ready to serve you
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {staff.map((member) => (
                <div 
                  key={member.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                >
                  {member.avatar_url ? (
                    <img 
                      src={member.avatar_url} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                      {member.name?.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  {member.title && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                      {member.title}
                    </p>
                  )}
                  <Link
                    to={createPageUrl('BookAppointment') + `?staff=${member.id}`}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 font-medium hover:gap-2 transition-all"
                  >
                    Book now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Book Your Appointment?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who trust us with their appointments. 
            Book now and experience the difference.
          </p>
          <Link to={createPageUrl('BookAppointment')}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 rounded-xl px-8 h-14 text-lg font-semibold shadow-lg">
              Book Your Appointment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">BookFlow</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} BookFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}