/**
 * localStorage utilities for Vibe Palettes
 *
 * This module handles all localStorage operations for saving and loading palettes.
 * All data is stored under a single key: "vibe-palettes-v1"
 */

import { VibePalette, VibeColor } from './paletteTypes';

const STORAGE_KEY = 'vibe-palettes-v1';

/**
 * Generates a simple UUID (v4-like)
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates the default example palette (FinModeler G3)
 */
function createDefaultPalette(): VibePalette {
  const now = new Date().toISOString();

  const colors: VibeColor[] = [
    {
      id: generateId(),
      hex: '#DDF247',
      label: 'Lemon Lime',
      role: 'accent',
    },
    {
      id: generateId(),
      hex: '#22262B',
      label: 'Shadow Grey',
      role: 'text',
    },
    {
      id: generateId(),
      hex: '#F2F2F2',
      label: 'White Smoke',
      role: 'background',
    },
    {
      id: generateId(),
      hex: '#2D6A4F',
      label: 'Dark Emerald',
      role: 'primary',
    },
    {
      id: generateId(),
      hex: '#0077B6',
      label: 'Bright Teal Blue',
      role: 'other',
    },
  ];

  return {
    id: generateId(),
    name: 'FinModeler G3',
    brand: 'FinModeler',
    notes: 'Default example palette - feel free to edit or delete!',
    colors,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Loads all palettes from localStorage
 * Returns default palette if nothing is stored yet
 */
export function loadPalettes(): VibePalette[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      // First time - return default palette
      const defaultPalette = createDefaultPalette();
      savePalettes([defaultPalette]);
      return [defaultPalette];
    }

    const palettes = JSON.parse(stored) as VibePalette[];
    return palettes;
  } catch (error) {
    console.error('Error loading palettes from localStorage:', error);
    // Return default on error
    const defaultPalette = createDefaultPalette();
    return [defaultPalette];
  }
}

/**
 * Saves all palettes to localStorage
 */
export function savePalettes(palettes: VibePalette[]): void {
  try {
    const json = JSON.stringify(palettes);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Error saving palettes to localStorage:', error);
    throw new Error('Failed to save palettes. Your browser storage may be full.');
  }
}

/**
 * Clears all palettes from localStorage (for resetting)
 */
export function clearPalettes(): void {
  localStorage.removeItem(STORAGE_KEY);
}
