import React, { useState } from 'react';
import { useFPS } from '../hooks/useFPS';

export function DebugPanel({ renderedRows, firstVisibleRow, totalRows }) {
  const fps = useFPS();
  const [minimized, setMinimized] = useState(false);

  const fpsClass =
    fps >= 55 ? 'fps-good' : fps >= 30 ? 'fps-ok' : 'fps-bad';

  if (minimized) {
    return (
      <button
        className="debug-toggle"
        onClick={() => setMinimized(false)}
        title="Show Debug Panel"
      >
        ⚡
      </button>
    );
  }

  return (
    <div data-test-id="debug-panel" className="debug-panel">
      <div className="debug-panel-header">
        <span className="debug-panel-title">⚡ Debug</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="debug-status-dot" />
          <button
            onClick={() => setMinimized(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1,
              padding: '0 2px',
            }}
            title="Minimize"
          >
            ×
          </button>
        </div>
      </div>

      {/* FPS */}
      <div className="debug-metric">
        <span className="debug-label">FPS</span>
        <span
          data-test-id="debug-fps"
          className={`debug-value debug-fps-value ${fpsClass}`}
        >
          {fps}
        </span>
      </div>

      {/* Rendered Rows */}
      <div className="debug-metric">
        <span className="debug-label">DOM Rows</span>
        <span data-test-id="debug-rendered-rows" className="debug-value">
          {renderedRows}
        </span>
      </div>

      {/* Scroll Position */}
      <div className="debug-metric">
        <span className="debug-label">Position</span>
        <span data-test-id="debug-scroll-position" className="debug-value" style={{ fontSize: '10px' }}>
          Row {firstVisibleRow.toLocaleString()} / {totalRows.toLocaleString()}
        </span>
      </div>

      {/* Total Rows */}
      <div className="debug-metric">
        <span className="debug-label">Total Rows</span>
        <span className="debug-value" style={{ fontSize: '11px', color: 'var(--accent-primary)' }}>
          {totalRows.toLocaleString()}
        </span>
      </div>

      {/* Memory estimate */}
      <div className="debug-metric">
        <span className="debug-label">Efficiency</span>
        <span
          className="debug-value"
          style={{ fontSize: '10px', color: 'var(--accent-green)' }}
        >
          {renderedRows} / {totalRows.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
