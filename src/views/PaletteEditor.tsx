/**
 * PaletteEditor view
 *
 * Editor for a single palette with:
 * - Left side: palette metadata + color list
 * - Right side: live preview panel
 * - Actions: save, save as copy, back
 */

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
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
  onOpenShades: (
    color: VibeColor, 
    onSelect: (hex: string) => void,
    onAddToPalette?: (hex: string) => void
  ) => void;
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
  const [expandedPreview, setExpandedPreview] = useState(false);
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

  // Add color with specific hex (for adding from shades)
  const addColorWithHex = (hex: string) => {
    const newColor: VibeColor = {
      id: generateId(),
      hex: hex,
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

      {/* Editor layout: left side (details + preview) + right side (colors) */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
        {/* Left: Palette details + Preview */}
        <div className="space-y-6">
          {/* Palette metadata */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-lg font-semibold mb-3">Palette Details</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editedPalette.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., FinModeler G3"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0">Brand</label>
                <input
                  type="text"
                  value={editedPalette.brand || ''}
                  onChange={(e) => updateField('brand', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="e.g., FinModeler"
                />
              </div>

              <div className="flex items-start gap-3">
                <label className="text-sm font-medium text-gray-700 w-16 flex-shrink-0 pt-1.5">Notes</label>
                <textarea
                  value={editedPalette.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={2}
                  placeholder="Optional notes about this palette..."
                />
              </div>
            </div>
          </div>

          {/* Preview panel */}
          <div className="lg:sticky lg:top-6">
            <PreviewPanel palette={editedPalette} onExpand={() => setExpandedPreview(true)} />
          </div>
        </div>

        {/* Right: Color list */}
        <div className="bg-white rounded-lg shadow-md p-5 h-fit lg:sticky lg:top-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Colors</h3>
            <button
              onClick={addColor}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              + Add Color
            </button>
          </div>

          <div className="space-y-3">
            {editedPalette.colors.map((color, index) => (
              <ColorRow
                key={color.id}
                color={color}
                isFirst={index === 0}
                isLast={index === editedPalette.colors.length - 1}
                onUpdate={(updates) => updateColor(color.id, updates)}
                onDelete={() => deleteColor(color.id)}
                onMove={(dir) => moveColor(color.id, dir)}
                onOpenShades={(onSelect) => onOpenShades(color, onSelect, addColorWithHex)}
                showToast={showToast}
              />
            ))}

            {editedPalette.colors.length === 0 && (
              <p className="text-gray-500 text-center py-8 text-sm">
                No colors yet. Click "Add Color" to get started.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded preview modal */}
      {expandedPreview && (
        <ExpandedPreviewModal palette={editedPalette} onClose={() => setExpandedPreview(false)} />
      )}
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
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const brightness = getColorBrightness(color.hex);

  return (
    <div className="border border-gray-200 rounded-lg p-3" style={{ backgroundColor: color.hex }}>
      <div className="flex gap-2 mb-2">
        {/* Compact swatch with color picker */}
        <div className="relative flex-shrink-0">
          <div
            className="w-16 h-16 rounded-lg shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all border-2 border-white"
            style={{ backgroundColor: color.hex }}
            onClick={() => setShowPicker(!showPicker)}
            title="Click to open color picker"
          />

          {/* Color picker popup */}
          {showPicker && (
            <div
              ref={pickerRef}
              className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3"
              style={{ left: 0, top: '100%' }}
            >
              <HexColorPicker
                color={color.hex}
                onChange={(newHex) => {
                  onUpdate({ hex: newHex.toUpperCase() });
                  setHexInput(newHex.toUpperCase());
                }}
              />
              <button
                onClick={() => setShowPicker(false)}
                className="mt-2 w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Hex and Label inputs side by side */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexBlur}
              className="w-24 px-2 py-1.5 border border-gray-300 rounded font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="#RRGGBB"
            />
            <input
              type="text"
              value={color.label || ''}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              placeholder="Label (e.g., Lemon Lime)"
            />
            <button
              onClick={copyHex}
              className="px-2 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-xs font-medium transition-colors bg-white"
              title="Copy hex to clipboard"
            >
              Copy
            </button>
          </div>

          {/* Role + Actions */}
          <div className="flex gap-1.5 items-center">
            <select
              value={color.role || 'other'}
              onChange={(e) =>
                onUpdate({ role: e.target.value as VibeColor['role'] })
              }
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="primary">Primary</option>
              <option value="accent">Accent</option>
              <option value="background">Background</option>
              <option value="text">Text</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => onOpenShades((hex) => onUpdate({ hex }))}
              className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs font-medium transition-colors bg-white"
            >
              Shades
            </button>

            <div className="flex-1" />

            <button
              onClick={() => onMove('left')}
              disabled={isFirst}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              title="Move left"
            >
              ←
            </button>

            <button
              onClick={() => onMove('right')}
              disabled={isLast}
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              title="Move right"
            >
              →
            </button>

            <button
              onClick={onDelete}
              className="px-2 py-1 bg-white border border-red-300 rounded hover:bg-red-50 text-red-600 text-sm transition-colors"
              title="Delete color"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Preview panel showing the palette in use
 */
function PreviewPanel({ palette, onExpand }: { palette: VibePalette; onExpand: () => void }) {
  // Map colors by role
  const colorsByRole = {
    background: palette.colors.find((c) => c.role === 'background')?.hex || '#F9FAFB',
    text: palette.colors.find((c) => c.role === 'text')?.hex || '#111827',
    primary: palette.colors.find((c) => c.role === 'primary')?.hex || '#3B82F6',
    accent: palette.colors.find((c) => c.role === 'accent')?.hex || '#10B981',
  };

  const hasRoles = palette.colors.some((c) => c.role && c.role !== 'other');

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Preview</h3>
        <button
          onClick={onExpand}
          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs font-medium transition-colors"
        >
          Expand
        </button>
      </div>

      {!hasRoles && (
        <p className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded mb-3">
          Assign roles to colors for a better preview.
        </p>
      )}

      {/* Preview area */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: colorsByRole.background }}
      >
        <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
          <h4
            className="text-xl font-bold"
            style={{ color: colorsByRole.text }}
          >
            {palette.name || 'Your Palette'}
          </h4>

          <p
            className="text-xs leading-relaxed"
            style={{ color: colorsByRole.text, opacity: 0.7 }}
          >
            This is a preview of how your palette looks in a real UI. The background, text,
            buttons, and accents use colors based on their assigned roles.
          </p>

          <div className="flex gap-2 flex-wrap">
            <button
              className="px-3 py-1.5 rounded-lg font-medium text-white shadow-sm text-xs"
              style={{ backgroundColor: colorsByRole.primary }}
            >
              Primary Button
            </button>

            <span
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: colorsByRole.accent }}
            >
              Tag
            </span>

            <a
              href="#"
              className="px-3 py-1.5 font-medium underline text-xs"
              style={{ color: colorsByRole.accent }}
              onClick={(e) => e.preventDefault()}
            >
              Link
            </a>
          </div>

          {/* Show all colors */}
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 mb-2">All colors in palette:</p>
            <div className="flex gap-1.5 flex-wrap">
              {palette.colors.map((color) => (
                <div
                  key={color.id}
                  className="w-10 h-10 rounded shadow-sm"
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

/**
 * Expanded preview modal - full screen view of the palette
 */
function ExpandedPreviewModal({ palette, onClose }: { palette: VibePalette; onClose: () => void }) {
  // Map colors by role
  const colorsByRole = {
    background: palette.colors.find((c) => c.role === 'background')?.hex || '#F9FAFB',
    text: palette.colors.find((c) => c.role === 'text')?.hex || '#111827',
    primary: palette.colors.find((c) => c.role === 'primary')?.hex || '#3B82F6',
    accent: palette.colors.find((c) => c.role === 'accent')?.hex || '#10B981',
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Expanded Preview: {palette.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Large color squares - no gaps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Palette Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 rounded-lg overflow-hidden shadow-lg">
              {palette.colors.map((color) => {
                const brightness = getColorBrightness(color.hex);
                return (
                  <div
                    key={color.id}
                    className="aspect-square flex flex-col items-center justify-center p-6"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span
                      className={`font-mono text-2xl font-bold mb-2 ${
                        brightness === 'light' ? 'text-gray-800' : 'text-white'
                      }`}
                    >
                      {color.hex}
                    </span>
                    {color.label && (
                      <span
                        className={`text-lg ${brightness === 'light' ? 'text-gray-700' : 'text-white opacity-90'}`}
                      >
                        {color.label}
                      </span>
                    )}
                    {color.role && color.role !== 'other' && (
                      <span
                        className={`text-sm mt-2 px-3 py-1 rounded-full ${
                          brightness === 'light'
                            ? 'bg-gray-800 text-white'
                            : 'bg-white text-gray-800'
                        }`}
                      >
                        {color.role}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Larger UI elements preview */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">UI Elements Preview</h3>
            <div
              className="rounded-lg p-12 min-h-[500px]"
              style={{ backgroundColor: colorsByRole.background }}
            >
              <div className="bg-white rounded-lg shadow-xl p-10 space-y-6 max-w-4xl mx-auto">
                <h4
                  className="text-5xl font-bold mb-4"
                  style={{ color: colorsByRole.text }}
                >
                  {palette.name}
                </h4>

                {palette.brand && (
                  <p
                    className="text-2xl"
                    style={{ color: colorsByRole.text, opacity: 0.7 }}
                  >
                    {palette.brand}
                  </p>
                )}

                <p
                  className="text-xl leading-relaxed"
                  style={{ color: colorsByRole.text, opacity: 0.8 }}
                >
                  This is a full-screen preview of your color palette. The large color squares above
                  show how the colors work together without gaps. This view helps you see the
                  relationships between colors more clearly.
                </p>

                <div className="flex gap-4 flex-wrap pt-4">
                  <button
                    className="px-8 py-4 rounded-lg font-semibold text-white shadow-lg text-xl"
                    style={{ backgroundColor: colorsByRole.primary }}
                  >
                    Primary Button
                  </button>

                  <button
                    className="px-8 py-4 rounded-lg font-semibold border-2 text-xl"
                    style={{
                      borderColor: colorsByRole.primary,
                      color: colorsByRole.primary,
                    }}
                  >
                    Secondary Button
                  </button>

                  <span
                    className="px-6 py-3 rounded-full text-lg font-semibold text-white shadow-md"
                    style={{ backgroundColor: colorsByRole.accent }}
                  >
                    Accent Tag
                  </span>

                  <a
                    href="#"
                    className="px-6 py-3 font-semibold underline text-xl"
                    style={{ color: colorsByRole.accent }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Link Element
                  </a>
                </div>

                {/* Card examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <div
                    className="p-6 rounded-lg shadow-md"
                    style={{ backgroundColor: colorsByRole.background }}
                  >
                    <h5
                      className="text-2xl font-bold mb-3"
                      style={{ color: colorsByRole.text }}
                    >
                      Card Title
                    </h5>
                    <p
                      className="text-lg"
                      style={{ color: colorsByRole.text, opacity: 0.7 }}
                    >
                      Example card content using background color
                    </p>
                  </div>

                  <div
                    className="p-6 rounded-lg shadow-md border-2"
                    style={{ borderColor: colorsByRole.accent }}
                  >
                    <h5
                      className="text-2xl font-bold mb-3"
                      style={{ color: colorsByRole.accent }}
                    >
                      Highlighted Card
                    </h5>
                    <p
                      className="text-lg"
                      style={{ color: colorsByRole.text, opacity: 0.7 }}
                    >
                      Card with accent border
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color grid with labels */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Color Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {palette.colors.map((color) => {
                const brightness = getColorBrightness(color.hex);
                return (
                  <div key={color.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div
                      className="h-32 flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      <span
                        className={`font-mono text-xl font-bold ${
                          brightness === 'light' ? 'text-gray-800' : 'text-white'
                        }`}
                      >
                        {color.hex}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-gray-900">
                        {color.label || 'Unnamed Color'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Role: {color.role || 'none'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
