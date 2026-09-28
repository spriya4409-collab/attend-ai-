import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_STUDENTS, generateInitialSubjectAttendance, INITIAL_ALERTS } from '../data/mockStudents';
import { TIMETABLE_DATASET } from '../data/timetables';
import {
  ClassSectionTimetable,
  DayOfWeek,
  QRSession,
  RiskStatus,
  SmartAlert,
  StudentProfile,
  SubjectAttendance,
  UserRole,
} from '../types';
import {
  calculateAttendancePercentage,
  calculateRequiredClasses,
  calculateSafeMisses,
  getDayOfWeekName,
  getRiskStatus,
} from '../utils/attendanceCalculations';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeStudent: StudentProfile;
  studentsList: StudentProfile[];
  allTimetables: Record<string, ClassSectionTimetable>;
  currentTimetable: ClassSectionTimetable;
  subjects: SubjectAttendance[];
  overallAttended: number;
  overallConducted: number;
  overallMissed: number;
  overallPercentage: number;
  overallStatus: RiskStatus;
  overallSafeMisses75: number;
  overallSafeMisses90: number;
  overallRequired75: number;
  overallRequired90: number;
  alerts: SmartAlert[];
  unreadAlertCount: number;
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  addAlert: (alert: Omit<SmartAlert, 'id' | 'read' | 'timestamp'>) => void;
  activeQRSessions: QRSession[];
  generateQRSession: (subjectCode: string, periodNumber: number) => QRSession;
  scanQRCode: (token: string) => { success: boolean; message: string };
  switchStudent: (studentId: string) => void;
  changeSection: (sectionId: string) => void;
  registerStudent: (newStudent: Omit<StudentProfile, 'id' | 'createdAt'>) => void;
  updateSubjectData: (subjectCode: string, attended: number, conducted: number) => void;
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  simulatedDay: DayOfWeek;
  simulatedTomorrowDay: DayOfWeek;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  updateTimetableSchedule: (sectionId: string, updatedTimetable: ClassSectionTimetable) => void;
  isRegistered: boolean;
  setIsRegistered: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Semester Schedule Notice (Aug - Nov 2026)',
    content: 'Regular classes commenced on 29 August 2026. The 75% attendance threshold is strictly enforced per university regulations.',
    author: 'Dean of Academic Affairs',
    date: '2026-08-29',
    priority: 'HIGH',
  },
  {
    id: 'ann-2',
    title: 'Continuous Assessment Test - 1 Schedule',
    content: 'CAT-1 examinations for all II, III, and IV year ECE/BME sections commence in mid-October. Check timetable portal for lab dates.',
    author: 'Controller of Examinations',
    date: '2026-09-15',
    priority: 'NORMAL',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [studentsList, setStudentsList] = useState<StudentProfile[]>(DEMO_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>(DEMO_STUDENTS[0].id);
  const [allTimetables, setAllTimetables] = useState<Record<string, ClassSectionTimetable>>(TIMETABLE_DATASET);
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-09-28'); // Monday
  const [alerts, setAlerts] = useState<SmartAlert[]>(INITIAL_ALERTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [activeQRSessions, setActiveQRSessions] = useState<QRSession[]>([]);
  const [scannedTokens, setScannedTokens] = useState<Set<string>>(new Set());
  const [isRegistered, setIsRegistered] = useState<boolean>(true);

  const activeStudent = studentsList.find(s => s.id === activeStudentId) || studentsList[0];
  const currentTimetable = allTimetables[activeStudent.sectionId] || allTimetables['III_ECE_A'];

  // Attendance storage per student
  const [studentSubjectStore, setStudentSubjectStore] = useState<Record<string, SubjectAttendance[]>>(() => {
    const store: Record<string, SubjectAttendance[]> = {};
    // Student 1: Warning (76.2%)
    store['student-1'] = generateInitialSubjectAttendance('III_ECE_A', 'WARNING');
    // Student 2: Safe (92.4%)
    store['student-2'] = generateInitialSubjectAttendance('IV_ECE_B', 'SAFE');
    // Student 3: Detention Risk (71.8%)
    store['student-3'] = generateInitialSubjectAttendance('II_BME', 'DETENTION_RISK');
    // Student 4: Safe / Borderline (88.5%)
    store['student-4'] = generateInitialSubjectAttendance('III_ECE_DS', 'WARNING');
    // Student 5: Safe First Year (94.1%)
    store['student-5'] = generateInitialSubjectAttendance('I_YEAR_SEEE', 'SAFE');
    return store;
  });

  const subjects = studentSubjectStore[activeStudent.id] || generateInitialSubjectAttendance(activeStudent.sectionId, 'WARNING');

  // Overall attendance calculations
  const overallConducted = subjects.reduce((sum, s) => sum + s.conducted, 0);
  const overallAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
  const overallMissed = overallConducted - overallAttended;
  const overallPercentage = Number(calculateAttendancePercentage(overallAttended, overallConducted).toFixed(1));
  const overallStatus = getRiskStatus(overallPercentage);
  const overallSafeMisses75 = calculateSafeMisses(overallAttended, overallConducted, 75);
  const overallSafeMisses90 = calculateSafeMisses(overallAttended, overallConducted, 90);
  const overallRequired75 = calculateRequiredClasses(overallAttended, overallConducted, 75);
  const overallRequired90 = calculateRequiredClasses(overallAttended, overallConducted, 90);

  // Derive day of week for simulated date
  const currentDateObj = new Date(simulatedDate);
  const simulatedDay = getDayOfWeekName(currentDateObj) || 'Monday';

  const tomorrowDateObj = new Date(simulatedDate);
  tomorrowDateObj.setDate(tomorrowDateObj.getDate() + 1);
  const simulatedTomorrowDay = getDayOfWeekName(tomorrowDateObj) || 'Tuesday';

  const unreadAlertCount = alerts.filter(a => !a.read).length;

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
  };

  const clearAlerts = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const addAlert = (newAlert: Omit<SmartAlert, 'id' | 'read' | 'timestamp'>) => {
    const alert: SmartAlert = {
      ...newAlert,
      id: `alert-${Date.now()}`,
      read: false,
      timestamp: 'Just now',
    };
    setAlerts(prev => [alert, ...prev]);
  };

  const switchStudent = (studentId: string) => {
    const found = studentsList.find(s => s.id === studentId);
    if (found) {
      setActiveStudentId(found.id);
    }
  };

  const changeSection = (sectionId: string) => {
    if (!allTimetables[sectionId]) return;
    setStudentsList(prev =>
      prev.map(s => (s.id === activeStudent.id ? { ...s, sectionId } : s))
    );
    if (!studentSubjectStore[activeStudent.id]) {
      setStudentSubjectStore(prev => ({
        ...prev,
        [activeStudent.id]: generateInitialSubjectAttendance(sectionId, 'WARNING'),
      }));
    }
  };

  const registerStudent = (newStudentData: Omit<StudentProfile, 'id' | 'createdAt'>) => {
    const newId = `student-${Date.now()}`;
    const newProfile: StudentProfile = {
      ...newStudentData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setStudentsList(prev => [...prev, newProfile]);
    setStudentSubjectStore(prev => ({
      ...prev,
      [newId]: generateInitialSubjectAttendance(newProfile.sectionId, 'SAFE'),
    }));
    setActiveStudentId(newId);
  };

  const updateSubjectData = (subjectCode: string, attended: number, conducted: number) => {
    setStudentSubjectStore(prev => {
      const currentList = prev[activeStudent.id] || [];
      const updated = currentList.map(s => {
        if (s.subjectCode === subjectCode) {
          const missed = conducted - attended;
          const percentage = Number(calculateAttendancePercentage(attended, conducted).toFixed(1));
          return {
            ...s,
            conducted,
            attended,
            missed,
            percentage,
            status: getRiskStatus(percentage),
            safeMissesTo90: calculateSafeMisses(attended, conducted, 90),
            safeMissesTo75: calculateSafeMisses(attended, conducted, 75),
            requiredFor75: calculateRequiredClasses(attended, conducted, 75),
            requiredFor90: calculateRequiredClasses(attended, conducted, 90),
          };
        }
        return s;
      });
      return { ...prev, [activeStudent.id]: updated };
    });
  };

  // QR Attendance Generation & Scanning
  const generateQRSession = (subjectCode: string, periodNumber: number): QRSession => {
    const sub = currentTimetable.subjects.find(s => s.code === subjectCode) || currentTimetable.subjects[0];
    const session: QRSession = {
      sessionId: `qr-${Date.now()}`,
      subjectCode: sub.code,
      subjectName: sub.name,
      sectionId: activeStudent.sectionId,
      periodNumber,
      date: simulatedDate,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 mins validity
      generatedBy: 'Faculty Coordinator',
      token: `ATTENDAI:${sub.code}:${simulatedDate}:P${periodNumber}:${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    };

    setActiveQRSessions(prev => [session, ...prev]);
    return session;
  };

  const scanQRCode = (token: string): { success: boolean; message: string } => {
    if (!token || !token.startsWith('ATTENDAI:')) {
      return { success: false, message: 'Invalid AttendAI QR Code token format.' };
    }

    if (scannedTokens.has(token)) {
      return { success: false, message: 'Duplicate Scan Detected! This QR code has already been scanned by you.' };
    }

    const parts = token.split(':');
    const subjectCode = parts[1];
    const periodStr = parts[3];

    // Find subject in current student's list
    const matched = subjects.find(s => s.subjectCode === subjectCode);
    if (!matched) {
      return {
        success: false,
        message: `Subject ${subjectCode} does not belong to your section timetable (${activeStudent.sectionId}).`,
      };
    }

    // Mark attended
    updateSubjectData(subjectCode, matched.attended + 1, matched.conducted + 1);
    setScannedTokens(prev => new Set(prev).add(token));

    addAlert({
      studentId: activeStudent.id,
      title: 'QR Attendance Verified',
      message: `Successfully verified attendance for ${matched.subjectName} (${periodStr}).`,
      type: 'SUCCESS',
    });

    return {
      success: true,
      message: `Verified! Attendance recorded for ${matched.subjectName} (${subjectCode}).`,
    };
  };

  const addAnnouncement = (newAnn: Omit<Announcement, 'id' | 'date'>) => {
    const item: Announcement = {
      ...newAnn,
      id: `ann-${Date.now()}`,
      date: simulatedDate,
    };
    setAnnouncements(prev => [item, ...prev]);
  };

  const updateTimetableSchedule = (sectionId: string, updatedTimetable: ClassSectionTimetable) => {
    setAllTimetables(prev => ({
      ...prev,
      [sectionId]: updatedTimetable,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeStudent,
        studentsList,
        allTimetables,
        currentTimetable,
        subjects,
        overallAttended,
        overallConducted,
        overallMissed,
        overallPercentage,
        overallStatus,
        overallSafeMisses75,
        overallSafeMisses90,
        overallRequired75,
        overallRequired90,
        alerts,
        unreadAlertCount,
        markAlertRead,
        clearAlerts,
        addAlert,
        activeQRSessions,
        generateQRSession,
        scanQRCode,
        switchStudent,
        changeSection,
        registerStudent,
        updateSubjectData,
        simulatedDate,
        setSimulatedDate,
        simulatedDay,
        simulatedTomorrowDay,
        announcements,
        addAnnouncement,
        updateTimetableSchedule,
        isRegistered,
        setIsRegistered,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
