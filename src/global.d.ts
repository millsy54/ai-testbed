// Ambient declarations for certain drag/drop APIs not present in lib.dom.d.ts for all TS versions
declare global {
  interface DataTransferItemList {
    // Some browsers (Chromium family) provide an `add` overload that accepts a File
    // We mark it optional to avoid conflicts with strict lib versions.
    add?: (file: File) => DataTransferItem | void
  }
}

export {}
