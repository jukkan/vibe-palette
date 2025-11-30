/**
 * Main App component
 *
 * Manages the overall application state and routing between views:
 * - PaletteList: gallery of all palettes
 * - PaletteEditor: edit a single palette
 * - Modals: Shades and Export
 */

import { useState, useEffect, useMemo } from 'react';
import { VibePalette, VibeColor } from './lib/paletteTypes';
import { loadPalettes, savePalettes } from './lib/storage';
import { ToastProvider } from './components/Toast';
import { PaletteList } from './views/PaletteList';
import { PaletteEditor } from './views/PaletteEditor';
import { ShadesModal } from './components/ShadesModal';
import { ExportModal } from './components/ExportModal';

type View = 'list' | 'editor';

/**
 * Generates a random gradient with two colors
 * Returns gradient CSS and text color (white or black) for readability
 */
function generateRandomGradient() {
  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 60 + Math.floor(Math.random() * 120)) % 360; // 60-180 degrees apart

  const saturation1 = 60 + Math.floor(Math.random() * 30); // 60-90%
  const saturation2 = 60 + Math.floor(Math.random() * 30);

  const lightness1 = 45 + Math.floor(Math.random() * 20); // 45-65%
  const lightness2 = 45 + Math.floor(Math.random() * 20);

  const color1 = `hsl(${hue1}, ${saturation1}%, ${lightness1}%)`;
  const color2 = `hsl(${hue2}, ${saturation2}%, ${lightness2}%)`;

  const angle = Math.floor(Math.random() * 360);

  // Calculate average lightness to determine text color
  const avgLightness = (lightness1 + lightness2) / 2;
  const textColor = avgLightness > 55 ? '#1F2937' : '#FFFFFF';

  return {
    gradient: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
    textColor,
  };
}

function App() {
  const [palettes, setPalettes] = useState<VibePalette[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);

  // Modal states
  const [shadesModal, setShadesModal] = useState<{
    color: VibeColor;
    onSelect: (hex: string) => void;
    onAddToPalette?: (hex: string) => void;
  } | null>(null);
  const [exportModal, setExportModal] = useState<VibePalette | null>(null);

  // Generate random gradient once on mount
  const headerStyle = useMemo(() => generateRandomGradient(), []);

  // Load palettes on mount
  useEffect(() => {
    const loaded = loadPalettes();
    setPalettes(loaded);
  }, []);

  // Get selected palette
  const selectedPalette = palettes.find((p) => p.id === selectedPaletteId);

  // Handlers
  const handleSelectPalette = (paletteId: string) => {
    setSelectedPaletteId(paletteId);
    setCurrentView('editor');
  };

  const handleCreatePalette = (palette: VibePalette) => {
    const updated = [...palettes, palette];
    setPalettes(updated);
    savePalettes(updated);
    setSelectedPaletteId(palette.id);
    setCurrentView('editor');
  };

  const handleSavePalette = (palette: VibePalette) => {
    const updated = palettes.map((p) => (p.id === palette.id ? palette : p));
    setPalettes(updated);
    savePalettes(updated);
  };

  const handleSaveAsCopy = (palette: VibePalette) => {
    const updated = [...palettes, palette];
    setPalettes(updated);
    savePalettes(updated);
    setSelectedPaletteId(palette.id);
  };

  const handleDeletePalette = (paletteId: string) => {
    const updated = palettes.filter((p) => p.id !== paletteId);
    setPalettes(updated);
    savePalettes(updated);
    setCurrentView('list');
    setSelectedPaletteId(null);
  };

  const handleRestoreBackup = (restoredPalettes: VibePalette[]) => {
    setPalettes(restoredPalettes);
    savePalettes(restoredPalettes);
    setCurrentView('list');
    setSelectedPaletteId(null);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedPaletteId(null);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header
          className="shadow-md relative"
          style={{ background: headerStyle.gradient }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1
              className="text-2xl font-bold"
              style={{ color: headerStyle.textColor }}
            >
              Vibe Palettes
            </h1>

            {/* GitHub Link */}
            <a
              href="https://github.com/jukkan/vibe-palette"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              title="View on GitHub"
            >
              <svg
                className="w-6 h-6"
                style={{ fill: headerStyle.textColor }}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </header>

        {/* Main content */}
        <main>
          {currentView === 'list' && (
            <PaletteList
              palettes={palettes}
              onSelectPalette={handleSelectPalette}
              onCreatePalette={handleCreatePalette}
              onRestoreBackup={handleRestoreBackup}
            />
          )}

          {currentView === 'editor' && selectedPalette && (
            <PaletteEditor
              palette={selectedPalette}
              onSave={handleSavePalette}
              onSaveAsCopy={handleSaveAsCopy}
              onBack={handleBack}
              onDelete={handleDeletePalette}
              onOpenShades={(color, onSelect, onAddToPalette) => 
                setShadesModal({ color, onSelect, onAddToPalette })
              }
              onOpenExport={setExportModal}
            />
          )}
        </main>

        {/* Modals */}
        {shadesModal && (
          <ShadesModal
            color={shadesModal.color}
            onClose={() => setShadesModal(null)}
            onSelectShade={shadesModal.onSelect}
            onAddToPalette={shadesModal.onAddToPalette}
          />
        )}

        {exportModal && (
          <ExportModal palette={exportModal} onClose={() => setExportModal(null)} />
        )}
      </div>
    </ToastProvider>
  );
}

export default App;
