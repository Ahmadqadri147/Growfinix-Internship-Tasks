import { useEffect, useRef, useState } from 'react';

/**
 * Keeps a scrollable container pinned to the bottom as new content arrives,
 * unless the user has manually scrolled up to read history - in that case
 * we surface a "new messages" affordance instead of yanking their scroll.
 */
export function useAutoScroll(dependencyList = []) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    function handleScroll() {
      const threshold = 80;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsAtBottom(atBottom);
    }

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      const el = containerRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencyList);

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setIsAtBottom(true);
  };

  return { containerRef, bottomRef, isAtBottom, scrollToBottom };
}

export default useAutoScroll;
