# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taby is a cross-browser extension (Chrome, Firefox, Edge) that provides a keyboard-driven command palette for navigating tabs, bookmarks, and history. Uses React 19 + TypeScript + Vite.

## Development Commands

### Setup

```bash
pnpm install  # Install dependencies (requires pnpm 8 + Node 20)
```

### Building

```bash
pnpm run build:chrome    # Build for Chrome/Edge (manifest v3)
pnpm run build:firefox   # Build for Firefox (manifest v2)
```

Chrome builds use a special two-step process:

1. `build:background:chrome` - Compiles background script as IIFE using `vite.chrome.background.config.ts`
2. `build:web` - Builds popup and background HTML using main `vite.config.ts`
3. `build:manifest:chrome` - Swaps `manifestv3.json` to `manifest.json`

Firefox builds only need the web build step (uses `manifest.json` directly).

### Code Quality

```bash
pnpm run lint     # Run ESLint
pnpm run check    # Check Prettier formatting
pnpm run format   # Auto-format with Prettier
```

### Publishing

```bash
pnpm run publish:chrome   # Publish to Chrome Web Store (requires auth env vars)
pnpm run publish:firefox  # Publish to Firefox Add-ons (requires JWT env vars)
pnpm run sign:firefox     # Sign for unlisted distribution
```

## Architecture

### Message-Based Communication

The extension uses a message-passing architecture between popup UI and background service worker:

1. **Frontend** (popup) sends messages via `src/lib/search.ts` helper functions
2. **Background** (`src/background/background.ts`) listens for messages and routes to handlers
3. **Handlers** (`src/background/handler.ts`) execute browser API calls and return data

Message flow example:

- User types in Command component → `search_open_tabs()` → sends `REQUEST_SEARCH_OPEN_TABS` message → `handleRequestSearchOpenTabs()` → returns filtered tabs using Fuse.js

See `src/type/message.ts` for message type definitions.

### Browser API Abstraction

All Chrome/Firefox browser API calls go through `webextension-polyfill` for cross-browser compatibility. Only background scripts can access tabs/bookmarks/history APIs.

### Build System Complexity

Chrome requires manifest v3 with a service worker background script compiled as IIFE (not ESM). This necessitates a separate Vite config (`vite.chrome.background.config.ts`) that:

- Builds `src/background/background.ts` as a library in IIFE format
- Outputs to `dist/background.global.js` (referenced in `manifestv3.json`)
- Uses `emptyOutDir: false` to preserve popup build artifacts

Firefox uses manifest v2 with a background page, so the background HTML is built normally via the main Vite config.

### Fuzzy Search Implementation

All search (tabs, bookmarks, history) uses Fuse.js with identical patterns:

1. Fetch data from browser API
2. If search is empty, return all results
3. Otherwise, create Fuse instance with `keys: ["title", "url"]` (or `["title", "url", "key"]` for tabs)
4. Return search results mapped through `TTab.fromX()` converters

Search logic lives in background handlers (`src/background/handler.ts`), not the frontend.

### State Management

- **Settings**: Stored in `browser.storage.local`, accessed via `useSettings` hook
- **Navigation**: Tab/Bookmark/History/Settings groups managed by `useGroup` hook
- **Search results**: Fetched on-demand from background via messages

No global state library - uses React hooks + browser storage.

### Path Aliases

TypeScript and Vite both use `~/*` to alias `./src/*`:

- tsconfig: `"~/*": ["./src/*"]`
- vite: `resolve.alias: { "~": path.resolve(__dirname, "./src") }`

## Browser-Specific Differences

| Feature      | Chrome/Edge            | Firefox                   |
| ------------ | ---------------------- | ------------------------- |
| Manifest     | v3 (`manifestv3.json`) | v2 (`manifest.json`)      |
| Background   | Service worker (IIFE)  | Background page (HTML)    |
| Command      | `_execute_action`      | `_execute_browser_action` |
| Build script | `build:chrome`         | `build:firefox`           |

Firefox filters out `about:firefoxview` tabs in `handleRequestSearchOpenTabs`.

## Version Management

Version is defined in `public/manifest.json` and read by CI via `node -p "require('./public/manifest.json').version"`. Update version there, not in `package.json`.

## CI/CD Pipeline

On push to main:

1. Runs lint + prettier checks
2. Builds for both Chrome and Firefox in parallel
3. Publishes to all three stores (Chrome, Firefox, Edge) simultaneously
4. Creates GitHub release with zip artifacts

Edge uses the Chrome build but with different auth credentials (see `publish-edge` job in `.github/workflows/ci.yml`).
