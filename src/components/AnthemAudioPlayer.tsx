import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Music,
  Info
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';
import { createCeremonialFanfareWavBlob, triggerFanfareDownload } from '../utils/audioFanfare';

export const AnthemAudioPlayer: React.FC = () => {
  const { schoolInfo } = useSchool();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(12.5);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use developer uploaded audio if present, otherwise default to static fanfare
  const customAudioUrl = schoolInfo.anthem?.audioUrl;
  const audioFileName = schoolInfo.anthem?.audioFileName || 'Ghanata_Senior_High_School_Anthem.wav';
  const isCustomAudio = Boolean(customAudioUrl && customAudioUrl !== 'stored_in_google_cloud');

  const [audioSrc, setAudioSrc] = useState<string>(
    customAudioUrl && customAudioUrl !== 'stored_in_google_cloud'
      ? customAudioUrl
      : '/audio/Ghanata_Senior_High_School_Anthem_Fanfare.wav'
  );

  useEffect(() => {
    if (customAudioUrl && customAudioUrl.length > 50 && customAudioUrl !== 'stored_in_google_cloud') {
      setAudioSrc(customAudioUrl);
      if (audioRef.current) {
        audioRef.current.load();
      }
    } else if (customAudioUrl === 'stored_in_google_cloud') {
      import('../services/firebaseClient').then(({ loadAudioFromFirestore }) => {
        loadAudioFromFirestore().then(res => {
          if (res?.audioUrl) {
            setAudioSrc(res.audioUrl);
            if (audioRef.current) audioRef.current.load();
          }
        });
      });
    } else {
      const defaultUrl = '/audio/Ghanata_Senior_High_School_Anthem_Fanfare.wav';
      setAudioSrc(defaultUrl);
    }
  }, [customAudioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Fallback to synthesizing directly via blob if default file fails
        if (!isCustomAudio) {
          try {
            const blob = createCeremonialFanfareWavBlob();
            const url = URL.createObjectURL(blob);
            if (audioRef.current) {
              audioRef.current.src = url;
              audioRef.current.play();
              setIsPlaying(true);
            }
          } catch (err) {
            console.error('Audio play error', err);
          }
        }
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDownload = () => {
    if (customAudioUrl) {
      const a = document.createElement('a');
      a.href = customAudioUrl;
      a.download = audioFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 500);
    } else {
      triggerFanfareDownload('Ghanata_Senior_High_School_Anthem.wav');
    }
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const barHeights = [20, 45, 65, 85, 40, 70, 95, 100, 80, 60, 45, 75, 90, 85, 55, 30, 65, 80, 50, 25];

  return (
    <div className="w-full bg-stone-900/90 backdrop-blur-md rounded-2xl border border-yellow-500/30 p-5 sm:p-7 shadow-2xl text-white">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-stone-950 shadow-md flex-shrink-0">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                {isCustomAudio ? 'School Recording Active' : 'Ceremonial Fanfare'}
              </span>
              <span className="text-[11px] text-stone-400">
                {isCustomAudio ? 'Developer Uploaded Track' : '44.1 kHz · Brass & Chimes'}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white font-heading truncate max-w-md">
              {isCustomAudio 
                ? (schoolInfo.anthem.audioFileName || 'Ghanata Anthem Recording') 
                : 'Ceremonial Fanfare & Anthem Prelude'}
            </h4>
          </div>
        </div>

        {/* Download Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-stone-950 font-heading font-bold text-xs shadow-lg hover:shadow-yellow-400/30 active:scale-95 transition-all cursor-pointer"
            title="Download anthem audio file"
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Audio</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Waveform Visualization */}
      <div className="py-4">
        <div className="flex items-center justify-between gap-1 h-14 px-2 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
          {barHeights.map((h, i) => {
            const progressRatio = currentTime / (duration || 12.5);
            const isPlayed = i / barHeights.length <= progressRatio;
            return (
              <div 
                key={i} 
                className="flex-1 h-full flex items-center justify-center cursor-pointer group"
                onClick={() => {
                  const targetSec = (i / barHeights.length) * (duration || 12.5);
                  if (audioRef.current) {
                    audioRef.current.currentTime = targetSec;
                    setCurrentTime(targetSec);
                  }
                }}
              >
                <div 
                  className={`w-full rounded-full transition-all duration-150 ${
                    isPlayed 
                      ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                      : 'bg-white/20 group-hover:bg-white/40'
                  } ${isPlaying && isPlayed ? 'animate-pulse' : ''}`}
                  style={{ 
                    height: `${isPlaying ? Math.max(15, (h * (0.6 + 0.4 * Math.sin(Date.now() / 200 + i)))) : h}%` 
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrub Bar & Time */}
      <div className="space-y-1 mb-4">
        <div className="relative">
          <input
            type="range"
            min={0}
            max={duration || 12.5}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          />
        </div>
        <div className="flex justify-between text-[11px] text-stone-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-stone-950 flex items-center justify-center shadow-lg hover:shadow-yellow-400/30 transition-all cursor-pointer"
            aria-label={isPlaying ? 'Pause Fanfare' : 'Play Fanfare'}
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-stone-950" /> : <Play className="w-6 h-6 fill-stone-950 translate-x-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="text-xs text-stone-300">
            <span className="font-semibold text-yellow-300">
              {isPlaying ? 'Now Playing' : 'Ready to Play'}
            </span>
            <span className="block text-[11px] text-stone-400">
              {isCustomAudio ? 'School audio recording' : 'Ceremonial brass, bells & cadence'}
            </span>
          </div>
        </div>

        {/* Volume & Audio Format Links */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-stone-400 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-400 pl-2 border-l border-white/10">
            <button
              onClick={handleDownload}
              className="hover:text-yellow-300 underline underline-offset-2 cursor-pointer"
            >
              <span>{isCustomAudio ? 'Audio File' : 'WAV'}</span>
            </button>
            {!isCustomAudio && (
              <>
                <span>·</span>
                <a 
                  href="/Ghanata Senior High School Anthem.mp3" 
                  download="Ghanata Senior High School Anthem.mp3"
                  className="hover:text-yellow-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <span>MP3</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Assembly Guidance Footnote */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>Sung during morning parade, Speech & Prize Giving Day, and Founders Day.</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-stone-500">
          <Info className="w-3 h-3" />
          <span>Click Download for offline school assemblies</span>
        </div>
      </div>
    </div>
  );
};
