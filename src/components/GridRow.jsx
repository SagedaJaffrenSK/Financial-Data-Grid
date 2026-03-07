import React, { useState, useCallback } from 'react';
import { COLUMNS } from './GridHeader.jsx';
import { formatAmount, formatDate } from '../utils/dataUtils.js';

function StatusBadge({ status }) {
  const cls =
    status === 'Completed'
      ? 'status-completed'
      : status === 'Pending'
      ? 'status-pending'
      : 'status-failed';
  return <span className={`status-badge ${cls}`}>{status}</span>;
}

function EditableCell({ value, onSave, testId, isPinned, colKey, width, leftOffset }) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(value);

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    setEditing(true);
    setEditVal(value);
  }, [value]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    onSave(editVal);
  }, [editVal, onSave]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditVal(value);
    }
  }, [value]);

  return (
    <div
      data-test-id={testId}
      className={`grid-cell${isPinned ? ' pinned-column' : ''}`}
      style={{
        width,
        minWidth: width,
        ...(isPinned ? { left: leftOffset } : {}),
      }}
      onDoubleClick={handleDoubleClick}
      title={typeof value === 'string' ? value : undefined}
    >
      {editing ? (
        <input
          className="cell-edit-input"
          autoFocus
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      ) : colKey === 'status' ? (
        <StatusBadge status={value} />
      ) : colKey === 'amount' ? (
        <span className={value > 5000 ? 'amount-large' : 'amount-positive'}>
          {formatAmount(value)}
        </span>
      ) : colKey === 'date' ? (
        formatDate(value)
      ) : (
        String(value ?? '')
      )}
    </div>
  );
}

export const GridRow = React.memo(function GridRow({
  row,
  rowIndex,
  isSelected,
  pinnedColumns,
  onRowClick,
  onCellSave,
}) {
  const handleClick = useCallback(
    (e) => onRowClick(row, rowIndex, e),
    [row, rowIndex, onRowClick]
  );

  // Compute pinned left offsets
  const pinnedOffsets = {};
  let offset = 0;
  for (const col of COLUMNS) {
    if (pinnedColumns.includes(col.key)) {
      pinnedOffsets[col.key] = offset;
      offset += col.width;
    }
  }

  return (
    <div
      data-test-id={`virtual-row-${row.id}`}
      data-selected={isSelected ? 'true' : undefined}
      className="grid-row"
      onClick={handleClick}
      style={{ height: 40 }}
    >
      {COLUMNS.map((col) => {
        const isPinned = pinnedColumns.includes(col.key);
        return (
          <EditableCell
            key={col.key}
            testId={`cell-${rowIndex}-${col.key}`}
            value={row[col.key]}
            colKey={col.key}
            width={col.width}
            isPinned={isPinned}
            leftOffset={pinnedOffsets[col.key] ?? 0}
            onSave={(newVal) => onCellSave(row.id, col.key, newVal)}
          />
        );
      })}
    </div>
  );
});