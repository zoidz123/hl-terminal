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
}

interface MethodResponseProps {
  response: MethodResponseData;
}

export function MethodResponse({ response }: MethodResponseProps) {
  return (
    <Box flexDirection="column">
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
