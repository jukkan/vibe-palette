/**
 * Type definitions for Vibe Palette
 *
 * This file contains all the TypeScript interfaces and types
 * used throughout the application.
 */

/**
 * Represents a single color in a palette
 */
export interface VibeColor {
  /** Unique identifier for this color (UUID) */
  id: string;

  /** Hex color code (e.g., "#DDF247") */
  hex: string;

  /** Optional human-readable label (e.g., "Lemon Lime") */
  label?: string;

  /** Optional role/purpose of this color in the palette */
  role?: 'primary' | 'accent' | 'background' | 'text' | 'other';
}

/**
 * Represents a complete color palette
 */
export interface VibePalette {
  /** Unique identifier for this palette (UUID) */
  id: string;

  /** Name of the palette (e.g., "Ocean Breeze") */
  name: string;

  /** Optional brand/project name (e.g., "My Brand") */
  brand?: string;

  /** Optional notes or description */
  notes?: string;

  /** Array of colors in this palette */
  colors: VibeColor[];

  /** ISO timestamp of when this palette was created */
  createdAt: string;

  /** ISO timestamp of when this palette was last updated */
  updatedAt: string;
}
