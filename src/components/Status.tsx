import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme.js";
import { Spinner } from "./Spinner.js";

interface StatusProps {
  isLoading?: boolean;
  loadingMessage?: string;
  network?: string;
}

export function Status({
  isLoading = false,
  loadingMessage = "thinking",
  network = "mainnet"
}: StatusProps) {
  return (
    <Box
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={1}>
        <Text color={theme.primary} bold>
          hl
        </Text>
        <Text color={theme.textMuted}>│</Text>
        <Text color={theme.textDim}>hyperliquid terminal</Text>
        {isLoading && (
          <>
            <Text color={theme.textMuted}>│</Text>
            <Spinner label={loadingMessage} />
          </>
        )}
      </Box>
      <Box gap={1}>
        <Text color={theme.textMuted}>●</Text>
        <Text color={theme.success}>{network}</Text>
      </Box>
    </Box>
  );
}
