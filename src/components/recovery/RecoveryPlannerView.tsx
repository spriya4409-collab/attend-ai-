import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Milestone,
  PartyPopper,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusColor, projectRecoveryMilestones } from '../../utils/attendanceCalculations';

export const RecoveryPlannerView: React.FC = () => {
  const {
    subjects,
    currentTimetable,
    overallAttended,
    overallConducted,
    overallPercentage,
    overallStatus,
    simulatedDate,
  } = useApp();

  const [selectedTarget, setSelectedTarget] = useState<number>(
    overallPercentage < 75 ? 75 : overallPercentage < 85 ? 85 : 90
  );
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('OVERALL');

  const activeSubject = subjects.find(s => s.subjectCode === selectedSubjectCode);
  const baseAttended = activeSubject ? activeSubject.attended : overallAttended;
  const baseConducted = activeSubject ? activeSubject.conducted : overallConducted;

  // Run real forward timetable recovery projection!
  const plan = projectRecoveryMilestones(
    currentTimetable,
    baseAttended,
    baseConducted,
    selectedTarget,
    activeSubject ? activeSubject.subjectCode : undefined,
    simulatedDate
  );

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Target className="w-6 h-6 text-emerald-400" />
          Recovery Planner & Calendar Forecasting
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Find out exactly how many consecutive classes you need to attend, and when on your timetable you will cross your target.
        </p>
      </div>

      {/* Target Selector Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400">Step 1: Choose Recovery Target</span>
            <div className="flex items-center gap-2 mt-2">
              {[
                { val: 75, label: '75% (Detention Escape)', desc: 'Minimum university requirement' },
                { val: 85, label: '85% (Academic Safety)', desc: 'Comfortable buffer' },
                { val: 90, label: '90% (Distinction / Honors)', desc: 'Excellence standard' },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setSelectedTarget(t.val)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTarget === t.val
                      ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <p className="font-extrabold">{t.val}% Target</p>
                  <p className="text-[10px] opacity-80">{t.label.split('(')[1]?.replace(')', '') || ''}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-400">Step 2: Subject Scope</span>
            <select
              value={selectedSubjectCode}
              onChange={(e) => setSelectedSubjectCode(e.target.value)}
              className="mt-2 w-full sm:w-64 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="OVERALL">-- Entire Semester (Overall) --</option>
              {subjects.map((s) => (
                <option key={s.subjectCode} value={s.subjectCode}>
                  {s.subjectCode} - {s.subjectName} ({s.percentage}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Recovery Plan Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Forward Timetable Recovery Route</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {plan.classesRequired === 0 ? (
                <span className="text-emerald-400">Target Already Achieved! 🎉</span>
              ) : (
                <>
                  Attend next{' '}
                  <span className="text-emerald-400 underline decoration-emerald-500 decoration-wavy">
                    {plan.classesRequired} consecutive classes
                  </span>
                </>
              )}
            </h3>

            <p className="text-slate-300 text-sm max-w-xl">
              {plan.classesRequired === 0
                ? `Your attendance is currently ${plan.currentPercentage}%, which meets or exceeds your ${selectedTarget}% goal.`
                : `By attending ${plan.classesRequired} uninterrupted upcoming classes in ${currentTimetable.displayName}, your attendance will climb from ${plan.currentPercentage}% to ${selectedTarget}%.`}
            </p>
          </div>

          {/* Expected Date Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shrink-0 min-w-48 shadow-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Projected Recovery Date
            </span>
            <p className="text-xl font-black text-indigo-300 mt-1">
              {plan.projectedDate ? plan.projectedDate : 'Semester End'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Based on {currentTimetable.displayName} schedule
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Current: {plan.currentPercentage}%</span>
            <span className="text-emerald-400">Goal: {selectedTarget}%</span>
          </div>

          <div className="relative w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (plan.currentPercentage / selectedTarget) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Start</span>
            <span>Recovery Target ({selectedTarget}%)</span>
          </div>
        </div>

        {plan.classesRequired === 0 && (
          <div className="pt-2 flex justify-start">
            <button
              onClick={handleCelebrate}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-600/30"
            >
              <PartyPopper className="w-4 h-4" />
              Celebrate Milestone!
            </button>
          </div>
        )}
      </div>

      {/* Timetable Milestone Calendar Sequence */}
      {plan.timetableMilestones.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Milestone className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">
                Scheduled Class-by-Class Recovery Timeline
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {plan.timetableMilestones.length} classes mapped forward
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Every step is extracted directly from the actual class schedule for {currentTimetable.displayName}:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
            {plan.timetableMilestones.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-[11px] shrink-0 border border-emerald-500/20">
                    #{idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-200">{m.subjectName}</p>
                    <p className="text-[11px] text-slate-400">
                      {m.date} ({m.day}, Period {m.periodNumber})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold text-emerald-400 text-sm">
                    {m.cumulativeAttendance}%
                  </span>
                  <p className="text-[10px] text-slate-500">cumulative</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
