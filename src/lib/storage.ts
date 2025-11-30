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
 * Creates the default example palette
 */
function createDefaultPalette(): VibePalette {
  const now = new Date().toISOString();

  const colors: VibeColor[] = [
    {
      id: generateId(),
      hex: '#3B82F6',
      label: 'Primary',
      role: 'primary',
    },
    {
      id: generateId(),
      hex: '#F97316',
      label: 'Accent',
      role: 'accent',
    },
    {
      id: generateId(),
      hex: '#F9FAFB',
      label: 'Light Background',
      role: 'background',
    },
    {
      id: generateId(),
      hex: '#1F2937',
      label: 'Dark Text',
      role: 'text',
    },
    {
      id: generateId(),
      hex: '#8B5CF6',
      label: 'Secondary',
      role: 'other',
    },
  ];

  return {
    id: generateId(),
    name: 'Example Palette',
    brand: undefined,
    notes: 'Example palette - feel free to edit or delete!',
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

/**
 * Exports all palettes as a JSON backup file
 */
export function exportBackup(): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const data = stored || '[]';
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  const filename = `vibe-palettes-backup-${date}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and imports a backup file
 * Returns the imported palettes if valid, throws an error otherwise
 */
export function importBackup(jsonContent: string): VibePalette[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch {
    throw new Error('Invalid JSON format: please check your backup file');
  }
  
  // Validate it's an array
  if (!Array.isArray(parsed)) {
    throw new Error('Invalid backup format: expected an array of palettes');
  }
  
  // Validate each palette has required fields
  for (const palette of parsed) {
    if (typeof palette !== 'object' || palette === null) {
      throw new Error('Invalid backup format: each item must be a palette object');
    }
    if (typeof palette.id !== 'string' || typeof palette.name !== 'string') {
      throw new Error('Invalid backup format: each palette must have an id and name');
    }
    if (!Array.isArray(palette.colors)) {
      throw new Error('Invalid backup format: each palette must have a colors array');
    }
  }
  
  return parsed as VibePalette[];
}
