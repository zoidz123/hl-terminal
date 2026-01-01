import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import { theme } from "../theme.js";

interface InputProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  onValueChange?: (value: string) => void;
}

export function Input({
  onSubmit,
  disabled = false,
  placeholder = "Ask a question or type /",
  initialValue = "",
  onValueChange,
}: InputProps) {
  const [value, setValue] = useState(initialValue);
  const [cursorPosition, setCursorPosition] = useState(initialValue.length);

  // Sync with external initialValue changes
  useEffect(() => {
    if (initialValue !== value) {
      setValue(initialValue);
      setCursorPosition(initialValue.length);
    }
  }, [initialValue]);

  // Notify parent of value changes
  useEffect(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  useInput((input, key) => {
    if (disabled) return;

    if (key.return) {
      if (value.trim()) {
        onSubmit(value.trim());
        setValue("");
        setCursorPosition(0);
      }
      return;
    }

    if (key.backspace || key.delete) {
      if (cursorPosition > 0) {
        setValue((v) => v.slice(0, cursorPosition - 1) + v.slice(cursorPosition));
        setCursorPosition((p) => Math.max(0, p - 1));
      }
      return;
    }

    if (key.leftArrow) {
      setCursorPosition((p) => Math.max(0, p - 1));
      return;
    }

    if (key.rightArrow) {
      setCursorPosition((p) => Math.min(value.length, p + 1));
      return;
    }

    // Regular character input
    if (input && !key.ctrl && !key.meta) {
      setValue((v) => v.slice(0, cursorPosition) + input + v.slice(cursorPosition));
      setCursorPosition((p) => p + input.length);
    }
  });

  const showPlaceholder = !value && !disabled;

  return (
    <Box
      borderStyle="round"
      borderColor={disabled ? theme.textMuted : theme.border}
      paddingX={1}
    >
      <Text color={disabled ? theme.textMuted : theme.primary} bold>
        {"› "}
      </Text>
      {showPlaceholder ? (
        <Text color={theme.textMuted}>{placeholder}</Text>
      ) : (
        <>
          <Text color={disabled ? theme.textMuted : theme.text}>{value}</Text>
          {!disabled && (
            <Text backgroundColor={theme.primary} color={theme.background}>
              {" "}
            </Text>
          )}
        </>
      )}
    </Box>
  );
}
