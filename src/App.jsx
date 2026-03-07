import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { VirtualGrid } from './components/VirtualGrid.jsx';
import { GridHeader } from './components/GridHeader.jsx';
import { DebugPanel } from './components/DebugPanel.jsx';
import { useDebounce } from './hooks/useDebounce.js';
import { sortData, applyFilters } from './utils/dataUtils.js';

const STATUSES = ['Completed', 'Pending', 'Failed'];

export default function App() {
  // ── Raw data & loading ──────────────────────────────────────────
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadProgress, setLoadProgress] = useState('Initializing...');

  // ── Sort ────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // ── Filter ──────────────────────────────────────────────────────
  const [merchantInput, setMerchantInput] = useState('');
  const [merchantFilter, setMerchantFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);

  // ── Selection ───────────────────────────────────────────────────
  const [selectedRows, setSelectedRows] = useState(new Set());

  // ── Pinned columns ──────────────────────────────────────────────
  const [pinnedColumns, setPinnedColumns] = useState([]);

  // ── Debug metrics ────────────────────────────────────────────────
  const [renderedRows, setRenderedRows] = useState(0);
  const [firstVisibleRow, setFirstVisibleRow] = useState(0);

  // ── Load data ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoadProgress('Fetching transactions.json...');
        const response = await fetch('/transactions.json');

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: ${response.statusText}. ` +
            `Run "npm run generate-data" first.`
          );
        }

        setLoadProgress('Parsing 1,000,000 rows...');
        const json = await response.json();

        if (!cancelled) {
          setLoadProgress('Preparing grid...');
          // Small delay to let the UI paint the progress message
          await new Promise((r) => setTimeout(r, 60));
          setRawData(json);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message);
          setLoading(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // ── Derived: sorted + filtered data ─────────────────────────────
  const processedData = useMemo(() => {
    let data = rawData;

    // Apply filters first (reduces dataset for sort)
    data = applyFilters(data, { merchantFilter, statusFilter });

    // Then sort
    if (sortKey) {
      data = sortData(data, sortKey, sortDir);
    }

    return data;
  }, [rawData, merchantFilter, statusFilter, sortKey, sortDir]);

  // ── Debounced merchant filter ────────────────────────────────────
  const applyMerchantFilter = useCallback(
    (value) => setMerchantFilter(value),
    []
  );
  const debouncedFilter = useDebounce(applyMerchantFilter, 300);

  const handleMerchantInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setMerchantInput(val);
      debouncedFilter(val);
    },
    [debouncedFilter]
  );

  // ── Sort handler ────────────────────────────────────────────────
  const handleSort = useCallback(
    (key) => {
      setSortKey((prev) => {
        if (prev === key) {
          setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
          return key;
        }
        setSortDir('asc');
        return key;
      });
    },
    []
  );

  // ── Pin toggle ───────────────────────────────────────────────────
  const handlePinToggle = useCallback((key) => {
    setPinnedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  // ── Row selection ────────────────────────────────────────────────
  const handleRowClick = useCallback((row, rowIndex, e) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    setSelectedRows((prev) => {
      const next = new Set(isCtrl ? prev : []);
      if (prev.has(row.id) && isCtrl) {
        next.delete(row.id);
      } else {
        next.add(row.id);
      }
      return next;
    });
  }, []);

  // ── Cell save ────────────────────────────────────────────────────
  const handleCellSave = useCallback((rowId, colKey, newVal) => {
    setRawData((prev) =>
      prev.map((r) =>
        r.id === rowId ? { ...r, [colKey]: newVal } : r
      )
    );
  }, []);

  // ── Clear all filters ────────────────────────────────────────────
  const handleClearFilters = useCallback(() => {
    setMerchantInput('');
    setMerchantFilter('');
    setStatusFilter(null);
  }, []);

  // ── Quick status filter toggle ───────────────────────────────────
  const handleStatusFilter = useCallback((status) => {
    setStatusFilter((prev) => (prev === status ? null : status));
  }, []);

  // ── Render: Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">◈ FinGrid</div>
        <div className="loading-bar-wrapper">
          <div className="loading-bar" />
        </div>
        <div className="loading-text">{loadProgress}</div>
        <div className="loading-sub">Loading 1,000,000 financial records</div>
      </div>
    );
  }

  // ── Render: Error ────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="error-screen">
        <div className="error-code">ERR</div>
        <div className="error-message">{loadError}</div>
        <div className="error-hint">
          Run: <strong>npm run generate-data</strong> then refresh.
        </div>
      </div>
    );
  }

  const totalFiltered = processedData.length;
  const totalRaw = rawData.length;
  const hasActiveFilter = merchantFilter || statusFilter;

  // ── Render: App ──────────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      {/* ── Top Bar ──────────────────────────────────────────── */}
      <header className="top-bar">
        <div className="top-bar-logo">FinGrid</div>
        <div className="top-bar-divider" />
        <div className="top-bar-stats">
          <div className="stat-item">
            <span>Dataset:</span>
            <span className="stat-value">{totalRaw.toLocaleString()} rows</span>
          </div>
          <div className="stat-item">
            <span>Visible:</span>
            <span className="stat-value">{totalFiltered.toLocaleString()}</span>
          </div>
          {selectedRows.size > 0 && (
            <div className="selected-count-badge">
              {selectedRows.size} selected
            </div>
          )}
        </div>
        <div className="top-bar-spacer" />
      </header>

      {/* ── Filter Toolbar ────────────────────────────────────── */}
      <div className="filter-toolbar">
        {/* Merchant filter */}
        <div className="filter-input-wrapper">
          <span className="filter-icon">🔍</span>
          <input
            data-test-id="filter-merchant"
            className="filter-input"
            type="text"
            placeholder="Filter by merchant..."
            value={merchantInput}
            onChange={handleMerchantInputChange}
          />
        </div>

        {/* Filter count */}
        <div data-test-id="filter-count" className="filter-count">
          Showing{' '}
          <strong>{totalFiltered.toLocaleString()}</strong>{' '}
          of {totalRaw.toLocaleString()} rows
        </div>

        <div className="top-bar-divider" />
        <span className="quick-filters-label">Status:</span>

        {/* Quick status filters */}
        {STATUSES.map((s) => (
          <button
            key={s}
            data-test-id={`quick-filter-${s}`}
            className={`quick-filter-btn status-${s.toLowerCase()}${statusFilter === s ? ' active' : ''}`}
            onClick={() => handleStatusFilter(s)}
          >
            {s}
          </button>
        ))}

        {/* Clear filters */}
        {hasActiveFilter && (
          <button className="btn-clear" onClick={handleClearFilters}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Grid ──────────────────────────────────────────────── */}
      <div className="grid-wrapper">
        <GridHeader
          sortKey={sortKey}
          sortDir={sortDir}
          pinnedColumns={pinnedColumns}
          onSort={handleSort}
          onPinToggle={handlePinToggle}
        />

        <VirtualGrid
          data={processedData}
          totalRows={totalFiltered}
          pinnedColumns={pinnedColumns}
          selectedRows={selectedRows}
          onRowClick={handleRowClick}
          onCellSave={handleCellSave}
          onRenderedRowsChange={setRenderedRows}
          onScrollPositionChange={setFirstVisibleRow}
        />
      </div>

      {/* ── Debug Panel ───────────────────────────────────────── */}
      <DebugPanel
        renderedRows={renderedRows}
        firstVisibleRow={firstVisibleRow}
        totalRows={totalFiltered}
      />
    </div>
  );
}