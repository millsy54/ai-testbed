import type { DragState, FileManifestItem } from '../types'
import { FileCard } from './FileCard'

type FileListProps = {
  files: FileManifestItem[]
  statusById: Record<string, DragState>
  draggableById: Record<string, boolean>
  onDragStart: (event: React.DragEvent<HTMLElement>, file: FileManifestItem) => void
  onDragEnd: (event: React.DragEvent<HTMLElement>, fileId: string) => void
}

export function FileList({
  files,
  statusById,
  draggableById,
  onDragStart,
  onDragEnd,
}: FileListProps) {
  return (
    <section className="file-list" aria-label="Draggable files">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          dragState={statusById[file.id] ?? 'idle'}
          draggable={draggableById[file.id] ?? false}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      ))}
    </section>
  )
}
