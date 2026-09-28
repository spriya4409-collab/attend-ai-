import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers,
  MapPin,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVAILABLE_SECTIONS } from '../../data/timetables';
import { DayOfWeek } from '../../types';
import { calculateRemainingClasses } from '../../utils/attendanceCalculations';

export const TimetableView: React.FC = () => {
  const {
    currentTimetable,
    allTimetables,
    changeSection,
    simulatedDate,
    simulatedDay,
    simulatedTomorrowDay,
  } = useApp();

  const [activeView, setActiveView] = useState<'WEEK' | 'TODAY' | 'TOMORROW'>('WEEK');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(simulatedDay);

  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const remaining = calculateRemainingClasses(currentTimetable, simulatedDate);

  const displayedDaySchedule =
    activeView === 'TODAY'
      ? currentTimetable.schedule.find(s => s.day === simulatedDay)
      : activeView === 'TOMORROW'
      ? currentTimetable.schedule.find(s => s.day === simulatedTomorrowDay)
      : currentTimetable.schedule.find(s => s.day === selectedDay);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header and Section Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-indigo-400" />
              Academic Timetable & Schedule Engine
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              Verified Dataset
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official class periods, lab sessions, faculty allocations, and room numbers for {currentTimetable.displayName}.
          </p>
        </div>

        {/* Section Quick Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
          <span className="text-xs font-semibold text-slate-400 pl-2">Class Section:</span>
          <select
            value={currentTimetable.sectionId}
            onChange={(e) => changeSection(e.target.value)}
            className="p-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {AVAILABLE_SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label} ({sec.dept} Year {sec.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Semester Timeline & Remaining Classes Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Semester Start</span>
          <p className="text-base font-bold text-slate-200 mt-0.5">{currentTimetable.semesterStartDate}</p>
          <span className="text-[10px] text-emerald-400">Classes commenced</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Semester End</span>
          <p className="text-base font-bold text-slate-200 mt-0.5">{currentTimetable.semesterEndDate}</p>
          <span className="text-[10px] text-indigo-400">Final attendance freeze</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Classes</span>
          <p className="text-base font-bold text-cyan-400 mt-0.5">{remaining.totalRemaining} Periods</p>
          <span className="text-[10px] text-slate-400">Calculated from timetable</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Weekly Load</span>
          <p className="text-base font-bold text-purple-400 mt-0.5">35 Periods / Week</p>
          <span className="text-[10px] text-slate-400">7 Periods per day</span>
        </div>
      </div>

      {/* Filter Tabs: Today / Tomorrow / Full Week Day Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView('WEEK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'WEEK'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Schedule
          </button>
          <button
            onClick={() => setActiveView('TODAY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'TODAY'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today ({simulatedDay})
          </button>
          <button
            onClick={() => setActiveView('TOMORROW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeView === 'TOMORROW'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tomorrow ({simulatedTomorrowDay})
          </button>
        </div>

        {activeView === 'WEEK' && (
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedDay === day
                    ? 'bg-slate-800 text-indigo-400 border border-indigo-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Periods Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span>
              {activeView === 'TODAY'
                ? `Today's Schedule (${simulatedDay})`
                : activeView === 'TOMORROW'
                ? `Tomorrow's Schedule (${simulatedTomorrowDay})`
                : `${selectedDay}'s Schedule`}
            </span>
            <span className="text-xs text-slate-500 font-normal">
              ({displayedDaySchedule?.periods.length || 0} periods)
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Timing: 08:45 AM – 04:05 PM
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayedDaySchedule?.periods.map((period) => (
            <div
              key={`${period.periodNumber}-${period.subjectCode}`}
              className={`p-4 rounded-2xl border transition-all space-y-3 shadow-md ${
                period.isLab
                  ? 'bg-purple-950/20 border-purple-500/30'
                  : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-300 font-black flex items-center justify-center text-xs border border-indigo-500/20 shrink-0">
                  P{period.periodNumber}
                </span>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {period.startTime} - {period.endTime}
                  </span>
                  {period.isLab && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block mt-0.5">
                      Lab Session
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {period.subjectCode}
                </span>
                <h4 className="text-sm font-bold text-slate-100 mt-0.5 line-clamp-2">
                  {period.subjectName}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 truncate max-w-[65%]">
                  <User className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{period.facultyName}</span>
                </span>
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {period.roomNo}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full 5-Day Weekly Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Complete Monday to Friday Section Matrix ({currentTimetable.displayName})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-2.5">Day</th>
                <th className="p-2.5">Period 1<br/><span className="text-[9px] text-slate-500">8:45-9:40</span></th>
                <th className="p-2.5">Period 2<br/><span className="text-[9px] text-slate-500">9:40-10:35</span></th>
                <th className="p-2.5">Period 3<br/><span className="text-[9px] text-slate-500">10:50-11:45</span></th>
                <th className="p-2.5">Period 4<br/><span className="text-[9px] text-slate-500">11:45-12:40</span></th>
                <th className="p-2.5">Period 5<br/><span className="text-[9px] text-slate-500">1:30-2:25</span></th>
                <th className="p-2.5">Period 6<br/><span className="text-[9px] text-slate-500">2:25-3:15</span></th>
                <th className="p-2.5">Period 7<br/><span className="text-[9px] text-slate-500">3:15-4:05</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {currentTimetable.schedule.map((daySchedule) => (
                <tr key={daySchedule.day} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-bold text-indigo-300 bg-slate-950/40">
                    {daySchedule.day}
                  </td>
                  {daySchedule.periods.map((p) => (
                    <td
                      key={p.periodNumber}
                      className={`p-2 border-l border-slate-800/50 ${
                        p.isLab ? 'bg-purple-950/30' : ''
                      }`}
                    >
                      <p className="font-bold text-[11px] text-slate-200">{p.subjectCode}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{p.subjectName}</p>
                      <p className="text-[9px] text-slate-500">{p.roomNo}</p>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
