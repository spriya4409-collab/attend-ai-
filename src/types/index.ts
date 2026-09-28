export type RiskStatus = 'SAFE' | 'WARNING' | 'DETENTION_RISK';

export type UserRole = 'STUDENT' | 'PARENT' | 'ADMIN';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface PeriodSlot {
  periodNumber: number; // 1 to 7
  startTime: string; // e.g. "08:45 AM"
  endTime: string; // e.g. "09:40 AM"
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  roomNo: string;
  isLab?: boolean;
  labBatch?: string;
}

export interface DaySchedule {
  day: DayOfWeek;
  periods: PeriodSlot[];
}

export interface ClassSectionTimetable {
  sectionId: string; // e.g. "IV_ECE_B"
  department: string; // "ECE" | "BME" | "SEEE"
  year: 'I' | 'II' | 'III' | 'IV';
  section: string; // "A" | "B" | "DS" | "DS A" | "DS B" | "SEEE"
  displayName: string; // "IV ECE B"
  academicYear: string; // "2026-2027"
  semester: number; // 1 to 8
  semesterStartDate: string; // "2026-08-29"
  semesterEndDate: string; // "2026-11-29"
  schedule: DaySchedule[];
  subjects: {
    code: string;
    name: string;
    credits: number;
    faculty: string;
    isLab?: boolean;
  }[];
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  conducted: number;
  attended: number;
  missed: number;
  percentage: number;
  safeMissesTo90: number;
  safeMissesTo75: number;
  requiredFor75: number;
  requiredFor90: number;
  status: RiskStatus;
  isLab?: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectCode: string;
  date: string; // YYYY-MM-DD
  day: DayOfWeek;
  periodNumber: number;
  status: 'PRESENT' | 'ABSENT' | 'ON_DUTY' | 'MEDICAL_LEAVE';
  timestamp: string;
  source: 'QR_SCAN' | 'FACULTY_PORTAL' | 'MANUAL';
}

export interface StudentProfile {
  id: string;
  name: string;
  registerNumber: string;
  collegeId: string;
  department: string;
  year: 'I' | 'II' | 'III' | 'IV';
  section: string;
  sectionId: string; // Links to ClassSectionTimetable.sectionId
  email: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  avatarUrl?: string;
  targetPercentage: number; // e.g. 75, 85, 90
  createdAt: string;
}

export interface SmartAlert {
  id: string;
  studentId: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface QRSession {
  sessionId: string;
  subjectCode: string;
  subjectName: string;
  sectionId: string;
  periodNumber: number;
  date: string;
  expiresAt: number; // unix timestamp ms
  generatedBy: string;
  token: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'attendbot';
  text: string;
  timestamp: string;
  insights?: {
    attendanceChange?: number;
    projectedPercentage?: number;
    riskStatus?: RiskStatus;
    actionableAdvice?: string;
  };
}

export interface RecoveryPlan {
  subjectCode?: string;
  targetPercentage: number;
  currentPercentage: number;
  classesRequired: number;
  projectedDate: string | null;
  totalConductedAfterRecovery: number;
  totalAttendedAfterRecovery: number;
  timetableMilestones: {
    date: string;
    day: DayOfWeek;
    periodNumber: number;
    subjectName: string;
    cumulativeAttendance: number;
  }[];
}
