import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Calendar, Clock, Users, DollarSign, TrendingUp,
  ArrowRight, Loader2, ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfMonth, 
  endOfMonth,
  subMonths,
  isToday,
  parseISO
} from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

import StatsCard from '@/components/admin/StatsCard';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        setUser(currentUser);

        const [appointmentsData, customersData, servicesData, staffData] = await Promise.all([
          base44.entities.Appointment.list('-date', 100),
          base44.entities.Customer.list('-created_date', 100),
          base44.entities.Service.list(),
          base44.entities.Staff.list()
        ]);

        setAppointments(appointmentsData);
        setCustomers(customersData);
        setServices(servicesData);
        setStaff(staffData);
      } catch (e) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => 
    apt.date === format(new Date(), 'yyyy-MM-dd') && 
    apt.status !== 'cancelled'
  );

  const thisMonthAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    return aptDate >= monthStart && aptDate <= monthEnd && apt.status !== 'cancelled';
  });

  const lastMonthAppointments = appointments.filter(apt => {
    const aptDate = parseISO(apt.date);
    const lastMonth = subMonths(new Date(), 1);
    const monthStart = startOfMonth(lastMonth);
    const monthEnd = endOfMonth(lastMonth);
    return aptDate >= monthStart && aptDate <= monthEnd && apt.status !== 'cancelled';
  });

  const thisMonthRevenue = thisMonthAppointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (apt.price || 0), 0);

  const lastMonthRevenue = lastMonthAppointments
    .filter(apt => apt.status === 'completed')
    .reduce((sum, apt) => sum + (apt.price || 0), 0);

  const revenueChange = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : 0;

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');

  // Chart data
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = appointments.filter(apt => apt.date === dateStr && apt.status !== 'cancelled');
    return {
      day: format(date, 'EEE'),
      appointments: dayAppointments.length,
      revenue: dayAppointments.filter(apt => apt.status === 'completed').reduce((sum, apt) => sum + (apt.price || 0), 0)
    };
  });

  // Service popularity
  const serviceStats = services.map(service => {
    const count = appointments.filter(apt => apt.service_id === service.id && apt.status !== 'cancelled').length;
    return { name: service.name, count, color: service.color };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          title="Pending Approval"
          value={pendingAppointments.length}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Total Customers"
          value={customers.length}
          icon={Users}
          color="purple"
        />
        <StatsCard
          title="This Month Revenue"
          value={`$${thisMonthRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend={revenueChange >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(revenueChange)}% vs last month`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="appointments" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorAppointments)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceStats.map((service, idx) => (
                <div key={service.name} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: service.color || '#6366f1' }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {service.name}
                    </p>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full"
                        style={{ 
                          width: `${(service.count / (serviceStats[0]?.count || 1)) * 100}%`,
                          backgroundColor: service.color || '#6366f1'
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {service.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Schedule</CardTitle>
            <Link to={createPageUrl('AdminAppointments')}>
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No appointments today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map(apt => (
                  <div 
                    key={apt.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div 
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: apt.color || '#6366f1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">
                        {apt.customer_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {apt.service_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {apt.start_time}
                      </p>
                      {getStatusBadge(apt.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {pendingAppointments.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {pendingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400">No pending appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.slice(0, 5).map(apt => (
                  <div 
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {apt.customer_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {apt.service_name} • {format(parseISO(apt.date), 'MMM d')} at {apt.start_time}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={async () => {
                          await base44.entities.Appointment.update(apt.id, { status: 'cancelled' });
                          setAppointments(appointments.map(a => a.id === apt.id ? {...a, status: 'cancelled'} : a));
                        }}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={async () => {
                          await base44.entities.Appointment.update(apt.id, { status: 'confirmed' });
                          setAppointments(appointments.map(a => a.id === apt.id ? {...a, status: 'confirmed'} : a));
                        }}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}