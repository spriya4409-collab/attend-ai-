import {
  AlertCircle,
  Camera,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVAILABLE_SECTIONS } from '../../data/timetables';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const { studentsList, registerStudent } = useApp();

  const [name, setName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [department, setDepartment] = useState('ECE');
  const [year, setYear] = useState<'I' | 'II' | 'III' | 'IV'>('III');
  const [section, setSection] = useState('A');
  const [sectionId, setSectionId] = useState('III_ECE_A');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idCardUploaded, setIdCardUploaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSectionChange = (newSecId: string) => {
    setSectionId(newSecId);
    const secObj = AVAILABLE_SECTIONS.find(s => s.id === newSecId);
    if (secObj) {
      setDepartment(secObj.dept);
      setYear(secObj.year as any);
      setSection(secObj.sec);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Duplicate Register Number validation
    const duplicate = studentsList.find(s => s.registerNumber.trim() === registerNumber.trim());
    if (duplicate) {
      setErrorMessage(`Register number ${registerNumber} already exists! Duplicate register numbers are strictly prohibited.`);
      return;
    }

    if (!name.trim() || !registerNumber.trim() || !email.trim() || !parentPhone.trim()) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (!idCardUploaded) {
      setErrorMessage('Please upload and verify your College ID card to complete registration.');
      return;
    }

    registerStudent({
      name,
      registerNumber,
      collegeId: collegeId || `ID-${registerNumber.slice(-4)}`,
      department,
      year,
      section,
      sectionId,
      email,
      parentName: parentName || 'Guardian',
      parentPhone: parentPhone || '+91 98000 00000',
      targetPercentage: 85,
    });

    setSuccessMessage(`Registration successful! Linked to ${sectionId.replace(/_/g, ' ')} timetable.`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Student Registration & ID Verification</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Arun Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Register Number * (Must be Unique)</label>
              <input
                type="text"
                placeholder="e.g. 310623106099"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">College ID Number</label>
              <input
                type="text"
                placeholder="e.g. ECE23-099"
                value={collegeId}
                onChange={(e) => setCollegeId(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Class Section & Timetable *</label>
              <select
                value={sectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none cursor-pointer"
              >
                {AVAILABLE_SECTIONS.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.label} ({sec.dept})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Student College Email *</label>
              <input
                type="email"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Parent / Guardian Name</label>
              <input
                type="text"
                placeholder="e.g. S. Narayanan"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Parent WhatsApp/Phone *</label>
              <input
                type="text"
                placeholder="+91 98400 12345"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* College ID Card Verification Step */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              College ID Card Verification Step
            </span>
            <p className="text-[11px] text-slate-400">
              Upload physical college ID card or take a snapshot for automated OCR verification:
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIdCardUploaded(true)}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  idCardUploaded
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {idCardUploaded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ID Verified (Match 99.8%)
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Simulate ID Card Scan / Upload
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-indigo-600/30"
            >
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
