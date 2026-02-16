export type FileManifestItem = {
  id: string
  name: string
  mimeType: string
  url: string
  sizeLabel: string
  description: string
  dragIcon?: string
}

export type DragState = 'loading' | 'idle' | 'dragging' | 'ready' | 'failed'

export type DragCapability = {
  supportsDesktopDrop: boolean
  supportsNativeFilePayload: boolean
  browserLabel: string
}
