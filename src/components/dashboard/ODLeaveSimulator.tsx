import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  FileCheck2,
  FileText,
  HelpCircle,
  Info,
  RotateCcw,
  Scale,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getStatusColor,
  LeaveCreditRule,
  simulateLeaveOutcome,
} from '../../utils/attendanceCalculations';

export const ODLeaveSimulator: React.FC = () => {
  const {
    activeStudent,
    overallAttended,
    overallConducted,
    overallPercentage,
    overallStatus,
    currentTimetable,
  } = useApp();

  // Inputs
  const [odDays, setOdDays] = useState<number>(2);
  const [medicalDays, setMedicalDays] = useState<number>(0);
  const [classesPerDay, setClassesPerDay] = useState<number>(6);
  const [useCustomClasses, setUseCustomClasses] = useState<boolean>(false);
  const [customClasses, setCustomClasses] = useState<number>(12);
  const [leaveReason, setLeaveReason] = useState<string>('Technical Symposium / Hackathon');
  const [selectedRule, setSelectedRule] = useState<LeaveCreditRule>('CREDITED_AS_ATTENDED');

  // Compute live result
  const result = useMemo(() => {
    return simulateLeaveOutcome({
      currentAttended: overallAttended,
      currentConducted: overallConducted,
      odDays,
      medicalDays,
      classesPerDay,
      customAffectedClasses: useCustomClasses ? customClasses : undefined,
      reason: leaveReason,
      rule: selectedRule,
    });
  }, [
    overallAttended,
    overallConducted,
    odDays,
    medicalDays,
    classesPerDay,
    useCustomClasses,
    customClasses,
    leaveReason,
    selectedRule,
  ]);

  const currentColors = getStatusColor(overallStatus);
  const projColors = getStatusColor(result.projectedStatus);

  const resetSimulator = () => {
    setOdDays(0);
    setMedicalDays(0);
    setUseCustomClasses(false);
    setCustomClasses(0);
    setLeaveReason('Technical Symposium / Hackathon');
    setSelectedRule('CREDITED_AS_ATTENDED');
  };

  return (
    <div className="rounded-3xl bg-slate-900/85 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>Feature 2: OD & Leave Simulator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            On-Duty (OD) & Medical Leave Simulator
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Model institutional attendance impacts for approved On-Duty, medical certificates, and official permissions with configurable college policies.
          </p>
        </div>

        <button
          onClick={resetSimulator}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto border border-slate-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Inputs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs Panel: 6 Cols */}
        <div className="lg:col-span-6 space-y-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-cyan-400" />
            Enter Leave & Duty Parameters
          </h4>

          {/* Steppers: OD Days & Medical Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* OD Days */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                On-Duty (OD) Days
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOdDays((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={odDays}
                  onChange={(e) => setOdDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 text-center py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-base focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setOdDays((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="flex gap-1 pt-1">
                {[0, 1, 2, 3, 5].map((d) => (
                  <button
                    key={`od-${d}`}
                    type="button"
                    onClick={() => setOdDays(d)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded cursor-pointer transition-colors ${
                      odDays === d
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Days */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-rose-400" />
                Medical Leave Days
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMedicalDays((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={medicalDays}
                  onChange={(e) => setMedicalDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 text-center py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-base focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setMedicalDays((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
              <div className="flex gap-1 pt-1">
                {[0, 1, 2, 3, 5].map((d) => (
                  <button
                    key={`med-${d}`}
                    type="button"
                    onClick={() => setMedicalDays(d)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded cursor-pointer transition-colors ${
                      medicalDays === d
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Classes Per Day or Custom Override */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">
                Affected Classes Calculation:
              </span>
              <label className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomClasses}
                  onChange={(e) => setUseCustomClasses(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-0 cursor-pointer"
                />
                <span>Custom class count</span>
              </label>
            </div>

            {!useCustomClasses ? (
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">Classes per day (timetable average):</span>
                <div className="flex items-center gap-1">
                  {[5, 6, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setClassesPerDay(num)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                        classesPerDay === num
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {num} periods
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Total classes affected:</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={customClasses}
                  onChange={(e) => setCustomClasses(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white font-bold"
                />
                <span className="text-[11px] text-slate-500">classes total</span>
              </div>
            )}

            <div className="text-[11px] text-cyan-300/90 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40">
              Total affected classes modeled: <b className="text-cyan-200">{result.totalAffectedClasses} classes</b> ({result.totalLeaveDays} total day(s))
            </div>
          </div>

          {/* Reason / Type of Leave */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Reason / Category of Leave:
            </label>
            <select
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Technical Symposium / Hackathon">Technical Symposium / Hackathon (Institutional Representation)</option>
              <option value="Inter-College Sports / Tournament">Inter-College Sports / University Tournament</option>
              <option value="Hospitalization / Severe Illness">Hospitalization / Typhoid / Dengue (Medical Certificate)</option>
              <option value="Medical Specialist Rest">Medical Specialist Certified Bed Rest</option>
              <option value="Paper Presentation / Conference">National/International Conference Paper Presentation</option>
              <option value="NCC / NSS Camp">NCC / NSS National Service Camp</option>
              <option value="Family Emergency">Personal / Family Emergency</option>
            </select>
          </div>

          {/* Configurable Institutional Attendance Policy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Institutional Attendance Policy:
              </label>
              <span className="text-[10px] text-slate-400">Configurable Rule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRule('CREDITED_AS_ATTENDED')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRule === 'CREDITED_AS_ATTENDED'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-200 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="font-bold text-slate-200 text-xs">1. 100% Duty Credit</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Counts as attended classes</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRule('EXEMPTED_FROM_TOTAL')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRule === 'EXEMPTED_FROM_TOTAL'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="font-bold text-slate-200 text-xs">2. Excluded from Total</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Exempted from conducted divisor</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRule('OD_ATTENDED_MEDICAL_EXEMPT')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRule === 'OD_ATTENDED_MEDICAL_EXEMPT'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="font-bold text-slate-200 text-xs">3. Hybrid OD/Medical</div>
                <div className="text-[10px] text-slate-400 mt-0.5">OD attended, Medical waived</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRule('TREATED_AS_ABSENT')}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  selectedRule === 'TREATED_AS_ABSENT'
                    ? 'bg-rose-500/10 border-rose-500 text-rose-200 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                <div className="font-bold text-slate-200 text-xs">4. Normal Absence</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Standard absence penalty</div>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              {result.ruleExplanation}
            </p>
          </div>
        </div>

        {/* Right Output Panel: 6 Cols */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                Projected Attendance Outcome
              </h4>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg ${projColors.badge}`}>
                {projColors.label}
              </span>
            </div>

            {/* Projection Primary Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Current */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Current Attendance</span>
                <p className="text-2xl font-black text-white mt-1">
                  {result.currentPercentage}%
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {overallAttended} / {overallConducted} classes
                </p>
              </div>

              {/* Projected */}
              <div className={`p-4 rounded-xl border ${projColors.bg} ${projColors.border}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Projected Attendance</span>
                  <span
                    className={`text-xs font-bold ${
                      result.diffPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {result.diffPercentage >= 0 ? `+${result.diffPercentage}%` : `${result.diffPercentage}%`}
                  </span>
                </div>
                <p className={`text-2xl font-black mt-1 ${projColors.text}`}>
                  {result.projectedPercentage}%
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {result.projectedAttended} / {result.projectedConducted} classes
                </p>
              </div>
            </div>

            {/* Checklist items: >= 90%, >= 75%, and safe misses */}
            <div className="space-y-2.5 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2">
                  {result.remainsAbove90 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-400" />
                  )}
                  Remains Above 90% Safe Target?
                </span>
                <span className={`font-bold ${result.remainsAbove90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.remainsAbove90 ? 'YES (Protected)' : 'NO (Below 90%)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2">
                  {result.remainsAbove75 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  Remains Above 75% Detention Threshold?
                </span>
                <span className={`font-bold ${result.remainsAbove75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.remainsAbove75 ? 'YES (Eligible for Exams)' : 'NO (Detention Risk!)'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-300">
                  Classes that can still be missed safely:
                </span>
                <span className="font-extrabold text-cyan-400">
                  {result.projectedSafeMisses75 > 0 ? (
                    `${result.projectedSafeMisses75} classes (to 75%)`
                  ) : (
                    <span className="text-rose-400">0 classes (No margin!)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Critical warning banner if critical zone */}
            {result.isCriticalWarning && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2.5 animate-pulse">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-rose-100">
                    CRITICAL WARNING: Detention Zone Triggered!
                  </h5>
                  <p className="mt-0.5 text-[11px] text-rose-300/90 leading-relaxed">
                    Under this leave scenario, projected attendance drops to {result.projectedPercentage}%, below the mandatory 75% university detention threshold. You will need to attend <b className="text-white underline">{result.requiredClassesTo75} consecutive upcoming classes</b> to recover eligibility.
                  </p>
                </div>
              </div>
            )}

            {/* Approved vs Unapproved Comparison Box */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1.5">
              <span className="font-bold text-slate-300 block">
                Approved Institutional Exemption vs. Unapproved Absence:
              </span>
              <div className="flex items-center justify-between text-slate-400">
                <span>With institutional approval ({selectedRule.replace(/_/g, ' ')}):</span>
                <span className={`font-bold ${projColors.text}`}>{result.projectedPercentage}%</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>If treated as unapproved absence:</span>
                <span className="font-bold text-rose-400">{result.normalAbsenceProjectedPercentage}%</span>
              </div>
              <div className="text-[10px] text-emerald-400/90 font-medium pt-1 border-t border-slate-800/80">
                Institutional documentation saves +{Number((result.projectedPercentage - result.normalAbsenceProjectedPercentage).toFixed(2))}% of your attendance ledger!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
