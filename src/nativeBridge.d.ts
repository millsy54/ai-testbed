export type NativeDragPayload = {
  name: string
  icon?: string
}

export type NativeAttachResult = {
  ok: boolean
  message: string
}

export type NativeBridgeApi = {
  isElectron: true
  validateFile: (payload: NativeDragPayload) => Promise<boolean>
  attachToOutlook: (payload: NativeDragPayload) => Promise<NativeAttachResult>
  startDrag: (payload: NativeDragPayload) => void
}

declare global {
  interface Window {
    nativeBridge?: NativeBridgeApi
  }
}

export {}
