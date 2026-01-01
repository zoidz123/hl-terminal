import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { theme } from '../theme.js';
import {
  categories,
  getMethodsBySubcategory,
  type MethodCategory,
  type MethodMeta,
} from '../commands/methods.js';
import { getMethodUsage } from '../commands/router.js';

interface CategoryMenuProps {
  onSelect: (command: string) => void;
  onCancel: () => void;
  activeWallet?: string;
}

type MenuState = 'categories' | 'methods';

export function CategoryMenu({ onSelect, onCancel, activeWallet }: CategoryMenuProps) {
  const [state, setState] = useState<MenuState>('categories');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState(0);
  const [currentCategory, setCurrentCategory] = useState<MethodCategory | null>(null);

  // Get methods grouped by subcategory for current category
  const methodGroups = currentCategory ? getMethodsBySubcategory(currentCategory) : {};
  const flatMethods: MethodMeta[] = Object.values(methodGroups).flat();

  useInput((input, key) => {
    if (key.escape) {
      if (state === 'methods') {
        setState('categories');
        setCurrentCategory(null);
        setSelectedMethod(0);
      } else {
        onCancel();
      }
      return;
    }

    if (state === 'categories') {
      if (key.upArrow) {
        setSelectedCategory((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedCategory((prev) => Math.min(categories.length - 1, prev + 1));
      } else if (key.return) {
        const cat = categories[selectedCategory];
        if (cat.id === 'info') {
          setCurrentCategory(cat.id);
          setState('methods');
          setSelectedMethod(0);
        }
        // exchange and websocket are coming soon - do nothing
      }
    } else if (state === 'methods') {
      if (key.upArrow) {
        setSelectedMethod((prev) => Math.max(0, prev - 1));
      } else if (key.downArrow) {
        setSelectedMethod((prev) => Math.min(flatMethods.length - 1, prev + 1));
      } else if (key.return) {
        const method = flatMethods[selectedMethod];
        if (method) {
          // Generate a command template
          const usage = getMethodUsage(method.name, activeWallet);
          onSelect(usage);
        }
      }
    }
  });

  if (state === 'categories') {
    return (
      <Box flexDirection="column" paddingY={1}>
        <Text color={theme.accent} bold>Select API Category</Text>
        <Text color={theme.textMuted}>Use arrow keys to navigate, Enter to select, Esc to cancel</Text>
        <Box flexDirection="column" marginTop={1}>
          {categories.map((cat, i) => (
            <Box key={cat.id} marginLeft={1}>
              <Text color={i === selectedCategory ? theme.primary : undefined}>
                {i === selectedCategory ? '> ' : '  '}
              </Text>
              <Text color={i === selectedCategory ? theme.primary : undefined} bold={i === selectedCategory}>
                {cat.name}
              </Text>
              <Text color={theme.textMuted}>{' - '}{cat.description}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // Methods view
  let methodIndex = 0;
  return (
    <Box flexDirection="column" paddingY={1}>
      <Box>
        <Text color={theme.textMuted}>{'< '}</Text>
        <Text color={theme.accent} bold>Info Methods</Text>
        <Text color={theme.textMuted}>{' (Esc to go back)'}</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {Object.entries(methodGroups).map(([subcategory, methods]) => (
          <Box key={subcategory} flexDirection="column" marginBottom={1}>
            <Text color={theme.accent} bold>{subcategory}</Text>
            {methods.map((method) => {
              const isSelected = methodIndex === selectedMethod;
              const currentIndex = methodIndex;
              methodIndex++;
              return (
                <Box key={method.name} marginLeft={1}>
                  <Text color={isSelected ? theme.primary : undefined}>
                    {isSelected ? '> ' : '  '}
                  </Text>
                  <Text color={isSelected ? theme.primary : undefined} bold={isSelected}>
                    /{method.name}
                  </Text>
                  <Text color={theme.textMuted}>{' - '}{method.description}</Text>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
