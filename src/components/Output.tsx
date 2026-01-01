import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';
import { Spinner } from './Spinner.js';
import { MethodResponse, type MethodResponseData } from './MethodResponse.js';

export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'error' | 'system' | 'method';
  content?: string;
  methodResponse?: MethodResponseData;
  timestamp: Date;
}

interface OutputProps {
  messages: Message[];
  streamingContent?: string;
}

export function Output({ messages, streamingContent }: OutputProps) {
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1} paddingY={1}>
      {messages.length === 0 && !streamingContent && (
        <Box flexDirection="column" paddingY={1}>
          <Text color={theme.textMuted}>
            Type a question about Hyperliquid or use a slash command.
          </Text>
          <Box marginTop={1}>
            <Text color={theme.textMuted}>Examples:</Text>
          </Box>
          <Text color={theme.textMuted}>  "What is funding rate?"</Text>
          <Text color={theme.textMuted}>  "Explain the l2Book response"</Text>
          <Text color={theme.textMuted}>  /l2Book coin=ETH</Text>
          <Text color={theme.textMuted}>  /allMids</Text>
          <Text color={theme.textMuted}>  /help</Text>
        </Box>
      )}

      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {streamingContent && (
        <Box flexDirection="column" marginTop={1}>
          <FormattedContent content={streamingContent} />
          <Box marginTop={1}>
            <Spinner />
          </Box>
        </Box>
      )}
    </Box>
  );
}

function MessageItem({ message }: { message: Message }) {
  if (message.type === 'user') {
    return (
      <Box marginTop={1} flexDirection="row">
        <Text color={theme.primary} bold>{'> '}</Text>
        <Text color={theme.primary}>{message.content}</Text>
      </Box>
    );
  }

  if (message.type === 'error') {
    return (
      <Box marginTop={1}>
        <Text color={theme.error}>{message.content}</Text>
      </Box>
    );
  }

  if (message.type === 'system') {
    return (
      <Box marginTop={1}>
        <Text color={theme.info}>{message.content}</Text>
      </Box>
    );
  }

  if (message.type === 'method' && message.methodResponse) {
    return (
      <Box marginTop={1}>
        <MethodResponse response={message.methodResponse} />
      </Box>
    );
  }

  // Assistant message (text) - format nicely
  return (
    <Box marginTop={1} flexDirection="column">
      <FormattedContent content={message.content || ''} />
    </Box>
  );
}

function FormattedContent({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <Box flexDirection="column">
      {lines.map((line, i) => (
        <FormattedLine key={i} line={line} />
      ))}
    </Box>
  );
}

function FormattedLine({ line }: { line: string }) {
  // Empty line = spacing
  if (line.trim() === '') {
    return <Text> </Text>;
  }

  // H1 header: # Title
  if (line.startsWith('# ')) {
    return (
      <Box marginTop={1} marginBottom={1}>
        <Text color={theme.primary} bold>{line.slice(2)}</Text>
      </Box>
    );
  }

  // H2 header: ## Title
  if (line.startsWith('## ')) {
    return (
      <Box marginTop={1}>
        <Text color={theme.accent} bold>{line.slice(3)}</Text>
      </Box>
    );
  }

  // H3 header: ### Title
  if (line.startsWith('### ')) {
    return (
      <Box marginTop={1}>
        <Text bold>{line.slice(4)}</Text>
      </Box>
    );
  }

  // Bullet point: - item or * item
  if (line.match(/^\s*[-*]\s/)) {
    const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
    const text = line.replace(/^\s*[-*]\s/, '');
    return (
      <Box marginLeft={indent}>
        <Text>  </Text>
        <Text color={theme.accent}>•</Text>
        <Text> {formatInlineText(text)}</Text>
      </Box>
    );
  }

  // Numbered list: 1. item
  if (line.match(/^\s*\d+\.\s/)) {
    const match = line.match(/^(\s*)(\d+)\.\s(.*)$/);
    if (match) {
      const [, indent, num, text] = match;
      return (
        <Box marginLeft={indent?.length || 0}>
          <Text color={theme.accent}>{num}.</Text>
          <Text> {formatInlineText(text)}</Text>
        </Box>
      );
    }
  }

  // Code block marker
  if (line.startsWith('```')) {
    return <Text color={theme.textMuted}>───</Text>;
  }

  // Regular text with inline formatting
  return <Text>{formatInlineText(line)}</Text>;
}

function formatInlineText(text: string): string {
  // Remove markdown bold/italic markers for cleaner display
  // Keep the text, just remove the ** and * markers
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}
