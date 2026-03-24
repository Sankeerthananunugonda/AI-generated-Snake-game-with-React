import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative font-digital crt-flicker">
      <div className="scanlines" />
      
      <header className="mb-8 text-center z-10">
        <h1 className="text-2xl md:text-4xl lg:text-5xl text-cyan-400 glitch-text drop-shadow-[0_0_10px_#0ff]" data-text="TERMINAL_OS v9.9">
          TERMINAL_OS v9.9
        </h1>
        <p className="text-fuchsia-500 mt-4 text-[8px] md:text-[10px] tracking-widest uppercase">
          UNAUTHORIZED ACCESS DETECTED
        </p>
      </header>

      <main className="z-10 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 w-full max-w-5xl">
        <div className="flex-1 w-full max-w-md lg:max-w-none flex justify-center">
          <SnakeGame />
        </div>
        <div className="w-full max-w-md lg:w-80 flex flex-col gap-8">
          <MusicPlayer />
          <div className="border-2 border-cyan-900 p-4 text-[10px] text-cyan-700 bg-black/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <p className="mb-2 text-cyan-500">&gt; SYSTEM LOG:</p>
            <p className="animate-pulse text-fuchsia-400">&gt; AWAITING USER INPUT...</p>
            <p>&gt; MEMORY: OK</p>
            <p>&gt; UPLINK: STABLE</p>
            <p>&gt; KERNEL: ACTIVE</p>
            <p className="mt-2 text-cyan-900">_</p>
          </div>
        </div>
      </main>
    </div>
  );
}
