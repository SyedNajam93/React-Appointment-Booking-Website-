import React from 'react';
import { Clock, DollarSign, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(service)}
      className={cn(
        "w-full p-5 rounded-2xl border-2 text-left transition-all duration-300",
        "hover:shadow-lg hover:scale-[1.02]",
        selected 
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20" 
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {service.color && (
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: service.color }}
              />
            )}
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {service.name}
            </h3>
          </div>
          {service.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4" />
              {service.duration} min
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white">
              <DollarSign className="w-4 h-4" />
              {service.price}
            </span>
          </div>
        </div>
        <div className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          selected 
            ? "border-blue-500 bg-blue-500" 
            : "border-slate-300 dark:border-slate-600"
        )}>
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </button>
  );
}