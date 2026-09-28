import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Calculator,
  Calendar,
  CheckCircle2,
  Compass,
  GraduationCap,
  LayoutDashboard,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TabType } from '../common/Navigation';

interface DemoTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const { switchStudent, changeSection, currentTimetable } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '1. Welcome to AttendAI & The Problem',
      icon: Sparkles,
      desc: 'College students often know how many classes they attended and missed, but cannot answer: "How many can I safely skip?", "Am I entering detention?", and "How many classes do I need to recover?". AttendAI solves this with real timetable integration.',
      actionLabel: 'Go to Dashboard',
      tab: 'DASHBOARD' as TabType,
      runAction: () => {
        switchStudent('student-1'); // Arun K (Warning 76.2%)
      },
    },
    {
      title: '2. Section & Timetable Association',
      icon: Calendar,
      desc: 'The app dynamically binds the student to their section timetable from the primary dataset (e.g. III ECE A, IV ECE B, III ECE DS, II BME, I Year SEEE). Notice that periods, timings (8:45 AM - 4:05 PM), faculty, and rooms are canonical.',
      actionLabel: 'Inspect Timetable',
      tab: 'TIMETABLE' as TabType,
      runAction: () => {
        changeSection('III_ECE_A');
      },
    },
    {
      title: '3. Subject Attendance & Safe Skips',
      icon: GraduationCap,
      desc: 'Every subject card calculates both Safe Misses before 75% detention and Safe Misses before 90% distinction using rigorous mathematics: M = ⌊ (A / T) - C ⌋.',
      actionLabel: 'View Subject Directory',
      tab: 'SUBJECTS' as TabType,
      runAction: () => {},
    },
    {
      title: '4. Skip Class Predictor (Grounded in Tomorrow)',
      icon: Calculator,
      desc: 'The Skip Class Predictor cross-references tomorrow\'s actual timetable. If a student wants to skip a period, it verifies whether the class actually occurs and warns if detention threshold will be breached.',
      actionLabel: 'Open Skip Predictor',
      tab: 'CALCULATOR' as TabType,
      runAction: () => {},
    },
    {
      title: '5. Recovery Planner & Forward Calendar Dates',
      icon: Target,
      desc: 'Calculates the consecutive classes needed: R = ⌈ (T·C - 100·A)/(100 - T) ⌉, then steps day-by-day forward through the timetable schedule to project the exact calendar milestone date of recovery!',
      actionLabel: 'Launch Recovery Planner',
      tab: 'RECOVERY' as TabType,
      runAction: () => {},
    },
    {
      title: '6. AttendBot AI Copilot',
      icon: Bot,
      desc: 'AttendBot understands the student\'s attendance, tomorrow\'s periods, and remaining semester classes. It never hallucinates nonexistent classes.',
      actionLabel: 'Chat with AttendBot',
      tab: 'ATTENDBOT' as TabType,
      runAction: () => {},
    },
    {
      title: '7. Guardian Transparency & Parent Portal',
      icon: Users,
      desc: 'Dedicated parent view with simulated WhatsApp and SMS gateway dispatch, informing parents of attendance status and detention mitigation plans.',
      actionLabel: 'Open Parent Portal',
      tab: 'PARENT' as TabType,
      runAction: () => {},
    },
    {
      title: '8. Admin Oversight & Architecture Export',
      icon: Shield,
      desc: 'Full administrative panel with roster management, timetable editor, OCR ingestion, plus complete exportable Flutter and Firebase code specifications for evaluation.',
      actionLabel: 'Inspect Architecture',
      tab: 'ARCHITECTURE' as TabType,
      runAction: () => {},
    },
  ];

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  const handleStepAction = () => {
    step.runAction();
    onNavigateTab(step.tab);
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/20">
              {currentStep + 1}/{tourSteps.length}
            </span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Hackathon Judge Demonstration Walkthrough
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400">
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{step.title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5">
          {tourSteps.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Previous
          </button>

          <button
            onClick={handleStepAction}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>{step.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
