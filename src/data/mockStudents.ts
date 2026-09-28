import { SmartAlert, StudentProfile, SubjectAttendance } from '../types';
import { calculateAttendancePercentage, calculateRequiredClasses, calculateSafeMisses, getRiskStatus } from '../utils/attendanceCalculations';
import { TIMETABLE_DATASET } from './timetables';

export const DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'student-1',
    name: 'Arun Kumar S.',
    registerNumber: '310623106012',
    collegeId: 'ECE23-012',
    department: 'ECE',
    year: 'III',
    section: 'A',
    sectionId: 'III_ECE_A',
    email: 'arun.k@college.edu',
    parentName: 'Sundaram K.',
    parentPhone: '+91 98401 23456',
    parentEmail: 'sundaram.k@gmail.com',
    targetPercentage: 85,
    createdAt: '2026-08-29',
  },
  {
    id: 'student-2',
    name: 'Priya Sundaram',
    registerNumber: '310622106088',
    collegeId: 'ECE22-088',
    department: 'ECE',
    year: 'IV',
    section: 'B',
    sectionId: 'IV_ECE_B',
    email: 'priya.s@college.edu',
    parentName: 'Sundaram Narayanan',
    parentPhone: '+91 94440 98765',
    parentEmail: 'sundaram.n@yahoo.com',
    targetPercentage: 90,
    createdAt: '2026-08-29',
  },
  {
    id: 'student-3',
    name: 'Karthik Raja',
    registerNumber: '310624121045',
    collegeId: 'BME24-045',
    department: 'BME',
    year: 'II',
    section: 'A',
    sectionId: 'II_BME',
    email: 'karthik.r@college.edu',
    parentName: 'Rajendran M.',
    parentPhone: '+91 98842 11223',
    parentEmail: 'rajendran.m@outlook.com',
    targetPercentage: 75,
    createdAt: '2026-08-29',
  },
  {
    id: 'student-4',
    name: 'Sneha Mohan',
    registerNumber: '310623106095',
    collegeId: 'ECEDS23-095',
    department: 'ECE',
    year: 'III',
    section: 'DS',
    sectionId: 'III_ECE_DS',
    email: 'sneha.m@college.edu',
    parentName: 'Mohan Kumar',
    parentPhone: '+91 97103 44556',
    parentEmail: 'mohan.kumar@gmail.com',
    targetPercentage: 90,
    createdAt: '2026-08-29',
  },
  {
    id: 'student-5',
    name: 'Rahul Varma',
    registerNumber: '310625105034',
    collegeId: 'SEEE25-034',
    department: 'SEEE',
    year: 'I',
    section: 'SEEE',
    sectionId: 'I_YEAR_SEEE',
    email: 'rahul.v@college.edu',
    parentName: 'Varma Narayanan',
    parentPhone: '+91 98410 55667',
    parentEmail: 'varma.n@gmail.com',
    targetPercentage: 90,
    createdAt: '2026-08-29',
  },
];

// Helper to generate subject attendance based on timetable subjects
export function generateInitialSubjectAttendance(
  sectionId: string,
  profileBias: 'SAFE' | 'WARNING' | 'DETENTION_RISK'
): SubjectAttendance[] {
  const timetable = TIMETABLE_DATASET[sectionId] || TIMETABLE_DATASET['III_ECE_A'];

  return timetable.subjects.map((sub, index) => {
    let conducted = 28 + (index % 4) * 3;
    let attended = 0;

    if (profileBias === 'SAFE') {
      // 90% - 95%
      attended = Math.max(1, conducted - Math.floor(Math.random() * 2));
    } else if (profileBias === 'WARNING') {
      // 76% - 84%
      const missCount = Math.floor(conducted * (0.17 + (index % 3) * 0.04));
      attended = Math.max(1, conducted - missCount);
    } else {
      // DETENTION RISK: 68% - 74%
      const missCount = Math.floor(conducted * (0.28 + (index % 2) * 0.05));
      attended = Math.max(1, conducted - missCount);
    }

    const missed = conducted - attended;
    const percentage = Number(calculateAttendancePercentage(attended, conducted).toFixed(1));
    const status = getRiskStatus(percentage);
    const safeMissesTo90 = calculateSafeMisses(attended, conducted, 90);
    const safeMissesTo75 = calculateSafeMisses(attended, conducted, 75);
    const requiredFor75 = calculateRequiredClasses(attended, conducted, 75);
    const requiredFor90 = calculateRequiredClasses(attended, conducted, 90);

    return {
      subjectCode: sub.code,
      subjectName: sub.name,
      facultyName: sub.faculty,
      conducted,
      attended,
      missed,
      percentage,
      safeMissesTo90,
      safeMissesTo75,
      requiredFor75,
      requiredFor90,
      status,
      isLab: sub.isLab,
    };
  });
}

export const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: 'alert-1',
    studentId: 'student-1',
    title: 'Detention Warning Approaching',
    message: 'Discrete-Time Signal Processing is at 76.5%. Missing tomorrow\'s class will plunge you into Detention Risk!',
    type: 'CRITICAL',
    timestamp: '10 minutes ago',
    read: false,
  },
  {
    id: 'alert-2',
    studentId: 'student-1',
    title: 'Recovery Path Calculated',
    message: 'Attend next 5 consecutive classes in DSP to safely reach 80.0% attendance.',
    type: 'WARNING',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'alert-3',
    studentId: 'student-1',
    title: 'Timetable Synced',
    message: 'Semester timetable for III ECE A is active. Semester ends 29 Nov 2026.',
    type: 'INFO',
    timestamp: 'Yesterday',
    read: true,
  },
];
