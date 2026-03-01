# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Bible reading presentation app built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. Features dual-language support (English and Chinese), a control panel interface, and a popup projection window for presenting Bible verses. All user data (bookmarks, reading history, preferences) is stored client-side in localStorage.

## Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:3000

# Production
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint
```

## Architecture

### Data Flow

**Dual-Window Architecture**: The app uses two separate windows for presentation:
- **Control Panel** (main page `/`): Book/chapter/verse selector, language controls, reading history
- **Projection Window** (`/popup`): Full-screen verse display for presenting

Communication between windows uses **BroadcastChannel API** (with localStorage fallback). The control panel sends updates to the popup when the user changes selection, version, language, or font size.

### Bible API Strategy

The app supports multiple Bible versions through two different APIs:

1. **English versions** (KJV, NIV): Uses [scripture.api.bible](https://scripture.api.bible)
   - Requires `BIBLE_API_KEY` in `.env.local`
   - Requests go through Next.js API route `/api/bible/route.ts` to keep API key secure
   - Fetches verses individually to get text content (bulk endpoint doesn't include verse text)

2. **Chinese versions** (CUNPSS, CCB): Uses [getbible.net](https://getbible.net) API
   - No API key required
   - Direct client-side requests from `src/lib/bible.ts`
   - Book IDs are mapped from app abbreviations to numeric IDs (see `BOOK_ID_MAP`)

### Key Implementation Details

**Book ID Mapping**: Books use uppercase abbreviations internally (`'GEN'`, `'MAT'`) but need conversion:
- For Bible API (English): mostly 1:1 except Song of Solomon (`'SOS'` → `'SNG'`)
- For GetBible API (Chinese): use numeric IDs 1-66 (via `BOOK_ID_MAP`)

**Caching**: Both APIs use `cache: 'force-cache'` in fetch requests. In-memory caches (`booksCache`, `versesCache`) prevent redundant API calls during a session.

**Fallback Data**: All 66 Bible books are hardcoded in `getFallbackBooks()` with chapter counts, Chinese names, and pinyin for search. This ensures the book list always works even if APIs are unavailable.

**localStorage Keys**:
- `bible_bookmarks` - Array of bookmarked verses with timestamps
- `bible_reading_history` - Last 30 chapters read (newest first)
- `bible_languages` - Selected languages `['en' | 'zh']`
- `bible_version` - Current Bible version ID
- `bible_font_size` - Font size preference

**Verse Highlighting**: When jumping to a specific verse (from bookmarks or search), the verse is highlighted with yellow background (`#fef08a`) for 60 seconds.

## Configuration

### Environment Variables

Required for English Bible versions (see `SETUP_BIBLE_API.md` for setup):

```bash
BIBLE_API_KEY=your_api_key_here  # From https://scripture.api.bible
```

### TypeScript Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`)

## File Structure

```
src/
├── app/
│   ├── page.tsx              # Main control panel page
│   ├── popup/page.tsx        # Projection window (BroadcastChannel consumer)
│   ├── bookmarks/page.tsx    # Bookmarks view
│   ├── search/page.tsx       # Bible search
│   ├── layout.tsx            # Root layout with metadata
│   └── api/bible/
│       ├── route.ts          # Proxy for Bible API (protects API key)
│       └── list/route.ts     # Lists available Bible versions
├── components/
│   ├── ControlPanel.tsx      # Main control interface with selectors
│   ├── BookSelector.tsx      # Book/chapter dropdown UI
│   ├── VerseDisplay.tsx      # Single verse renderer
│   ├── DualLanguageVerseDisplay.tsx  # Side-by-side bilingual display
│   ├── LanguageSelector.tsx  # Language toggle buttons
│   ├── BibleModal.tsx        # Search results modal
│   └── VersesPopup.tsx       # (appears unused, legacy component)
└── lib/
    ├── bible.ts              # Bible data fetching, caching, search
    ├── storage.ts            # localStorage utilities
    └── translations.ts       # UI translation strings (en/zh)
```

## Common Patterns

**Loading verses**: Always use `getChapter(bookId, chapter, version)` from `@/lib/bible`. Never fetch directly from APIs as it bypasses caching and error handling.

**Dual-language display**: When both English and Chinese are selected, load both versions and pass to `DualLanguageVerseDisplay` via `translationMap` prop (verse ID → translation text).

**Opening projection window**: Use `window.open('/popup', 'bible-popup', '...')` with window features. Then send data via `BroadcastChannel('bible_app').postMessage({...})`.

## Testing the App

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Configure Bible API key (see `SETUP_BIBLE_API.md`)
4. Select a book and chapter
5. Click "Project" button to open projection window
6. Both windows should stay synchronized

## Known Issues

- Chinese version pinyin in fallback data has some typos (e.g., `'chuaijiji'` should be `'chuaijiji'` for Exodus)
- ESV translation not available (requires paid licensing from Crossway)
