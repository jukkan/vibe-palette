# Vibe Palettes

A minimal, focused color palette manager built for marketers and non-designers who need a simple tool to manage brand colors for websites, slide decks, thumbnails, and social graphics.

Inspired by Coolors but stripped down to just the essentials you actually need.

## Features

- **Simple palette management**: Create, edit, and organize color palettes
- **Color roles**: Assign semantic roles (primary, accent, background, text) to colors
- **Shade generator**: Explore light and dark variations of any color
- **Live preview**: See how your palette looks in real UI elements
- **Export options**: Export as JSON or human-readable text for AI prompts
- **No backend required**: All data stored in localStorage
- **Responsive design**: Works on laptop and tablet

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for production

```bash
npm run build
```

The production build will be in the `dist` folder.

### Preview production build

```bash
npm run preview
```

## How It Works

### Data Storage

All palettes are stored in your browser's localStorage under the key `"vibe-palettes-v1"`.

- **First time**: The app creates a default example palette to get you started
- **Persistence**: Your palettes are saved automatically whenever you make changes
- **No cloud sync**: Everything stays in your browser

### Resetting/Wiping Data

If you want to start fresh and clear all palettes:

1. Open your browser's developer console (F12)
2. Run this command:
   ```javascript
   localStorage.removeItem('vibe-palettes-v1')
   ```
3. Refresh the page

The app will recreate the default example palette.

## Project Structure

```
vibe-palette/
├── src/
│   ├── lib/
│   │   ├── paletteTypes.ts      # TypeScript interfaces
│   │   ├── storage.ts           # localStorage helpers
│   │   └── colorUtils.ts        # Color manipulation utilities
│   ├── components/
│   │   ├── Toast.tsx            # Toast notification system
│   │   ├── ShadesModal.tsx      # Shade explorer modal
│   │   └── ExportModal.tsx      # Export modal (JSON/text)
│   ├── views/
│   │   ├── PaletteList.tsx      # Gallery view of all palettes
│   │   └── PaletteEditor.tsx    # Edit a single palette
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles + Tailwind
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Key Components

### PaletteList
- Displays all palettes as cards in a responsive grid
- Each card shows color stripes and palette metadata
- "New Palette" button opens a modal to create a palette with a base color and generates 5 harmonious colors

### PaletteEditor
- **Left panel**: Palette metadata and color list
- **Right panel**: Live preview of the palette in use
- Edit color hex values, labels, and roles
- Reorder colors with left/right arrows
- Delete individual colors
- "Shades" button opens the shade explorer
- "Export" button opens export options

### ShadesModal
- Generates ~12 shades of a color from light to dark
- Click to copy hex value
- "Use this shade" button replaces the original color

### ExportModal
- **JSON tab**: Structured data for programmatic use
- **Chat text tab**: Human-readable description for AI prompts

## Usage Tips

1. **Assign roles**: Set color roles (primary, accent, background, text) to see a more accurate preview
2. **Clone palettes**: Use "Save as Copy" to create variations
3. **Explore shades**: Use the shade generator to find lighter/darker versions
4. **Export for AI**: Use the "Chat text" export to quickly describe your palette in AI prompts

## Browser Compatibility

Works in all modern browsers that support:
- ES2020
- localStorage
- CSS Grid
- CSS Custom Properties

## License

MIT

## Contributing

This is a simple, focused tool. If you want to add features, feel free to fork and customize for your needs!
