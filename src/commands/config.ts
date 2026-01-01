import { getConfigPath } from "../config/index.js";
import type { Config } from "../config/index.js";

export function configCommand(config: Config): string {
  const maskedKey = config.anthropicApiKey
    ? `${config.anthropicApiKey.slice(0, 10)}...${config.anthropicApiKey.slice(-4)}`
    : "(not set)";

  const wallet = config.walletAddress
    ? `${config.walletAddress.slice(0, 8)}...${config.walletAddress.slice(-6)}`
    : "(not set)";

  let output = "Configuration\n\n";
  output += `Config file:     ${getConfigPath()}\n`;
  output += `API Key:         ${maskedKey}\n`;
  output += `Wallet:          ${wallet}\n`;
  output += `Network:         ${config.network}\n`;

  return output;
}
