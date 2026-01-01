/**
 * Wallet management commands
 */

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
  loadConfig,
  saveConfig,
  getActiveWallet,
  type Config,
  type Wallet,
} from "../config/index.js";

interface WalletCommandResult {
  message: string;
  configUpdated?: boolean;
}

export async function walletCommand(
  args: string[],
  config: Config
): Promise<WalletCommandResult> {
  const subcommand = args[0]?.toLowerCase();

  switch (subcommand) {
    case "new":
    case "create":
      return createWallet(args.slice(1), config);

    case "list":
    case "ls":
      return listWallets(config);

    case "use":
    case "switch":
      return switchWallet(args.slice(1), config);

    case "show":
    case "active":
      return showActiveWallet(config);

    case "import":
      return importWallet(args.slice(1), config);

    case "export":
      return exportWallet(args.slice(1), config);

    case "remove":
    case "delete":
    case "rm":
      return removeWallet(args.slice(1), config);

    default:
      return {
        message: `Wallet Commands

  /wallet new <name>      Create a new wallet
  /wallet import <name> <privateKey>  Import existing wallet
  /wallet list            List all wallets
  /wallet use <name>      Switch active wallet
  /wallet show            Show active wallet details
  /wallet export <name>   Export wallet private key
  /wallet remove <name>   Remove a wallet

Examples:
  /wallet new trading
  /wallet import main 0x...
  /wallet use trading`,
      };
  }
}

function createWallet(args: string[], config: Config): WalletCommandResult {
  const name = args[0];
  if (!name) {
    return { message: "Usage: /wallet new <name>\n\nExample: /wallet new trading" };
  }

  // Check if name already exists
  if (config.wallets?.some((w) => w.name === name)) {
    return { message: `Wallet "${name}" already exists. Use a different name.` };
  }

  // Generate new wallet
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const wallet: Wallet = {
    name,
    address: account.address,
    privateKey,
  };

  // Update config
  const updatedConfig = { ...config };
  updatedConfig.wallets = [...(config.wallets || []), wallet];

  // Set as active if it's the first wallet
  if (!updatedConfig.activeWallet) {
    updatedConfig.activeWallet = name;
  }

  saveConfig(updatedConfig);

  return {
    message: `Wallet "${name}" created!

Address: ${account.address}

This wallet is ${updatedConfig.activeWallet === name ? "now active" : "saved but not active"}.
${updatedConfig.activeWallet !== name ? `Use "/wallet use ${name}" to switch to it.` : ""}

IMPORTANT: Back up your private key with "/wallet export ${name}"`,
    configUpdated: true,
  };
}

function importWallet(args: string[], config: Config): WalletCommandResult {
  const name = args[0];
  const privateKey = args[1];

  if (!name || !privateKey) {
    return {
      message: "Usage: /wallet import <name> <privateKey>\n\nExample: /wallet import main 0x...",
    };
  }

  // Check if name already exists
  if (config.wallets?.some((w) => w.name === name)) {
    return { message: `Wallet "${name}" already exists. Use a different name.` };
  }

  // Validate and get address from private key
  let account;
  try {
    const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
    account = privateKeyToAccount(formattedKey as `0x${string}`);
  } catch {
    return { message: "Invalid private key format." };
  }

  const wallet: Wallet = {
    name,
    address: account.address,
    privateKey: privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`,
  };

  // Update config
  const updatedConfig = { ...config };
  updatedConfig.wallets = [...(config.wallets || []), wallet];

  // Set as active if it's the first wallet
  if (!updatedConfig.activeWallet) {
    updatedConfig.activeWallet = name;
  }

  saveConfig(updatedConfig);

  return {
    message: `Wallet "${name}" imported!

Address: ${account.address}

This wallet is ${updatedConfig.activeWallet === name ? "now active" : "saved but not active"}.`,
    configUpdated: true,
  };
}

function listWallets(config: Config): WalletCommandResult {
  const wallets = config.wallets || [];

  if (wallets.length === 0) {
    return {
      message: 'No wallets configured.\n\nCreate one with "/wallet new <name>"',
    };
  }

  let output = "Wallets\n\n";
  for (const wallet of wallets) {
    const isActive = wallet.name === config.activeWallet;
    const marker = isActive ? "* " : "  ";
    const shortAddr = `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;
    output += `${marker}${wallet.name.padEnd(15)} ${shortAddr}${isActive ? " (active)" : ""}\n`;
  }

  return { message: output };
}

function switchWallet(args: string[], config: Config): WalletCommandResult {
  const name = args[0];
  if (!name) {
    return { message: "Usage: /wallet use <name>" };
  }

  const wallet = config.wallets?.find((w) => w.name === name);
  if (!wallet) {
    const available = config.wallets?.map((w) => w.name).join(", ") || "none";
    return { message: `Wallet "${name}" not found.\n\nAvailable: ${available}` };
  }

  const updatedConfig = { ...config, activeWallet: name };
  saveConfig(updatedConfig);

  const shortAddr = `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}`;
  return {
    message: `Switched to wallet "${name}" (${shortAddr})`,
    configUpdated: true,
  };
}

function showActiveWallet(config: Config): WalletCommandResult {
  const wallet = getActiveWallet(config);

  if (!wallet) {
    // Check for legacy wallet address
    if (config.walletAddress) {
      const shortAddr = `${config.walletAddress.slice(0, 8)}...${config.walletAddress.slice(-6)}`;
      return { message: `Active wallet (legacy): ${shortAddr}` };
    }
    return {
      message: 'No active wallet.\n\nCreate one with "/wallet new <name>"',
    };
  }

  let output = `Active Wallet: ${wallet.name}\n\n`;
  output += `Address: ${wallet.address}\n`;
  output += `Has private key: ${wallet.privateKey ? "Yes" : "No (watch-only)"}`;

  return { message: output };
}

function exportWallet(args: string[], config: Config): WalletCommandResult {
  const name = args[0] || config.activeWallet;

  if (!name) {
    return { message: "Usage: /wallet export <name>\n\nOr set an active wallet first." };
  }

  const wallet = config.wallets?.find((w) => w.name === name);
  if (!wallet) {
    return { message: `Wallet "${name}" not found.` };
  }

  if (!wallet.privateKey) {
    return { message: `Wallet "${name}" has no private key (watch-only).` };
  }

  return {
    message: `Wallet: ${wallet.name}
Address: ${wallet.address}
Private Key: ${wallet.privateKey}

WARNING: Never share your private key!`,
  };
}

function removeWallet(args: string[], config: Config): WalletCommandResult {
  const name = args[0];
  if (!name) {
    return { message: "Usage: /wallet remove <name>" };
  }

  const walletIndex = config.wallets?.findIndex((w) => w.name === name) ?? -1;
  if (walletIndex === -1) {
    return { message: `Wallet "${name}" not found.` };
  }

  const updatedConfig = { ...config };
  updatedConfig.wallets = config.wallets?.filter((w) => w.name !== name) || [];

  // If removing active wallet, clear active or set to first remaining
  if (config.activeWallet === name) {
    updatedConfig.activeWallet = updatedConfig.wallets[0]?.name;
  }

  saveConfig(updatedConfig);

  return {
    message: `Wallet "${name}" removed.${
      config.activeWallet === name
        ? updatedConfig.activeWallet
          ? ` Active wallet is now "${updatedConfig.activeWallet}".`
          : " No active wallet."
        : ""
    }`,
    configUpdated: true,
  };
}
