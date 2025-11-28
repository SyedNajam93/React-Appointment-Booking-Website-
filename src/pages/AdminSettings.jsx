import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Save, Loader2, Building, Clock, Mail, Bell,
  Calendar, Shield
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney'
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(null);

  const [formData, setFormData] = useState({
    business_name: '',
    business_email: '',
    business_phone: '',
    business_address: '',
    logo_url: '',
    timezone: 'America/New_York',
    booking_window_days: 30,
    min_notice_hours: 24,
    cancellation_notice_hours: 24,
    auto_confirm: true,
    send_email_confirmations: true,
    send_email_reminders: true,
    default_appointment_status: 'confirmed'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        const settings = await base44.entities.Settings.list();
        if (settings.length > 0) {
          setSettingsId(settings[0].id);
          setFormData({
            business_name: settings[0].business_name || '',
            business_email: settings[0].business_email || '',
            business_phone: settings[0].business_phone || '',
            business_address: settings[0].business_address || '',
            logo_url: settings[0].logo_url || '',
            timezone: settings[0].timezone || 'America/New_York',
            booking_window_days: settings[0].booking_window_days || 30,
            min_notice_hours: settings[0].min_notice_hours || 24,
            cancellation_notice_hours: settings[0].cancellation_notice_hours || 24,
            auto_confirm: settings[0].auto_confirm !== false,
            send_email_confirmations: settings[0].send_email_confirmations !== false,
            send_email_reminders: settings[0].send_email_reminders !== false,
            default_appointment_status: settings[0].default_appointment_status || 'confirmed'
          });
        }
      } catch (e) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        await base44.entities.Settings.update(settingsId, formData);
      } else {
        const created = await base44.entities.Settings.create(formData);
        setSettingsId(created.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure your booking system
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Business Information
          </CardTitle>
          <CardDescription>
            Basic information about your business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Business Name</Label>
              <Input
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Business Email</Label>
              <Input
                type="email"
                value={formData.business_email}
                onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={formData.business_phone}
                onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Business Address</Label>
            <Input
              value={formData.business_address}
              onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Logo URL</Label>
            <Input
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Booking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Booking Settings
          </CardTitle>
          <CardDescription>
            Configure how appointments are booked
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label>Booking Window (days)</Label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.booking_window_days}
                onChange={(e) => setFormData({ ...formData, booking_window_days: parseInt(e.target.value) || 30 })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">How far in advance clients can book</p>
            </div>
            <div>
              <Label>Minimum Notice (hours)</Label>
              <Input
                type="number"
                min="0"
                max="168"
                value={formData.min_notice_hours}
                onChange={(e) => setFormData({ ...formData, min_notice_hours: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum notice required for booking</p>
            </div>
            <div>
              <Label>Cancellation Notice (hours)</Label>
              <Input
                type="number"
                min="0"
                max="168"
                value={formData.cancellation_notice_hours}
                onChange={(e) => setFormData({ ...formData, cancellation_notice_hours: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum notice for cancellation</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-4 border-t border-slate-200 dark:border-slate-700">
            <div>
              <Label>Auto-confirm Appointments</Label>
              <p className="text-sm text-slate-500 mt-1">
                Automatically confirm appointments when booked
              </p>
            </div>
            <Switch
              checked={formData.auto_confirm}
              onCheckedChange={(checked) => setFormData({ ...formData, auto_confirm: checked })}
            />
          </div>

          <div>
            <Label>Default Appointment Status</Label>
            <Select
              value={formData.default_appointment_status}
              onValueChange={(value) => setFormData({ ...formData, default_appointment_status: value })}
            >
              <SelectTrigger className="mt-1 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-slate-700">
            <div>
              <Label>Email Confirmations</Label>
              <p className="text-sm text-slate-500 mt-1">
                Send confirmation emails when appointments are booked
              </p>
            </div>
            <Switch
              checked={formData.send_email_confirmations}
              onCheckedChange={(checked) => setFormData({ ...formData, send_email_confirmations: checked })}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <Label>Email Reminders</Label>
              <p className="text-sm text-slate-500 mt-1">
                Send reminder emails before appointments
              </p>
            </div>
            <Switch
              checked={formData.send_email_reminders}
              onCheckedChange={(checked) => setFormData({ ...formData, send_email_reminders: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}