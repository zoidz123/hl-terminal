import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';
import { formatJson } from '../formatting/index.js';

interface JsonBlockProps {
  title?: string;
  data: unknown;
  maxArrayItems?: number;
}

export function JsonBlock({ title = 'Response', data, maxArrayItems = 5 }: JsonBlockProps) {
  const formattedJson = formatJson(data, { maxArrayItems });

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={theme.textMuted}>{'─ '}</Text>
        <Text color={theme.accent} bold>{title}</Text>
        <Text color={theme.textMuted}>{' ─'}</Text>
      </Box>
      <Box paddingLeft={2} flexDirection="column">
        {formattedJson.split('\n').map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
}
