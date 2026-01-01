import { highlight } from 'cli-highlight';
import { formatTruncatedJson, type TruncateOptions } from './truncate.js';

/**
 * Formats and syntax-highlights JSON for terminal display
 */
export function formatJson(
  data: unknown,
  options: TruncateOptions = {}
): string {
  const jsonString = formatTruncatedJson(data, options);

  try {
    return highlight(jsonString, { language: 'json', ignoreIllegals: true });
  } catch {
    return jsonString;
  }
}
