import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PDFViewer.css';

interface PDFViewerProps {
  pdfPath: string;
  pageNumber: number;
  zoom: number;
  onPageChange: (pageNumber: number) => void;
  onZoomChange: (zoom: number) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

interface PDFDocument {
  numPages: number;
  getPage: (pageNum: number) => Promise<any>;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfPath,
  pageNumber,
  zoom,
  onPageChange,
  onZoomChange,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderingRef = useRef(false);

  // Initialize pdfjs worker
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
  }, []);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setError(null);
        const pdf = await pdfjsLib.getDocument(pdfPath).promise;
        setPdfDoc(pdf as unknown as PDFDocument);
      } catch (err) {
        setError(`Failed to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Error loading PDF:', err);
      }
    };

    if (pdfPath) {
      loadPDF();
    }
  }, [pdfPath]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || renderingRef.current) {
        return;
      }

      // Validate page number
      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
        setError(`Invalid page number: ${pageNumber}`);
        return;
      }

      renderingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        // Calculate rendering scale for high-quality output (150+ DPI)
        const baseScale = zoom * (window.devicePixelRatio || 1) * 1.5;

        const viewport = page.getViewport({ scale: baseScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Notify that canvas is ready
        if (onCanvasReady) {
          onCanvasReady(canvas);
        }
      } catch (err) {
        setError(`Failed to render page: ${err instanceof Error ? err.message : 'Unknown error'}`);
        console.error('Error rendering page:', err);
      } finally {
        renderingRef.current = false;
        setIsLoading(false);
      }
    };

    renderPage();
  }, [pdfDoc, pageNumber, zoom, onCanvasReady]);

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      onPageChange(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pdfDoc && pageNumber < pdfDoc.numPages) {
      onPageChange(pageNumber + 1);
    }
  };

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(3, newZoom));
    onZoomChange(clampedZoom);
  };

  const handleZoomIn = () => {
    const nextZoom = ZOOM_LEVELS.find((z) => z > zoom);
    if (nextZoom) {
      handleZoomChange(nextZoom);
    }
  };

  const handleZoomOut = () => {
    const prevZoom = [...ZOOM_LEVELS].reverse().find((z) => z < zoom);
    if (prevZoom) {
      handleZoomChange(prevZoom);
    }
  };

  const handleZoomPreset = (level: number) => {
    handleZoomChange(level);
  };

  return (
    <div className="pdf-viewer">
      <div className="pdf-toolbar">
        <div className="pdf-controls">
          <button
            className="pdf-btn"
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            title="Previous page (Page Up)"
          >
            ← Prev
          </button>
          <span className="pdf-page-info">
            Page {pageNumber} of {pdfDoc?.numPages || '?'}
          </span>
          <button
            className="pdf-btn"
            onClick={handleNextPage}
            disabled={!pdfDoc || pageNumber >= pdfDoc.numPages}
            title="Next page (Page Down)"
          >
            Next →
          </button>
        </div>

        <div className="pdf-zoom-controls">
          <button
            className="pdf-btn pdf-zoom-btn"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom out"
          >
            −
          </button>

          <div className="pdf-zoom-presets">
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level}
                className={`pdf-zoom-preset ${zoom === level ? 'active' : ''}`}
                onClick={() => handleZoomPreset(level)}
                title={`Zoom to ${Math.round(level * 100)}%`}
              >
                {Math.round(level * 100)}%
              </button>
            ))}
          </div>

          <button
            className="pdf-btn pdf-zoom-btn"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            title="Zoom in"
          >
            +
          </button>

          <span className="pdf-zoom-display">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      <div className="pdf-container">
        {error && (
          <div className="pdf-error">
            <p>⚠ {error}</p>
          </div>
        )}

        {isLoading && (
          <div className="pdf-loading">
            <div className="pdf-spinner"></div>
            <p>Rendering page...</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`pdf-canvas ${isLoading ? 'hidden' : ''}`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
