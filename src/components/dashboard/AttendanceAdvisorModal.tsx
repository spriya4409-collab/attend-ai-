import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Lightbulb,
  Maximize2,
  MessageSquare,
  Minimize2,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { askAttendanceAdvisor } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import { getStatusColor } from '../../utils/attendanceCalculations';

export const AttendanceAdvisorModal: React.FC = () => {
  const {
    activeStudent,
    currentTimetable,
    subjects,
    overallAttended,
    overallConducted,
    overallPercentage,
    overallStatus,
    simulatedDate,
    simulatedDay,
    simulatedTomorrowDay,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'advisor-welcome',
      sender: 'attendbot',
      text: `Hello ${activeStudent.name}! I am your personal **Attendance Advisor**.\n\nI have live access to your **${currentTimetable.displayName}** timetable and attendance record (${overallPercentage}% overall, ${overallAttended}/${overallConducted} classes).\n\nAsk me any natural-language attendance question! For example:\n• "If I take a 3-day sick leave starting tomorrow, will my Chemistry attendance drop below 75%?"\n• "What happens if I take 2 days of OD for a symposium?"\n• "Can I skip tomorrow's class?"`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const statusColors = getStatusColor(overallStatus);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `advisor-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await askAttendanceAdvisor(text, {
        studentName: activeStudent.name,
        department: activeStudent.department,
        year: activeStudent.year,
        section: activeStudent.section,
        sectionDisplayName: currentTimetable.displayName,
        overallAttended,
        overallConducted,
        overallPercentage,
        overallStatus,
        subjectAttendance: subjects,
        timetable: currentTimetable,
        simulatedTodayDay: simulatedDay,
        simulatedTomorrowDay,
      });

      const botMsg: ChatMessage = {
        id: `advisor-bot-${Date.now()}`,
        sender: 'attendbot',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `advisor-bot-err-${Date.now()}`,
          sender: 'attendbot',
          text: 'I could not compute that query right now. Please try again or rephrase.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'If I take a 3-day sick leave starting tomorrow, will my Chemistry attendance drop below 75%?',
    'What happens if I miss tomorrow\'s class?',
    'How many classes do I need to attend to recover to 75%?',
    'If I take 2 days OD for a symposium, will my attendance stay above 90%?',
  ];

  return (
    <>
      {/* Floating Action Button in bottom-right corner */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Subtle Attention Callout */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/40 text-xs text-indigo-200 shadow-xl backdrop-blur-md animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">Attendance Advisor</span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20"
            aria-label="Open Attendance Advisor Chatbot"
            title="Open Attendance Advisor AI Chatbot"
          >
            <Bot className="w-7 h-7 text-white transition-transform group-hover:rotate-6" />
            {/* Live Indicator Beacon */}
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </button>
        </div>
      )}

      {/* Floating Chat Drawer / Popover */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[440px] max-h-[85vh] h-[600px] flex flex-col rounded-3xl bg-slate-950 border border-indigo-500/30 shadow-2xl shadow-slate-950/80 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Drawer Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px] shadow-lg shadow-indigo-500/30 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white truncate">
                    Attendance Advisor
                  </h3>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                    Live AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  Synced: {activeStudent.name} • {overallPercentage}% ({overallStatus})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: `advisor-reset-${Date.now()}`,
                      sender: 'attendbot',
                      text: `Conversation restarted. Ready to answer attendance, leave, and timetable questions for ${activeStudent.name}.`,
                      timestamp: 'Just now',
                    },
                  ]);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Restart Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Close Advisor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
            {samplePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0 border border-slate-700/60"
              >
                {prompt.length > 38 ? `${prompt.slice(0, 38)}...` : prompt}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950 text-xs sm:text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-1.5 shadow-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-normal leading-normal">
                      {msg.text}
                    </div>
                    <div
                      className={`text-[10px] mt-1 ${
                        isUser ? 'text-indigo-200 text-right' : 'text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  <span>Attendance Advisor is inspecting your timetable & attendance records...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask: 'If I take a 3-day sick leave, will attendance drop below 75%?'"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-indigo-600/30"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
