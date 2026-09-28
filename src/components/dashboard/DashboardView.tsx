import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  BellRing,
  Bot,
  Calculator,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileText,
  Flame,
  HeartPulse,
  HelpCircle,
  Play,
  RotateCcw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateSemesterForecast,
  getStatusColor,
  predictSkipOutcome,
  simulateAttendance,
} from '../../utils/attendanceCalculations';
import { TabType } from '../common/Navigation';
import { AttendanceAdvisorModal } from './AttendanceAdvisorModal';
import { ODLeaveSimulator } from './ODLeaveSimulator';
import { VisualAttendanceHealth } from './VisualAttendanceHealth';

interface DashboardViewProps {
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    activeStudent,
    currentTimetable,
    subjects,
    overallAttended,
    overallConducted,
    overallMissed,
    overallPercentage,
    overallStatus,
    overallSafeMisses75,
    overallSafeMisses90,
    overallRequired75,
    overallRequired90,
    simulatedDate,
    simulatedDay,
    simulatedTomorrowDay,
    alerts,
  } = useApp();

  const statusColors = getStatusColor(overallStatus);

  // Tomorrow's timetable periods
  const tomorrowSchedule = currentTimetable.schedule.find(s => s.day === simulatedTomorrowDay);
  const tomorrowPeriods = tomorrowSchedule ? tomorrowSchedule.periods : [];

  // Tomorrow skip prediction
  const tomorrowSkipOutcome = predictSkipOutcome(overallAttended, overallConducted, 1);

  // Interactive Quick Simulator state
  const [simAttend, setSimAttend] = useState<number>(0);
  const [simMiss, setSimMiss] = useState<number>(0);

  const simResult = simulateAttendance(overallAttended, overallConducted, simAttend, simMiss);
  const simStatusColors = getStatusColor(simResult.projectedStatus);

  // Semester Forecast
  const remainingEstimate = Math.max(0, 180 - overallConducted);
  const forecast = calculateSemesterForecast(overallAttended, overallConducted, remainingEstimate);

  // Danger subjects (< 75% or 75-79%)
  const dangerSubjects = subjects.filter(s => s.status === 'DETENTION_RISK');
  const warningSubjects = subjects.filter(s => s.status === 'WARNING');

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* 0. Highlighted Capabilities Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
              AttendAI – Smart Attendance Predictor
            </h2>
            <p className="text-[11px] text-slate-400">
              Live timetable intelligence • Verified semester analytics (29 Aug – 29 Nov 2026)
            </p>
          </div>
        </div>

        {/* The Three Highlighted Capabilities */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs shadow-sm shadow-emerald-500/10">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            Visual Attendance Health
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold text-xs shadow-sm shadow-cyan-500/10">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            OD & Leave Simulator
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold text-xs shadow-sm shadow-purple-500/10">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            Attendance Advisor
          </span>
        </div>
      </div>

      {/* 1. Value Proposition Banner: The Three Questions Answered Instantly */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-5 sm:p-6 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Attendance Copilot • Semester 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {activeStudent.name}
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
              Enrolled in <span className="text-indigo-300 font-semibold">{currentTimetable.displayName}</span> • Semester Period: 29 Aug 2026 – 29 Nov 2026.
              Here is your verified attendance trajectory and forward timetable predictions.
            </p>
          </div>

          {/* Overall Attendance Donut/Gauge Card */}
          <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-xl shrink-0">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="38"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - overallPercentage / 100)}`}
                  className={`${
                    overallStatus === 'SAFE'
                      ? 'text-emerald-400'
                      : overallStatus === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-rose-500'
                  } transition-all duration-1000 ease-out`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white leading-none">
                  {overallPercentage}%
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                  Overall
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block ${statusColors.badge}`}>
                {statusColors.label}
              </div>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{overallAttended}</span> / {overallConducted} classes
              </p>
              <p className="text-[11px] text-slate-500">
                Missed: <span className="text-rose-400 font-medium">{overallMissed}</span>
              </p>
            </div>
          </div>
        </div>

        {/* The 3 Core Question Answers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          {/* Question 1: Where is my attendance right now? */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className={`p-2 rounded-lg ${statusColors.bg} ${statusColors.text} shrink-0 mt-0.5`}>
              {overallStatus === 'SAFE' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : overallStatus === 'WARNING' ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                1. Where is my attendance right now?
              </p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {overallPercentage}% — {statusColors.label}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                {overallStatus === 'SAFE'
                  ? 'Exceeds the 90% distinction target. Safe from all detention criteria.'
                  : overallStatus === 'WARNING'
                  ? `Above the 75% threshold, but needs caution to avoid dropping into detention risk.`
                  : `CRITICAL: Below 75% threshold! You are currently flagged for detention.`}
              </p>
            </div>
          </div>

          {/* Question 2: What happens if I miss upcoming classes? */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                2. What happens if I miss classes?
              </p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {overallSafeMisses75 > 0 ? (
                  <span className="text-emerald-400">{overallSafeMisses75} Safe Misses Remaining</span>
                ) : (
                  <span className="text-rose-400">0 Safe Misses (Detention Risk!)</span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Missing 1 class tomorrow drops your overall attendance to{' '}
                <span className="text-rose-300 font-semibold">{tomorrowSkipOutcome.projectedPercentage}%</span>{' '}
                ({tomorrowSkipOutcome.diffPercentage}%).
              </p>
            </div>
          </div>

          {/* Question 3: What do I need to do to stay safe or recover? */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                3. How do I recover or hit 90%?
              </p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {overallRequired75 > 0 ? (
                  <span className="text-amber-400">Attend next {overallRequired75} consecutive classes</span>
                ) : (
                  <span className="text-emerald-400">Attend {overallRequired90} classes for 90%</span>
                )}
              </p>
              <button
                onClick={() => onNavigate('RECOVERY')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 mt-1 cursor-pointer"
              >
                <span>View forward recovery calendar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 1: Visual Attendance Tracking Section */}
      <VisualAttendanceHealth />

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Classes Conducted</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-slate-100">{overallConducted}</p>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Semester total so far</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Classes Attended</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-emerald-400">{overallAttended}</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500/70" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {((overallAttended / (overallConducted || 1)) * 100).toFixed(0)}% attendance rate
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Safe Misses (to 75%)</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className={`text-2xl font-bold ${overallSafeMisses75 > 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {overallSafeMisses75}
            </p>
            <ShieldCheck className="w-4 h-4 text-cyan-500/70" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Before detention zone</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Safe Misses (to 90%)</p>
          <div className="flex items-baseline justify-between mt-1">
            <p className={`text-2xl font-bold ${overallSafeMisses90 > 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
              {overallSafeMisses90}
            </p>
            <Award className="w-4 h-4 text-indigo-500/70" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Before dropping below 90%</p>
        </div>
      </div>

      {/* 3. Priority Alerts & Urgent Action Items */}
      {dangerSubjects.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                Detention Warning: {dangerSubjects.length} Subject(s) Below 75% Threshold!
              </h4>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                {dangerSubjects.map(s => `${s.subjectName} (${s.percentage}%) needs ${s.requiredFor75} classes to recover`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('RECOVERY')}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors"
          >
            Fix Attendance
          </button>
        </div>
      )}

      {/* 4. Two-Column Layout: Tomorrow's Schedule Consequences & Quick Attendance Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column A: Tomorrow's Real Timetable & Skip Impact */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Tomorrow's Timetable ({simulatedTomorrowDay})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('TIMETABLE')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              View Full Week →
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Real schedule from <span className="text-slate-200 font-medium">{currentTimetable.displayName}</span> dataset.
            Hover or inspect any period to preview what happens if missed.
          </p>

          <div className="space-y-2">
            {tomorrowPeriods.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No classes scheduled for tomorrow ({simulatedTomorrowDay}).
              </p>
            ) : (
              tomorrowPeriods.map((period) => {
                const sub = subjects.find(s => s.subjectCode === period.subjectCode);
                const ifMissOutcome = sub ? predictSkipOutcome(sub.attended, sub.conducted, 1) : null;

                return (
                  <div
                    key={`${period.periodNumber}-${period.subjectCode}`}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-300 font-bold flex items-center justify-center text-11px shrink-0 border border-indigo-500/20">
                        P{period.periodNumber}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-200">{period.subjectName}</p>
                        <p className="text-[11px] text-slate-400">
                          {period.startTime} - {period.endTime} • {period.roomNo}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {sub && (
                        <div>
                          <span className={`font-semibold ${getStatusColor(sub.status).text}`}>
                            {sub.percentage}%
                          </span>
                          {ifMissOutcome && (
                            <p className="text-[10px] text-slate-400">
                              Miss: <span className={ifMissOutcome.isDangerous ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                                {ifMissOutcome.projectedPercentage}%
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <Compass className="w-3.5 h-3.5" />
              Skip Predictor
            </span>
            <button
              onClick={() => onNavigate('CALCULATOR')}
              className="text-xs text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Simulate skipping specific subjects →
            </button>
          </div>
        </div>

        {/* Column B: Interactive What-If Simulator */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Interactive Attendance Simulator
              </h3>
            </div>
            <button
              onClick={() => {
                setSimAttend(0);
                setSimMiss(0);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Simulate attending or missing upcoming classes to see how overall attendance shifts immediately.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Attend extra */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <label className="text-xs font-semibold text-emerald-400 block mb-1.5">
                Attend Upcoming (+{simAttend})
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 3, 5].map((num) => (
                  <button
                    key={`attend-${num}`}
                    onClick={() => setSimAttend(num)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      simAttend === num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            {/* Miss extra */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <label className="text-xs font-semibold text-rose-400 block mb-1.5">
                Miss Upcoming (+{simMiss})
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={`miss-${num}`}
                    onClick={() => setSimMiss(num)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      simMiss === num
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation Result Preview Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Simulation Outcome:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${simStatusColors.badge}`}>
                {simStatusColors.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400">Projected Attendance:</span>
                <p className="text-2xl font-black text-white">
                  {simResult.projectedPercentage}%
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">Net Shift:</span>
                <p
                  className={`text-sm font-bold ${
                    simResult.diffPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {simResult.diffPercentage >= 0 ? `+${simResult.diffPercentage}` : simResult.diffPercentage}%
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal border-t border-slate-700/50 pt-2">
              Formula: ({overallAttended} + {simAttend}) / ({overallConducted} + {simAttend + simMiss}) × 100
              = {simResult.projectedAttended} / {simResult.projectedConducted} classes.
            </p>
          </div>

          {/* End-semester projection summary */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              End-Semester Forecast (29 Nov 2026)
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-300 font-bold uppercase">Best Case</p>
                <p className="text-base font-extrabold text-white mt-0.5">{forecast.bestCase}%</p>
                <p className="text-[9px] text-slate-400">Attend 100%</p>
              </div>

              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-indigo-300 font-bold uppercase">Expected</p>
                <p className="text-base font-extrabold text-white mt-0.5">{forecast.expectedCase}%</p>
                <p className="text-[9px] text-slate-400">Maintain pace</p>
              </div>

              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-[10px] text-rose-300 font-bold uppercase">Risk Case</p>
                <p className="text-base font-extrabold text-white mt-0.5">{forecast.riskCase}%</p>
                <p className="text-[9px] text-slate-400">Miss 30%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 2: OD & Medical Leave Simulator */}
      <ODLeaveSimulator />

      {/* 5. Subject Cards Quick Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Subject Attendance Snapshot ({subjects.length} Subjects)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('SUBJECTS')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
          >
            View Detailed Cards & History →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((sub) => {
            const sc = getStatusColor(sub.status);
            return (
              <div
                key={sub.subjectCode}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {sub.subjectCode} {sub.isLab && '• Lab'}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                      {sub.subjectName}
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sc.badge}`}>
                    {sub.percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      sub.status === 'SAFE'
                        ? 'bg-emerald-500'
                        : sub.status === 'WARNING'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    Attended: <b className="text-slate-200">{sub.attended}</b>/{sub.conducted}
                  </span>
                  <span>
                    {sub.safeMissesTo75 > 0 ? (
                      <span className="text-cyan-400 font-medium">{sub.safeMissesTo75} safe skips</span>
                    ) : (
                      <span className="text-rose-400 font-bold">Needs {sub.requiredFor75} to 75%</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 3: Floating Attendance Advisor AI Chatbot */}
      <AttendanceAdvisorModal />
    </div>
  );
};
