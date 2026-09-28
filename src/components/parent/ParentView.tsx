import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  MessageCircle,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  TrendingDown,
  User,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getStatusColor } from '../../utils/attendanceCalculations';

export const ParentView: React.FC = () => {
  const {
    activeStudent,
    currentTimetable,
    subjects,
    overallPercentage,
    overallStatus,
    overallAttended,
    overallConducted,
    overallSafeMisses75,
    overallRequired75,
    simulatedDate,
  } = useApp();

  const statusColors = getStatusColor(overallStatus);

  const [notificationType, setNotificationType] = useState<'LOW_ATTENDANCE' | 'DAILY_DIGEST' | 'RECOVERY_UPDATE'>('LOW_ATTENDANCE');
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Draft dynamic alert message based on student attendance
  const generateMessageText = () => {
    switch (notificationType) {
      case 'LOW_ATTENDANCE':
        return overallStatus === 'DETENTION_RISK'
          ? `[ATTENDAI URGENT ALERT] Dear ${activeStudent.parentName}, your ward ${activeStudent.name} (${activeStudent.registerNumber}, ${currentTimetable.displayName}) currently has ${overallPercentage}% attendance, which is below the mandatory 75% university detention threshold. Immediate recovery requires attending next ${overallRequired75} consecutive classes. Please consult college counseling.`
          : `[ATTENDAI ATTENDANCE NOTICE] Dear ${activeStudent.parentName}, your ward ${activeStudent.name}'s attendance is currently at ${overallPercentage}%. While currently above detention risk, they have only ${overallSafeMisses75} safe absences remaining.`;

      case 'DAILY_DIGEST':
        return `[ATTENDAI DAILY SUMMARY] Attendance Digest for ${activeStudent.name} on ${simulatedDate}: Overall attendance is ${overallPercentage}% (${overallAttended}/${overallConducted} classes). No unauthorized absence recorded today.`;

      case 'RECOVERY_UPDATE':
        return `[ATTENDAI RECOVERY PROGRESS] Dear ${activeStudent.parentName}, ${activeStudent.name} has begun their academic attendance recovery plan. Attendance is at ${overallPercentage}%. Expected milestone date to cross 75%: Mid-October 2026.`;
    }
  };

  const handleDispatch = () => {
    setDispatchStatus(`Simulating dispatch via ${channel} Gateway to ${activeStudent.parentPhone}...`);
    setTimeout(() => {
      setDispatchStatus(`✅ Message successfully dispatched to ${activeStudent.parentPhone} via ${channel} Service Gateway.`);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Parent Portal & Automated Guardian Alerts
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-semibold border border-purple-500/20">
            Guardian View
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time transparency for parents regarding academic attendance, detention alerts, and timetable compliance.
        </p>
      </div>

      {/* Student Profile & Attendance Overview */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white shadow-lg shadow-purple-500/20">
              {activeStudent.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{activeStudent.name}</h3>
              <p className="text-xs text-slate-400">
                Reg: <span className="text-slate-200 font-mono">{activeStudent.registerNumber}</span> • Section:{' '}
                <span className="text-indigo-400 font-semibold">{currentTimetable.displayName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendance Level</span>
              <p className="text-2xl font-black text-white">{overallPercentage}%</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${statusColors.badge}`}>
              {statusColors.label}
            </span>
          </div>
        </div>

        {/* Guardian Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500">Registered Guardian:</span>
            <p className="font-bold text-slate-200 mt-0.5">{activeStudent.parentName}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500">Guardian Phone:</span>
            <p className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              {activeStudent.parentPhone}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-500">Guardian Email:</span>
            <p className="font-bold text-slate-200 mt-0.5 truncate">{activeStudent.parentEmail || 'Not configured'}</p>
          </div>
        </div>

        {/* Risk Status Indicator */}
        {overallStatus === 'DETENTION_RISK' ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-300">
                CRITICAL DETENTION ALERT: Immediate Action Required
              </h4>
              <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">
                Your ward is currently below the mandatory 75% attendance threshold. In accordance with university regulations, students below 75% will not be permitted to take end-semester examinations unless approved under certified medical condonation.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300">
                Satisfactory Attendance Record
              </h4>
              <p className="text-xs text-emerald-300/90 mt-1">
                Your ward is maintaining regular attendance above the university detention line.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subject-Wise Report for Guardian */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-purple-400" />
          Academic Subject Attendance Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((sub) => {
            const sc = getStatusColor(sub.status);
            return (
              <div
                key={sub.subjectCode}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400">{sub.subjectCode}</span>
                    <h5 className="font-bold text-slate-200 line-clamp-1">{sub.subjectName}</h5>
                  </div>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${sc.badge}`}>
                    {sub.percentage}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Conducted: {sub.conducted}</span>
                  <span>Attended: <b className="text-emerald-400">{sub.attended}</b></span>
                  <span>Missed: <b className="text-rose-400">{sub.missed}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp & SMS Gateway Simulator */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200">
              Automated WhatsApp / SMS Notification Gateway
            </h3>
          </div>
          <span className="text-xs text-slate-400">Twilio / WhatsApp Business API Architecture</span>
        </div>

        <p className="text-xs text-slate-400">
          Select notification template and channel to preview and test live message dispatch:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Notification Trigger</label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="LOW_ATTENDANCE">Low Attendance / Detention Alert</option>
              <option value="DAILY_DIGEST">Daily Attendance Digest</option>
              <option value="RECOVERY_UPDATE">Attendance Recovery Progress Report</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Delivery Channel</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChannel('WHATSAPP')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  channel === 'WHATSAPP'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Alert
              </button>
              <button
                onClick={() => setChannel('SMS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                  channel === 'SMS'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                SMS Alert
              </button>
            </div>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Message Payload Preview:
            </span>
            <span className="font-mono text-[10px] text-indigo-400">To: {activeStudent.parentPhone}</span>
          </div>
          <p className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
            {generateMessageText()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-slate-500">
            * Integration uses cloud webhook layer to trigger external SMS/WhatsApp providers securely.
          </p>
          <button
            onClick={handleDispatch}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            Dispatch Notification
          </button>
        </div>

        {dispatchStatus && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 animate-in fade-in">
            {dispatchStatus}
          </div>
        )}
      </div>
    </div>
  );
};
