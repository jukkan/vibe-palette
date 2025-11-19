/**
 * PaletteEditor view
 *
 * Editor for a single palette with:
 * - Left side: palette metadata + color list
 * - Right side: live preview panel
 * - Actions: save, save as copy, back
 */

import { useState } from 'react';
import { VibePalette, VibeColor } from '../lib/paletteTypes';
import { generateId } from '../lib/storage';
import { normalizeHex, getColorBrightness } from '../lib/colorUtils';
import { useToast } from '../components/Toast';

interface PaletteEditorProps {
  palette: VibePalette;
  onSave: (palette: VibePalette) => void;
  onSaveAsCopy: (palette: VibePalette) => void;
  onBack: () => void;
  onDelete?: (paletteId: string) => void;
  onOpenShades: (color: VibeColor, onSelect: (hex: string) => void) => void;
  onOpenExport: (palette: VibePalette) => void;
}

export function PaletteEditor({
  palette,
  onSave,
  onSaveAsCopy,
  onBack,
  onDelete,
  onOpenShades,
  onOpenExport,
}: PaletteEditorProps) {
  const [editedPalette, setEditedPalette] = useState<VibePalette>(palette);
  const { showToast } = useToast();

  // Update palette field
  const updateField = (field: keyof VibePalette, value: string) => {
    setEditedPalette((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Update color
  const updateColor = (colorId: string, updates: Partial<VibeColor>) => {
    setEditedPalette((prev) => ({
      ...prev,
      colors: prev.colors.map((color) =>
        color.id === colorId ? { ...color, ...updates } : color
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Add new color
  const addColor = () => {
    const newColor: VibeColor = {
      id: generateId(),
      hex: '#3B82F6',
      label: '',
      role: 'other',
    };

    setEditedPalette((prev) => ({
      ...prev,
      colors: [...prev.colors, newColor],
      updatedAt: new Date().toISOString(),
    }));
  };

  // Delete color
  const deleteColor = (colorId: string) => {
    setEditedPalette((prev) => ({
      ...prev,
      colors: prev.colors.filter((color) => color.id !== colorId),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Move color
  const moveColor = (colorId: string, direction: 'left' | 'right') => {
    setEditedPalette((prev) => {
      const colors = [...prev.colors];
      const index = colors.findIndex((c) => c.id === colorId);

      if (index === -1) return prev;

      const newIndex = direction === 'left' ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= colors.length) return prev;

      // Swap
      [colors[index], colors[newIndex]] = [colors[newIndex], colors[index]];

      return {
        ...prev,
        colors,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Handle save
  const handleSave = () => {
    if (!editedPalette.name.trim()) {
      showToast('Palette name is required');
      return;
    }

    onSave(editedPalette);
    showToast('Palette saved!');
  };

  // Handle save as copy
  const handleSaveAsCopy = () => {
    if (!editedPalette.name.trim()) {
      showToast('Palette name is required');
      return;
    }

    const now = new Date().toISOString();
    const copy: VibePalette = {
      ...editedPalette,
      id: generateId(),
      name: `${editedPalette.name} (Copy)`,
      colors: editedPalette.colors.map((color) => ({
        ...color,
        id: generateId(),
      })),
      createdAt: now,
      updatedAt: now,
    };

    onSaveAsCopy(copy);
    showToast('Palette copied!');
  };

  // Handle delete
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this palette?')) {
      onDelete?.(editedPalette.id);
      showToast('Palette deleted');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
        >
          ← Back to Palettes
        </button>

        <div className="flex gap-2">
          {onDelete && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={() => onOpenExport(editedPalette)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Export
          </button>
          <button
            onClick={handleSaveAsCopy}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Save as Copy
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor layout: left side (editor) + right side (preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Palette editor */}
        <div>
          {/* Palette metadata */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Palette Details</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedPalette.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., FinModeler G3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input
                  type="text"
                  value={editedPalette.brand || ''}
                  onChange={(e) => updateField('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., FinModeler"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editedPalette.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional notes about this palette..."
                />
              </div>
            </div>
          </div>

          {/* Color list */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Colors</h3>
              <button
                onClick={addColor}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + Add Color
              </button>
            </div>

            <div className="space-y-4">
              {editedPalette.colors.map((color, index) => (
                <ColorRow
                  key={color.id}
                  color={color}
                  isFirst={index === 0}
                  isLast={index === editedPalette.colors.length - 1}
                  onUpdate={(updates) => updateColor(color.id, updates)}
                  onDelete={() => deleteColor(color.id)}
                  onMove={(dir) => moveColor(color.id, dir)}
                  onOpenShades={(onSelect) => onOpenShades(color, onSelect)}
                  showToast={showToast}
                />
              ))}

              {editedPalette.colors.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No colors yet. Click "Add Color" to get started.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview panel */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <PreviewPanel palette={editedPalette} />
        </div>
      </div>
    </div>
  );
}

/**
 * Individual color row in the editor
 */
interface ColorRowProps {
  color: VibeColor;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updates: Partial<VibeColor>) => void;
  onDelete: () => void;
  onMove: (direction: 'left' | 'right') => void;
  onOpenShades: (onSelect: (hex: string) => void) => void;
  showToast: (message: string) => void;
}

function ColorRow({
  color,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onMove,
  onOpenShades,
  showToast,
}: ColorRowProps) {
  const [hexInput, setHexInput] = useState(color.hex);

  // Handle hex blur (validation)
  const handleHexBlur = () => {
    const normalized = normalizeHex(hexInput);
    if (normalized) {
      onUpdate({ hex: normalized });
      setHexInput(normalized);
    } else {
      // Reset to valid hex
      setHexInput(color.hex);
      showToast('Invalid hex color');
    }
  };

  // Copy hex to clipboard
  const copyHex = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      showToast(`Copied ${color.hex}`);
    } catch (err) {
      showToast('Failed to copy');
    }
  };

  const brightness = getColorBrightness(color.hex);

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Color swatch + hex */}
      <div className="flex gap-3 mb-3">
        {/* Large swatch */}
        <div
          className="w-20 h-20 rounded-lg shadow-sm flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: color.hex }}
        >
          <span className={`text-xs font-mono ${brightness === 'light' ? 'text-gray-800' : 'text-white'}`}>
            {color.hex}
          </span>
        </div>

        {/* Inputs */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexBlur}
              className="flex-1 px-3 py-2 border border-gray-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="#RRGGBB"
            />
            <button
              onClick={copyHex}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
              title="Copy hex to clipboard"
            >
              Copy
            </button>
          </div>

          <input
            type="text"
            value={color.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Label (e.g., Lemon Lime)"
          />
        </div>
      </div>

      {/* Role + Actions */}
      <div className="flex gap-2 items-center">
        <select
          value={color.role || 'other'}
          onChange={(e) =>
            onUpdate({ role: e.target.value as VibeColor['role'] })
          }
          className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="primary">Primary</option>
          <option value="accent">Accent</option>
          <option value="background">Background</option>
          <option value="text">Text</option>
          <option value="other">Other</option>
        </select>

        <button
          onClick={() => onOpenShades((hex) => onUpdate({ hex }))}
          className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          Shades
        </button>

        <div className="flex-1" />

        <button
          onClick={() => onMove('left')}
          disabled={isFirst}
          className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move left"
        >
          ←
        </button>

        <button
          onClick={() => onMove('right')}
          disabled={isLast}
          className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move right"
        >
          →
        </button>

        <button
          onClick={onDelete}
          className="px-2 py-1 text-red-600 hover:text-red-700"
          title="Delete color"
        >
          🗑
        </button>
      </div>
    </div>
  );
}

/**
 * Preview panel showing the palette in use
 */
function PreviewPanel({ palette }: { palette: VibePalette }) {
  // Map colors by role
  const colorsByRole = {
    background: palette.colors.find((c) => c.role === 'background')?.hex || '#F9FAFB',
    text: palette.colors.find((c) => c.role === 'text')?.hex || '#111827',
    primary: palette.colors.find((c) => c.role === 'primary')?.hex || '#3B82F6',
    accent: palette.colors.find((c) => c.role === 'accent')?.hex || '#10B981',
  };

  const hasRoles = palette.colors.some((c) => c.role && c.role !== 'other');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Preview</h3>

      {!hasRoles && (
        <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded mb-4">
          Assign roles to colors (primary, accent, background, text) for a better preview.
        </p>
      )}

      {/* Preview area */}
      <div
        className="rounded-lg p-8 min-h-96"
        style={{ backgroundColor: colorsByRole.background }}
      >
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h4
            className="text-2xl font-bold"
            style={{ color: colorsByRole.text }}
          >
            {palette.name || 'Your Palette'}
          </h4>

          <p
            className="text-sm"
            style={{ color: colorsByRole.text, opacity: 0.7 }}
          >
            This is a preview of how your palette looks in a real UI. The background, text,
            buttons, and accents use colors based on their assigned roles.
          </p>

          <div className="flex gap-3 flex-wrap">
            <button
              className="px-4 py-2 rounded-lg font-medium text-white shadow-sm"
              style={{ backgroundColor: colorsByRole.primary }}
            >
              Primary Button
            </button>

            <span
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: colorsByRole.accent }}
            >
              Tag
            </span>

            <a
              href="#"
              className="px-4 py-2 font-medium underline"
              style={{ color: colorsByRole.accent }}
              onClick={(e) => e.preventDefault()}
            >
              Link
            </a>
          </div>

          {/* Show all colors */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">All colors in palette:</p>
            <div className="flex gap-2 flex-wrap">
              {palette.colors.map((color) => (
                <div
                  key={color.id}
                  className="w-12 h-12 rounded shadow-sm"
                  style={{ backgroundColor: color.hex }}
                  title={color.label || color.hex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
