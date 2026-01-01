import { highlight } from 'cli-highlight';

/**
 * Formats and syntax-highlights code for terminal display
 */
export function formatCode(code: string, language: string = 'typescript'): string {
  try {
    return highlight(code, { language, ignoreIllegals: true });
  } catch {
    return code;
  }
}

/**
 * Generates SDK usage snippet for a method call
 */
export function generateSdkSnippet(
  methodName: string,
  params: Record<string, unknown>
): string {
  const hasParams = Object.keys(params).length > 0;

  if (!hasParams) {
    return `const response = await infoClient.${methodName}();`;
  }

  // Format params as object literal
  const paramEntries = Object.entries(params)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `  ${key}: "${value}"`;
      }
      return `  ${key}: ${value}`;
    })
    .join(',\n');

  return `const response = await infoClient.${methodName}({
${paramEntries}
});`;
}
