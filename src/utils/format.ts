import { theme } from "../theme.js";

/**
 * Format a number as USD currency
 */
export function formatUsd(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$--";

  return "$" + num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a price with appropriate precision
 */
export function formatPrice(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "$--";

  if (num >= 1000) {
    return formatUsd(num, 2);
  } else if (num >= 1) {
    return formatUsd(num, 2);
  } else if (num >= 0.01) {
    return formatUsd(num, 4);
  } else {
    return "$" + num.toPrecision(4);
  }
}

/**
 * Format a percentage
 */
export function formatPercent(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "--%";

  const sign = num >= 0 ? "+" : "";
  return sign + (num * 100).toFixed(decimals) + "%";
}

/**
 * Format a size/quantity
 */
export function formatSize(value: number | string, decimals = 4): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "--";

  return num.toFixed(decimals);
}

/**
 * Shorten an address
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get color for a PnL value
 */
export function getPnlColor(value: number): string {
  if (value > 0) return theme.positive;
  if (value < 0) return theme.negative;
  return theme.neutral;
}

/**
 * Format PnL with color indicator
 */
export function formatPnl(value: number | string): { text: string; color: string } {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return { text: "$--", color: theme.neutral };

  const sign = num >= 0 ? "+" : "";
  return {
    text: sign + formatUsd(num),
    color: getPnlColor(num),
  };
}

/**
 * Create a simple text table
 */
export function createTable(
  headers: string[],
  rows: string[][],
  columnWidths?: number[]
): string {
  const widths = columnWidths || headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map(r => (r[i] || "").length));
    return Math.max(h.length, maxRowWidth);
  });

  const formatRow = (cells: string[]) =>
    cells.map((cell, i) => cell.padEnd(widths[i])).join("  ");

  const headerLine = formatRow(headers);
  const separator = widths.map(w => "─".repeat(w)).join("──");
  const dataLines = rows.map(formatRow);

  return [headerLine, separator, ...dataLines].join("\n");
}

/**
 * Format a timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2m ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
