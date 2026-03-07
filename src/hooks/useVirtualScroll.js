import { useState, useCallback, useRef } from 'react';

const ROW_HEIGHT = 40;
const BUFFER_ROWS = 15;

export function useVirtualScroll(totalRows) {
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef(null);
  const scrollRef = useRef(null);

  // Calculate which rows should be rendered
  const getVisibleRange = useCallback(
    (currentScrollTop, containerHeight) => {
      const start = Math.floor(currentScrollTop / ROW_HEIGHT);
      const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);

      const startIndex = Math.max(0, start - BUFFER_ROWS);
      const endIndex = Math.min(totalRows - 1, start + visibleCount + BUFFER_ROWS);

      return { startIndex, endIndex };
    },
    [totalRows]
  );

  const handleScroll = useCallback((e) => {
    const newScrollTop = e.currentTarget.scrollTop;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(newScrollTop);
    });
  }, []);

  const totalHeight = totalRows * ROW_HEIGHT;

  const firstVisibleRow = Math.floor(scrollTop / ROW_HEIGHT);

  return {
    scrollTop,
    totalHeight,
    ROW_HEIGHT,
    firstVisibleRow,
    getVisibleRange,
    handleScroll,
    scrollRef,
  };
}
