import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { 
  Search, Plus, Edit2, MoreVertical, Loader2, 
  Mail, Phone, Calendar, DollarSign, Star, Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from 'date-fns';

const TAG_COLORS = {
  VIP: 'bg-amber-100 text-amber-800',
  Regular: 'bg-blue-100 text-blue-800',
  New: 'bg-green-100 text-green-800'
};

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    tags: []
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await base44.auth.me();
        if (user.role !== 'admin') {
          navigate(createPageUrl('Home'));
          return;
        }
        const [customersData, appointmentsData] = await Promise.all([
          base44.entities.Customer.list('-created_date'),
          base44.entities.Appointment.list('-date', 500)
        ]);
        setCustomers(customersData);
        setAppointments(appointmentsData);
      } catch (e) {
        navigate(createPageUrl('Home'));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openCustomerSheet = (customer) => {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  };

  const openEditDialog = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      notes: customer.notes || '',
      tags: customer.tags || []
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedCustomer) {
        await base44.entities.Customer.update(selectedCustomer.id, formData);
        setCustomers(customers.map(c => 
          c.id === selectedCustomer.id ? { ...c, ...formData } : c
        ));
      } else {
        const created = await base44.entities.Customer.create(formData);
        setCustomers([created, ...customers]);
      }
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toggleTag = (tag) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    setFormData({ ...formData, tags: newTags });
  };

  const getCustomerAppointments = (customerId, email) => {
    return appointments.filter(apt => 
      apt.customer_id === customerId || apt.customer_email === email
    );
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {customers.length} total customers
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedCustomer(null);
            setFormData({ name: '', email: '', phone: '', notes: '', tags: [] });
            setDialogOpen(true);
          }} 
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Appointments</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map(customer => (
              <TableRow 
                key={customer.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/30 cursor-pointer"
                onClick={() => openCustomerSheet(customer)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {customer.name?.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {customer.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="text-slate-900 dark:text-white">{customer.email}</p>
                    <p className="text-slate-500">{customer.phone || '-'}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {customer.total_appointments || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${customer.total_spent || 0}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-600 dark:text-slate-300">
                    {customer.last_visit || 'Never'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {(customer.tags || []).map(tag => (
                      <Badge key={tag} className={TAG_COLORS[tag] || 'bg-slate-100 text-slate-800'}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(customer);
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Customer Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedCustomer && (
            <>
              <SheetHeader>
                <SheetTitle>Customer Details</SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedCustomer.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {selectedCustomer.name}
                    </h3>
                    <div className="flex gap-1 mt-1">
                      {(selectedCustomer.tags || []).map(tag => (
                        <Badge key={tag} className={TAG_COLORS[tag]}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Appointments</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedCustomer.total_appointments || 0}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Total Spent</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${selectedCustomer.total_spent || 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-900 dark:text-white">{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-900 dark:text-white">{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>

                {selectedCustomer.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Notes</h4>
                    <p className="text-slate-700 dark:text-slate-300">{selectedCustomer.notes}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Appointment History</h4>
                  <div className="space-y-2">
                    {getCustomerAppointments(selectedCustomer.id, selectedCustomer.email)
                      .slice(0, 5)
                      .map(apt => (
                        <div 
                          key={apt.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {apt.service_name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {format(new Date(apt.date), 'MMM d, yyyy')} at {apt.start_time}
                            </p>
                          </div>
                          <Badge className={
                            apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }>
                            {apt.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setSheetOpen(false);
                    openEditDialog(selectedCustomer);
                  }}
                  className="w-full"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Customer
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer ? 'Edit Customer' : 'New Customer'}
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer ? 'Update customer details' : 'Add a new customer'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
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
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                {['VIP', 'Regular', 'New'].map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer ${formData.tags.includes(tag) ? TAG_COLORS[tag] : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this customer..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

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
    </div>
  );
}