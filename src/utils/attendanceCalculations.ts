import { ClassSectionTimetable, DayOfWeek, PeriodSlot, RecoveryPlan, RiskStatus, SubjectAttendance } from '../types';

export function calculateAttendancePercentage(attended: number, conducted: number): number {
  if (conducted <= 0) return 100;
  if (attended <= 0) return 0;
  if (attended > conducted) return 100;
  const raw = (attended / conducted) * 100;
  return Math.min(100, Math.max(0, raw));
}

export function getRiskStatus(percentage: number): RiskStatus {
  // Spec: GREEN: Above 90%, YELLOW: 75% to below 90%, RED: Below 75%
  if (percentage >= 90) return 'SAFE';
  if (percentage >= 75) return 'WARNING';
  return 'DETENTION_RISK';
}

export function getStatusColor(status: RiskStatus): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
} {
  switch (status) {
    case 'SAFE':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        label: 'SAFE ZONE',
      };
    case 'WARNING':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        label: 'WARNING ZONE',
      };
    case 'DETENTION_RISK':
      return {
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
        label: 'DETENTION RISK',
      };
  }
}

/**
 * Calculates maximum future classes that can be missed while remaining >= targetPercentage.
 * Formula: M <= (A - (T * C) / 100) / (T / 100) = (100 * A / T) - C
 */
export function calculateSafeMisses(attended: number, conducted: number, targetPercentage: number): number {
  if (conducted <= 0) return 0;
  const currentPct = (attended / conducted) * 100;
  if (currentPct < targetPercentage) return 0;
  if (targetPercentage <= 0) return Infinity;

  // Let T = targetPercentage / 100
  // A / (C + M) >= T  =>  M <= (A - T * C) / T = (A / T) - C
  const t = targetPercentage / 100;
  const maxMisses = Math.floor((attended / t) - conducted);
  return Math.max(0, maxMisses);
}

/**
 * Calculates consecutive future classes that must be attended to reach targetPercentage.
 * Formula: (A + R) / (C + R) >= T / 100
 * => R * (1 - T/100) >= (T * C / 100) - A
 * => R >= (T * C - 100 * A) / (100 - T)
 */
export function calculateRequiredClasses(attended: number, conducted: number, targetPercentage: number): number {
  if (conducted <= 0) return 0;
  const currentPct = (attended / conducted) * 100;
  if (currentPct >= targetPercentage) return 0;
  if (targetPercentage >= 100) {
    // If a student already missed a class, 100% is unattainable mathematically
    return attended < conducted ? -1 : 0;
  }

  const numerator = (targetPercentage * conducted) - (100 * attended);
  const denominator = 100 - targetPercentage;
  const required = Math.ceil(numerator / denominator);
  return Math.max(0, required);
}

/**
 * Skip Class Predictor:
 * Predicts outcome when skipping N classes in a subject or overall.
 */
export function predictSkipOutcome(
  attended: number,
  conducted: number,
  classesToSkip: number
): {
  projectedAttended: number;
  projectedConducted: number;
  currentPercentage: number;
  projectedPercentage: number;
  diffPercentage: number;
  currentStatus: RiskStatus;
  projectedStatus: RiskStatus;
  isDangerous: boolean;
} {
  const currentPct = calculateAttendancePercentage(attended, conducted);
  const currentStatus = getRiskStatus(currentPct);

  const projAttended = attended;
  const projConducted = conducted + classesToSkip;
  const projPct = calculateAttendancePercentage(projAttended, projConducted);
  const projectedStatus = getRiskStatus(projPct);

  const isDangerous =
    (currentStatus === 'SAFE' && projectedStatus !== 'SAFE') ||
    (currentStatus === 'WARNING' && projectedStatus === 'DETENTION_RISK') ||
    projectedStatus === 'DETENTION_RISK';

  return {
    projectedAttended: projAttended,
    projectedConducted: projConducted,
    currentPercentage: Number(currentPct.toFixed(2)),
    projectedPercentage: Number(projPct.toFixed(2)),
    diffPercentage: Number((projPct - currentPct).toFixed(2)),
    currentStatus,
    projectedStatus,
    isDangerous,
  };
}

/**
 * Attendance Simulator:
 * Simulate attending or missing upcoming N classes.
 */
export function simulateAttendance(
  attended: number,
  conducted: number,
  attendExtra: number,
  missExtra: number
): {
  projectedAttended: number;
  projectedConducted: number;
  projectedPercentage: number;
  diffPercentage: number;
  projectedStatus: RiskStatus;
} {
  const currentPct = calculateAttendancePercentage(attended, conducted);
  const newAttended = attended + attendExtra;
  const newConducted = conducted + attendExtra + missExtra;
  const newPct = calculateAttendancePercentage(newAttended, newConducted);

  return {
    projectedAttended: newAttended,
    projectedConducted: newConducted,
    projectedPercentage: Number(newPct.toFixed(2)),
    diffPercentage: Number((newPct - currentPct).toFixed(2)),
    projectedStatus: getRiskStatus(newPct),
  };
}

/**
 * Maps day index (0=Sun, 1=Mon... 6=Sat) to DayOfWeek (excluding weekends)
 */
export function getDayOfWeekName(date: Date): DayOfWeek | null {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ... 5 is Friday
  if (dayIndex >= 1 && dayIndex <= 5) {
    return days[dayIndex - 1];
  }
  return null;
}

/**
 * Forward calendar recovery projection using real timetable.
 * Counts future occurrences of the subject (or any class if overall) until `classesRequired` is reached.
 */
export function projectRecoveryMilestones(
  timetable: ClassSectionTimetable,
  currentAttended: number,
  currentConducted: number,
  targetPercentage: number,
  subjectCode?: string,
  startDateString: string = '2026-09-28'
): RecoveryPlan {
  const classesRequired = calculateRequiredClasses(currentAttended, currentConducted, targetPercentage);
  const currentPercentage = calculateAttendancePercentage(currentAttended, currentConducted);

  if (classesRequired <= 0) {
    return {
      subjectCode,
      targetPercentage,
      currentPercentage: Number(currentPercentage.toFixed(1)),
      classesRequired: 0,
      projectedDate: 'Already Achieved',
      totalConductedAfterRecovery: currentConducted,
      totalAttendedAfterRecovery: currentAttended,
      timetableMilestones: [],
    };
  }

  const milestones: RecoveryPlan['timetableMilestones'] = [];
  let needed = classesRequired;
  let runningAttended = currentAttended;
  let runningConducted = currentConducted;

  // Iterate forward up to 75 calendar days until semester end (2026-11-29)
  const curr = new Date(startDateString);
  const end = new Date(timetable.semesterEndDate);

  while (curr <= end && needed > 0) {
    const dayName = getDayOfWeekName(curr);
    if (dayName) {
      const daySchedule = timetable.schedule.find(s => s.day === dayName);
      if (daySchedule) {
        for (const period of daySchedule.periods) {
          if (!subjectCode || period.subjectCode === subjectCode) {
            runningAttended += 1;
            runningConducted += 1;
            needed -= 1;

            const cumPct = calculateAttendancePercentage(runningAttended, runningConducted);

            milestones.push({
              date: curr.toISOString().split('T')[0],
              day: dayName,
              periodNumber: period.periodNumber,
              subjectName: period.subjectName,
              cumulativeAttendance: Number(cumPct.toFixed(1)),
            });

            if (needed <= 0) break;
          }
        }
      }
    }
    // advance 1 day
    curr.setDate(curr.getDate() + 1);
  }

  const lastMilestone = milestones[milestones.length - 1];
  const projectedDate = lastMilestone ? lastMilestone.date : null;

  return {
    subjectCode,
    targetPercentage,
    currentPercentage: Number(currentPercentage.toFixed(1)),
    classesRequired,
    projectedDate,
    totalConductedAfterRecovery: runningConducted,
    totalAttendedAfterRecovery: runningAttended,
    timetableMilestones: milestones,
  };
}

/**
 * Calculates remaining classes in the semester from current date using real timetable
 */
export function calculateRemainingClasses(
  timetable: ClassSectionTimetable,
  currentDateString: string = '2026-09-28'
): {
  totalRemaining: number;
  bySubject: Record<string, number>;
} {
  const bySubject: Record<string, number> = {};
  timetable.subjects.forEach(s => {
    bySubject[s.code] = 0;
  });

  let totalRemaining = 0;
  const curr = new Date(currentDateString);
  const end = new Date(timetable.semesterEndDate);

  while (curr <= end) {
    const dayName = getDayOfWeekName(curr);
    if (dayName) {
      const daySchedule = timetable.schedule.find(s => s.day === dayName);
      if (daySchedule) {
        for (const period of daySchedule.periods) {
          totalRemaining += 1;
          bySubject[period.subjectCode] = (bySubject[period.subjectCode] || 0) + 1;
        }
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  return { totalRemaining, bySubject };
}

/**
 * Semester End Forecast:
 * Best case: 100% of remaining attended
 * Expected case: Student maintains current attendance rate
 * Risk case: Student misses 1 class per week or misses 5 upcoming
 */
export function calculateSemesterForecast(
  attended: number,
  conducted: number,
  remainingClasses: number
): {
  bestCase: number;
  expectedCase: number;
  riskCase: number;
} {
  const totalClasses = conducted + remainingClasses;
  if (totalClasses <= 0) return { bestCase: 100, expectedCase: 100, riskCase: 100 };

  const currentRate = conducted > 0 ? attended / conducted : 0.85;

  const bestAttended = attended + remainingClasses;
  const bestCase = Number(((bestAttended / totalClasses) * 100).toFixed(1));

  const expectedAttended = attended + Math.round(remainingClasses * currentRate);
  const expectedCase = Number(((expectedAttended / totalClasses) * 100).toFixed(1));

  // Risk case: miss 25% of remaining classes
  const riskAttended = attended + Math.max(0, Math.round(remainingClasses * 0.70));
  const riskCase = Number(((riskAttended / totalClasses) * 100).toFixed(1));

  return { bestCase, expectedCase, riskCase };
}
