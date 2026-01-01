/**
 * Help command - displays available methods organized by category
 */

import { methods, getMethodsBySubcategory, type MethodMeta, type MethodCategory } from './methods.js';
import { getMethodUsage } from './router.js';

export function helpCommand(topic?: string): string {
  // If a specific method is requested, show detailed help
  if (topic && methods[topic]) {
    return getMethodHelp(topic);
  }

  // Special help for wallet command
  if (topic === 'wallet') {
    return getWalletHelp();
  }

  // Otherwise show all methods by subcategory
  return getAllMethodsHelp();
}

function getWalletHelp(): string {
  return `# /wallet

Wallet management commands for storing and switching between wallets.

## Subcommands

  /wallet new <name>                Create a new wallet
  /wallet import <name> <key>       Import existing wallet from private key
  /wallet list                      List all configured wallets
  /wallet use <name>                Switch to a different wallet
  /wallet show                      Show active wallet details
  /wallet export <name>             Export wallet private key
  /wallet remove <name>             Remove a wallet

## Examples

  /wallet new trading               Create wallet named "trading"
  /wallet import main 0x...         Import wallet with private key
  /wallet use trading               Switch to "trading" wallet
  /wallet list                      Show all wallets

## Aliases

  /w             Short for /wallet
  new, create    Both create a new wallet
  list, ls       Both list wallets
  use, switch    Both switch active wallet
  show, active   Both show active wallet
  remove, rm     Both remove a wallet`;
}

function getAllMethodsHelp(): string {
  let output = '# Hyperliquid API Methods\n\n';
  output += 'Commands map 1:1 to SDK methods. Use: /<method> [param=value]\n';
  output += 'Type / and press Enter to browse methods interactively.\n\n';

  const grouped = getMethodsBySubcategory('info');

  for (const [subcategory, methods] of Object.entries(grouped)) {
    output += `## ${subcategory}\n\n`;
    for (const method of methods) {
      output += formatMethodLine(method);
    }
    output += '\n';
  }

  // System commands
  output += '## System\n\n';
  output += '  /help [method]  Show this help or help for a specific method\n';
  output += '  /config         Show current configuration\n';
  output += '  /wallet         Manage wallets (new, import, list, use, export, remove)\n';
  output += '\n';

  output += 'Type /help <method> for detailed info on a method.\n';
  output += 'Example: /help l2Book\n';

  return output;
}

function formatMethodLine(method: MethodMeta): string {
  const usage = getMethodUsage(method.name);
  const padding = Math.max(2, 45 - usage.length);
  return `  ${usage}${' '.repeat(padding)}${method.description}\n`;
}

function getMethodHelp(methodName: string): string {
  const method = methods[methodName];
  if (!method) {
    return `Unknown method: ${methodName}`;
  }

  let output = `# /${method.name}\n\n`;
  output += `${method.description}\n\n`;

  // Usage
  output += '## Usage\n\n';
  output += `  ${getMethodUsage(method.name)}\n\n`;

  // Parameters
  if (method.params.length > 0) {
    output += '## Parameters\n\n';
    for (const param of method.params) {
      const required = param.required && !param.isUserAddress ? '(required)' : '(optional)';
      output += `  ${param.name}: ${param.type} ${required}\n`;
      output += `    ${param.description}\n`;
      if (param.isUserAddress) {
        output += `    Uses configured wallet if not provided\n`;
      }
      output += '\n';
    }
  } else {
    output += '## Parameters\n\n  None\n\n';
  }

  // Example
  output += '## Example\n\n';
  output += `  ${generateExample(method)}\n\n`;

  // Return Type
  output += '## Return Type\n\n';
  output += `  ${method.returnType}\n\n`;

  // Docs
  output += '## Documentation\n\n';
  output += `  ${method.docsUrl}\n`;

  return output;
}

function generateExample(method: MethodMeta): string {
  const parts = [`/${method.name}`];

  for (const param of method.params) {
    if (param.required && !param.isUserAddress) {
      let exampleValue = '';
      if (param.name === 'coin') {
        exampleValue = 'ETH';
      } else if (param.name === 'interval') {
        exampleValue = '1h';
      } else if (param.name === 'startTime') {
        exampleValue = String(Date.now() - 24 * 60 * 60 * 1000);
      } else if (param.name === 'vaultAddress') {
        exampleValue = '0x...';
      } else if (param.type === 'string') {
        exampleValue = `<${param.name}>`;
      } else if (param.type === 'number') {
        exampleValue = '0';
      } else {
        exampleValue = 'true';
      }
      parts.push(`${param.name}=${exampleValue}`);
    }
  }

  return parts.join(' ');
}
