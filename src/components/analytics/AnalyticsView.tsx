import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  HelpCircle,
  PieChart as PieIcon,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSemesterForecast, getStatusColor } from '../../utils/attendanceCalculations';

export const AnalyticsView: React.FC = () => {
  const {
    subjects,
    currentTimetable,
    overallAttended,
    overallConducted,
    overallMissed,
    overallPercentage,
    overallStatus,
    simulatedDate,
  } = useApp();

  // Find best and lowest attendance subjects
  const sortedSubjects = [...subjects].sort((a, b) => b.percentage - a.percentage);
  const bestSubject = sortedSubjects[0];
  const lowestSubject = sortedSubjects[sortedSubjects.length - 1];

  // End semester forecast
  const remainingEstimate = Math.max(0, 180 - overallConducted);
  const forecast = calculateSemesterForecast(overallAttended, overallConducted, remainingEstimate);

  // Line chart data points (simulated weekly progression since 29 Aug 2026)
  const weeklyTrend = [
    { week: 'W1 (Aug 29)', pct: 95.0, attended: 19, conducted: 20 },
    { week: 'W2 (Sep 05)', pct: 92.5, attended: 37, conducted: 40 },
    { week: 'W3 (Sep 12)', pct: 86.6, attended: 52, conducted: 60 },
    { week: 'W4 (Sep 19)', pct: 81.2, attended: 65, conducted: 80 },
    { week: 'W5 (Current)', pct: overallPercentage, attended: overallAttended, conducted: overallConducted },
  ];

  // Calendar Heatmap generation: Dates between Aug 29 and Sep 28
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date('2026-08-29');
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Simulate attendance activity
    let status: 'FULL' | 'PARTIAL' | 'ABSENT' | 'WEEKEND' = 'WEEKEND';
    if (!isWeekend) {
      if (overallStatus === 'SAFE') {
        status = i % 11 === 0 ? 'PARTIAL' : 'FULL';
      } else if (overallStatus === 'WARNING') {
        status = i % 6 === 0 ? 'ABSENT' : i % 4 === 0 ? 'PARTIAL' : 'FULL';
      } else {
        status = i % 4 === 0 ? 'ABSENT' : i % 3 === 0 ? 'PARTIAL' : 'FULL';
      }
    }

    return {
      date: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      status,
    };
  });

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          Attendance Analytics & Insights
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Deep data analysis, historical trends, threshold comparisons, and calendar activity heatmap.
        </p>
      </div>

      {/* Analytics Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Best Subject */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Highest Attendance</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400">{bestSubject?.percentage}%</p>
          <p className="text-xs font-bold text-slate-200 truncate">{bestSubject?.subjectName}</p>
          <p className="text-[10px] text-slate-400">{bestSubject?.attended}/{bestSubject?.conducted} classes attended</p>
        </div>

        {/* Lowest Subject */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Lowest Attendance</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-black text-rose-400">{lowestSubject?.percentage}%</p>
          <p className="text-xs font-bold text-slate-200 truncate">{lowestSubject?.subjectName}</p>
          <p className="text-[10px] text-slate-400">Needs {lowestSubject?.requiredFor75} classes to hit 75%</p>
        </div>

        {/* Average Attendance */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Semester Average</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black text-white">{overallPercentage}%</p>
          <p className="text-xs font-bold text-slate-200">
            {overallStatus === 'SAFE' ? 'Safe Zone' : overallStatus === 'WARNING' ? 'Warning Zone' : 'Detention Risk'}
          </p>
          <p className="text-[10px] text-slate-400">{overallAttended} attended, {overallMissed} missed</p>
        </div>

        {/* Semester Forecast Expected */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Projected End-Semester</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-black text-indigo-400">{forecast.expectedCase}%</p>
          <p className="text-xs font-bold text-slate-200">Expected Pace</p>
          <p className="text-[10px] text-slate-400">Best case: {forecast.bestCase}%</p>
        </div>
      </div>

      {/* Two Column Charts: Trend Line & Pie/Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Semester Progression */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Attendance Trend Progression (Semester Weeks)
            </h3>
            <span className="text-xs text-slate-400">75% Threshold Line</span>
          </div>

          <div className="h-56 relative w-full pt-4">
            {/* SVG Line Chart */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180">
              {/* Background grid lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="40" y1="65" x2="480" y2="65" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />
              <line x1="40" y1="110" x2="480" y2="110" stroke="#334155" strokeDasharray="3 3" opacity="0.4" />

              {/* 75% Detention Threshold Line (Red) */}
              {/* y-coordinate for 75% where 100% is y=20, 50% is y=150 => 75% is y=72 */}
              <line x1="40" y1="75" x2="480" y2="75" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="485" y="79" fill="#f43f5e" fontSize="9" fontWeight="bold">75% Risk</text>

              {/* 90% Target Line (Green) */}
              <line x1="40" y1="40" x2="480" y2="40" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="485" y="44" fill="#10b981" fontSize="9" fontWeight="bold">90% Target</text>

              {/* Y Axis Labels */}
              <text x="25" y="24" fill="#94a3b8" fontSize="9" textAnchor="end">100%</text>
              <text x="25" y="79" fill="#94a3b8" fontSize="9" textAnchor="end">75%</text>
              <text x="25" y="154" fill="#94a3b8" fontSize="9" textAnchor="end">50%</text>

              {/* Data Line Path */}
              {(() => {
                const points = weeklyTrend.map((d, idx) => {
                  const x = 60 + idx * 95;
                  // Map pct (50 to 100) to y (150 to 20)
                  const y = 150 - ((d.pct - 50) / 50) * 130;
                  return `${x},${y}`;
                });

                return (
                  <>
                    {/* Area fill */}
                    <polygon
                      points={`60,160 ${points.join(' ')} ${60 + (weeklyTrend.length - 1) * 95},160`}
                      fill="url(#gradient-trend)"
                      opacity="0.2"
                    />

                    {/* Path */}
                    <polyline
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points.join(' ')}
                    />

                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient-trend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Dots and Labels */}
                    {weeklyTrend.map((d, idx) => {
                      const x = 60 + idx * 95;
                      const y = 150 - ((d.pct - 50) / 50) * 130;
                      return (
                        <g key={idx}>
                          <circle cx={x} cy={y} r="5" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2.5" />
                          <text x={x} y={y - 10} fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                            {d.pct}%
                          </text>
                          <text x={x} y={175} fill="#94a3b8" fontSize="9" textAnchor="middle">
                            {d.week.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Pie/Donut Chart: Attended vs Missed */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-400" />
            Class Distribution (Conducted Classes)
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-56">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="#1e293b"
                  strokeWidth="18"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="18"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallPercentage / 100)}`}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{overallPercentage}%</span>
                <span className="text-[10px] text-slate-400 font-semibold">Attended</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-300 font-medium">Classes Attended:</span>
                <span className="font-bold text-white ml-auto">{overallAttended}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-slate-300 font-medium">Classes Missed:</span>
                <span className="font-bold text-rose-400 ml-auto">{overallMissed}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-slate-600" />
                <span className="text-slate-300 font-medium">Total Conducted:</span>
                <span className="font-bold text-slate-300 ml-auto">{overallConducted}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                Attendance Status:{' '}
                <span className={`font-bold ${getStatusColor(overallStatus).text}`}>
                  {getStatusColor(overallStatus).label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart: Subject-wise Comparison against 75% & 90% */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Subject-wise Attendance vs Thresholds
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400 font-medium">
              <span className="w-2.5 h-0.5 bg-rose-500" /> 75% Detention Line
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2.5 h-0.5 bg-emerald-500" /> 90% Target Line
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {subjects.map((sub) => {
            const sc = getStatusColor(sub.status);
            return (
              <div key={sub.subjectCode} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-200">
                    <span className="text-indigo-400">{sub.subjectCode}</span> - {sub.subjectName}
                  </span>
                  <span className={sc.text}>{sub.percentage}%</span>
                </div>

                {/* Bar with 75% and 90% threshold indicators */}
                <div className="relative w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-700 ${
                      sub.status === 'SAFE'
                        ? 'bg-emerald-500'
                        : sub.status === 'WARNING'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                  {/* 75% vertical marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-400 z-10"
                    style={{ left: '75%' }}
                    title="75% Detention Threshold"
                  />
                  {/* 90% vertical marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10"
                    style={{ left: '90%' }}
                    title="90% Target"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Heatmap Activity Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Calendar Attendance Activity Heatmap (29 Aug 2026 – {simulatedDate})
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-800" /> Weekend
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {heatmapDays.map((item, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl border text-center transition-all ${
                item.status === 'FULL'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : item.status === 'PARTIAL'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : item.status === 'ABSENT'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-600'
              }`}
            >
              <p className="text-[10px] font-bold">{item.dayName}</p>
              <p className="text-xs font-black mt-0.5">{item.date.split('-')[2]}</p>
              <p className="text-[9px] capitalize opacity-80 mt-0.5">{item.status.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
