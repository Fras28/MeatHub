import React from 'react';

const colorClasses = {
  green: 'text-green-600 bg-green-50',
  blue: 'text-blue-600 bg-blue-50',
  red: 'text-red-600 bg-red-50',
  amber: 'text-amber-600 bg-amber-50'
};

export default function MetricCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm font-medium">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}