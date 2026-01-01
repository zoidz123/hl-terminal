import React, { useState, useCallback, useRef } from "react";
import { Box, useApp, useInput } from "ink";
import { theme } from "./theme.js";
import { Status } from "./components/Status.js";
import { Output, type Message } from "./components/Output.js";
import { Input } from "./components/Input.js";
import { Setup } from "./components/Setup.js";
import { CategoryMenu } from "./components/CategoryMenu.js";
import { configExists, getEffectiveConfig, loadConfig, type Config } from "./config/index.js";
import { isSlashCommand, executeCommand, type ExecutionResult } from "./commands/index.js";
import { streamChat } from "./llm/client.js";

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function App() {
  const { exit } = useApp();
  const [config, setConfig] = useState<Config | null>(() => getEffectiveConfig());
  const [needsSetup, setNeedsSetup] = useState(() => !configExists());
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("thinking");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Use ref to track accumulated content to avoid stale closure issues
  const accumulatedContent = useRef("");

  // Handle Ctrl+C to exit
  useInput((input, key) => {
    if (key.ctrl && input === "c") {
      exit();
    }
  });

  const addMessage = useCallback((type: Message["type"], content?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        type,
        content,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSetupComplete = useCallback((newConfig: Config) => {
    setConfig(newConfig);
    setNeedsSetup(false);
    addMessage("system", 'Ready! Type / to browse methods or ask a question.');
  }, [addMessage]);

  const handleSubmit = useCallback(
    async (input: string) => {
      if (!config) return;

      // Check if user just typed "/" - show category menu
      if (input.trim() === "/") {
        setShowCategoryMenu(true);
        return;
      }

      // Add user message
      addMessage("user", input);

      if (isSlashCommand(input)) {
        // Handle slash command
        setIsLoading(true);
        setLoadingMessage("fetching data");
        try {
          const result = await executeCommand(input, config);

          if (result.type === "error") {
            addMessage("error", result.content || "Unknown error");
          } else if (result.type === "method" && result.methodResponse) {
            // Add method response with structured data
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                type: "method",
                methodResponse: result.methodResponse,
                timestamp: new Date(),
              },
            ]);
          } else {
            // Text response (help, config, etc.)
            addMessage("assistant", result.content || "");
          }

          // Reload config if it was updated
          if (result.configUpdated) {
            const newConfig = getEffectiveConfig();
            if (newConfig) {
              setConfig(newConfig);
            }
          }
        } catch (error) {
          addMessage(
            "error",
            `Error: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        } finally {
          setIsLoading(false);
        }
      } else {
        // Handle natural language with LLM
        setIsLoading(true);
        setLoadingMessage("thinking");
        setStreamingContent("");
        accumulatedContent.current = "";

        await streamChat(input, config, {
          onText: (text) => {
            accumulatedContent.current += text;
            setStreamingContent(accumulatedContent.current);
          },
          onToolUse: (toolName) => {
            setLoadingMessage("querying hyperliquid");
          },
          onRetry: (secondsLeft) => {
            setLoadingMessage(`rate limited, retrying in ${secondsLeft}s`);
          },
          onComplete: () => {
            // Add the final message
            if (accumulatedContent.current) {
              addMessage("assistant", accumulatedContent.current);
            }
            setStreamingContent("");
            accumulatedContent.current = "";
            setIsLoading(false);
          },
          onError: (error) => {
            addMessage("error", error.message);
            setStreamingContent("");
            accumulatedContent.current = "";
            setIsLoading(false);
          },
        });
      }
    },
    [config, addMessage]
  );

  const handleCategorySelect = useCallback((command: string) => {
    setShowCategoryMenu(false);
    setInputValue(command);
  }, []);

  const handleCategoryCancel = useCallback(() => {
    setShowCategoryMenu(false);
  }, []);

  if (needsSetup) {
    return <Setup onComplete={handleSetupComplete} />;
  }

  if (showCategoryMenu) {
    return (
      <Box flexDirection="column" height="100%">
        <Status
          isLoading={false}
          loadingMessage=""
          network={config?.network}
        />
        <Box
          flexDirection="column"
          flexGrow={1}
          borderStyle="round"
          borderColor={theme.border}
          paddingX={1}
        >
          <CategoryMenu
            onSelect={handleCategorySelect}
            onCancel={handleCategoryCancel}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" height="100%">
      <Status
        isLoading={isLoading}
        loadingMessage={loadingMessage}
        network={config?.network}
      />
      <Box
        flexDirection="column"
        flexGrow={1}
        borderStyle="round"
        borderColor={theme.border}
      >
        <Output messages={messages} streamingContent={streamingContent} />
      </Box>
      <Input
        onSubmit={handleSubmit}
        disabled={isLoading}
        initialValue={inputValue}
        onValueChange={setInputValue}
      />
    </Box>
  );
}
