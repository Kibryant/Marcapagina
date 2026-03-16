'use client';

import { cn } from '@marcapagina/shared';
import {
  CloudRain,
  Coffee,
  Library,
  Pause,
  Play,
  RotateCcw,
  Square,
  Timer as TimerIcon,
  Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ReadingTimerProps {
  onStop: (minutes: number) => void;
  className?: string;
}

export function ReadingTimer({ onStop, className }: ReadingTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const sounds = {
    rain: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg',
    cafe: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    library:
      'https://actions.google.com/sounds/v1/ambiences/office_ambience.ogg',
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  useEffect(() => {
    if (audioRef.current) {
      if (isActive && currentSound) {
        audioRef.current
          .play()
          .catch((e) => console.log('Audio play prevented:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isActive, currentSound]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleStop = () => {
    setIsActive(false);
    const minutes = Math.max(1, Math.round(seconds / 60));
    onStop(minutes);
  };
  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const toggleSound = (soundKey: string) => {
    if (currentSound === soundKey) {
      setCurrentSound(null);
    } else {
      setCurrentSound(soundKey);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2 text-primary">
        <TimerIcon className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wider">
          Timer de Leitura
        </span>
      </div>

      <div className="text-5xl font-mono font-bold tracking-tighter tabular-nums selection:bg-transparent">
        {formatTime(seconds)}
      </div>

      <div className="flex items-center gap-3">
        {!isActive ? (
          <Button
            onClick={handleStart}
            variant="default"
            size="lg"
            className="h-12 w-12 rounded-full p-0"
          >
            <Play className="h-6 w-6 fill-current" />
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            variant="outline"
            size="lg"
            className="h-12 w-12 rounded-full p-0 border-primary text-primary"
          >
            <Pause className="h-6 w-6 fill-current" />
          </Button>
        )}

        <Button
          onClick={handleStop}
          variant="outline"
          size="lg"
          disabled={seconds === 0}
          className="h-12 w-12 rounded-full p-0 border-danger/50 text-danger hover:bg-danger/10"
        >
          <Square className="h-5 w-5 fill-current" />
        </Button>

        <Button
          onClick={handleReset}
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {seconds > 0 && !isActive && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Pausado. Clique no quadrado para salvar{' '}
          {Math.max(1, Math.round(seconds / 60))} min.
        </p>
      )}

      {/* Ambient Sounds UI */}
      <div className="w-full pt-6 mt-2 border-t border-dashed space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Ambiente
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Volume2 className="h-3 w-3" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => toggleSound('rain')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300',
              currentSound === 'rain'
                ? 'bg-primary/10 border-primary text-primary shadow-inner'
                : 'bg-surface hover:border-primary/30 text-muted-foreground'
            )}
          >
            <CloudRain
              className={cn(
                'h-5 w-5',
                currentSound === 'rain' && 'animate-pulse'
              )}
            />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              Chuva
            </span>
          </button>

          <button
            onClick={() => toggleSound('cafe')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300',
              currentSound === 'cafe'
                ? 'bg-primary/10 border-primary text-primary shadow-inner'
                : 'bg-surface hover:border-primary/30 text-muted-foreground'
            )}
          >
            <Coffee
              className={cn(
                'h-5 w-5',
                currentSound === 'cafe' && 'animate-pulse'
              )}
            />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              Café
            </span>
          </button>

          <button
            onClick={() => toggleSound('library')}
            className={cn(
              'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-300',
              currentSound === 'library'
                ? 'bg-primary/10 border-primary text-primary shadow-inner'
                : 'bg-surface hover:border-primary/30 text-muted-foreground'
            )}
          >
            <Library
              className={cn(
                'h-5 w-5',
                currentSound === 'library' && 'animate-pulse'
              )}
            />
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              Foco
            </span>
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={
          currentSound ? sounds[currentSound as keyof typeof sounds] : undefined
        }
        loop
      />
    </div>
  );
}
