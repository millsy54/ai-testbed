import type { FileManifestItem } from './types'

export const fileManifest: FileManifestItem[] = [
  {
    id: 'example-pdf',
    name: 'example.pdf',
    mimeType: 'application/pdf',
    url: '/files/example.pdf',
    sizeLabel: 'PDF sample',
    description: 'Simple PDF document for drag-out testing.',
    dragIcon: 'picture.png',
  },
  {
    id: 'message-msg',
    name: 'message.msg',
    mimeType: 'application/vnd.ms-outlook',
    url: '/files/message.msg',
    sizeLabel: 'Outlook message',
    description: 'Sample Outlook message file.',
    dragIcon: 'picture.png',
  },
  {
    id: 'picture-png',
    name: 'picture.png',
    mimeType: 'image/png',
    url: '/files/picture.png',
    sizeLabel: 'PNG image',
    description: 'Sample image for drag and download behavior.',
    dragIcon: 'picture.png',
  },
]
