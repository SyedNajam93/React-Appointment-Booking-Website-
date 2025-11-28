import React from 'react';
import { 
  Calendar, Clock, User, MoreVertical, 
  Check, X, Eye, Edit2, Trash2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parse } from 'date-fns';

export default function AppointmentTable({ 
  appointments, 
  onStatusChange, 
  onView, 
  onEdit,
  onDelete 
}) {
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

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <Calendar className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 dark:bg-slate-900/50">
            <TableHead>Customer</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
              <TableCell>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {appointment.customer_name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {appointment.customer_email}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: appointment.color || '#6366f1' }}
                  />
                  <span className="text-slate-900 dark:text-white">
                    {appointment.service_name}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-slate-900 dark:text-white">
                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-slate-700 dark:text-slate-300">
                  {appointment.staff_name || '-'}
                </span>
              </TableCell>
              <TableCell>
                {getStatusBadge(appointment.status)}
              </TableCell>
              <TableCell>
                <span className="font-medium text-slate-900 dark:text-white">
                  ${appointment.price}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(appointment)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(appointment)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {appointment.status === 'pending' && (
                      <DropdownMenuItem onClick={() => onStatusChange?.(appointment, 'confirmed')}>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Confirm
                      </DropdownMenuItem>
                    )}
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <>
                        <DropdownMenuItem onClick={() => onStatusChange?.(appointment, 'completed')}>
                          <Check className="w-4 h-4 mr-2 text-blue-600" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.(appointment, 'no_show')}>
                          <User className="w-4 h-4 mr-2 text-slate-600" />
                          Mark No Show
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onStatusChange?.(appointment, 'cancelled')}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}