import React from 'react'
import { FileList } from './components/FileList'
import { fileManifest } from './fileManifest'
import { useFileDrag } from './hooks/useFileDrag'

export default function App() {
  const { capability, statusById, draggableById, onDragStart, onDragEnd } = useFileDrag(fileManifest)
  const isElectronShell = capability.browserLabel === 'Electron shell'

  return (
    <main className="app">
      <header className="hero">
        <p className="kicker">Desktop transfer testbed</p>
        <h1>Drag Files Into Outlook or Desktop</h1>
        <p className="subtitle">
          In Electron mode, drag uses OS-native file drag via <code>startDrag</code> for Outlook
          attachment support. Browser mode keeps web drag fallbacks.
        </p>
      </header>

      <div className={`support-banner ${capability.supportsDesktopDrop ? 'ok' : 'warn'}`}>
        <strong>Browser detection:</strong> {capability.browserLabel}.{' '}
        {capability.supportsNativeFilePayload
          ? 'Native file payload drag is enabled.'
          : 'Native payload drag is limited; use Download links as fallback.'}
      </div>

      {!isElectronShell && (
        <p className="subtitle">
          Note: some Outlook desktop builds do not accept browser-origin drag payloads even when
          browsers provide file drag data. Electron mode uses OS-native drag APIs.
        </p>
      )}
      {isElectronShell && (
        <p className="subtitle">
          If a card is not in <strong>Ready</strong> state, that file path was not resolved by the
          native process and drag is disabled for that item.
        </p>
      )}

      <FileList
        files={fileManifest}
        statusById={statusById}
        draggableById={draggableById}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    </main>
  )
}
