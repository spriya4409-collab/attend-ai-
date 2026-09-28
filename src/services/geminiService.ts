import { GoogleGenAI } from '@google/genai';
import { ClassSectionTimetable, DayOfWeek, SubjectAttendance } from '../types';
import { predictSkipOutcome } from '../utils/attendanceCalculations';

interface AttendBotContext {
  studentName: string;
  department: string;
  year: string;
  section: string;
  sectionDisplayName: string;
  overallAttended: number;
  overallConducted: number;
  overallPercentage: number;
  overallStatus: string;
  subjectAttendance: SubjectAttendance[];
  timetable: ClassSectionTimetable;
  simulatedTodayDay: DayOfWeek;
  simulatedTomorrowDay: DayOfWeek;
}

// Fallback rule-based timetable & attendance reasoning engine
export function getLocalAttendBotResponse(query: string, context: AttendBotContext): string {
  const lower = query.toLowerCase();
  const todaySchedule = context.timetable.schedule.find(s => s.day === context.simulatedTodayDay);
  const tomorrowSchedule = context.timetable.schedule.find(s => s.day === context.simulatedTomorrowDay);

  // Check: "Can I skip tomorrow..." or "skip tomorrow's..."
  if (lower.includes('skip') || lower.includes('miss') || lower.includes('bunk') || lower.includes('can i miss')) {
    // Check if query mentions a specific subject
    const matchedSubject = context.subjectAttendance.find(
      s => lower.includes(s.subjectName.toLowerCase()) ||
           lower.includes(s.subjectCode.toLowerCase()) ||
           (s.subjectCode === 'EC8553' && (lower.includes('dsp') || lower.includes('signal'))) ||
           (s.subjectCode === 'EC8501' && (lower.includes('dc') || lower.includes('digital comm'))) ||
           (s.subjectCode === 'EC8701' && (lower.includes('ame') || lower.includes('antennas'))) ||
           (s.subjectCode === 'MA8151' && (lower.includes('math') || lower.includes('m1'))) ||
           (s.subjectCode === 'MA8352' && (lower.includes('math') || lower.includes('m3') || lower.includes('algebra')))
    );

    if (matchedSubject) {
      // Check if this subject actually occurs tomorrow
      const tomorrowOccurrences = tomorrowSchedule?.periods.filter(p => p.subjectCode === matchedSubject.subjectCode) || [];

      if (lower.includes('tomorrow')) {
        if (tomorrowOccurrences.length === 0) {
          return `You do not have any ${matchedSubject.subjectName} (${matchedSubject.subjectCode}) scheduled for tomorrow (${context.simulatedTomorrowDay}) according to your ${context.sectionDisplayName} timetable.\n\nYour current attendance in ${matchedSubject.subjectName} is ${matchedSubject.percentage}% (${matchedSubject.attended}/${matchedSubject.conducted} classes). Check your timetable tab for tomorrow's actual scheduled periods.`;
        }

        const skipCount = tomorrowOccurrences.length;
        const outcome = predictSkipOutcome(matchedSubject.attended, matchedSubject.conducted, skipCount);

        if (outcome.projectedStatus === 'DETENTION_RISK') {
          return `⚠️ DO NOT SKIP! You have ${skipCount} period(s) of ${matchedSubject.subjectName} tomorrow (${context.simulatedTomorrowDay}).\n\nIf you miss tomorrow, your attendance will drop from ${outcome.currentPercentage}% to ${outcome.projectedPercentage}%, plunging you into DETENTION RISK (below 75%). Attending keeps you safe!`;
        } else if (outcome.projectedPercentage < 90 && outcome.currentPercentage >= 90) {
          return `⚠️ Caution: You have ${skipCount} period(s) of ${matchedSubject.subjectName} tomorrow (${context.simulatedTomorrowDay}). If you miss it, your attendance drops from ${outcome.currentPercentage}% to ${outcome.projectedPercentage}%, dropping you below your 90% distinction target!`;
        } else {
          return `You have ${skipCount} period(s) of ${matchedSubject.subjectName} scheduled tomorrow (${context.simulatedTomorrowDay}) at Period ${tomorrowOccurrences.map(p => p.periodNumber).join(', ')}.\n\nIf you skip, attendance drops from ${outcome.currentPercentage}% to ${outcome.projectedPercentage}% (${outcome.projectedStatus}). You currently have ${matchedSubject.safeMissesTo75} safe miss(es) remaining before reaching the 75% detention threshold.`;
        }
      }

      // General skip question for this subject
      const outcome = predictSkipOutcome(matchedSubject.attended, matchedSubject.conducted, 1);
      return `For ${matchedSubject.subjectName} (${matchedSubject.subjectCode}):\n- Current attendance: ${matchedSubject.percentage}% (${matchedSubject.status})\n- Safe misses to stay above 75%: ${matchedSubject.safeMissesTo75} classes\n- Safe misses to stay above 90%: ${matchedSubject.safeMissesTo90} classes\n\nIf you miss 1 class, your attendance drops to ${outcome.projectedPercentage}% (${outcome.projectedStatus}).`;
    }

    // Generic skip question for tomorrow
    if (lower.includes('tomorrow')) {
      const tomorrowPeriods = tomorrowSchedule ? tomorrowSchedule.periods.length : 0;
      const outcome = predictSkipOutcome(context.overallAttended, context.overallConducted, 1);
      return `Tomorrow (${context.simulatedTomorrowDay}) you have ${tomorrowPeriods} scheduled periods in ${context.sectionDisplayName}.\n\nIf you miss 1 class tomorrow, your overall attendance drops from ${context.overallPercentage}% to ${outcome.projectedPercentage}%.\nSafe misses to stay >= 75%: ${context.overallStatus === 'DETENTION_RISK' ? '0 (You are already in detention risk)' : 'calculate via Subject tab'}.`;
    }
  }

  // Check: "What is my next class?" or "classes tomorrow" or "today's classes"
  if (lower.includes('tomorrow') && (lower.includes('schedule') || lower.includes('class') || lower.includes('timetable') || lower.includes('period'))) {
    if (!tomorrowSchedule || tomorrowSchedule.periods.length === 0) {
      return `No classes scheduled for tomorrow (${context.simulatedTomorrowDay}).`;
    }
    const list = tomorrowSchedule.periods.map(p => `• Period ${p.periodNumber} (${p.startTime} - ${p.endTime}): ${p.subjectName} (${p.roomNo})`).join('\n');
    return `Here is your schedule for tomorrow (${context.simulatedTomorrowDay}) in ${context.sectionDisplayName}:\n\n${list}`;
  }

  if (lower.includes('today') && (lower.includes('schedule') || lower.includes('class') || lower.includes('timetable') || lower.includes('period'))) {
    if (!todaySchedule || todaySchedule.periods.length === 0) {
      return `No classes scheduled for today (${context.simulatedTodayDay}).`;
    }
    const list = todaySchedule.periods.map(p => `• Period ${p.periodNumber} (${p.startTime} - ${p.endTime}): ${p.subjectName} (${p.roomNo})`).join('\n');
    return `Today's schedule (${context.simulatedTodayDay}) for ${context.sectionDisplayName}:\n\n${list}`;
  }

  // Check: "How to recover?" or "recovery" or "reach 75%" or "reach 90%"
  if (lower.includes('recover') || lower.includes('target') || lower.includes('reach 75') || lower.includes('reach 90') || lower.includes('detention')) {
    const dangerSubs = context.subjectAttendance.filter(s => s.status === 'DETENTION_RISK' || s.status === 'WARNING');
    if (dangerSubs.length === 0) {
      return `Great news! You are currently in the SAFE ZONE with an overall attendance of ${context.overallPercentage}%. None of your subjects are in detention risk.\n\nKeep maintaining regular attendance to safeguard your 90% target until the semester ends on 29 November 2026.`;
    }

    const advice = dangerSubs.map(s => `• ${s.subjectName}: Current ${s.percentage}%. Needs ${s.requiredFor75} consecutive classes to cross 75%, or ${s.requiredFor90} classes to reach 90%.`).join('\n');
    return `Here is your recovery action plan:\n\n${advice}\n\nCheck the Recovery Planner tab to see the exact projected calendar dates when these milestones will be reached!`;
  }

  // Default summary response
  return `Hello ${context.studentName}! I am AttendBot, your smart attendance copilot for ${context.sectionDisplayName}.\n\n` +
    `• Overall Attendance: ${context.overallPercentage}% (${context.overallStatus})\n` +
    `• Attended: ${context.overallAttended} / ${context.overallConducted} total classes conducted\n` +
    `• Danger Subjects: ${context.subjectAttendance.filter(s => s.status === 'DETENTION_RISK').map(s => s.subjectName).join(', ') || 'None'}\n\n` +
    `You can ask me questions like:\n- "Can I skip tomorrow's class?"\n- "What classes do I have tomorrow?"\n- "How many classes do I need to attend to reach 85%?"\n- "Which subjects are in detention risk?"`;
}

export async function askAttendBot(
  query: string,
  context: AttendBotContext,
  apiKey?: string
): Promise<string> {
  const effectiveKey = apiKey || (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined);

  if (!effectiveKey || effectiveKey === 'MY_GEMINI_API_KEY') {
    // Intelligent local fallback
    return getLocalAttendBotResponse(query, context);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: effectiveKey });

    const systemPrompt = `You are AttendBot, the intelligent attendance and timetable copilot for college students at AttendAI.
You have ACCESS to the student's real profile and verified timetable dataset.
NEVER invent classes, fake subjects, or imaginary dates.
If a class does not exist on the timetable, explicitly state that it does not occur.

STUDENT CONTEXT:
- Name: ${context.studentName}
- Department: ${context.department} (${context.year} Year, Section ${context.section})
- Timetable Section: ${context.sectionDisplayName}
- Overall Attendance: ${context.overallPercentage}% (${context.overallStatus})
- Classes: Attended ${context.overallAttended} out of ${context.overallConducted}
- Today is simulated as: ${context.simulatedTodayDay}
- Tomorrow is simulated as: ${context.simulatedTomorrowDay}
- Semester duration: 29 August 2026 to 29 November 2026

SUBJECT ATTENDANCE BREAKDOWN:
${context.subjectAttendance.map(s => `- ${s.subjectCode} ${s.subjectName}: ${s.percentage}% (${s.attended}/${s.conducted} attended). Status: ${s.status}. Safe misses to 75%: ${s.safeMissesTo75}. Required for 75%: ${s.requiredFor75}. Required for 90%: ${s.requiredFor90}.`).join('\n')}

TODAY'S SCHEDULE (${context.simulatedTodayDay}):
${JSON.stringify(context.timetable.schedule.find(s => s.day === context.simulatedTodayDay)?.periods || [], null, 2)}

TOMORROW'S SCHEDULE (${context.simulatedTomorrowDay}):
${JSON.stringify(context.timetable.schedule.find(s => s.day === context.simulatedTomorrowDay)?.periods || [], null, 2)}

GUIDELINES:
1. Always calculate exact math before answering. If a student wants to skip a class, check if the class actually occurs on that day.
2. If it occurs, calculate the new attendance %: (attended) / (conducted + skipped) * 100.
3. Warn immediately if it causes detention risk (<75%) or drops them below 90%.
4. Keep answers friendly, authoritative, concise, and structured.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2,
      },
    });

    return response.text || getLocalAttendBotResponse(query, context);
  } catch (error) {
    console.warn('Gemini API call failed, using intelligent rule engine fallback:', error);
    return getLocalAttendBotResponse(query, context);
  }
}
