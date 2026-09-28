import {
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Database,
  Edit2,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Plus,
  QrCode,
  Save,
  Search,
  Send,
  Shield,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVAILABLE_SECTIONS } from '../../data/timetables';
import { ClassSectionTimetable, DayOfWeek } from '../../types';
import { getStatusColor } from '../../utils/attendanceCalculations';

export const AdminView: React.FC = () => {
  const {
    studentsList,
    allTimetables,
    updateTimetableSchedule,
    announcements,
    addAnnouncement,
    switchStudent,
    changeSection,
    addAlert,
    simulatedDate,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'STUDENTS' | 'TIMETABLES' | 'UPLOAD_PARSER' | 'ANNOUNCEMENTS'>('STUDENTS');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('IV_ECE_B');
  const [editingTimetable, setEditingTimetable] = useState<ClassSectionTimetable>(allTimetables['IV_ECE_B']);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [annSuccess, setAnnSuccess] = useState(false);

  // Timetable Parser Simulator
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedDataPreview, setParsedDataPreview] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleSectionSelect = (secId: string) => {
    setSelectedSectionId(secId);
    setEditingTimetable(allTimetables[secId]);
  };

  const handleSaveTimetable = () => {
    updateTimetableSchedule(selectedSectionId, editingTimetable);
    alert(`Timetable for ${editingTimetable.displayName} successfully saved and updated across all student profiles.`);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      author: 'Academic Administration',
      priority: annPriority,
    });

    // Also push a smart alert to students
    addAlert({
      studentId: 'all',
      title: annTitle,
      message: annContent,
      type: annPriority === 'URGENT' ? 'CRITICAL' : annPriority === 'HIGH' ? 'WARNING' : 'INFO',
    });

    setAnnTitle('');
    setAnnContent('');
    setAnnSuccess(true);
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsing(true);

    // Simulate OCR & AI structural parsing
    setTimeout(() => {
      setIsParsing(false);
      setParsedDataPreview(
        JSON.stringify(
          {
            parsedFile: file.name,
            extractedSection: 'IV ECE B',
            semester: '7',
            academicYear: '2026-2027',
            status: 'VERIFIED_ACCURATE',
            periodsExtracted: 35,
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            subjectsIdentified: [
              'EC8701 Antennas and Microwave Engineering',
              'EC8702 Optical Communication',
              'EC8791 Embedded and Real Time Systems',
              'EC8751 Optical and Microwave Lab',
              'EC8711 Embedded Systems Laboratory',
              'OIT751 Data Science Fundamentals',
            ],
            confidenceScore: 0.994,
          },
          null,
          2
        )
      );
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            Admin & Department Operations Panel
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Student roster oversight, canonical timetable management, PDF ingestion, and institute broadcasts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveAdminTab('STUDENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeAdminTab === 'STUDENTS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Students Roster ({studentsList.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('TIMETABLES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeAdminTab === 'TIMETABLES' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Timetables (10 Sections)
          </button>
          <button
            onClick={() => setActiveAdminTab('UPLOAD_PARSER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeAdminTab === 'UPLOAD_PARSER' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload & OCR Ingestion
          </button>
          <button
            onClick={() => setActiveAdminTab('ANNOUNCEMENTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeAdminTab === 'ANNOUNCEMENTS' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Broadcasts
          </button>
        </div>
      </div>

      {activeAdminTab === 'STUDENTS' && (
        /* Students Management Roster */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Registered Students Directory
            </h3>
            <span className="text-xs text-slate-400">
              Unique Register Number enforcement active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Register No</th>
                  <th className="p-3">College ID</th>
                  <th className="p-3">Department & Section</th>
                  <th className="p-3">Parent Contact</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {studentsList.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40">
                    <td className="p-3">
                      <p className="font-bold text-white">{st.name}</p>
                      <p className="text-[10px] text-slate-500">{st.email}</p>
                    </td>
                    <td className="p-3 font-mono text-indigo-300">{st.registerNumber}</td>
                    <td className="p-3 text-slate-400">{st.collegeId}</td>
                    <td className="p-3 font-semibold text-slate-200">
                      {st.department} Year {st.year} - {st.section}
                    </td>
                    <td className="p-3 text-slate-400">
                      {st.parentName} ({st.parentPhone})
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => switchStudent(st.id)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold cursor-pointer"
                      >
                        Inspect Student
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'TIMETABLES' && (
        /* Timetable Management & Editor */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                Select Section Timetable to Inspect / Modify
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All 10 canonical sections from uploaded timetable dataset.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSectionId}
                onChange={(e) => handleSectionSelect(e.target.value)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-indigo-300 focus:outline-none cursor-pointer"
              >
                {AVAILABLE_SECTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.label} ({sec.dept})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveTimetable}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/30"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Section Metadata Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500">Section:</span>
              <p className="font-bold text-slate-200 mt-0.5">{editingTimetable.displayName}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500">Semester:</span>
              <p className="font-bold text-slate-200 mt-0.5">Semester {editingTimetable.semester}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500">Subjects Count:</span>
              <p className="font-bold text-emerald-400 mt-0.5">{editingTimetable.subjects.length} Subjects</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-500">Semester Duration:</span>
              <p className="font-bold text-indigo-400 mt-0.5">{editingTimetable.semesterStartDate} to {editingTimetable.semesterEndDate}</p>
            </div>
          </div>

          {/* Subjects List for this Section */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Registered Subjects & Faculty:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {editingTimetable.subjects.map((sub) => (
                <div key={sub.code} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-indigo-400">{sub.code}</span>
                    <span className="text-[10px] text-slate-500">{sub.credits} Credits</span>
                  </div>
                  <p className="font-semibold text-slate-200 mt-0.5">{sub.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{sub.faculty}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAdminTab === 'UPLOAD_PARSER' && (
        /* Timetable PDF / Image Upload & Parser */
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Upload & Ingest Timetable Files (PDF / Image OCR)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports IV ECE B, IV ECE A, III ECE DS, II ECE DS B, III BME, III ECE A, III ECE B, II ECE DS A, II BME, I Year / SEEE files.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-3xl p-8 text-center space-y-3 bg-slate-950/40 transition-colors">
            <Upload className="w-12 h-12 text-slate-500 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-200">
                Click to browse or drop timetable PDF / Image
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PDF, JPG, PNG scanned timetables accepted. Vision model accurately preserves subject names and periods.
              </p>
            </div>

            <input
              type="file"
              accept=".pdf,image/*"
              onChange={handleSimulateUpload}
              className="hidden"
              id="timetable-file-input"
            />
            <label
              htmlFor="timetable-file-input"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-emerald-600/30"
            >
              Select Timetable Document
            </label>
          </div>

          {isParsing && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs text-slate-300">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <p className="font-semibold text-white">Analyzing Timetable Document...</p>
                <p className="text-slate-400">Extracting days, periods, room allocations, and faculty designations.</p>
              </div>
            </div>
          )}

          {parsedDataPreview && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Ingestion & Validation Result:
                </span>
                <span className="text-slate-400">{uploadedFileName}</span>
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto max-h-64">
                {parsedDataPreview}
              </pre>
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'ANNOUNCEMENTS' && (
        /* Broadcast Announcements Manager */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handlePostAnnouncement} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Broadcast Notification to Students & Parents
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. CAT-1 Examination Attendance Condonation Deadline"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Priority Level</label>
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as any)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="NORMAL">Normal Notice</option>
                <option value="HIGH">High Priority (Exam / Test)</option>
                <option value="URGENT">Urgent (Detention Threshold Deadline)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Message Content</label>
              <textarea
                rows={4}
                placeholder="Details of the announcement..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast to All Sections
            </button>

            {annSuccess && (
              <p className="text-xs text-emerald-400 font-medium text-center">
                ✅ Announcement published and synced with Smart Alerts!
              </p>
            )}
          </form>

          {/* Announcements Log */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Active Campus Broadcasts</h3>
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{ann.title}</span>
                    <span className="text-[10px] text-slate-500">{ann.date}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{ann.content}</p>
                  <p className="text-[10px] text-indigo-400 font-semibold pt-1">
                    Issued by: {ann.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
