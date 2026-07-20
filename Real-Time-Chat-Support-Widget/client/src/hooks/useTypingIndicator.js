import { useCallback, useRef } from 'react';
import { useChat } from '../context/ChatContext.jsx';

/**
 * Wraps the raw notifyTyping/notifyStopTyping socket calls with debounce
 * logic so we don't spam the server on every keystroke.
 */
export function useTypingIndicator() {
  const { notifyTyping, notifyStopTyping } = useChat();
  const timeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      notifyTyping();
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      notifyStopTyping();
    }, 1500);
  }, [notifyTyping, notifyStopTyping]);

  const handleStopTyping = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      notifyStopTyping();
    }
  }, [notifyStopTyping]);

  return { handleTyping, handleStopTyping };
}

export default useTypingIndicator;
