import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GridRow } from './GridRow.jsx';
import { useVirtualScroll } from '../hooks/useVirtualScroll.js';

const ROW_HEIGHT = 40;

export function VirtualGrid({
  data,
  totalRows,
  pinnedColumns,
  selectedRows,
  onRowClick,
  onCellSave,
  onRenderedRowsChange,
  onScrollPositionChange,
}) {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(600);

  const {
    scrollTop,
    totalHeight,
    firstVisibleRow,
    getVisibleRange,
    handleScroll,
  } = useVirtualScroll(totalRows);

  // Measure container height on mount and resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);

    return () => ro.disconnect();
  }, []);

  // Report metrics to parent
  const { startIndex, endIndex } = getVisibleRange(scrollTop, containerHeight);
  const visibleData = data.slice(startIndex, endIndex + 1);
  const renderedCount = visibleData.length;
  const translateY = startIndex * ROW_HEIGHT;

  useEffect(() => {
    onRenderedRowsChange?.(renderedCount);
  }, [renderedCount, onRenderedRowsChange]);

  useEffect(() => {
    onScrollPositionChange?.(firstVisibleRow);
  }, [firstVisibleRow, onScrollPositionChange]);

  const handleScrollEvent = useCallback(
    (e) => {
      handleScroll(e);
    },
    [handleScroll]
  );

  return (
    <div
      ref={containerRef}
      data-test-id="grid-scroll-container"
      className="grid-scroll-container"
      onScroll={handleScrollEvent}
    >
      {/* Sizer: creates correct scrollbar height */}
      <div
        className="grid-sizer"
        style={{ height: totalHeight }}
        aria-hidden="true"
      />

      {/* Window: contains only rendered rows, GPU-positioned */}
      <div
        data-test-id="grid-row-window"
        className="grid-row-window"
        style={{
          transform: `translateY(${translateY}px)`,
          willChange: 'transform',
        }}
      >
        {visibleData.map((row, localIndex) => {
          const absoluteIndex = startIndex + localIndex;
          return (
            <GridRow
              key={row.id}
              row={row}
              rowIndex={absoluteIndex}
              isSelected={selectedRows.has(row.id)}
              pinnedColumns={pinnedColumns}
              onRowClick={onRowClick}
              onCellSave={onCellSave}
            />
          );
        })}
      </div>
    </div>
  );
}