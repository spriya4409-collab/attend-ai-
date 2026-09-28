import {
  BarChart3,
  Bot,
  Calculator,
  Calendar,
  CheckCircle,
  FileCode,
  GraduationCap,
  History,
  LayoutDashboard,
  QrCode,
  Shield,
  Target,
  Users,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';

export type TabType =
  | 'DASHBOARD'
  | 'SUBJECTS'
  | 'CALCULATOR'
  | 'RECOVERY'
  | 'TIMETABLE'
  | 'ANALYTICS'
  | 'ATTENDBOT'
  | 'QR_SCANNER'
  | 'PARENT'
  | 'ADMIN'
  | 'ARCHITECTURE';

interface NavigationProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange }) => {
  const { role, overallStatus } = useApp();

  const primaryNavItems: { id: TabType; label: string; icon: any; badge?: string }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'SUBJECTS', label: 'Subjects', icon: GraduationCap },
    { id: 'CALCULATOR', label: 'Skip & Calc', icon: Calculator },
    { id: 'RECOVERY', label: 'Recovery', icon: Target },
    { id: 'TIMETABLE', label: 'Timetable', icon: Calendar },
    { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
    { id: 'ATTENDBOT', label: 'AttendBot', icon: Bot, badge: 'AI' },
    { id: 'QR_SCANNER', label: 'QR Scan', icon: QrCode },
  ];

  // Secondary items based on role or advanced inspection
  const secondaryNavItems: { id: TabType; label: string; icon: any; highlight?: boolean }[] = [
    { id: 'PARENT', label: 'Parent Portal', icon: Users },
    { id: 'ADMIN', label: 'Admin & Upload', icon: Shield },
    { id: 'ARCHITECTURE', label: 'Flutter / Firebase Spec', icon: FileCode, highlight: true },
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation Bar */}
      <nav className="hidden md:block max-w-7xl mx-auto px-4 lg:px-6 pt-4">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          {/* Primary student workflow tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Secondary management & architecture tabs */}
          <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-800">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-700 text-white shadow-sm'
                      : item.highlight
                      ? 'text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl px-2 py-2">
        <div className="flex items-center justify-around">
          {[
            { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
            { id: 'SUBJECTS', label: 'Subjects', icon: GraduationCap },
            { id: 'CALCULATOR', label: 'Predict', icon: Calculator },
            { id: 'TIMETABLE', label: 'Timetable', icon: Calendar },
            { id: 'ATTENDBOT', label: 'AttendBot', icon: Bot, badge: 'AI' },
            { id: 'ADMIN', label: 'More', icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as TabType)}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-3 text-[9px] px-1 bg-cyan-500 text-slate-950 font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-indigo-400 absolute bottom-0" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
