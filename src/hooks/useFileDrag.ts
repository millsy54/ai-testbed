import React from 'react'
import type { DragCapability, DragState, FileManifestItem } from '../types'

const detectDragCapability = (): DragCapability => {
  if (window.nativeBridge?.isElectron) {
    return {
      supportsDesktopDrop: true,
      supportsNativeFilePayload: true,
      browserLabel: 'Electron shell',
    }
  }

  const ua = navigator.userAgent
  const isEdge = ua.includes('Edg/')
  const isChrome = ua.includes('Chrome/') && !ua.includes('OPR/') && !ua.includes('Brave')
  const hasNativeFileAdd =
    typeof DataTransferItemList !== 'undefined' &&
    typeof DataTransferItemList.prototype.add === 'function'
  const isChromium = isEdge || isChrome || ua.includes('Chromium/')

  if (isEdge) {
    return {
      supportsDesktopDrop: true,
      supportsNativeFilePayload: hasNativeFileAdd,
      browserLabel: 'Microsoft Edge',
    }
  }

  if (isChrome || ua.includes('Chromium/')) {
    return {
      supportsDesktopDrop: true,
      supportsNativeFilePayload: hasNativeFileAdd,
      browserLabel: 'Chromium-based browser',
    }
  }

  return {
    supportsDesktopDrop: false,
    supportsNativeFilePayload: false,
    browserLabel: 'non-Chromium browser',
  }
}

export const useFileDrag = (files: FileManifestItem[]) => {
  const usingNativeBridge = Boolean(window.nativeBridge?.isElectron)
  const [nativeReadyById, setNativeReadyById] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const file of files) {
      initial[file.id] = false
    }
    return initial
  })
  const [statusById, setStatusById] = React.useState<Record<string, DragState>>(() => {
    const initial: Record<string, DragState> = {}
    for (const file of files) {
      initial[file.id] = 'loading'
    }
    return initial
  })
  const [filePayloadsById, setFilePayloadsById] = React.useState<Record<string, File | null>>(() => {
    const initial: Record<string, File | null> = {}
    for (const file of files) {
      initial[file.id] = null
    }
    return initial
  })

  const capability = React.useMemo(() => detectDragCapability(), [])

  React.useEffect(() => {
    if (!usingNativeBridge) return

    let active = true
    const validateNativeFiles = async () => {
      await Promise.all(
        files.map(async (file) => {
          try {
            const valid = await window.nativeBridge?.validateFile({ name: file.name })
            if (!active) return
            const isValid = Boolean(valid)
            setNativeReadyById((prev) => ({ ...prev, [file.id]: isValid }))
            setStatusById((prev) => ({ ...prev, [file.id]: isValid ? 'idle' : 'failed' }))
          } catch {
            if (!active) return
            setNativeReadyById((prev) => ({ ...prev, [file.id]: false }))
            setStatusById((prev) => ({ ...prev, [file.id]: 'failed' }))
          }
        }),
      )
    }

    validateNativeFiles()

    return () => {
      active = false
    }
  }, [files, usingNativeBridge])

  React.useEffect(() => {
    if (usingNativeBridge) return

    let active = true
    const hydratePayloads = async () => {
      await Promise.all(
        files.map(async (file) => {
          try {
            const response = await fetch(file.url)
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }
            const blob = await response.blob()
            const payload = new File([blob], file.name, { type: file.mimeType })
            if (!active) return
            setFilePayloadsById((prev) => ({ ...prev, [file.id]: payload }))
            setStatusById((prev) => ({ ...prev, [file.id]: 'idle' }))
          } catch {
            if (!active) return
            setStatusById((prev) => ({ ...prev, [file.id]: 'failed' }))
          }
        }),
      )
    }

    hydratePayloads()

    return () => {
      active = false
    }
  }, [files, usingNativeBridge])

  const onDragStart = React.useCallback(
    (event: React.DragEvent<HTMLElement>, file: FileManifestItem) => {
      event.dataTransfer.effectAllowed = 'copy'
      const absoluteUrl = new URL(file.url, window.location.href).toString()
      const payload = filePayloadsById[file.id]

      setStatusById((prev) => ({ ...prev, [file.id]: 'dragging' }))

      const canAttachNativeFile =
        !usingNativeBridge &&
        Boolean(payload) &&
        Boolean(event.dataTransfer.items) &&
        typeof event.dataTransfer.items.add === 'function'

      try {
        if (usingNativeBridge) {
          event.dataTransfer.clearData()
          event.preventDefault()
          if (!nativeReadyById[file.id]) {
            throw new Error('native-file-unavailable')
          }
          window.nativeBridge?.startDrag({ name: file.name, icon: file.dragIcon })
        } else if (canAttachNativeFile && payload) {
          // Prioritize a native file payload for Outlook/mail clients.
          const addFile = event.dataTransfer.items.add
          if (typeof addFile === 'function') {
            addFile.call(event.dataTransfer.items, payload)
          }
        } else {
          // Fallback for desktop/folder drops when native payload cannot be added.
          event.dataTransfer.setData(
            'DownloadURL',
            `${file.mimeType}:${file.name}:${absoluteUrl}`,
          )
          event.dataTransfer.setData('text/uri-list', absoluteUrl)
          event.dataTransfer.setData('text/plain', absoluteUrl)
        }

        setStatusById((prev) => ({ ...prev, [file.id]: 'ready' }))
      } catch {
        setStatusById((prev) => ({ ...prev, [file.id]: 'failed' }))
      }
    },
    [filePayloadsById, nativeReadyById, usingNativeBridge],
  )

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLElement>, fileId: string) => {
    event.preventDefault()
    setStatusById((prev) => ({ ...prev, [fileId]: prev[fileId] === 'failed' ? 'failed' : 'idle' }))
  }, [])

  const draggableById = React.useMemo(() => {
    const map: Record<string, boolean> = {}
    for (const file of files) {
      map[file.id] = usingNativeBridge
        ? Boolean(nativeReadyById[file.id])
        : Boolean(filePayloadsById[file.id]) && capability.supportsNativeFilePayload
    }
    return map
  }, [
    capability.supportsNativeFilePayload,
    filePayloadsById,
    files,
    nativeReadyById,
    usingNativeBridge,
  ])

  return {
    capability,
    statusById,
    draggableById,
    onDragStart,
    onDragEnd,
  }
}
