import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';
import { formatCode } from '../formatting/index.js';

interface TypeBlockProps {
  title?: string;
  typeDefinition: string;
}

export function TypeBlock({ title = 'Type', typeDefinition }: TypeBlockProps) {
  const formattedType = formatCode(typeDefinition, 'typescript');

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={theme.textMuted}>{'─ '}</Text>
        <Text color={theme.info} bold>{title}</Text>
        <Text color={theme.textMuted}>{' ─'}</Text>
      </Box>
      <Box paddingLeft={2} flexDirection="column">
        {formattedType.split('\n').map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
}
