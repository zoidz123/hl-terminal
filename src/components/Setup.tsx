import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../theme.js";
import { saveConfig, getConfigPath } from "../config/index.js";
import type { Config } from "../config/index.js";

type SetupStep = "welcome" | "api_key" | "wallet" | "complete";

interface SetupProps {
  onComplete: (config: Config) => void;
}

export function Setup({ onComplete }: SetupProps) {
  const [step, setStep] = useState<SetupStep>("welcome");
  const [apiKey, setApiKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [inputValue, setInputValue] = useState("");

  useInput((input, key) => {
    if (step === "welcome") {
      if (key.return) {
        setStep("api_key");
      }
      return;
    }

    if (step === "api_key" || step === "wallet") {
      if (key.return) {
        if (step === "api_key") {
          if (inputValue.trim()) {
            setApiKey(inputValue.trim());
            setInputValue("");
            setStep("wallet");
          }
        } else if (step === "wallet") {
          const address = inputValue.trim();
          setWalletAddress(address);

          // Build wallets array if address provided
          const wallets = address
            ? [{ name: "default", address }]
            : [];

          const config: Config = {
            anthropicApiKey: apiKey,
            wallets,
            activeWallet: address ? "default" : undefined,
            network: "mainnet",
          };
          saveConfig(config);
          setStep("complete");
          setTimeout(() => onComplete(config), 1500);
        }
        return;
      }

      if (key.backspace || key.delete) {
        setInputValue((v) => v.slice(0, -1));
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setInputValue((v) => v + input);
      }
    }
  });

  if (step === "welcome") {
    return (
      <Box flexDirection="column" padding={2}>
        <Box marginBottom={1} flexDirection="column">
          <Text color={theme.primary} bold>{"  __    __"}</Text>
          <Text color={theme.primary} bold>{" / /_  / /"}</Text>
          <Text color={theme.primary} bold>{"/ __ \\/ /"}</Text>
          <Text color={theme.primary} bold>{"/ / / / /"}</Text>
          <Text color={theme.primary} bold>{"/_/ /_/_/"}</Text>
        </Box>
        <Text color={theme.text} bold>
          Welcome to hl - Hyperliquid Terminal
        </Text>
        <Box marginTop={1}>
          <Text color={theme.textDim}>
            An AI-powered interface for learning and exploring Hyperliquid.
          </Text>
        </Box>
        <Box marginTop={2}>
          <Text color={theme.text}>Before we start, I need a few things.</Text>
        </Box>
        <Box marginTop={2}>
          <Text color={theme.textDim}>Press </Text>
          <Text color={theme.primary}>Enter</Text>
          <Text color={theme.textDim}> to continue...</Text>
        </Box>
      </Box>
    );
  }

  if (step === "api_key") {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color={theme.text} bold>
          Claude API Key
        </Text>
        <Box marginTop={1}>
          <Text color={theme.textDim}>
            Get one at console.anthropic.com
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.primary}>{"> "}</Text>
          <Text color={theme.text}>{inputValue}</Text>
          <Text backgroundColor={theme.primary}>{" "}</Text>
        </Box>
      </Box>
    );
  }

  if (step === "wallet") {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color={theme.text} bold>
          Wallet Address (optional)
        </Text>
        <Box marginTop={1}>
          <Text color={theme.textDim}>
            For querying your positions. Press Enter to skip.
          </Text>
        </Box>
        <Box marginTop={1}>
          <Text color={theme.primary}>{"> "}</Text>
          <Text color={theme.text}>{inputValue}</Text>
          <Text backgroundColor={theme.primary}>{" "}</Text>
        </Box>
      </Box>
    );
  }

  if (step === "complete") {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color={theme.success}>Config saved to {getConfigPath()}</Text>
        <Box marginTop={1}>
          <Text color={theme.textDim}>Starting hl...</Text>
        </Box>
      </Box>
    );
  }

  return null;
}
