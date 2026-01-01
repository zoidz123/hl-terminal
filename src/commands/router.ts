/**
 * Command parser for SDK-direct method calls.
 * Syntax: /<methodName> [param=value] [param=value]
 */

import { methods, methodNames } from './methods.js';

export interface ParsedCommand {
  method: string;
  params: Record<string, string | number | boolean | string[]>;
  raw: string;
}

export interface ParseError {
  error: string;
  suggestion?: string;
}

export type ParseResult = ParsedCommand | ParseError;

export function isParseError(result: ParseResult): result is ParseError {
  return 'error' in result;
}

/**
 * Parse a slash command into method name and parameters.
 *
 * Examples:
 *   /allMids                    -> { method: 'allMids', params: {} }
 *   /l2Book coin=ETH            -> { method: 'l2Book', params: { coin: 'ETH' } }
 *   /l2Book coin=ETH nSigFigs=5 -> { method: 'l2Book', params: { coin: 'ETH', nSigFigs: 5 } }
 */
export function parseCommand(input: string): ParseResult {
  const trimmed = input.trim();

  if (!trimmed.startsWith('/')) {
    return { error: 'Commands must start with /' };
  }

  const withoutSlash = trimmed.slice(1);
  const parts = withoutSlash.split(/\s+/);
  const methodName = parts[0];
  const paramParts = parts.slice(1);

  if (!methodName) {
    return { error: 'No command specified. Type /help for available commands.' };
  }

  // Check for special commands
  if (methodName === 'help' || methodName === 'h') {
    return { method: 'help', params: { topic: paramParts[0] || '' }, raw: input };
  }

  if (methodName === 'config' || methodName === 'cfg') {
    return { method: 'config', params: {}, raw: input };
  }

  if (methodName === 'wallet' || methodName === 'w') {
    return { method: 'wallet', params: { args: paramParts }, raw: input };
  }

  // Validate method name
  if (!methodNames.includes(methodName)) {
    // Try to find a close match
    const suggestion = findSimilarMethod(methodName);
    return {
      error: `Unknown method: ${methodName}`,
      suggestion: suggestion ? `Did you mean /${suggestion}?` : 'Type /help for available commands.',
    };
  }

  // Parse params
  const params: Record<string, string | number | boolean> = {};
  const methodMeta = methods[methodName];

  for (const part of paramParts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex === -1) {
      return { error: `Invalid parameter format: ${part}. Use param=value syntax.` };
    }

    const key = part.slice(0, eqIndex);
    const value = part.slice(eqIndex + 1);

    // Find param metadata
    const paramMeta = methodMeta.params.find((p) => p.name === key);
    if (!paramMeta) {
      const validParams = methodMeta.params.map((p) => p.name).join(', ');
      return {
        error: `Unknown parameter '${key}' for /${methodName}`,
        suggestion: validParams ? `Valid parameters: ${validParams}` : 'This method takes no parameters.',
      };
    }

    // Type coercion
    if (paramMeta.type === 'number') {
      const num = Number(value);
      if (isNaN(num)) {
        return { error: `Parameter '${key}' must be a number, got '${value}'` };
      }
      params[key] = num;
    } else if (paramMeta.type === 'boolean') {
      params[key] = value === 'true' || value === '1';
    } else {
      params[key] = value;
    }
  }

  // Check required params
  for (const paramMeta of methodMeta.params) {
    if (paramMeta.required && !(paramMeta.name in params) && !paramMeta.isUserAddress) {
      return {
        error: `Missing required parameter '${paramMeta.name}' for /${methodName}`,
        suggestion: `Usage: /${methodName} ${paramMeta.name}=<value>`,
      };
    }
  }

  return { method: methodName, params, raw: input };
}

/**
 * Simple fuzzy match to find similar method names
 */
function findSimilarMethod(input: string): string | null {
  const lower = input.toLowerCase();

  // Exact prefix match
  const prefixMatch = methodNames.find((m) => m.toLowerCase().startsWith(lower));
  if (prefixMatch) return prefixMatch;

  // Contains match
  const containsMatch = methodNames.find((m) => m.toLowerCase().includes(lower));
  if (containsMatch) return containsMatch;

  // Levenshtein distance would be better but this is good enough
  return null;
}

/**
 * Get example value for a parameter
 */
function getExampleValue(paramName: string, paramType: string): string {
  switch (paramName) {
    case 'coin':
      return 'BTC';
    case 'interval':
      return '1d';
    case 'startTime':
      // 30 days ago
      return String(Date.now() - 30 * 24 * 60 * 60 * 1000);
    case 'endTime':
      return String(Date.now());
    case 'nSigFigs':
      return '5';
    case 'vaultAddress':
      return '0x...';
    case 'user':
      return '0x...';
    case 'aggregateByTime':
      return 'true';
    default:
      if (paramType === 'number') return '0';
      if (paramType === 'boolean') return 'true';
      return `<${paramName}>`;
  }
}

/**
 * Generate usage string for a method with example values
 */
export function getMethodUsage(methodName: string): string {
  const meta = methods[methodName];
  if (!meta) return '';

  const requiredParams = meta.params
    .filter((p) => p.required && !p.isUserAddress)
    .map((p) => `${p.name}=${getExampleValue(p.name, p.type)}`)
    .join(' ');

  const optionalParams = meta.params
    .filter((p) => !p.required || p.isUserAddress)
    .map((p) => `[${p.name}]`)
    .join(' ');

  const allParams = [requiredParams, optionalParams].filter(Boolean).join(' ');

  return `/${methodName}${allParams ? ' ' + allParams : ''}`;
}
