import React from 'react';

const COLUMNS = [
  { key: 'id',          label: 'ID',          width: 80,  pinnable: true },
  { key: 'date',        label: 'Date',         width: 110, pinnable: true },
  { key: 'merchant',    label: 'Merchant',     width: 160, pinnable: false },
  { key: 'category',    label: 'Category',     width: 140, pinnable: false },
  { key: 'amount',      label: 'Amount',       width: 110, pinnable: false },
  { key: 'status',      label: 'Status',       width: 110, pinnable: false },
  { key: 'description', label: 'Description',  width: 220, pinnable: false },
];

export { COLUMNS };

export function GridHeader({ sortKey, sortDir, pinnedColumns, onSort, onPinToggle }) {
  return (
    <div className="grid-header">
      {COLUMNS.map((col, colIndex) => {
        const isPinned = pinnedColumns.includes(col.key);
        const isSorted = sortKey === col.key;

        // Calculate left offset for pinned columns
        let leftOffset = 0;
        if (isPinned) {
          for (let i = 0; i < colIndex; i++) {
            if (pinnedColumns.includes(COLUMNS[i].key)) {
              leftOffset += COLUMNS[i].width;
            }
          }
        }

        return (
          <div
            key={col.key}
            data-test-id={`header-${col.key}`}
            className={`header-cell${isSorted ? ' sorted' : ''}${isPinned ? ' pinned-column' : ''}`}
            style={{
              width: col.width,
              minWidth: col.width,
              ...(isPinned ? { left: leftOffset } : {}),
            }}
            onClick={() => onSort(col.key)}
            title={`Sort by ${col.label}`}
          >
            <div className="header-cell-content">
              <span className="header-label">{col.label}</span>
              {isSorted && (
                <span className="sort-indicator">
                  {sortDir === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </div>

            {col.pinnable && (
              <button
                data-test-id={`pin-column-${col.key}`}
                className={`pin-btn${isPinned ? ' pinned' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinToggle(col.key);
                }}
                title={isPinned ? `Unpin ${col.label}` : `Pin ${col.label}`}
              >
                {isPinned ? '📌' : '📍'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
