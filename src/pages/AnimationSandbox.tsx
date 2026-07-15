import React, { useState } from 'react';
import { Sparkles, Terminal, Activity, RefreshCw } from 'lucide-react';

export const AnimationSandbox = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* BACKGROUND GRAPHIC INTERFACE (ReactBits Vibe) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-25 pointer-events-none" />
      
      {/* FLOATING NEON ORBS */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none [animation-delay:2s]" />

      <div className="w-full max-w-4xl z-10 space-y-8 text-center">
        {/* PAGE HEADER */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold tracking-wide uppercase">
            <Sparkles className="h-3 w-3 animate-spin [animation-duration:4s]" /> Experimental Lab Layer
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Interactive Node Canvas
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-medium">
            A high-performance animation canvas built for telemetry validation metrics and micro-motions. Hover over the cores to trigger data streams.
          </p>
        </div>

        {/* REACTION SYSTEM: THE GRID MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          {[
            { id: 1, title: 'neural_matrix.io', icon: Activity, desc: 'Tracks active streaming client hooks.', color: 'from-indigo-500 to-cyan-400' },
            { id: 2, title: 'crypt_handshake.sh', icon: Terminal, desc: 'Handles async encryption arrays.', color: 'from-purple-500 to-pink-500' },
            { id: 3, title: 'sys_telemetry.log', icon: RefreshCw, desc: 'Compiles background event nodes.', color: 'from-emerald-500 to-teal-400' }
          ].map((node) => {
            const NodeIcon = node.icon;
            const isHovered = activeNode === node.id;
            
            return (
              <div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1.5 hover:border-slate-700/80 hover:shadow-xl hover:shadow-indigo-500/5 group cursor-pointer"
              >
                {/* Micro-Glow Border Light effect */}
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${node.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                
                {/* Reactive Vector Lines Mesh */}
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_70%)] transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className={`p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 group-hover:text-white transition-colors`}>
                      <NodeIcon className={`h-5 w-5 ${isHovered ? 'animate-spin [animation-duration:3s]' : ''}`} />
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                      ID // 00{node.id}
                    </span>
                  </div>

                  <div className="text-left space-y-1">
                    <h3 className="text-sm font-mono font-bold text-slate-200 group-hover:text-white transition-colors">
                      {node.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {node.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};