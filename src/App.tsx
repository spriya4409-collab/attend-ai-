import React, { useState } from 'react';
import { AdminView } from './components/admin/AdminView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { AttendBotView } from './components/attendbot/AttendBotView';
import { RegisterModal } from './components/auth/RegisterModal';
import { CalculatorView } from './components/calculator/CalculatorView';
import { Header } from './components/common/Header';
import { Navigation, TabType } from './components/common/Navigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { DemoTourModal } from './components/demo/DemoTourModal';
import { ParentView } from './components/parent/ParentView';
import { QRScannerView } from './components/qr/QRScannerView';
import { RecoveryPlannerView } from './components/recovery/RecoveryPlannerView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { TimetableView } from './components/timetable/TimetableView';
import { AppProvider, useApp } from './context/AppContext';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<TabType>('DASHBOARD');
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { role } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />

        {/* Navigation Tabs (Desktop bar & Mobile bottom) */}
        <Navigation
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
        />

        {/* Active Tab Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 pt-5">
          {currentTab === 'DASHBOARD' && (
            <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'SUBJECTS' && <SubjectsView />}
          {currentTab === 'CALCULATOR' && <CalculatorView />}
          {currentTab === 'RECOVERY' && <RecoveryPlannerView />}
          {currentTab === 'TIMETABLE' && <TimetableView />}
          {currentTab === 'ANALYTICS' && <AnalyticsView />}
          {currentTab === 'ATTENDBOT' && <AttendBotView />}
          {currentTab === 'QR_SCANNER' && <QRScannerView />}
          {currentTab === 'PARENT' && <ParentView />}
          {currentTab === 'ADMIN' && <AdminView />}
          {currentTab === 'ARCHITECTURE' && <ArchitectureView />}
        </main>
      </div>

      {/* Presentation Tour Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onNavigateTab={(tab) => setCurrentTab(tab)}
      />

      {/* Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
