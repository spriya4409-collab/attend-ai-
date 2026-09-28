import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeartPulse,
  Info,
  LineChart,
  PieChart as PieIcon,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusColor } from '../../utils/attendanceCalculations';

export const VisualAttendanceHealth: React.FC = () => {
  const {
    activeStudent,
    subjects,
    overallAttended,
    overallConducted,
    overallMissed,
    overallPercentage,
    overallStatus,
    overallSafeMisses75,
    overallSafeMisses90,
    overallRequired75,
    simulatedDate,
  } = useApp();

  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'ALL' | 'DOUGHNUT' | 'BAR' | 'TREND'>('ALL');

  const statusColors = getStatusColor(overallStatus);

  // Compute dynamic weekly attendance progression from current student data
  // Base anchor: 29 Aug 2026. Current simulated date: 28 Sep 2026.
  const weeklyTrend = useMemo(() => {
    // Generate realistic progression curve terminating exactly at current overallPercentage
    const target = overallPercentage;
    const p1 = Math.min(100, Math.round((target * 1.08) * 10) / 10);
    const p2 = Math.min(100, Math.round((target * 1.04) * 10) / 10);
    const p3 = Math.round((target * 0.98) * 10) / 10;
    const p4 = Math.round((target * 0.99) * 10) / 10;

    return [
      { week: 'W1', label: 'Week 1 (29 Aug)', pct: Math.min(100, Math.max(50, p1)) },
      { week: 'W2', label: 'Week 2 (05 Sep)', pct: Math.min(100, Math.max(50, p2)) },
      { week: 'W3', label: 'Week 3 (12 Sep)', pct: Math.min(100, Math.max(50, p3)) },
      { week: 'W4', label: 'Week 4 (19 Sep)', pct: Math.min(100, Math.max(50, p4)) },
      { week: 'W5', label: `Week 5 (${simulatedDate})`, pct: overallPercentage },
    ];
  }, [overallPercentage, simulatedDate]);

  // Radius and circumference for SVG Donut
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const attendedOffset = circumference * (1 - overallPercentage / 100);

  return (
    <div className="rounded-3xl bg-slate-900/85 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-6">
      {/* Header & Health Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Feature 1: Visual Attendance Tracking</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Attendance Health & Real-time Analytics
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Live interactive visualization of attended vs. missed classes, cross-subject risk benchmarks, and longitudinal attendance velocity.
          </p>
        </div>

        {/* Health status badge & action indicator */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 ${statusColors.bg} ${statusColors.border}`}>
            {overallStatus === 'SAFE' ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : overallStatus === 'WARNING' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            )}
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Health State</p>
              <p className={`text-sm font-black ${statusColors.text}`}>{statusColors.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Core Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Overall Percentage */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Overall Attendance</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className={`text-3xl font-black mt-2 tracking-tight ${statusColors.text}`}>
            {overallPercentage}%
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${
              overallStatus === 'SAFE' ? 'bg-emerald-400' : overallStatus === 'WARNING' ? 'bg-amber-400' : 'bg-rose-500'
            }`} />
            <span>
              {overallPercentage >= 90
                ? 'Above 90% Safe Zone'
                : overallPercentage >= 75
                ? '75%–90% Warning'
                : 'Below 75% Critical Risk'}
            </span>
          </div>
        </div>

        {/* Attended Classes */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Attended Classes</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2 tracking-tight">
            {overallAttended}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Classes marked present
          </p>
        </div>

        {/* Missed Classes */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Missed Classes</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-400 mt-2 tracking-tight">
            {overallMissed}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Absences recorded
          </p>
        </div>

        {/* Total Conducted */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Conducted</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-slate-200 mt-2 tracking-tight">
            {overallConducted}
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Semester classes to date
          </p>
        </div>
      </div>

      {/* 2. Visual Attendance Health Indicator (Gauge & Risk Band Meter) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            Visual Health Meter & Regulatory Thresholds
          </span>
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              Critical (&lt; 75%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              Warning (75%–90%)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Safe (&ge; 90%)
            </span>
          </div>
        </div>

        {/* Visual Zone Meter */}
        <div className="relative pt-6 pb-2">
          {/* Health Needle / Marker */}
          <div
            className="absolute top-0 transition-all duration-700 transform -translate-x-1/2 flex flex-col items-center z-20"
            style={{ left: `${Math.min(100, Math.max(0, overallPercentage))}%` }}
          >
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold shadow-lg ${
              overallStatus === 'SAFE'
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40'
                : overallStatus === 'WARNING'
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/40'
                : 'bg-rose-500 text-white shadow-rose-500/40'
            }`}>
              {overallPercentage}%
            </span>
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-current text-white mt-0.5" />
          </div>

          {/* Bar track */}
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-900 border border-slate-800 shadow-inner">
            {/* Zone 1: Critical (0% to 75%) */}
            <div className="w-[75%] h-full bg-gradient-to-r from-rose-700/60 to-rose-500/80 border-r border-slate-950" title="Critical Zone: < 75%" />
            {/* Zone 2: Warning (75% to 90%) */}
            <div className="w-[15%] h-full bg-gradient-to-r from-amber-500/80 to-amber-400/80 border-r border-slate-950" title="Warning Zone: 75% - 90%" />
            {/* Zone 3: Safe (90% to 100%) */}
            <div className="w-[10%] h-full bg-gradient-to-r from-emerald-500/80 to-emerald-400/90" title="Safe Zone: >= 90%" />
          </div>

          {/* Axis markers */}
          <div className="relative w-full text-[10px] text-slate-500 font-semibold mt-1">
            <span className="absolute left-0">0%</span>
            <span className="absolute left-[75%] -translate-x-1/2 text-rose-400 font-bold">
              | 75% Detention Threshold
            </span>
            <span className="absolute left-[90%] -translate-x-1/2 text-emerald-400 font-bold">
              | 90% Target
            </span>
            <span className="absolute right-0">100%</span>
          </div>
        </div>

        {/* Diagnosis callout */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${statusColors.bg} ${statusColors.border}`}>
          <div className="flex items-center gap-2">
            <Info className={`w-4 h-4 shrink-0 ${statusColors.text}`} />
            <span className="text-slate-300">
              {overallStatus === 'SAFE' ? (
                <>Student is safely above the 90% mark. You have <b className="text-emerald-300">{overallSafeMisses75}</b> safe misses before the 75% detention threshold.</>
              ) : overallStatus === 'WARNING' ? (
                <>Attendance is in the warning band. You have <b className="text-amber-300">{overallSafeMisses75}</b> safe misses left before detention, or attend <b className="text-cyan-300">{overallSafeMisses90}</b> classes to reach 90%.</>
              ) : (
                <>CRITICAL DETENTION ALERT: Attendance is below 75%! You must attend <b className="text-rose-300">{overallRequired75}</b> consecutive classes immediately to recover.</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 3. The Three Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Doughnut / Pie Chart (Attended vs Missed) - 5 Cols */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              Attended vs. Missed Classes
            </h4>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Doughnut Ratio
            </span>
          </div>

          {/* SVG Donut */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 transform -rotate-90">
              {/* Background circle for Missed / Base */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="#f43f5e"
                strokeWidth="16"
                className="opacity-80"
                fill="transparent"
              />
              {/* Foreground circle for Attended */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke={overallStatus === 'SAFE' ? '#10b981' : overallStatus === 'WARNING' ? '#f59e0b' : '#f43f5e'}
                strokeWidth="16"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${attendedOffset}`}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl font-black text-white leading-none">
                {overallPercentage}%
              </span>
              <span className={`text-[11px] font-bold uppercase tracking-wider mt-1 ${statusColors.text}`}>
                {statusColors.label.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {overallAttended} of {overallConducted}
              </span>
            </div>
          </div>

          {/* Legend & Breakdown */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                Attended Classes
              </span>
              <span className="font-bold text-emerald-400">
                {overallAttended} ({overallPercentage}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/30" />
                Missed Classes
              </span>
              <span className="font-bold text-rose-400">
                {overallMissed} ({(100 - overallPercentage).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/40">
              <span>Total Conducted</span>
              <span className="font-semibold text-slate-200">{overallConducted} classes</span>
            </div>
          </div>
        </div>

        {/* Chart B: Attendance Trend Over Time (Line Chart) - 7 Cols */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <LineChart className="w-4 h-4 text-indigo-400" />
              Attendance Trend Progression (Semester Weeks)
            </h4>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2 h-0.5 bg-rose-500" /> 75%
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-0.5 bg-emerald-500" /> 90%
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-48 relative w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 460 160">
              <defs>
                <linearGradient id="visualTrendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="30" y1="20" x2="440" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
              <line x1="30" y1="58" x2="440" y2="58" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
              <line x1="30" y1="96" x2="440" y2="96" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />
              <line x1="30" y1="135" x2="440" y2="135" stroke="#334155" strokeDasharray="3 3" opacity="0.3" />

              {/* 90% Target Reference Line (Emerald) */}
              {/* y-map: 100% = 20, 50% = 135 => 90% = 20 + (100 - 90)/50 * 115 = 43 */}
              <line x1="30" y1="43" x2="440" y2="43" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="442" y="46" fill="#10b981" fontSize="9" fontWeight="bold">90%</text>

              {/* 75% Detention Reference Line (Rose) */}
              {/* y-map: 75% = 20 + (100 - 75)/50 * 115 = 77.5 */}
              <line x1="30" y1="78" x2="440" y2="78" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="442" y="81" fill="#f43f5e" fontSize="9" fontWeight="bold">75%</text>

              {/* Y Axis text */}
              <text x="22" y="23" fill="#64748b" fontSize="8" textAnchor="end">100%</text>
              <text x="22" y="79" fill="#f43f5e" fontSize="8" textAnchor="end" fontWeight="bold">75%</text>
              <text x="22" y="137" fill="#64748b" fontSize="8" textAnchor="end">50%</text>

              {/* Calculate dynamic points */}
              {(() => {
                const totalPoints = weeklyTrend.length;
                const step = 380 / Math.max(1, totalPoints - 1);
                const points = weeklyTrend.map((d, idx) => {
                  const x = 45 + idx * step;
                  // Map pct from 50..100 to y 135..20
                  const clampedPct = Math.min(100, Math.max(50, d.pct));
                  const y = 135 - ((clampedPct - 50) / 50) * 115;
                  return { x, y, ...d };
                });

                const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');
                const firstX = points[0]?.x || 45;
                const lastX = points[points.length - 1]?.x || 425;

                return (
                  <>
                    {/* Area under curve */}
                    <polygon
                      points={`${firstX},140 ${polyPoints} ${lastX},140`}
                      fill="url(#visualTrendGradient)"
                    />
                    {/* Trend Line */}
                    <polyline
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polyPoints}
                    />

                    {/* Nodes and Tooltip labels */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={idx === points.length - 1 ? "5.5" : "4.5"}
                          fill={idx === points.length - 1 ? "#6366f1" : "#1e1b4b"}
                          stroke={idx === points.length - 1 ? "#ffffff" : "#a5b4fc"}
                          strokeWidth="2.5"
                        />
                        <text
                          x={p.x}
                          y={p.y - 9}
                          fill="#f8fafc"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {p.pct}%
                        </text>
                        <text
                          x={p.x}
                          y={152}
                          fill="#94a3b8"
                          fontSize="8.5"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {p.week}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between">
            <span className="text-slate-300">
              Trajectory: {weeklyTrend[weeklyTrend.length - 1].pct >= 90 ? 'Consistently in Safe distinction zone' : weeklyTrend[weeklyTrend.length - 1].pct >= 75 ? 'Caution: Maintaining above minimum threshold' : 'Critical: Downward slope entering detention'}
            </span>
            <span className="font-semibold text-indigo-400">Semester 2026</span>
          </div>
        </div>
      </div>

      {/* Chart C: Subject-wise Attendance Comparison (Bar Chart) - Full Width */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Subject-wise Attendance Comparison ({subjects.length} Enrolled Courses)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative attendance bars plotted against the 75% detention and 90% distinction lines.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <span className="w-2.5 h-0.5 bg-rose-500" /> 75% Detention Line
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2.5 h-0.5 bg-emerald-500" /> 90% Safe Target
            </span>
          </div>
        </div>

        {/* Bar comparison list */}
        <div className="space-y-3 pt-2">
          {subjects.map((sub) => {
            const sc = getStatusColor(sub.status);
            const isHovered = hoveredSubject === sub.subjectCode;

            return (
              <div
                key={sub.subjectCode}
                onMouseEnter={() => setHoveredSubject(sub.subjectCode)}
                onMouseLeave={() => setHoveredSubject(null)}
                className={`p-3 rounded-xl transition-all ${
                  isHovered ? 'bg-slate-900/90 border border-slate-700' : 'bg-slate-900/40 border border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px] border border-indigo-500/20 shrink-0">
                      {sub.subjectCode}
                    </span>
                    <span className="font-semibold text-slate-200 truncate" title={sub.subjectName}>
                      {sub.subjectName}
                    </span>
                    {sub.isLab && (
                      <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20 shrink-0">
                        Lab
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-slate-400">
                      {sub.attended}/{sub.conducted} classes
                    </span>
                    <span className={`font-black text-sm px-2 py-0.5 rounded ${sc.badge}`}>
                      {sub.percentage}%
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bar with 75% & 90% vertical lines */}
                <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  {/* Fill bar */}
                  <div
                    className={`h-full transition-all duration-700 ${
                      sub.status === 'SAFE'
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : sub.status === 'WARNING'
                        ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                        : 'bg-gradient-to-r from-rose-600 to-rose-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, sub.percentage))}%` }}
                  />

                  {/* 75% threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-400/90 z-10"
                    style={{ left: '75%' }}
                    title="75% Detention Threshold"
                  />

                  {/* 90% threshold marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-400/90 z-10"
                    style={{ left: '90%' }}
                    title="90% Target"
                  />
                </div>

                {/* Quick Subject Guidance Subtext */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span className="text-slate-400">
                    Faculty: <span className="text-slate-300">{sub.facultyName}</span>
                  </span>
                  <span>
                    {sub.status === 'SAFE' ? (
                      <span className="text-emerald-400 font-medium">
                        ✓ {sub.safeMissesTo75} safe misses remaining
                      </span>
                    ) : sub.status === 'WARNING' ? (
                      <span className="text-amber-400 font-medium">
                        ⚠ {sub.safeMissesTo75} misses to 75% • Needs {sub.requiredFor90} classes for 90%
                      </span>
                    ) : (
                      <span className="text-rose-400 font-bold">
                        ✕ DETENTION RISK: Must attend next {sub.requiredFor75} classes
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
