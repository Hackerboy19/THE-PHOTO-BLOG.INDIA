import { useEffect, useRef } from 'react';
import { AudioSynth } from '../components/ClientDashboard';

/**
 * Custom React hook to play a subtle camera shutter sound when dependencies change, 
 * or provide a manual trigger function.
 */
export function useShutterSound(triggerValue?: any) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Avoid playing sound on the initial mount unless desirable.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (triggerValue !== undefined) {
      AudioSynth.playShutter();
    }
  }, [triggerValue]);

  const playManual = () => {
    AudioSynth.playShutter();
  };

  return playManual;
}
