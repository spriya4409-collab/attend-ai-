import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Copy,
  GraduationCap,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRSession } from '../../types';

export const QRScannerView: React.FC = () => {
  const {
    activeStudent,
    currentTimetable,
    subjects,
    scanQRCode,
    generateQRSession,
    activeQRSessions,
    simulatedDate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'STUDENT_SCAN' | 'FACULTY_GEN'>('STUDENT_SCAN');
  const [manualToken, setManualToken] = useState('');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  // Faculty Generator State
  const [genSubjectCode, setGenSubjectCode] = useState(subjects[0]?.subjectCode || 'EC8501');
  const [genPeriod, setGenPeriod] = useState(1);
  const [latestSession, setLatestSession] = useState<QRSession | null>(null);

  const handleGenerate = () => {
    const session = generateQRSession(genSubjectCode, genPeriod);
    setLatestSession(session);
    setScanResult(null);
  };

  const handleScanToken = (token: string) => {
    const res = scanQRCode(token);
    setScanResult(res);
  };

  const simulateLiveProjectorScan = () => {
    // Generate a fresh session if none exists, or use the active one
    const sub = subjects[0];
    const session = latestSession || generateQRSession(sub.subjectCode, 1);
    setLatestSession(session);
    handleScanToken(session.token);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-indigo-400" />
            Dynamic QR Attendance System
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time classroom QR validation with anti-proxy token verification and duplicate scan protection.
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('STUDENT_SCAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'STUDENT_SCAN'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Student QR Scanner
          </button>
          <button
            onClick={() => setActiveTab('FACULTY_GEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'FACULTY_GEN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Faculty QR Generator
          </button>
        </div>
      </div>

      {activeTab === 'STUDENT_SCAN' ? (
        /* Student Scanner View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulated Camera Viewfinder */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Video className="w-4 h-4 text-indigo-400" />
                Live Camera Feed (Virtual Camera)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                Ready to Scan
              </span>
            </div>

            {/* Viewfinder box with animated scan line */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-slate-950 border-2 border-indigo-500/50 overflow-hidden flex items-center justify-center shadow-2xl">
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />

              {/* Laser animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-400" />

              <div className="p-4 space-y-2 opacity-60">
                <QrCode className="w-20 h-20 text-slate-600 mx-auto" />
                <p className="text-[11px] text-slate-400 font-medium">
                  Point camera at the faculty projector QR code
                </p>
              </div>
            </div>

            {/* Quick Demo Simulator Button */}
            <div className="w-full space-y-2">
              <button
                onClick={simulateLiveProjectorScan}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
              >
                <ScanLine className="w-4 h-4" />
                <span>Simulate Scan from Classroom Projector</span>
              </button>
              <p className="text-[11px] text-slate-500">
                Instant 1-click scan simulation for hackathon demonstration.
              </p>
            </div>
          </div>

          {/* Verification Status & Manual Token Input */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verification Status & Logs
              </h3>

              {scanResult ? (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    scanResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {scanResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span className="font-bold text-sm">
                      {scanResult.success ? 'Attendance Verified!' : 'Verification Failed'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{scanResult.message}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 text-center py-6">
                  No scan recorded yet. Point camera or press the simulation button above.
                </div>
              )}

              {/* Student Details being verified */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-400">
                  Student Verification Context:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Name:</span>
                    <p className="font-bold text-slate-200">{activeStudent.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Register No:</span>
                    <p className="font-bold text-slate-200">{activeStudent.registerNumber}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Section:</span>
                    <p className="font-bold text-indigo-400">{currentTimetable.displayName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">College ID:</span>
                    <p className="font-bold text-slate-200">{activeStudent.collegeId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manual Token Fallback */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Or Enter Classroom Session Token:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. ATTENDAI:EC8501:2026-09-28:P1:XYZ123"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleScanToken(manualToken)}
                  disabled={!manualToken.trim()}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold cursor-pointer transition-colors shrink-0"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Faculty QR Generator View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Generation Form */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              Faculty Attendance Session Dispatcher
            </h3>
            <p className="text-xs text-slate-400">
              Generate a time-limited QR code for your classroom screen in {currentTimetable.displayName}.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Subject</label>
              <select
                value={genSubjectCode}
                onChange={(e) => setGenSubjectCode(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.subjectCode} value={s.subjectCode}>
                    {s.subjectCode} - {s.subjectName} ({s.facultyName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Period Slot</label>
              <select
                value={genPeriod}
                onChange={(e) => setGenPeriod(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((p) => (
                  <option key={p} value={p}>
                    Period {p} (Timetable Slot)
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/30"
            >
              <Sparkles className="w-4 h-4" />
              Generate Classroom QR Code
            </button>
          </div>

          {/* Generated QR Display */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            {latestSession ? (
              <>
                <div className="p-4 bg-white rounded-2xl shadow-2xl">
                  {/* High visual QR placeholder */}
                  <div className="w-48 h-48 bg-slate-950 rounded-xl p-2 flex flex-col items-center justify-center text-slate-200 space-y-2">
                    <QrCode className="w-32 h-32 text-emerald-400" />
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[170px]">
                      {latestSession.token.split(':').slice(-2).join(':')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{latestSession.subjectName}</h4>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Period {latestSession.periodNumber} • Valid for 15 Minutes
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 break-all p-2 rounded-lg bg-slate-950 mt-2">
                    {latestSession.token}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12 space-y-2 text-slate-500 text-xs">
                <QrCode className="w-16 h-16 mx-auto opacity-40" />
                <p>Click "Generate Classroom QR Code" to project live session code.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
