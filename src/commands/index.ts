/**
 * Command entry point - routes slash commands to appropriate handlers
 */

import { parseCommand, isParseError } from './router.js';
import { executeMethod, type ExecutionResult } from './executor.js';
import { helpCommand } from './help.js';
import { configCommand } from './config.js';
import { walletCommand } from './wallet.js';
import type { Config } from '../config/index.js';

export { type ExecutionResult } from './executor.js';

export function isSlashCommand(input: string): boolean {
  return input.trim().startsWith('/');
}

export async function executeCommand(
  input: string,
  config: Config
): Promise<ExecutionResult> {
  const parsed = parseCommand(input);

  if (isParseError(parsed)) {
    let errorMsg = parsed.error;
    if (parsed.suggestion) {
      errorMsg += `\n${parsed.suggestion}`;
    }
    return { type: 'error', content: errorMsg };
  }

  // Handle special commands
  if (parsed.method === 'help') {
    const topic = parsed.params.topic as string | undefined;
    return { type: 'text', content: helpCommand(topic) };
  }

  if (parsed.method === 'config') {
    return { type: 'text', content: configCommand(config) };
  }

  if (parsed.method === 'wallet') {
    const args = parsed.params.args as string[] || [];
    const result = await walletCommand(args, config);
    return {
      type: 'text',
      content: result.message,
      configUpdated: result.configUpdated,
    };
  }

  // Execute SDK method
  return await executeMethod(parsed, config);
}
