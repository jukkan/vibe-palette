/**
 * Color utility functions
 *
 * Handles hex validation, normalization, and shade generation
 */

/**
 * Validates and normalizes a hex color code
 * Accepts: #RGB, #RRGGBB, RGB, RRGGBB
 * Returns: #RRGGBB or null if invalid
 */
export function normalizeHex(input: string): string | null {
  // Remove any whitespace
  let hex = input.trim();

  // Remove # if present
  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  // Validate hex characters
  if (!/^[0-9A-Fa-f]+$/.test(hex)) {
    return null;
  }

  // Handle 3-character shorthand (#RGB -> #RRGGBB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Check for valid 6-character hex
  if (hex.length !== 6) {
    return null;
  }

  return `#${hex.toUpperCase()}`;
}

/**
 * Converts hex to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const hexValue = normalized.slice(1);
  const r = parseInt(hexValue.slice(0, 2), 16);
  const g = parseInt(hexValue.slice(2, 4), 16);
  const b = parseInt(hexValue.slice(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Generates an array of shades for a given hex color
 * Returns approximately 12 shades from light to dark
 */
export function generateShades(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // Generate 12 shades with varying lightness
  // Lightness values from 95% (very light) to 10% (very dark)
  const lightnessValues = [95, 85, 75, 65, 55, 45, 35, 25, 20, 15, 10, 5];

  const shades = lightnessValues.map((lightness) => {
    const rgb = hslToRgb(hsl.h, hsl.s, lightness);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  });

  return shades;
}

/**
 * Determines if a color is light or dark (for contrast)
 * Returns 'light' or 'dark'
 */
export function getColorBrightness(hex: string): 'light' | 'dark' {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'dark';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? 'light' : 'dark';
}

/**
 * Generates a harmonious 5-color palette from a base color
 * Returns an array of 5 hex colors with suggested roles
 */
export function generatePaletteFromBase(
  baseHex: string
): Array<{ hex: string; label: string; role: 'primary' | 'accent' | 'background' | 'text' | 'other' }> {
  const rgb = hexToRgb(baseHex);
  if (!rgb) {
    // Fallback to a default blue palette if invalid
    return [
      { hex: '#3B82F6', label: 'Primary', role: 'primary' },
      { hex: '#10B981', label: 'Accent', role: 'accent' },
      { hex: '#F9FAFB', label: 'Light Background', role: 'background' },
      { hex: '#1F2937', label: 'Dark Text', role: 'text' },
      { hex: '#6366F1', label: 'Secondary', role: 'other' },
    ];
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 1. Primary: The base color itself
  const primary = baseHex;

  // 2. Accent: Complementary color (opposite on color wheel, 180° hue shift)
  const accentHsl = { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l };
  const accentRgb = hslToRgb(accentHsl.h, accentHsl.s, accentHsl.l);
  const accent = rgbToHex(accentRgb.r, accentRgb.g, accentRgb.b);

  // 3. Background: Very light version of base color (high lightness, lower saturation)
  const backgroundHsl = { h: hsl.h, s: Math.max(10, hsl.s * 0.2), l: 95 };
  const backgroundRgb = hslToRgb(backgroundHsl.h, backgroundHsl.s, backgroundHsl.l);
  const background = rgbToHex(backgroundRgb.r, backgroundRgb.g, backgroundRgb.b);

  // 4. Text: Dark color for readability (low lightness, low saturation)
  const textHsl = { h: hsl.h, s: Math.min(15, hsl.s * 0.3), l: 15 };
  const textRgb = hslToRgb(textHsl.h, textHsl.s, textHsl.l);
  const text = rgbToHex(textRgb.r, textRgb.g, textRgb.b);

  // 5. Secondary/Other: Analogous color (30° hue shift, slightly different lightness)
  const secondaryHsl = {
    h: (hsl.h + 30) % 360,
    s: Math.max(40, Math.min(80, hsl.s)),
    l: Math.max(35, Math.min(65, hsl.l + 10)),
  };
  const secondaryRgb = hslToRgb(secondaryHsl.h, secondaryHsl.s, secondaryHsl.l);
  const secondary = rgbToHex(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);

  return [
    { hex: primary, label: 'Primary', role: 'primary' },
    { hex: accent, label: 'Accent', role: 'accent' },
    { hex: background, label: 'Light Background', role: 'background' },
    { hex: text, label: 'Dark Text', role: 'text' },
    { hex: secondary, label: 'Secondary', role: 'other' },
  ];
}
