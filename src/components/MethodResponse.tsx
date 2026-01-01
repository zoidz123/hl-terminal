import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';
import { JsonBlock } from './JsonBlock.js';
import { CodeBlock } from './CodeBlock.js';
import { TypeBlock } from './TypeBlock.js';

export interface MethodResponseData {
  data: unknown;
  sdkSnippet: string;
  typeDefinition: string;
  docsUrl?: string;
  methodName?: string;
  resolvedParams?: Record<string, string | number | boolean>;
}

interface MethodResponseProps {
  response: MethodResponseData;
}

export function MethodResponse({ response }: MethodResponseProps) {
  // Format params for display
  const paramsDisplay = response.resolvedParams && Object.keys(response.resolvedParams).length > 0
    ? Object.entries(response.resolvedParams)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ')
    : null;

  return (
    <Box flexDirection="column">
      {response.methodName && (
        <Box marginBottom={1}>
          <Text color={theme.accent} bold>/{response.methodName}</Text>
          {paramsDisplay && (
            <Text color={theme.textMuted}> {paramsDisplay}</Text>
          )}
        </Box>
      )}
      <JsonBlock data={response.data} />
      <CodeBlock title="SDK Usage" code={response.sdkSnippet} />
      <TypeBlock title="Type" typeDefinition={response.typeDefinition} />
      {response.docsUrl && (
        <Box marginTop={1}>
          <Text color={theme.textMuted}>Docs: </Text>
          <Text color={theme.info} underline>{response.docsUrl}</Text>
        </Box>
      )}
    </Box>
  );
}
