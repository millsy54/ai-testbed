# Vite + React + Electron drag-files example

This project provides two drag strategies:

- Browser mode (`npm run dev`): uses `DataTransfer` for desktop drops in Chromium.
- Electron mode (`npm run dev:electron`): uses OS-native `webContents.startDrag`, which is required for reliable Outlook desktop attachment drag/drop.

In the current UI, each entire file tile is draggable (not a separate drag button).
The drag preview uses a generic placeholder icon so it does not show file image contents.

## Quick start (PowerShell)

```powershell
# from project root
npm install
npm run dev:electron
```

## Scripts

- `npm run dev` - Vite web app only.
- `npm run dev:electron` - Vite + Electron shell with native drag bridge.
- `npm run build:web` - build web assets only.
- `npm run build:electron` - build and package Electron app (includes `public/files` as app resources).

## Outlook note

Classic Outlook desktop on Windows often ignores browser-origin drag payloads.
Electron mode bypasses this by initiating drag from the native process.
