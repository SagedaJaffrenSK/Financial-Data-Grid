/**
 * Sort dataset by a given key.
 * Returns a new array (shallow copy) sorted by key.
 */
export function sortData(data, key, direction) {
  if (!key) return data;

  return [...data].sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    // Numeric comparison
    if (typeof valA === 'number' && typeof valB === 'number') {
      return direction === 'asc' ? valA - valB : valB - valA;
    }

    // Date comparison
    if (key === 'date') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
      return direction === 'asc' ? valA - valB : valB - valA;
    }

    // String comparison
    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filter data by merchant text (case-insensitive substring match).
 */
export function filterByMerchant(data, text) {
  if (!text || text.trim() === '') return data;
  const lower = text.toLowerCase().trim();
  return data.filter((row) => row.merchant.toLowerCase().includes(lower));
}

/**
 * Filter data by status value.
 */
export function filterByStatus(data, status) {
  if (!status) return data;
  return data.filter((row) => row.status === status);
}

/**
 * Apply all active filters to the base dataset.
 */
export function applyFilters(baseData, { merchantFilter, statusFilter }) {
  let result = baseData;

  if (statusFilter) {
    result = filterByStatus(result, statusFilter);
  }

  if (merchantFilter && merchantFilter.trim() !== '') {
    result = filterByMerchant(result, merchantFilter);
  }

  return result;
}

/**
 * Format a number as a currency string.
 */
export function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string to a short readable format.
 */
export function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return isoString;
  }
}
