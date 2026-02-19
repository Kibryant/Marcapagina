"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Timer as TimerIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadingTimerProps {
  onStop: (minutes: number) => void;
  className?: string;
}

export function ReadingTimer({ onStop, className }: ReadingTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
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

  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-xl border bg-surface p-6 shadow-sm", className)}>
      <div className="flex items-center gap-2 text-primary">
        <TimerIcon className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-wider">Timer de Leitura</span>
      </div>

      <div className="text-5xl font-mono font-bold tracking-tighter tabular-nums selection:bg-transparent">
        {formatTime(seconds)}
      </div>

      <div className="flex items-center gap-3">
        {!isActive ? (
          <Button onClick={handleStart} variant="default" size="lg" className="h-12 w-12 rounded-full p-0">
            <Play className="h-6 w-6 fill-current" />
          </Button>
        ) : (
          <Button onClick={handlePause} variant="outline" size="lg" className="h-12 w-12 rounded-full p-0 border-primary text-primary">
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
          Pausado. Clique no quadrado para salvar {Math.max(1, Math.round(seconds / 60))} min.
        </p>
      )}
    </div>
  );
}
