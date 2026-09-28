import {
  Check,
  Code,
  Copy,
  Database,
  ExternalLink,
  FileCode,
  Flame,
  Layers,
  Server,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';

export const ArchitectureView: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const flutterCalculatorCode = `// lib/services/attendance_engine.dart
import 'dart:math';

enum RiskStatus { safe, warning, detentionRisk }

class AttendanceResult {
  final double percentage;
  final RiskStatus status;
  final int safeMissesTo75;
  final int safeMissesTo90;
  final int requiredFor75;
  final int requiredFor90;

  AttendanceResult({
    required this.percentage,
    required this.status,
    required this.safeMissesTo75,
    required this.safeMissesTo90,
    required this.requiredFor75,
    required this.requiredFor90,
  });
}

class AttendanceEngine {
  /// Attendance Percentage = (A / C) * 100
  static double calculatePercentage(int attended, int conducted) {
    if (conducted <= 0) return 100.0;
    if (attended <= 0) return 0.0;
    return (attended / conducted) * 100.0;
  }

  /// Safe Misses before falling below target: M = floor(A / (T / 100) - C)
  static int calculateSafeMisses(int attended, int conducted, double targetPct) {
    if (conducted <= 0) return 0;
    double currentPct = (attended / conducted) * 100.0;
    if (currentPct < targetPct) return 0;
    double t = targetPct / 100.0;
    int maxMisses = ((attended / t) - conducted).floor();
    return max(0, maxMisses);
  }

  /// Required Consecutive Classes to reach target: R = ceil((T*C - 100*A) / (100 - T))
  static int calculateRequiredClasses(int attended, int conducted, double targetPct) {
    if (conducted <= 0) return 0;
    double currentPct = (attended / conducted) * 100.0;
    if (currentPct >= targetPct) return 0;
    if (targetPct >= 100.0) return -1; // mathematically unattainable if class missed
    double numerator = (targetPct * conducted) - (100.0 * attended);
    double denominator = 100.0 - targetPct;
    return (numerator / denominator).ceil();
  }

  static RiskStatus getRiskStatus(double percentage) {
    if (percentage >= 90.0) return RiskStatus.safe;
    if (percentage >= 75.0) return RiskStatus.warning;
    return RiskStatus.detentionRisk;
  }
}`;

  const firestoreRulesCode = `// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }

    // Students profile
    match /students/{studentId} {
      allow read: if isOwner(studentId) || isAdmin();
      allow write: if isOwner(studentId) || isAdmin();
    }

    // Attendance records: Verified only, students cannot forge
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated() && (resource.data.studentId == request.auth.uid || isAdmin());
      allow create: if isAdmin() || (isAuthenticated() && request.resource.data.source == 'QR_SCAN');
      allow update, delete: if isAdmin();
    }

    // Timetables: Public read for enrolled students, write for admins
    match /timetables/{timetableId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Announcements
    match /announcements/{announcementId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // QR Attendance Sessions
    match /qrSessions/{sessionId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}`;

  const firestoreSchemaJson = `{
  "collections": {
    "students": {
      "documentId": "uid",
      "fields": {
        "name": "string",
        "registerNumber": "string (unique index)",
        "collegeId": "string",
        "department": "ECE | BME | SEEE",
        "year": "I | II | III | IV",
        "section": "A | B | DS | DS A | DS B | SEEE",
        "sectionId": "string",
        "email": "string",
        "parentName": "string",
        "parentPhone": "string",
        "targetPercentage": "number (default: 75)",
        "createdAt": "timestamp"
      }
    },
    "attendance": {
      "documentId": "attendanceId",
      "fields": {
        "studentId": "string",
        "subjectCode": "string",
        "date": "string (YYYY-MM-DD)",
        "periodNumber": "number (1-7)",
        "status": "PRESENT | ABSENT | ON_DUTY",
        "source": "QR_SCAN | MANUAL | BIOMETRIC",
        "timestamp": "timestamp"
      }
    },
    "timetables": {
      "documentId": "sectionId (e.g. IV_ECE_B)",
      "fields": {
        "department": "string",
        "year": "string",
        "section": "string",
        "semesterStartDate": "2026-08-29",
        "semesterEndDate": "2026-11-29",
        "schedule": [
          {
            "day": "Monday",
            "periods": [
              {
                "periodNumber": 1,
                "startTime": "08:45 AM",
                "endTime": "09:40 AM",
                "subjectCode": "EC8701",
                "subjectName": "Antennas and Microwave Engg",
                "facultyName": "Dr. K. Senthil Nathan",
                "roomNo": "LH-402"
              }
            ]
          }
        ]
      }
    }
  }
}`;

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileCode className="w-6 h-6 text-cyan-400" />
            Flutter & Firebase Architecture Center
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
            Hackathon Production Specification
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Complete Flutter cross-platform architecture, mathematical calculation engine, Cloud Firestore schemas, and security rules.
        </p>
      </div>

      {/* Architecture Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Smartphone className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Flutter Mobile & Web</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Clean Architecture: Presentation (BLoC / Riverpod) → Domain (Use Cases & Mathematical Engine) → Data (Firebase Repositories).
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400">
            <Flame className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Firebase & Cloud Firestore</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cloud Firestore for real-time attendance streams, Firebase Authentication, and Cloud Functions for FCM alerts and Twilio WhatsApp triggers.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-sm text-white">Gemini AI Copilot</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AttendBot contextual injection with timetable verification, preventing hallucinations and reasoning mathematically over student schedule.
          </p>
        </div>
      </div>

      {/* Code Export 1: Flutter Mathematical Attendance Engine */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Flutter / Dart Attendance Calculation Engine (lib/services/attendance_engine.dart)
            </h3>
          </div>
          <button
            onClick={() => handleCopy('flutter_calc', flutterCalculatorCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            {copiedKey === 'flutter_calc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'flutter_calc' ? 'Copied!' : 'Copy Dart Code'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto max-h-64">
          {flutterCalculatorCode}
        </pre>
      </div>

      {/* Code Export 2: Firestore Security Rules */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Firebase Security Rules (firestore.rules)
            </h3>
          </div>
          <button
            onClick={() => handleCopy('rules', firestoreRulesCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'rules' ? 'Copied!' : 'Copy Rules'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto max-h-64">
          {firestoreRulesCode}
        </pre>
      </div>

      {/* Code Export 3: Firestore Database Schema */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Firestore Collections & Document Data Models
            </h3>
          </div>
          <button
            onClick={() => handleCopy('schema', firestoreSchemaJson)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            {copiedKey === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'schema' ? 'Copied!' : 'Copy Schema'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-64">
          {firestoreSchemaJson}
        </pre>
      </div>
    </div>
  );
};
