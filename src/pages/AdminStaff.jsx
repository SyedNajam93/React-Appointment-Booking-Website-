import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Plus, Edit2, Trash2, Loader2, Search, MoreVertical,
  Mail, Phone, User, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const defaultAvailability = DAYS.reduce((acc, day) => {
  acc[day] = {
    enabled: day !== 'saturday' && day !== 'sunday',
    start: '09:00',
    end: '18:00'
  };
  return acc;
}, {});

export default function AdminStaff() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
  const [selectedMember, setSelectedMember] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    bio: '',
    avatar_url: '',
    services: [],
    availability: defaultAvailability,
    is_active: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        const [staffData, servicesData] = await Promise.all([
          base44.entities.Staff.list(),
          base44.entities.Service.list()
        ]);
        setStaff(staffData);
        setServices(servicesData);
      } catch (e) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openNewDialog = () => {
    setSelectedMember(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      title: '',
      bio: '',
      avatar_url: '',
      services: [],
      availability: defaultAvailability,
      is_active: true
    });
    setDialogOpen(true);
  };

  const openEditDialog = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      title: member.title || '',
      bio: member.bio || '',
      avatar_url: member.avatar_url || '',
      services: member.services || [],
      availability: member.availability || defaultAvailability,
      is_active: member.is_active !== false
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedMember) {
        await base44.entities.Staff.update(selectedMember.id, formData);
        setStaff(staff.map(s => 
          s.id === selectedMember.id ? { ...s, ...formData } : s
        ));
      } else {
        const created = await base44.entities.Staff.create(formData);
        setStaff([...staff, created]);
      }
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.member) return;
    try {
      await base44.entities.Staff.delete(deleteDialog.member.id);
      setStaff(staff.filter(s => s.id !== deleteDialog.member.id));
      setDeleteDialog({ open: false, member: null });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleService = (serviceId) => {
    const newServices = formData.services.includes(serviceId)
      ? formData.services.filter(id => id !== serviceId)
      : [...formData.services, serviceId];
    setFormData({ ...formData, services: newServices });
  };

  const updateAvailability = (day, field, value) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [field]: value
        }
      }
    });
  };

  const filteredStaff = staff.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Staff</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your team members
          </p>
        </div>
        <Button onClick={openNewDialog} className="gap-2 bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4" />
          Add Staff
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(member => (
          <div 
            key={member.id}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {member.avatar_url ? (
                  <img 
                    src={member.avatar_url} 
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {member.name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  {member.title && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {member.title}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(member)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialog({ open: true, member })}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4" />
                {member.email}
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4" />
                  {member.phone}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="flex gap-1">
                {(member.services || []).slice(0, 3).map(serviceId => {
                  const service = services.find(s => s.id === serviceId);
                  return service ? (
                    <div 
                      key={serviceId}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: service.color || '#6366f1' }}
                      title={service.name}
                    />
                  ) : null;
                })}
                {(member.services || []).length > 3 && (
                  <span className="text-xs text-slate-500">+{member.services.length - 3}</span>
                )}
              </div>
              <Badge 
                variant={member.is_active !== false ? 'default' : 'secondary'}
                className={member.is_active !== false ? 'bg-green-100 text-green-800' : ''}
              >
                {member.is_active !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Staff Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMember ? 'Edit Staff Member' : 'New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {selectedMember ? 'Update staff details' : 'Add a new team member'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Senior Stylist"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief bio..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Avatar URL</Label>
                <Input
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select the services this staff member can provide
              </p>
              <div className="space-y-2">
                {services.map(service => (
                  <label 
                    key={service.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  >
                    <Checkbox
                      checked={formData.services.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: service.color || '#6366f1' }}
                    />
                    <span className="flex-1 text-slate-900 dark:text-white">{service.name}</span>
                    <span className="text-sm text-slate-500">{service.duration} min</span>
                  </label>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Set working hours for each day
              </p>
              <div className="space-y-3">
                {DAYS.map(day => (
                  <div 
                    key={day}
                    className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-24">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.availability[day]?.enabled}
                          onCheckedChange={(checked) => updateAvailability(day, 'enabled', checked)}
                        />
                        <span className="capitalize text-sm font-medium text-slate-900 dark:text-white">
                          {day}
                        </span>
                      </label>
                    </div>
                    {formData.availability[day]?.enabled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={formData.availability[day]?.start || '09:00'}
                          onChange={(e) => updateAvailability(day, 'start', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-slate-400">to</span>
                        <Input
                          type="time"
                          value={formData.availability[day]?.end || '18:00'}
                          onChange={(e) => updateAvailability(day, 'end', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.email}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{deleteDialog.member?.name}" from your team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}