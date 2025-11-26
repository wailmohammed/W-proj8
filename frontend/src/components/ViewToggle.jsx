import React, { useState } from 'react';
import { List, Calendar, BarChart3 } from 'lucide-react';

const VIEW_MODES = [
  { id: 'list', label: 'List', icon: List },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'chart', label: 'Chart', icon: BarChart3 }
];

export default function ViewToggle({ activeView, onViewChange }) {
  return (
    <div className="flex gap-2 bg-slate-800/50 p-2 rounded-lg w-fit">
      {VIEW_MODES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`px-3 py-2 rounded-md font-medium transition-all flex items-center gap-2 text-sm ${
            activeView === id
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
