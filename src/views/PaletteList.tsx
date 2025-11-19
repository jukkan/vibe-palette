/**
 * PaletteList view
 *
 * Main gallery view showing all palettes as cards in a responsive grid.
 * Each card displays the palette name, brand, and color stripes.
 */

import { VibePalette } from '../lib/paletteTypes';
import { generateId } from '../lib/storage';

interface PaletteListProps {
  palettes: VibePalette[];
  onSelectPalette: (paletteId: string) => void;
  onCreatePalette: (palette: VibePalette) => void;
}

export function PaletteList({ palettes, onSelectPalette, onCreatePalette }: PaletteListProps) {
  const handleNewPalette = () => {
    const now = new Date().toISOString();

    // Create a new empty palette (or clone the last one if it exists)
    const lastPalette = palettes[palettes.length - 1];

    const newPalette: VibePalette = {
      id: generateId(),
      name: 'New Palette',
      brand: lastPalette?.brand || '',
      notes: '',
      colors: lastPalette
        ? lastPalette.colors.map((color) => ({
            ...color,
            id: generateId(),
          }))
        : [
            {
              id: generateId(),
              hex: '#3B82F6',
              label: 'Blue',
              role: 'primary',
            },
          ],
      createdAt: now,
      updatedAt: now,
    };

    onCreatePalette(newPalette);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Your Palettes</h2>
          <p className="text-gray-600 mt-1">
            {palettes.length} {palettes.length === 1 ? 'palette' : 'palettes'}
          </p>
        </div>

        <button
          onClick={handleNewPalette}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + New Palette
        </button>
      </div>

      {/* Palette Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {palettes.map((palette) => (
          <PaletteCard
            key={palette.id}
            palette={palette}
            onClick={() => onSelectPalette(palette.id)}
          />
        ))}
      </div>

      {/* Empty state */}
      {palettes.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No palettes yet</p>
          <button
            onClick={handleNewPalette}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Palette
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Individual palette card component
 */
function PaletteCard({ palette, onClick }: { palette: VibePalette; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      {/* Color stripes */}
      <div className="h-32 flex">
        {palette.colors.length > 0 ? (
          palette.colors.map((color) => (
            <div
              key={color.id}
              className="flex-1"
              style={{ backgroundColor: color.hex }}
              title={color.label || color.hex}
            />
          ))
        ) : (
          <div className="flex-1 bg-gray-200 flex items-center justify-center text-gray-400">
            No colors
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 truncate">{palette.name}</h3>
        {palette.brand && <p className="text-sm text-gray-600 mt-1 truncate">{palette.brand}</p>}
        <p className="text-xs text-gray-500 mt-2">
          {palette.colors.length} {palette.colors.length === 1 ? 'color' : 'colors'}
        </p>
      </div>
    </div>
  );
}
