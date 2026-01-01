import React, { useState, useEffect } from "react";
import { Text } from "ink";
import { theme } from "../theme.js";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const FRAME_INTERVAL = 80;

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, FRAME_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <Text>
      <Text color={theme.primary}>{SPINNER_FRAMES[frame]}</Text>
      {label && <Text color={theme.textDim}> {label}</Text>}
    </Text>
  );
}
