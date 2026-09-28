import {
  AlertTriangle,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Cpu,
  GraduationCap,
  HelpCircle,
  LogOut,
  Moon,
  QrCode,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusColor } from '../../utils/attendanceCalculations';

interface HeaderProps {
  onOpenDemoTour: () => void;
  onOpenRegister: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenDemoTour, onOpenRegister }) => {
  const {
    role,
    setRole,
    activeStudent,
    studentsList,
    switchStudent,
    overallPercentage,
    overallStatus,
    alerts,
    unreadAlertCount,
    markAlertRead,
    clearAlerts,
    currentTimetable,
    simulatedDate,
    setSimulatedDate,
    simulatedDay,
  } = useApp();

  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  const statusColors = getStatusColor(overallStatus);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Active Class Section */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AttendAI
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Hackathon Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>Smart Attendance Predictor</span>
                <span className="text-slate-600">•</span>
                <span className="text-indigo-400 font-medium">{currentTimetable.displayName}</span>
              </p>
            </div>
          </div>

          {/* Quick Demo Tour Launch Button */}
          <button
            onClick={onOpenDemoTour}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-102 cursor-pointer"
            title="Start live judge walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Presentation Tour</span>
            <span className="sm:hidden">Tour</span>
          </button>
        </div>

        {/* Center / Right controls */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
          {/* Simulated Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">{simulatedDay}:</span>
            <input
              type="date"
              value={simulatedDate}
              min="2026-08-29"
              max="2026-11-29"
              onChange={(e) => setSimulatedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>

          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setRole('STUDENT')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'STUDENT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setRole('PARENT')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'PARENT'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Parent
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                role === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin / Faculty
            </button>
          </div>

          {/* Smart Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsMenu(!showAlertsMenu)}
              className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="Smart Alerts"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadAlertCount}
                </span>
              )}
            </button>

            {showAlertsMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Smart Attendance Alerts
                    </span>
                  </div>
                  {alerts.length > 0 && (
                    <button
                      onClick={clearAlerts}
                      className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-slate-800/60 max-h-72 overflow-y-auto mt-2 space-y-1">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No active alerts. Attendance is stable!
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => markAlertRead(alert.id)}
                        className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          alert.read
                            ? 'bg-transparent text-slate-400'
                            : 'bg-slate-800/60 text-slate-200 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`font-semibold flex items-center gap-1.5 ${
                              alert.type === 'CRITICAL'
                                ? 'text-rose-400'
                                : alert.type === 'WARNING'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {alert.type === 'CRITICAL' && (
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            )}
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">
                            {alert.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] mt-1 text-slate-300 leading-relaxed">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowStudentMenu(!showStudentMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-left"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[11px] font-bold text-white">
                {activeStudent.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-200 leading-none">
                  {activeStudent.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {activeStudent.sectionId.replace(/_/g, ' ')} •{' '}
                  <span className={statusColors.text}>{overallPercentage}%</span>
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showStudentMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                <div className="px-2 py-1.5 border-b border-slate-800 text-[11px] font-medium text-slate-400">
                  Select Demo Student Profile:
                </div>
                <div className="space-y-1 mt-1">
                  {studentsList.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        switchStudent(st.id);
                        setShowStudentMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors text-left ${
                        st.id === activeStudent.id
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'hover:bg-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-slate-200">{st.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {st.sectionId.replace(/_/g, ' ')} • Reg: {st.registerNumber}
                        </p>
                      </div>
                      {st.id === activeStudent.id && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setShowStudentMenu(false);
                      onOpenRegister();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    Register New Student
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
