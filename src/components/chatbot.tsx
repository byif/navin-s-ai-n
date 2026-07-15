import { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const welcomeMessage: ChatMessage = {
  role: 'assistant',
  content: "Hi, I am your Navin's AI advisor. Ask me about career choices, resume improvements, skill roadmaps, or interview preparation.",
};

const FormatChatMessage = ({ text }: { text: string }) => {
  return (
    <div className="space-y-2 text-sm leading-7 tracking-wide">
      {text.split('\n').map((line, lineIdx) => {
        const processedLine = line;
        
        const boldRegex = /\*\*(.*?)\*\*/g;
        const matches = [...processedLine.matchAll(boldRegex)];
        
        if (matches.length > 0) {
          return (
            <p key={lineIdx}>
              {processedLine.split(/\*\*.*?\*\*/).map((part, index) => (
                <span key={index}>
                  {part}
                  {matches[index] && (
                    <strong className="font-extrabold text-indigo-900 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded-md border border-indigo-100/30">
                      {matches[index][1]}
                    </strong>
                  )}
                </span>
              ))}
            </p>
          );
        }

        if (processedLine.trim().startsWith('*') || processedLine.trim().startsWith('-')) {
          const cleanLi = processedLine.replace(/^[\s*-]+/, '').trim();
          return (
            <ul key={lineIdx} className="list-disc pl-5 my-1 text-slate-700 dark:text-slate-300">
              <li className="font-medium">{cleanLi}</li>
            </ul>
          );
        }

        return processedLine.trim() ? <p key={lineIdx}>{processedLine}</p> : <div key={lineIdx} className="h-2" />;
      })}
    </div>
  );
};

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIXED SCROLL LOGIC: Restrict scrolling behavior inside its parent container block boundary 
  // block: "nearest" ensures the main browser page window doesn't snap down violently
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages]);

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: prompt };
    const nextMessages = [...messages, userMessage];
    
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true); // FIXED: Clean, direct state assignment assignment statement executed safely

    const contextPayload = {
      userName: user?.name || 'Candidate',
      userRole: user?.role || 'Job Seeker',
      academicRecords: {
        institution: 'Malla Reddy University',
        degree: 'Computer Science Engineering',
        metrics: { cgpa: 8.51, sgpa: 8.55 }
      },
      skillsMemoryBuffer: ['React', 'TypeScript', 'Node.js', 'Django', 'Full-Stack Web Architectures', 'Face Recognition AI']
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          context: contextPayload 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The advisor could not respond.');
      setMessages([...nextMessages, { role: 'assistant', content: data.content }]);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : 'Could not connect to the advisor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIXED CONTAINER SIZE BOUNDS: Set rigid height constraints with 'h-[calc(100vh-120px)]' 
    // to block content layout expansions from distorting viewport elements
    <div className="w-full max-w-7xl mx-auto my-4 h-[calc(100vh-120px)] flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
      
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shrink-0 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" /> AI Workspace Command Center
            </p>
            <h1 className="mt-1.5 text-xl font-black tracking-tight">Ask, explore, and plan your next move.</h1>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-semibold text-slate-400">Advisor Online</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-950/30 p-6 space-y-6">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {message.role === 'assistant' && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 border border-indigo-500/30 text-white shadow-lg shadow-indigo-600/10">
                <Bot className="h-5 w-5" />
              </span>
            )}
            
            <div className={`max-w-4xl rounded-2xl p-5 shadow-sm transition-all ${
              message.role === 'user' 
                ? 'bg-indigo-600 text-white font-medium rounded-tr-none' 
                : 'border border-slate-800 bg-slate-900 text-slate-200 rounded-tl-none'
            }`}>
              {message.role === 'assistant' ? (
                <FormatChatMessage text={message.content} />
              ) : (
                <p className="text-sm leading-6">{message.content}</p>
              )}
            </div>
            
            {message.role === 'user' && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shadow-md">
                <User className="h-5 w-5" />
              </span>
            )}
            
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center gap-3 text-sm text-slate-400 font-medium pl-14 animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> 
            Navin's AI Intelligence parsing profile architectures...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-800 bg-slate-900/60 p-4 shrink-0">
        {error && <p className="mb-3 rounded-xl bg-red-950/40 border border-red-900/50 px-4 py-3 text-xs font-semibold text-red-200">{error}</p>}
        <div className="flex gap-4">
          <input 
            value={input} 
            onChange={(event) => setInput(event.target.value)} 
            onKeyDown={(event) => event.key === 'Enter' && handleSend()} 
            placeholder="Ask about your tailored career paths, skills architectures, or interview strategies..." 
            className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-indigo-500 transition" 
            disabled={loading} 
          />
          <button 
            type="button" 
            onClick={handleSend} 
            disabled={loading} 
            className="rounded-xl bg-indigo-600 px-6 text-white font-bold transition hover:bg-indigo-500 disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer" 
            aria-label="Send message"
          >
            <span className="hidden sm:inline text-xs">Send Query</span>
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Chatbot;
