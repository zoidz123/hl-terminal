import { z } from "zod";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";

const WalletSchema = z.object({
  name: z.string(),
  address: z.string(),
  privateKey: z.string().optional(),
});

export type Wallet = z.infer<typeof WalletSchema>;

const ConfigSchema = z.object({
  anthropicApiKey: z.string().min(1),
  wallets: z.array(WalletSchema).default([]),
  activeWallet: z.string().optional(), // name of active wallet
  // Legacy fields for backwards compatibility
  walletAddress: z.string().optional(),
  walletPrivateKey: z.string().optional(),
  network: z.enum(["mainnet"]).default("mainnet"),
});

export type Config = z.infer<typeof ConfigSchema>;

const CONFIG_DIR = path.join(os.homedir(), ".hl");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function configExists(): boolean {
  try {
    fs.accessSync(CONFIG_FILE);
    return true;
  } catch {
    return false;
  }
}

export function loadConfig(): Config | null {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return ConfigSchema.parse(parsed);
  } catch {
    return null;
  }
}

export function saveConfig(config: Config): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getEnvOverrides(): Partial<Config> {
  const overrides: Partial<Config> = {};

  if (process.env.ANTHROPIC_API_KEY) {
    overrides.anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  }
  if (process.env.HL_WALLET_ADDRESS) {
    overrides.walletAddress = process.env.HL_WALLET_ADDRESS;
  }

  return overrides;
}

export function getEffectiveConfig(): Config | null {
  const fileConfig = loadConfig();
  if (!fileConfig) return null;

  const envOverrides = getEnvOverrides();
  return { ...fileConfig, ...envOverrides };
}

export function getActiveWallet(config: Config): Wallet | null {
  if (!config.activeWallet || !config.wallets) return null;
  return config.wallets.find((w) => w.name === config.activeWallet) || null;
}
