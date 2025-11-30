# Copilot Instructions for Vibe Palette

## Project Overview

Vibe Palette is a minimal, focused color palette manager built for marketers and non-designers. It's a React single-page application that stores data in localStorage.

## Tech Stack

- **Vite 5** - Build tool and dev server
- **React 18** - UI framework
- **TypeScript 5** - Type safety (strict mode enabled)
- **Tailwind CSS 3** - Utility-first styling
- **Node.js 20** - Runtime environment

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs at http://localhost:5173/)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── lib/                    # Shared utilities and types
│   ├── paletteTypes.ts     # TypeScript interfaces for palettes
│   ├── storage.ts          # localStorage helpers
│   └── colorUtils.ts       # Color manipulation utilities
├── components/             # Reusable UI components
│   ├── Toast.tsx           # Toast notification system
│   ├── ShadesModal.tsx     # Shade explorer modal
│   └── ExportModal.tsx     # Export modal (JSON/text)
├── views/                  # Page-level components
│   ├── PaletteList.tsx     # Gallery view of all palettes
│   └── PaletteEditor.tsx   # Edit a single palette
├── App.tsx                 # Main app component with routing
├── main.tsx                # Entry point
└── index.css               # Global styles + Tailwind imports
```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with all compiler checks enabled
- Define interfaces in `src/lib/paletteTypes.ts` for shared types
- Prefer explicit type annotations for function parameters and return types
- Use `const` assertions where appropriate

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Place reusable components in `src/components/`
- Place page-level views in `src/views/`
- Use React 18 patterns (no class components)

### Tailwind CSS

- Use Tailwind utility classes for styling
- Keep custom CSS minimal (only in `src/index.css` if needed)
- Use responsive prefixes (`sm:`, `md:`, `lg:`) for breakpoints

### Code Examples

```tsx
// Component structure example
import { useState } from 'react';

interface Props {
  color: string;
  onSelect: (hex: string) => void;
}

export function ColorButton({ color, onSelect }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      className="px-4 py-2 rounded-lg transition-colors"
      style={{ backgroundColor: color }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(color)}
    >
      {color}
    </button>
  );
}
```

## Data Storage

- All palettes are stored in localStorage under the key `"vibe-palettes-v1"`
- Use the helper functions in `src/lib/storage.ts` for reading/writing data
- The app creates a default example palette on first load

## Boundaries and Constraints

### Do NOT

- Do not add backend services or API integrations - this is a client-only app
- Do not modify the localStorage key format without migration logic
- Do not add authentication or user accounts
- Do not commit secrets, API keys, or environment files
- Do not modify `.github/workflows/deploy.yml` without explicit request
- Do not add heavy dependencies - keep the bundle size minimal

### Do

- Keep the app simple and focused on color palette management
- Maintain responsive design for laptop and tablet
- Preserve existing Tailwind CSS patterns
- Follow existing component patterns in the codebase
- Ensure TypeScript strict mode passes without errors

## Testing

This project currently does not have automated tests. When adding features:
- Ensure the build passes (`npm run build`)
- Test manually in the development server (`npm run dev`)
- Verify responsive behavior at different viewport sizes

## Deployment

The app deploys automatically to GitHub Pages when changes are pushed to `main`. The production URL is `https://palette.jukkan.com`.
