/**
 * Truncates arrays in data structures for display purposes.
 * Keeps the shape visible while limiting verbosity.
 */

export interface TruncateOptions {
  maxArrayItems?: number;
  maxDepth?: number;
}

interface TruncatedArray {
  items: unknown[];
  truncated: number;
  total: number;
}

const TRUNCATED_MARKER = Symbol('truncated');

export function truncateForDisplay(
  data: unknown,
  options: TruncateOptions = {}
): unknown {
  const { maxArrayItems = 5, maxDepth = 10 } = options;

  function truncate(value: unknown, depth: number): unknown {
    if (depth > maxDepth) {
      return '[max depth reached]';
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      const total = value.length;
      if (total <= maxArrayItems) {
        return value.map((item) => truncate(item, depth + 1));
      }

      // Truncate the array
      const truncatedItems = value
        .slice(0, maxArrayItems)
        .map((item) => truncate(item, depth + 1));

      // Return with metadata for display
      return {
        [TRUNCATED_MARKER]: true,
        items: truncatedItems,
        truncated: total - maxArrayItems,
        total,
      } as TruncatedArray;
    }

    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = truncate(val, depth + 1);
      }
      return result;
    }

    return value;
  }

  return truncate(data, 0);
}

/**
 * Converts truncated data to a display-friendly JSON string
 */
export function truncatedToJson(data: unknown, indent = 2): string {
  function replacer(key: string, value: unknown): unknown {
    if (
      value &&
      typeof value === 'object' &&
      TRUNCATED_MARKER in (value as Record<symbol, unknown>)
    ) {
      const { items, truncated, total } = value as TruncatedArray;
      // Create a special representation
      return [...items, `... ${truncated} more (${total} total)`];
    }
    return value;
  }

  return JSON.stringify(data, replacer, indent);
}

/**
 * Combined helper: truncate and stringify
 */
export function formatTruncatedJson(
  data: unknown,
  options: TruncateOptions = {}
): string {
  const truncated = truncateForDisplay(data, options);
  return truncatedToJson(truncated);
}
