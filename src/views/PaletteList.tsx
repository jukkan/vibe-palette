/**
 * PaletteList view
 *
 * Main gallery view showing all palettes as cards in a responsive grid.
 * Each card displays the palette name, brand, and color stripes.
 */

import { useState, useRef } from 'react';
import { VibePalette } from '../lib/paletteTypes';
import { generateId, exportBackup, importBackup } from '../lib/storage';
import { useToast } from '../components/Toast';

interface PaletteListProps {
  palettes: VibePalette[];
  onSelectPalette: (paletteId: string) => void;
  onCreatePalette: (palette: VibePalette) => void;
  onRestoreBackup: (palettes: VibePalette[]) => void;
}

export function PaletteList({ palettes, onSelectPalette, onCreatePalette, onRestoreBackup }: PaletteListProps) {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const { showToast } = useToast();

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

  const handleImport = (jsonText: string) => {
    try {
      const imported = JSON.parse(jsonText) as VibePalette;
      
      // Validate the imported data has required fields
      if (!imported.name || !Array.isArray(imported.colors)) {
        showToast('Invalid palette data');
        return;
      }

      // Generate new IDs for the palette and colors
      const now = new Date().toISOString();
      const newPalette: VibePalette = {
        ...imported,
        id: generateId(),
        colors: imported.colors.map(color => ({
          ...color,
          id: generateId(),
        })),
        createdAt: now,
        updatedAt: now,
      };

      onCreatePalette(newPalette);
      setShowImportModal(false);
      showToast('Palette imported successfully!');
    } catch (err) {
      showToast('Failed to import: Invalid JSON');
    }
  };

  const handleBackup = () => {
    try {
      exportBackup();
      showToast('Backup downloaded!');
    } catch (err) {
      showToast('Failed to create backup');
    }
  };

  const handleRestore = (jsonContent: string) => {
    try {
      const restored = importBackup(jsonContent);
      onRestoreBackup(restored);
      setShowRestoreModal(false);
      showToast(`Restored ${restored.length} palette${restored.length === 1 ? '' : 's'}!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to restore backup');
    }
  };

  // Group palettes by brand
  const groupedPalettes = palettes.reduce((groups, palette) => {
    const brand = palette.brand || 'Uncategorized';
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(palette);
    return groups;
  }, {} as Record<string, VibePalette[]>);

  // Sort brands alphabetically, but put Uncategorized last
  const sortedBrands = Object.keys(groupedPalettes).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

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

        <div className="flex gap-2">
          <button
            onClick={handleBackup}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            title="Download all palettes as a backup file"
          >
            Backup
          </button>
          <button
            onClick={() => setShowRestoreModal(true)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            title="Restore palettes from a backup file"
          >
            Restore
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Import
          </button>
          <button
            onClick={handleNewPalette}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + New Palette
          </button>
        </div>
      </div>

      {/* Grouped Palettes */}
      {sortedBrands.map((brand) => (
        <div key={brand} className="mb-10">
          {/* Brand Header */}
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            {brand}
            <span className="text-sm font-normal text-gray-500">
              ({groupedPalettes[brand].length})
            </span>
          </h3>
          
          {/* Palette Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedPalettes[brand].map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                onClick={() => onSelectPalette(palette.id)}
              />
            ))}
          </div>
        </div>
      ))}

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

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <RestoreModal
          onClose={() => setShowRestoreModal(false)}
          onRestore={handleRestore}
        />
      )}
    </div>
  );
}

/**
 * Individual palette card component
 */
function PaletteCard({ palette, onClick }: { palette: VibePalette; onClick: () => void }) {
  const { showToast } = useToast();

  const handleColorClick = (e: React.MouseEvent, hex: string) => {
    e.stopPropagation(); // Prevent card click
    navigator.clipboard.writeText(hex);
    showToast(`Copied ${hex} to clipboard`);
  };

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
              className="flex-1 relative group cursor-copy transition-all duration-200 hover:scale-110 hover:z-10"
              style={{ backgroundColor: color.hex }}
              title={color.label || color.hex}
              onClick={(e) => handleColorClick(e, color.hex)}
            >
              {/* Copy icon - shown on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-8 h-8 drop-shadow-lg"
                  style={{ color: getContrastColor(color.hex) }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
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
        {palette.brand && (
          <span className="inline-block px-2 py-1 mt-2 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {palette.brand}
          </span>
        )}
        {palette.notes && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{palette.notes}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          {palette.colors.length} {palette.colors.length === 1 ? 'color' : 'colors'}
        </p>
      </div>
    </div>
  );
}

/**
 * Calculate contrasting color (white or black) for text on a background
 */
function getContrastColor(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Import modal component
 */
function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (json: string) => void }) {
  const [jsonText, setJsonText] = useState('');

  const handleImport = () => {
    if (jsonText.trim()) {
      onImport(jsonText);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Import Palette</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <p className="text-sm text-gray-600 mb-3">
            Paste the JSON content from an exported palette below:
          </p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder='{"id": "...", "name": "My Palette", ...}'
          />
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!jsonText.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Palette
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Restore modal component for importing backup files
 * 
 * Allows users to restore all palettes from a backup file by either:
 * - Clicking to select a .json backup file from their device
 * - Pasting the backup JSON content directly into the textarea
 * 
 * @param onClose - Callback when the modal is closed
 * @param onRestore - Callback with the JSON content when restore is confirmed
 */
function RestoreModal({ onClose, onRestore }: { onClose: () => void; onRestore: (json: string) => void }) {
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestore = () => {
    if (jsonText.trim()) {
      onRestore(jsonText);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          setJsonText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Restore from Backup</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Restoring from a backup will replace all your current palettes. 
              Make sure to backup your current palettes first if you want to keep them.
            </p>
          </div>
          
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-8 text-center transition-colors"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">
                Click to select a backup file
              </p>
              <p className="text-xs text-gray-500 mt-1">
                or paste the JSON content below
              </p>
            </button>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Paste backup JSON content here..."
          />
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            disabled={!jsonText.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Restore Backup
          </button>
        </div>
      </div>
    </div>
  );
}
