/**
 * Main App component
 *
 * Manages the overall application state and routing between views:
 * - PaletteList: gallery of all palettes
 * - PaletteEditor: edit a single palette
 * - Modals: Shades and Export
 */

import { useState, useEffect } from 'react';
import { VibePalette, VibeColor } from './lib/paletteTypes';
import { loadPalettes, savePalettes } from './lib/storage';
import { ToastProvider } from './components/Toast';
import { PaletteList } from './views/PaletteList';
import { PaletteEditor } from './views/PaletteEditor';
import { ShadesModal } from './components/ShadesModal';
import { ExportModal } from './components/ExportModal';

type View = 'list' | 'editor';

function App() {
  const [palettes, setPalettes] = useState<VibePalette[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);

  // Modal states
  const [shadesModal, setShadesModal] = useState<{
    color: VibeColor;
    onSelect: (hex: string) => void;
  } | null>(null);
  const [exportModal, setExportModal] = useState<VibePalette | null>(null);

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

  const handleBack = () => {
    setCurrentView('list');
    setSelectedPaletteId(null);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Vibe Palettes</h1>
          </div>
        </header>

        {/* Main content */}
        <main>
          {currentView === 'list' && (
            <PaletteList
              palettes={palettes}
              onSelectPalette={handleSelectPalette}
              onCreatePalette={handleCreatePalette}
            />
          )}

          {currentView === 'editor' && selectedPalette && (
            <PaletteEditor
              palette={selectedPalette}
              onSave={handleSavePalette}
              onSaveAsCopy={handleSaveAsCopy}
              onBack={handleBack}
              onDelete={handleDeletePalette}
              onOpenShades={(color, onSelect) => setShadesModal({ color, onSelect })}
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
