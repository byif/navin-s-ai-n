import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';

const Resources = () => {
  const [terminalLog, setTerminalLog] = useState<string>('Initializing handshake sequence...');
  const [activeCycle, setActiveCycle] = useState(0);

  // Rotate console stream indicators to simulate processing engines
  useEffect(() => {
    const logs = [
      'Establishing secure handshake via WebSocket...',
      'Parsing local repository context matrices... OK',
      'Syncing candidate profiles with corporate nodes...',
      'Compiling telemetry network weights... 100%',
      "Navin's AI system diagnostics: STATUS_EXCELLENT"
    ];
    
    const interval = setInterval(() => {
      setActiveCycle((prev) => (prev + 1) % logs.length);
      setTerminalLog(logs[(activeCycle + 1) % logs.length]);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeCycle]);

  return (
    // FULL UI ALIGNMENT: Neutral dark aesthetic eliminating the gray canvas completely
    <div id="resources" className="w-full bg-slate-950/40 dark:bg-slate-950 py-12 border-t border-slate-200/60 dark:border-slate-900/60 transition-all duration-300">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER TRACKER */}
        <div className="mb-8 border-b border-slate-200/60 dark:border-slate-800/60 pb-5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Layers className="h-4 w-4 animate-pulse" /> Cyber Infrastructure
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Interactive Neural Network
          </h2>
        </div>

        {/* RECOGNIZABLE REACTBITS ENGINE PLATFORM CARD */}
        <div className="w-full bg-slate-900/40 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/70 rounded-2xl p-6 relative overflow-hidden shadow-sm min-h-[220px] flex flex-col justify-between group">
          
          {/* ANIMATION LAYER 1: Floating Particle Constellation Orbit */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 dark:opacity-70">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-orbit shadow-sm shadow-indigo-400/50"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${6 + Math.random() * 10}s`,
                  animationDelay: `${-Math.random() * 5}s`,
                  transform: `scale(${0.5 + Math.random() * 1.5})`
                }}
              />
            ))}
          </div>

          {/* ANIMATION LAYER 2: Moving Digital Scanline Mesh */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none animate-scanline" />

          {/* HUD INTERFACE MAIN CONTENT PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 items-center w-full">
            
            {/* LEFT HUD PANEL: Rotating Structural Hologram Ring */}
            <div className="md:col-span-4 flex flex-col items-center justify-center py-4 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50 pr-0 md:pr-6">
              <div className="relative h-20 w-20 flex items-center justify-center">
                {/* Outer Orbit Ring */}
                <div className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin [animation-duration:20s]" />
                {/* Inner Speed Ring */}
                <div className="absolute inset-2 border border-purple-500/40 rounded-full animate-spin [animation-duration:8s] [animation-direction:reverse]" />
                {/* Core Processor Element */}
                <span className="p-3 bg-slate-950 rounded-xl border border-slate-800 shadow-xl text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="h-6 w-6 animate-pulse" />
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mt-4 flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin [animation-duration:4s]" /> Telemetry Syncing
              </span>
            </div>

            {/* RIGHT HUD PANEL: Live Script Stream Stream Emulator */}
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/40 dark:border-slate-800/40 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Diagnostic Terminal Output</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              
              {/* Output Logger String block */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-xs text-slate-400 tracking-wide shadow-inner min-h-[64px] flex items-center transition-all duration-300">
                <span className="text-indigo-400 mr-2 shrink-0">&gt;</span>
                <span className="break-all">{terminalLog}</span>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 font-bold select-none pt-1">
                <div className="flex items-center gap-1"><Shield className="h-3 w-3 text-emerald-500" /> Mesh Secure</div>
                <div>Node Engine: <span className="text-slate-800 dark:text-slate-200">v1.0.4-LTS</span></div>
              </div>
            </div>

          </div>

          {/* Injection of standard CSS animation vectors */}
          <style>{`
            @keyframes orbit {
              0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.2; }
              50% { transform: translateY(-20px) translateX(15px) scale(1.2); opacity: 0.8; }
              100% { transform: translateY(0px) translateX(0px) rotate(360deg); opacity: 0.2; }
            }
            @keyframes scanline {
              0% { transform: translateY(0); }
              100% { transform: translateY(100%); }
            }
          `}</style>
        </div>

      </div>
    </div>
  );
};

export default Resources;
