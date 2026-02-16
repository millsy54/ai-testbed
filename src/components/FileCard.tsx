import type { DragState, FileManifestItem } from '../types'

type FileCardProps = {
  file: FileManifestItem
  dragState: DragState
  draggable: boolean
  onDragStart: (event: React.DragEvent<HTMLElement>, file: FileManifestItem) => void
  onDragEnd: (event: React.DragEvent<HTMLElement>, fileId: string) => void
}

const stateLabel: Record<DragState, string> = {
  loading: 'Preparing',
  idle: 'Ready',
  dragging: 'Dragging',
  ready: 'Drop into Outlook/Desktop',
  failed: 'Failed',
}

export function FileCard({
  file,
  dragState,
  draggable,
  onDragStart,
  onDragEnd,
}: FileCardProps) {
  return (
    <article
      className={`file-card state-${dragState} ${draggable ? 'is-draggable' : 'is-disabled'}`}
      draggable={draggable}
      onDragStart={(event) => onDragStart(event, file)}
      onDragEnd={(event) => onDragEnd(event, file.id)}
      aria-label={`File ${file.name}`}
      title={draggable ? `Drag ${file.name} to Outlook or your desktop` : `${file.name} (download only)`}
    >
      <div className="file-token" aria-hidden="true">
        {file.name.split('.').pop()?.toUpperCase() ?? 'FILE'}
      </div>
      <div className="file-main">
        <div className="filename">{file.name}</div>
        <div className="filetype">{file.mimeType}</div>
        <div className="filehint">{file.description}</div>
      </div>
      <div className="file-side">
        <span className={`status-pill status-${dragState}`}>{stateLabel[dragState]}</span>
        <a className="download-link" href={file.url} download={file.name} draggable={false}>
          Download
        </a>
      </div>
    </article>
  )
}
