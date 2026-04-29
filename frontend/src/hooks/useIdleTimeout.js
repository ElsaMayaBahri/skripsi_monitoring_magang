import { useEffect, useRef, useCallback, useState } from "react";

const useIdleTimeout = ({
  idleMinutes = 30,
  warningMinutes = 5,
  onLogout,
  enabled = true,
} = {}) => {
  const IDLE_MS    = idleMinutes    * 60 * 1000;
  const WARNING_MS = warningMinutes * 60 * 1000;

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown]     = useState(warningMinutes * 60);

  const idleTimerRef         = useRef(null);
  const warningTimerRef      = useRef(null);
  const countdownIntervalRef = useRef(null);

  const clearAllTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearTimeout(warningTimerRef.current);
    clearInterval(countdownIntervalRef.current);
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(warningMinutes * 60);
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(countdownIntervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [warningMinutes]);

  const startTimers = useCallback(() => {
    if (!enabled) return;
    clearAllTimers();
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      startCountdown();
    }, IDLE_MS - WARNING_MS);
    idleTimerRef.current = setTimeout(() => {
      setShowWarning(false);
      clearAllTimers();
      if (typeof onLogout === "function") onLogout();
    }, IDLE_MS);
  }, [enabled, IDLE_MS, WARNING_MS, clearAllTimers, startCountdown, onLogout]);

  const resetTimer = useCallback(() => {
    if (!showWarning) startTimers();
  }, [showWarning, startTimers]);

  const continueSession = useCallback(() => {
    setShowWarning(false);
    clearAllTimers();
    startTimers();
  }, [clearAllTimers, startTimers]);

  useEffect(() => {
    if (!enabled) { clearAllTimers(); setShowWarning(false); return; }
    const events = ["mousemove","mousedown","keydown","touchstart","scroll","click","wheel"];
    const handleActivity = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    startTimers();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearAllTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, showWarning]);

  const formatCountdown = () => {
    const m = Math.floor(countdown / 60).toString().padStart(2, "0");
    const s = (countdown % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return { showWarning, countdown, formatCountdown, continueSession };
};

export default useIdleTimeout;