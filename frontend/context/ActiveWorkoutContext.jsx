import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  startSession,
  completeSet,
  finishWorkout as finishWorkoutApi,
  skipWorkout as skipWorkoutApi,
  updateSession as updateSessionApi
} from '../services/workoutService';

const ActiveWorkoutContext = createContext(null);

const CHEATING_WARNINGS = [
  "If you want to achieve your goal, don't be lazy and do it!",
  "You chose this workout, so you have to complete it!",
  "If you have taken an initiative, complete it. Be brave!",
  "Real strength takes time. Do not skip set durations!",
  "Winners build habits, losers look for shortcuts. Complete the set!"
];

export function ActiveWorkoutProvider({ children }) {
  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('fitai_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [secondsElapsed, setSecondsElapsed] = useState(() => {
    const savedSecs = localStorage.getItem('fitai_active_secs');
    return savedSecs ? parseInt(savedSecs, 10) : 0;
  });

  // Rest Timer States (Feature 4)
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restTimeTotal, setRestTimeTotal] = useState(60);
  const [restActive, setRestActive] = useState(false);

  // Summary Celebration Modal (Feature 14)
  const [summaryData, setSummaryData] = useState(null);

  // Anti-cheating cooldown states
  const [cheatingWarning, setCheatingWarning] = useState('');
  const [lastCheckedTime, setLastCheckedTime] = useState(0);

  const timerRef = useRef(null);
  const restTimerRef = useRef(null);

  const [isPaused, setIsPaused] = useState(() => {
    return localStorage.getItem('fitai_active_paused') === 'true';
  });

  // Sync activeSession to localStorage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('fitai_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('fitai_active_session');
      localStorage.removeItem('fitai_active_secs');
      localStorage.removeItem('fitai_active_paused');
      setSecondsElapsed(0);
      setIsPaused(false);
    }
  }, [activeSession]);

  // Sync isPaused to localStorage
  useEffect(() => {
    localStorage.setItem('fitai_active_paused', isPaused.toString());
  }, [isPaused]);

  // Sync seconds elapsed to localStorage periodically
  useEffect(() => {
    if (activeSession && secondsElapsed > 0) {
      localStorage.setItem('fitai_active_secs', secondsElapsed.toString());
    }
  }, [secondsElapsed, activeSession]);

  // Active workout timer tick
  useEffect(() => {
    if (activeSession && activeSession.status === 'in_progress' && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession, isPaused]);

  // Rest timer tick (Feature 4)
  useEffect(() => {
    if (restActive && restTimeLeft > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            playRestTimerChime();
            setRestActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [restActive, restTimeLeft]);

  // Synthetic retro chime beep using Web Audio API (Feature 4)
  const playRestTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Simple double high beep chime
      const playBeep = (time, freq, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + duration);
      };
      
      playBeep(ctx.currentTime, 880, 0.25);
      playBeep(ctx.currentTime + 0.15, 1200, 0.4);
    } catch (e) {
      console.warn('AudioContext failed:', e);
    }
  };

  // Start Workout Session
  const startWorkout = async (exercise, sets, reps, weight) => {
    try {
      const res = await startSession({ exercise, sets, reps, weight });
      setActiveSession(res.data);
      setSecondsElapsed(0);
      setIsPaused(false);
      toast.success(`Workout session started: ${exercise}! 💪`);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session');
      return false;
    }
  };

  // Toggle Set Checklist Checkbox (Feature 2)
  const toggleSet = async (setIndex, checked) => {
    if (!activeSession) return;

    if (checked) {
      const now = Date.now();
      const elapsed = now - lastCheckedTime;
      if (lastCheckedTime > 0 && elapsed < 15000) { // 15s cooldown threshold
        const randomQuote = CHEATING_WARNINGS[Math.floor(Math.random() * CHEATING_WARNINGS.length)];
        setCheatingWarning(randomQuote);
        toast.error("Don't shortcut! Take time to finish your actual set. ⚠️");
        return;
      }
      setLastCheckedTime(now);
      setCheatingWarning('');
    }

    try {
      const res = await completeSet({
        session_id: activeSession._id,
        set_index: setIndex,
        checked,
      });
      setActiveSession(res.data);

      // Auto start rest timer on checking a set (Feature 4)
      if (checked) {
        let duration = 60; // Default
        const ex = activeSession.exercise.toLowerCase();
        if (ex.includes('squat') || ex.includes('deadlift') || ex.includes('legs')) {
          duration = 90; // Heavy lift default
        } else if (ex.includes('run') || ex.includes('cardio') || ex.includes('cycle')) {
          duration = 30; // Cardio brief rest
        }
        startRestTimer(duration);
      }
    } catch (err) {
      toast.error('Failed to update set status');
    }
  };

  // Start Rest Timer
  const startRestTimer = (secs) => {
    setRestTimeTotal(secs);
    setRestTimeLeft(secs);
    setRestActive(true);
    toast.success(`Rest timer started: ${secs}s ⏳`);
  };

  // Skip Rest
  const skipRest = () => {
    setRestActive(false);
    setRestTimeLeft(0);
    toast.success('Rest skipped. Back to work! ⚡');
  };

  // Finish Active Workout (Feature 1, 14)
  const finishActiveWorkout = async (actualWeight, actualReps) => {
    if (!activeSession) return;
    try {
      const res = await finishWorkoutApi({
        session_id: activeSession._id,
        duration: secondsElapsed,
        weight: actualWeight,
        reps: actualReps,
      });

      // Clear session
      setActiveSession(null);
      setRestActive(false);
      setRestTimeLeft(0);

      // Set summary data to display final celebration screen
      setSummaryData({
        exercise: activeSession.exercise,
        sets: activeSession.sets,
        duration: secondsElapsed,
        ...res.data,
      });

      toast.success('Congratulations! Workout completed successfully! 🎉');
      return true;
    } catch (err) {
      toast.error('Failed to finish workout session');
      return false;
    }
  };

  // Skip Active Workout (Feature 1)
  const skipActiveWorkout = async () => {
    if (!activeSession) return;
    try {
      await skipWorkoutApi({ exercise: activeSession.exercise });
      setActiveSession(null);
      setRestActive(false);
      setRestTimeLeft(0);
      toast.success('Workout skipped. We will crush the next one! 👍');
    } catch (err) {
      setActiveSession(null);
    }
  };

  // Update Active Session mid-workout (weight/reps)
  const updateActiveSession = async (weight, reps) => {
    if (!activeSession) return;
    try {
      const res = await updateSessionApi({
        session_id: activeSession._id,
        weight,
        reps,
      });
      setActiveSession(res.data);
      toast.success('Workout settings updated! 💪');
      return true;
    } catch (err) {
      toast.error('Failed to update workout settings');
      return false;
    }
  };

  return (
    <ActiveWorkoutContext.Provider
      value={{
        activeSession,
        secondsElapsed,
        isPaused,
        setIsPaused,
        restTimeLeft,
        restTimeTotal,
        restActive,
        summaryData,
        setSummaryData,
        cheatingWarning,
        startWorkout,
        toggleSet,
        startRestTimer,
        setRestTimeLeft,
        setRestActive,
        skipRest,
        finishActiveWorkout,
        skipActiveWorkout,
        updateActiveSession,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error('useActiveWorkout must be used within ActiveWorkoutProvider');
  }
  return context;
}
