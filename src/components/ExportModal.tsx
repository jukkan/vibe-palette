/**
 * ExportModal component
 *
 * Modal for exporting palette data in two formats:
 * 1. JSON - structured data for programmatic use
 * 2. Chat text - human-readable description for AI prompts
 */

import { useState } from 'react';
import { VibePalette } from '../lib/paletteTypes';
import { useToast } from './Toast';

interface ExportModalProps {
  palette: VibePalette;
  onClose: () => void;
}

export function ExportModal({ palette, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'text'>('json');
  const { showToast } = useToast();

  // Generate JSON export
  const jsonExport = JSON.stringify(palette, null, 2);

  // Generate chat text export
  const textExport = generateChatText(palette);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied ${label}!`);
    } catch (err) {
      showToast('Failed to copy');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Export Palette</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('json')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'json'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Chat Text
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'json' ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Structured JSON data for programmatic use or importing into other tools.
              </p>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto font-mono border border-gray-200">
                {jsonExport}
              </pre>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Human-readable description perfect for pasting into AI prompts or design briefs.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-200 whitespace-pre-wrap">
                {textExport}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Close
          </button>
          <button
            onClick={() =>
              copyToClipboard(
                activeTab === 'json' ? jsonExport : textExport,
                activeTab === 'json' ? 'JSON' : 'text'
              )
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Copy {activeTab === 'json' ? 'JSON' : 'Text'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Generates human-readable chat text for a palette
 */
function generateChatText(palette: VibePalette): string {
  const parts: string[] = [];

  // Brand and name
  if (palette.brand) {
    parts.push(`Brand: ${palette.brand}.`);
  }
  parts.push(`Palette: ${palette.name}.`);

  // Notes
  if (palette.notes) {
    parts.push(`Notes: ${palette.notes}`);
  }

  // Colors
  if (palette.colors.length > 0) {
    const colorDescriptions = palette.colors.map((color) => {
      let desc = color.hex;

      if (color.label) {
        desc += ` "${color.label}"`;
      }

      if (color.role && color.role !== 'other') {
        desc += ` (${color.role})`;
      }

      return desc;
    });

    parts.push(`Colors: ${colorDescriptions.join(', ')}.`);
  }

  return parts.join(' ');
}
