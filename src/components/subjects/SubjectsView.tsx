import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  GraduationCap,
  Info,
  LayoutGrid,
  List,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SubjectAttendance } from '../../types';
import { getStatusColor, projectRecoveryMilestones } from '../../utils/attendanceCalculations';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    activeStudent,
    currentTimetable,
    updateSubjectData,
    simulatedDate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SAFE' | 'WARNING' | 'DETENTION_RISK'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [selectedSubject, setSelectedSubject] = useState<SubjectAttendance | null>(null);

  const filteredSubjects = subjects.filter((s) => {
    const matchesQuery =
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header & Section Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Subject Attendance Directory
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              {currentTimetable.displayName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verified subjects, conducted periods, safe absences, and recovery classes for {activeStudent.name}.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'GRID' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject by name, code, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
          {(['ALL', 'SAFE', 'WARNING', 'DETENTION_RISK'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === filter
                  ? filter === 'SAFE'
                    ? 'bg-emerald-600 text-white'
                    : filter === 'WARNING'
                    ? 'bg-amber-600 text-white'
                    : filter === 'DETENTION_RISK'
                    ? 'bg-rose-600 text-white'
                    : 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {filter === 'ALL'
                ? 'All Subjects'
                : filter === 'SAFE'
                ? 'Safe (>90%)'
                : filter === 'WARNING'
                ? 'Warning (75-90%)'
                : 'Detention Risk (<75%)'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((sub) => {
            const sc = getStatusColor(sub.status);
            return (
              <div
                key={sub.subjectCode}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-indigo-400 tracking-wider">
                          {sub.subjectCode}
                        </span>
                        {sub.isLab && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold">
                            Laboratory
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {sub.subjectName}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3 text-slate-500" />
                        <span className="truncate">{sub.facultyName}</span>
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${sc.badge}`}>
                      {sub.percentage}%
                    </span>
                  </div>

                  {/* Progress Bar with 75% and 90% markers */}
                  <div className="space-y-1 mt-4">
                    <div className="relative w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          sub.status === 'SAFE'
                            ? 'bg-emerald-500'
                            : sub.status === 'WARNING'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, sub.percentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0%</span>
                      <span className="text-rose-400 font-semibold">75% Threshold</span>
                      <span className="text-emerald-400 font-semibold">90% Target</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Conducted</span>
                      <p className="font-bold text-slate-200 mt-0.5">{sub.conducted}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Attended</span>
                      <p className="font-bold text-emerald-400 mt-0.5">{sub.attended}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Missed</span>
                      <p className="font-bold text-rose-400 mt-0.5">{sub.missed}</p>
                    </div>
                  </div>

                  {/* Actionable Advice Box */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-1.5">
                    {sub.status === 'DETENTION_RISK' ? (
                      <div className="flex items-start gap-2 text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Detention Risk!</p>
                          <p className="text-[11px] text-rose-400/90 leading-tight">
                            You must attend the next <b>{sub.requiredFor75}</b> consecutive classes to reach 75%.
                          </p>
                        </div>
                      </div>
                    ) : sub.status === 'WARNING' ? (
                      <div className="flex items-start gap-2 text-amber-300">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">
                            {sub.safeMissesTo75} safe miss(es) before 75%
                          </p>
                          <p className="text-[11px] text-amber-400/90 leading-tight">
                            Attend <b>{sub.requiredFor90}</b> consecutive classes to reach 90% distinction.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Safe Zone Achieved</p>
                          <p className="text-[11px] text-emerald-400/90 leading-tight">
                            You can safely miss <b>{sub.safeMissesTo90}</b> classes and remain at or above 90%.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quick Adjust & Milestone Projection */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  {/* Quick Attendance +/- Test Buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 mr-1">Sim:</span>
                    <button
                      onClick={() => updateSubjectData(sub.subjectCode, Math.max(0, sub.attended - 1), Math.max(1, sub.conducted - 1))}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                      title="Undo 1 class"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => updateSubjectData(sub.subjectCode, sub.attended + 1, sub.conducted + 1)}
                      className="px-2 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-semibold transition-colors cursor-pointer border border-emerald-500/30"
                      title="Simulate Attend +1"
                    >
                      +1 Attended
                    </button>
                    <button
                      onClick={() => updateSubjectData(sub.subjectCode, sub.attended, sub.conducted + 1)}
                      className="px-2 py-1 rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-[10px] font-semibold transition-colors cursor-pointer border border-rose-500/30"
                      title="Simulate Miss +1"
                    >
                      +1 Missed
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedSubject(sub)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Code & Subject</th>
                  <th className="p-3.5">Faculty</th>
                  <th className="p-3.5 text-center">Conducted</th>
                  <th className="p-3.5 text-center">Attended</th>
                  <th className="p-3.5 text-center">Missed</th>
                  <th className="p-3.5 text-center">Attendance %</th>
                  <th className="p-3.5 text-center">Safe Misses (75%)</th>
                  <th className="p-3.5 text-center">Required (75%)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSubjects.map((sub) => {
                  const sc = getStatusColor(sub.status);
                  return (
                    <tr key={sub.subjectCode} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-bold text-indigo-400">{sub.subjectCode}</span>
                        <p className="font-semibold text-slate-100">{sub.subjectName}</p>
                      </td>
                      <td className="p-3.5 text-slate-400">{sub.facultyName}</td>
                      <td className="p-3.5 text-center font-semibold text-slate-200">{sub.conducted}</td>
                      <td className="p-3.5 text-center font-bold text-emerald-400">{sub.attended}</td>
                      <td className="p-3.5 text-center font-bold text-rose-400">{sub.missed}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-black ${sc.badge}`}>
                          {sub.percentage}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-cyan-400">
                        {sub.safeMissesTo75}
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-400">
                        {sub.requiredFor75}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.badge}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedSubject(sub)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 font-medium cursor-pointer"
                        >
                          Forecast
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Subject Drawer / Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  {selectedSubject.subjectCode} • {currentTimetable.displayName}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {selectedSubject.subjectName}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Faculty: {selectedSubject.facultyName}</p>
              </div>

              <button
                onClick={() => setSelectedSubject(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Calculations Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Current Attendance</span>
                <p className="text-xl font-extrabold text-white mt-1">{selectedSubject.percentage}%</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getStatusColor(selectedSubject.status).badge}`}>
                  {getStatusColor(selectedSubject.status).label}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Safe Skips to 75%</span>
                <p className="text-xl font-extrabold text-cyan-400 mt-1">{selectedSubject.safeMissesTo75}</p>
                <span className="text-[10px] text-slate-400">classes</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Safe Skips to 90%</span>
                <p className="text-xl font-extrabold text-indigo-400 mt-1">{selectedSubject.safeMissesTo90}</p>
                <span className="text-[10px] text-slate-400">classes</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Classes to 75%</span>
                <p className="text-xl font-extrabold text-amber-400 mt-1">{selectedSubject.requiredFor75}</p>
                <span className="text-[10px] text-slate-400">consecutive</span>
              </div>
            </div>

            {/* Forward Timetable Recovery Milestones for this Subject */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Forward Recovery Calendar Milestones
              </h4>
              <p className="text-xs text-slate-400">
                Calculated by forward-stepping through the actual {currentTimetable.displayName} timetable schedule:
              </p>

              {(() => {
                const plan = projectRecoveryMilestones(
                  currentTimetable,
                  selectedSubject.attended,
                  selectedSubject.conducted,
                  75,
                  selectedSubject.subjectCode,
                  simulatedDate
                );

                if (plan.classesRequired === 0) {
                  return (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      Attendance in {selectedSubject.subjectName} is already safely above 75%!
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
                      <span>Target: <b className="text-white">75% Attendance</b></span>
                      <span>Recovery Date: <b className="text-indigo-400">{plan.projectedDate || 'Semester End'}</b></span>
                    </div>

                    <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40">
                      {plan.timetableMilestones.map((m, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                          <span className="text-slate-300">
                            Class #{idx + 1}: {m.date} ({m.day}, P{m.periodNumber})
                          </span>
                          <span className="font-bold text-emerald-400">
                            → {m.cumulativeAttendance}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedSubject(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
