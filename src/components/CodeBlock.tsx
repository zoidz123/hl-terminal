import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';
import { formatCode } from '../formatting/index.js';

interface CodeBlockProps {
  title?: string;
  code: string;
  language?: string;
}

export function CodeBlock({ title = 'Code', code, language = 'typescript' }: CodeBlockProps) {
  const formattedCode = formatCode(code, language);

  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={theme.textMuted}>{'─ '}</Text>
        <Text color={theme.success} bold>{title}</Text>
        <Text color={theme.textMuted}>{' ─'}</Text>
      </Box>
      <Box paddingLeft={2} flexDirection="column">
        {formattedCode.split('\n').map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
    </Box>
  );
}
