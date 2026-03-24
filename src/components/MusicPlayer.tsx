import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: 'TRK_01: NEON_DRIFT', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'TRK_02: CYBER_PULSE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'TRK_03: DIGI_HORIZON', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const playNext = () => { setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length); setIsPlaying(true); };
  const playPrev = () => { setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length); setIsPlaying(true); };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  return (
    <div className="w-full p-6 border-2 border-fuchsia-500 bg-black font-digital text-xs text-cyan-400 relative shadow-[0_0_20px_rgba(255,0,255,0.2)]">
      <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 animate-pulse shadow-[0_0_10px_#f0f]" />
      <audio ref={audioRef} src={currentTrack.url} onTimeUpdate={handleTimeUpdate} onEnded={playNext} />
      
      <div className="flex justify-between items-center mb-6 border-b-2 border-cyan-900 pb-2">
        <span className="text-fuchsia-500 text-[10px] md:text-xs">AUDIO_UPLINK</span>
        <span className={isPlaying ? 'text-cyan-400 animate-pulse text-[10px] md:text-xs' : 'text-cyan-800 text-[10px] md:text-xs'}>
          {isPlaying ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>

      <div className="mb-6">
        <div className="truncate mb-4 glitch-text text-sm md:text-base" data-text={currentTrack.title}>
          {currentTrack.title}
        </div>
        <div className="w-full h-3 bg-gray-900 border border-cyan-900 relative">
          <div 
            className="h-full bg-cyan-500 shadow-[0_0_10px_#0ff] transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={playPrev} className="hover:text-fuchsia-500 hover:bg-cyan-900/30 px-3 py-2 border-2 border-transparent hover:border-fuchsia-500 transition-all text-[10px] md:text-xs">
          [PRV]
        </button>
        <button onClick={togglePlay} className="text-fuchsia-500 hover:text-cyan-400 hover:bg-fuchsia-900/30 px-6 py-2 border-2 border-fuchsia-500 hover:border-cyan-400 transition-all shadow-[0_0_10px_rgba(255,0,255,0.3)] hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] text-[10px] md:text-xs">
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </button>
        <button onClick={playNext} className="hover:text-fuchsia-500 hover:bg-cyan-900/30 px-3 py-2 border-2 border-transparent hover:border-fuchsia-500 transition-all text-[10px] md:text-xs">
          [NXT]
        </button>
      </div>
    </div>
  );
}
