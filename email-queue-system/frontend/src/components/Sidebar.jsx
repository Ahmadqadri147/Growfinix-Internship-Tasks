import React from 'react';
import { Calendar, LayoutDashboard, Zap, Server } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'booking', name: 'Booking Form', icon: Calendar },
    { id: 'dashboard', name: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'performance', name: 'Performance Demo', icon: Zap },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20 text-white">
          <Server size={20} className="animate-pulse" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-white leading-none">Growfinix</h1>
          <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Queue System</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border-l-4 border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Footer / Status Indicator */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          <div className="text-[11px]">
            <p className="font-semibold text-slate-300 leading-none mb-0.5">Redis Queue</p>
            <p className="text-slate-500 leading-none">Active & Listening</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
