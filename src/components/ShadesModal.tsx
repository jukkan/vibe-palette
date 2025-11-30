/**
 * ShadesModal component
 *
 * Shows shades/variations of a single color (light to dark)
 * Allows copying hex values and selecting a shade to replace the original
 */

import { VibeColor } from '../lib/paletteTypes';
import { generateShades, getColorBrightness } from '../lib/colorUtils';
import { useToast } from './Toast';

interface ShadesModalProps {
  color: VibeColor;
  onClose: () => void;
  onSelectShade: (hex: string) => void;
  onAddToPalette?: (hex: string) => void;
}

export function ShadesModal({ color, onClose, onSelectShade, onAddToPalette }: ShadesModalProps) {
  const { showToast } = useToast();
  const shades = generateShades(color.hex);

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      showToast(`Copied ${hex}`);
    } catch (err) {
      showToast('Failed to copy');
    }
  };

  const handleUseShade = (hex: string) => {
    onSelectShade(hex);
    showToast(`Updated to ${hex}`);
    onClose();
  };

  const handleAddToPalette = (hex: string) => {
    if (onAddToPalette) {
      onAddToPalette(hex);
      showToast(`Added ${hex} to palette`);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Shades of {color.label || color.hex}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Click to copy, &quot;Use this shade&quot; to replace, or &quot;Add to palette&quot; to add as new color
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Original color */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Original:</p>
          <ShadeRow
            hex={color.hex}
            label="Current color"
            onCopy={() => copyHex(color.hex)}
          />
        </div>

        {/* Shades list */}
        <div className="p-6 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-3">Variations (light to dark):</p>

          {shades.map((shade, index) => (
            <ShadeRow
              key={index}
              hex={shade}
              label={`Shade ${index + 1}`}
              onCopy={() => copyHex(shade)}
              onUse={() => handleUseShade(shade)}
              onAddToPalette={onAddToPalette ? () => handleAddToPalette(shade) : undefined}
              showUseButton={shade !== color.hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual shade row
 */
interface ShadeRowProps {
  hex: string;
  label: string;
  onCopy: () => void;
  onUse?: () => void;
  onAddToPalette?: () => void;
  showUseButton?: boolean;
}

function ShadeRow({ hex, label, onCopy, onUse, onAddToPalette, showUseButton = false }: ShadeRowProps) {
  const brightness = getColorBrightness(hex);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      {/* Top row: Swatch and info */}
      <div className="flex items-center gap-3 flex-1">
        {/* Swatch */}
        <div
          className="w-16 sm:w-20 h-10 sm:h-12 rounded shadow-sm flex items-center justify-center cursor-pointer flex-shrink-0"
          style={{ backgroundColor: hex }}
          onClick={onCopy}
          title="Click to copy"
        >
          <span className={`text-xs font-mono ${brightness === 'light' ? 'text-gray-800' : 'text-white'}`}>
            {hex}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{hex}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 ml-0 sm:ml-auto">
        <button
          onClick={onCopy}
          className="px-2.5 py-1 sm:px-3 sm:py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm font-medium transition-colors"
        >
          Copy
        </button>
        {showUseButton && onUse && (
          <button
            onClick={onUse}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs sm:text-sm font-medium transition-colors"
          >
            Use
          </button>
        )}
        {onAddToPalette && (
          <button
            onClick={onAddToPalette}
            className="px-2.5 py-1 sm:px-3 sm:py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded text-xs sm:text-sm font-medium transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}
