import { useEffect } from 'react';

type ToastListener = (message: string) => void;

// A single module-level subscriber, same pattern as services/api.ts's
// onSessionExpired - avoids pulling in a context/state library just to let
// any screen trigger a toast that's rendered once at the root layout.
let listener: ToastListener | null = null;

export function showToast(message: string) {
  listener?.(message);
}

export function useToastListener(callback: ToastListener) {
  useEffect(() => {
    listener = callback;
    return () => {
      if (listener === callback) listener = null;
    };
  }, [callback]);
}
