import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Lightbulb,
  Send,
  Sparkles,
  User,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { askAttendBot } from '../../services/geminiService';
import { ChatMessage } from '../../types';

export const AttendBotView: React.FC = () => {
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

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'attendbot',
      text: `Hello ${activeStudent.name}! I am AttendBot, your smart attendance copilot. I am synced with your **${currentTimetable.displayName}** timetable and current academic record.\n\nYour overall attendance is **${overallPercentage}%** (${overallStatus.replace(/_/g, ' ')}). You have attended ${overallAttended} out of ${overallConducted} classes conducted so far.\n\nAsk me anything like:\n• "Can I skip tomorrow's class?"\n• "What classes do I have tomorrow?"\n• "How many classes do I need to attend to reach 85%?"\n• "Which subjects are approaching detention risk?"`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const text = (queryToSend || inputQuery).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await askAttendBot(text, {
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
        id: `bot-${Date.now()}`,
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
          id: `bot-err-${Date.now()}`,
          sender: 'attendbot',
          text: 'I encountered an issue processing your request. Please check your network or try again.',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Can I skip tomorrow's class?",
    "What classes do I have tomorrow?",
    "How many classes to reach 85%?",
    "Which subjects are in danger of detention?",
    "Can I skip Discrete-Time Signal Processing?",
  ];

  return (
    <div className="space-y-4 pb-20 md:pb-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              AttendBot AI Assistant
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Grounded Reasoning
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Synced with {currentTimetable.displayName} • Active Timetable: {simulatedDay} (Today) / {simulatedTomorrowDay} (Tomorrow)
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Overall:</span>
          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
            {overallPercentage}% ({overallStatus})
          </span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1 mr-1" />
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="h-[460px] sm:h-[500px] rounded-3xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-5 overflow-y-auto space-y-4 shadow-xl">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              <span>AttendBot is inspecting your timetable & attendance records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={`Ask AttendBot about skipping, recovery, or tomorrow's ${currentTimetable.displayName} classes...`}
          className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/30"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
