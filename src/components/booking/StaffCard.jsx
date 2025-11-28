import React from 'react';
import { Check, Star } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function StaffCard({ staff, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(staff)}
      className={cn(
        "w-full p-4 rounded-2xl border-2 text-left transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        selected 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20" 
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          {staff.avatar_url ? (
            <img 
              src={staff.avatar_url} 
              alt={staff.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-medium">
              {staff.name?.charAt(0)}
            </div>
          )}
          {selected && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {staff.name}
          </h3>
          {staff.title && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {staff.title}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}