import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calculator,
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  calculateAttendancePercentage,
  calculateRequiredClasses,
  calculateSafeMisses,
  getStatusColor,
  predictSkipOutcome,
} from '../../utils/attendanceCalculations';

export const CalculatorView: React.FC = () => {
  const {
    subjects,
    currentTimetable,
    overallAttended,
    overallConducted,
    simulatedTomorrowDay,
    simulatedDay,
  } = useApp();

  // Mode: 1 = Skip Class Predictor (Timetable aware), 2 = Raw Calculator
  const [activeMode, setActiveMode] = useState<'SKIP_PREDICTOR' | 'RAW_CALCULATOR'>('SKIP_PREDICTOR');

  // Skip Class Predictor State
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>(
    subjects[0]?.subjectCode || 'OVERALL'
  );
  const [classesToSkip, setClassesToSkip] = useState<number>(1);

  // Manual Raw Calculator State
  const [manualConducted, setManualConducted] = useState<number>(40);
  const [manualAttended, setManualAttended] = useState<number>(32);

  // Active subject for Skip Predictor
  const activeSubject = subjects.find(s => s.subjectCode === selectedSubjectCode);
  const skipBaseAttended = activeSubject ? activeSubject.attended : overallAttended;
  const skipBaseConducted = activeSubject ? activeSubject.conducted : overallConducted;

  // Real timetable check for upcoming classes of this subject
  const tomorrowSchedule = currentTimetable.schedule.find(s => s.day === simulatedTomorrowDay);
  const tomorrowOccurrences = activeSubject
    ? tomorrowSchedule?.periods.filter(p => p.subjectCode === activeSubject.subjectCode) || []
    : tomorrowSchedule?.periods || [];

  const skipOutcome = predictSkipOutcome(skipBaseAttended, skipBaseConducted, classesToSkip);
  const skipStatusColors = getStatusColor(skipOutcome.projectedStatus);

  // Raw Calculator Outcomes
  const manualPct = calculateAttendancePercentage(manualAttended, manualConducted);
  const manualStatus = getStatusColor(skipOutcome.currentStatus); // fallback
  const rawStatus = getStatusColor(
    manualPct >= 90 ? 'SAFE' : manualPct >= 75 ? 'WARNING' : 'DETENTION_RISK'
  );
  const manualSafe75 = calculateSafeMisses(manualAttended, manualConducted, 75);
  const manualSafe90 = calculateSafeMisses(manualAttended, manualConducted, 90);
  const manualReq75 = calculateRequiredClasses(manualAttended, manualConducted, 75);
  const manualReq90 = calculateRequiredClasses(manualAttended, manualConducted, 90);

  // Edge case quick test buttons
  const testCases = [
    { label: 'Edge: 100%', c: 30, a: 30 },
    { label: 'Edge: 90.0%', c: 30, a: 27 },
    { label: 'Edge: 89.9%', c: 31, a: 27 }, // 87.1%
    { label: 'Edge: 75.0%', c: 40, a: 30 },
    { label: 'Edge: 74.9%', c: 39, a: 29 }, // 74.3%
    { label: 'Edge: 0 Conducted', c: 0, a: 0 },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-6 h-6 text-indigo-400" />
            Attendance Calculator & Skip Predictor
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mathematically verified predictions grounded in the {currentTimetable.displayName} timetable dataset.
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveMode('SKIP_PREDICTOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'SKIP_PREDICTOR'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timetable Skip Predictor
          </button>
          <button
            onClick={() => setActiveMode('RAW_CALCULATOR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeMode === 'RAW_CALCULATOR'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manual Formula Calc
          </button>
        </div>
      </div>

      {activeMode === 'SKIP_PREDICTOR' ? (
        /* 1. Timetable-Aware Skip Class Predictor */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Configure Planned Skip
            </h3>

            {/* Select Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Subject</label>
              <select
                value={selectedSubjectCode}
                onChange={(e) => setSelectedSubjectCode(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="OVERALL">-- All Subjects (Overall Attendance) --</option>
                {subjects.map((s) => (
                  <option key={s.subjectCode} value={s.subjectCode}>
                    {s.subjectCode} - {s.subjectName} ({s.percentage}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Number of Classes to Skip */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Number of Classes to Skip</span>
                <span className="font-bold text-rose-400 text-sm">{classesToSkip} class(es)</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={classesToSkip}
                onChange={(e) => setClassesToSkip(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 class</span>
                <span>3 classes</span>
                <span>5 classes</span>
                <span>10 classes</span>
              </div>
            </div>

            {/* Tomorrow's Timetable Verification Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Tomorrow ({simulatedTomorrowDay}):
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {tomorrowOccurrences.length} period(s)
                </span>
              </div>

              {activeSubject && (
                <div className="text-[11px] text-slate-400">
                  {tomorrowOccurrences.length > 0 ? (
                    <span className="text-amber-300">
                      ⚠️ <b>{activeSubject.subjectName}</b> occurs tomorrow at Period{' '}
                      {tomorrowOccurrences.map(p => p.periodNumber).join(', ')}!
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      ℹ️ Note: <b>{activeSubject.subjectName}</b> is NOT scheduled tomorrow on your section's timetable.
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Current Metrics Info */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Currently Attended:</span>
                <span className="font-bold text-slate-200">{skipBaseAttended} / {skipBaseConducted}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Percentage:</span>
                <span className="font-bold text-slate-200">{skipOutcome.currentPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Projection Results Card */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                    Projected Consequence
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Impact of Skipping {classesToSkip} {activeSubject ? activeSubject.subjectName : 'Classes'}
                  </h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg ${skipStatusColors.badge}`}>
                  {skipStatusColors.label}
                </span>
              </div>

              {/* Before vs After Visual Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Current Attendance</span>
                  <p className="text-3xl font-black text-white">
                    {skipOutcome.currentPercentage}%
                  </p>
                  <p className="text-xs text-slate-400">
                    Status: <span className="font-semibold text-slate-200">{skipOutcome.currentStatus}</span>
                  </p>
                </div>

                <div className={`p-4 rounded-xl border space-y-1 ${skipOutcome.isDangerous ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-950/70 border-slate-800'}`}>
                  <span className="text-xs text-slate-400">Projected Attendance</span>
                  <p className={`text-3xl font-black ${skipOutcome.isDangerous ? 'text-rose-400' : 'text-slate-100'}`}>
                    {skipOutcome.projectedPercentage}%
                  </p>
                  <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Drop of {Math.abs(skipOutcome.diffPercentage)}% ({skipOutcome.projectedStatus})
                  </p>
                </div>
              </div>

              {/* Mathematical breakdown formula */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <p className="font-semibold text-indigo-300">Exact Mathematical Formula Applied:</p>
                <p className="font-mono text-slate-200">
                  Projected % = Attended / (Conducted + Skipped) × 100
                </p>
                <p className="font-mono text-slate-400">
                  = {skipOutcome.projectedAttended} / ({skipBaseConducted} + {classesToSkip}) × 100
                  = {skipOutcome.projectedAttended} / {skipOutcome.projectedConducted} × 100
                  = {skipOutcome.projectedPercentage}%
                </p>
              </div>

              {/* Critical Alert Warning if threshold breached */}
              {skipOutcome.isDangerous && (
                <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-300">
                      DETENTION RISK WARNING!
                    </h4>
                    <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">
                      Skipping {classesToSkip} classes will drop your attendance below the mandatory 75% threshold!
                      University guidelines state that students below 75% are liable to be detained from end-semester examinations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Safe Absence Summary Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-200">
                  Safe Absences Remaining Before 75%:
                </p>
                <p className="text-slate-400 text-[11px]">
                  How many classes you can skip without entering detention risk.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-cyan-400">
                  {calculateSafeMisses(skipBaseAttended, skipBaseConducted, 75)}
                </span>
                <span className="text-xs text-slate-400 ml-1">classes</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Manual Formula Attendance & Edge Case Calculator */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Controls */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-indigo-400" />
              Manual Inputs
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Total Classes Conducted (C)</label>
              <input
                type="number"
                min="0"
                value={manualConducted}
                onChange={(e) => setManualConducted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Classes Attended (A)</label>
              <input
                type="number"
                min="0"
                max={manualConducted}
                value={manualAttended}
                onChange={(e) => setManualAttended(Math.min(manualConducted, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Edge Case Quick Presets */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400">Test Official Edge Cases:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {testCases.map((tc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setManualConducted(tc.c);
                      setManualAttended(tc.a);
                    }}
                    className="p-1.5 text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[10px] text-slate-300 transition-colors border border-slate-700/50 cursor-pointer"
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                  Calculated Result
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h3 className="text-4xl font-black text-white">{manualPct.toFixed(2)}%</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${rawStatus.badge}`}>
                    {rawStatus.label}
                  </span>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <p>Missed: <b className="text-rose-400">{Math.max(0, manualConducted - manualAttended)}</b></p>
                <p>Attended: <b className="text-emerald-400">{manualAttended}</b>/{manualConducted}</p>
              </div>
            </div>

            {/* Formula & Safe Misses Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Safe Skips to 75%</span>
                <p className="text-xl font-black text-cyan-400 mt-1">{manualSafe75}</p>
                <span className="text-[10px] text-slate-400">classes</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Safe Skips to 90%</span>
                <p className="text-xl font-black text-indigo-400 mt-1">{manualSafe90}</p>
                <span className="text-[10px] text-slate-400">classes</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Needed for 75%</span>
                <p className="text-xl font-black text-amber-400 mt-1">{manualReq75}</p>
                <span className="text-[10px] text-slate-400">consecutive</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase">Needed for 90%</span>
                <p className="text-xl font-black text-emerald-400 mt-1">{manualReq90}</p>
                <span className="text-[10px] text-slate-400">consecutive</span>
              </div>
            </div>

            {/* Zero Division Safety & Precision Notes */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">Mathematical Edge Case Compliance:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Zero conducted classes returns 100% (No division by zero).</li>
                <li>Intermediate values use full IEEE 754 float precision without premature rounding.</li>
                <li>Safe absence: M = ⌊ (A / T) - C ⌋. If A/C &lt; T, safe absence is strictly 0.</li>
                <li>Recovery classes: R = ⌈ (T·C - 100·A) / (100 - T) ⌉.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
