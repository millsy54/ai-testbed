# Vite + React + Electron drag-files example

This project provides two drag strategies:

- Browser mode (`npm run dev`): uses `DataTransfer` for desktop drops in Chromium.
- Electron mode (`npm run dev:electron`): uses OS-native `webContents.startDrag`, which is required for reliable Outlook desktop attachment drag/drop.
  It also includes a native `Attach to Outlook` button (COM automation) for Classic Outlook when drag/drop is blocked.

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
Electron mode bypasses this by initiating drag from the native process and includes a direct attach action.
