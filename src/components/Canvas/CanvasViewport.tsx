import { useCallback, useEffect, useRef, useState } from 'react'

import Canvas from '@/components/Canvas/Canvas'
import TextToolbar from '@/components/toolbars/TextToolbar'
import { CANVAS } from '@/configs/constants'
import { ViewportContext } from '@/contexts/ViewportContext'
import { useAppDispatch } from '@/store/hooks'
import { selectElement } from '@/store/slices/uiSlice'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 4
const ZOOM_STEP = 0.1

/** Fit the canvas to the available viewport. */
function calcFitZoom(containerW: number, containerH: number): number {
  return Math.min(
    (containerW * 0.9) / CANVAS.WIDTH,
    (containerH * 0.9) / CANVAS.HEIGHT,
  )
}

const btnBase =
  'inline-flex items-center justify-center rounded px-2 py-1 text-sm text-gray-600 ' +
  'transition-colors hover:bg-purple-50 hover:text-purple-700 ' +
  'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1'

export default function CanvasViewport() {
  const dispatch = useAppDispatch()
  const containerRef = useRef<HTMLDivElement>(null)

  const [containerH, setContainerH] = useState(() => window.innerHeight)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerH(el.clientHeight)
    const ro = new ResizeObserver(() => setContainerH(el.clientHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const [zoom, setZoomRaw] = useState<number>(() =>
    calcFitZoom(window.innerWidth, window.innerHeight),
  )

  const clampZoom = useCallback((z: number) => {
    setZoomRaw(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z)))
  }, [])

  const fitZoom = useCallback(() => {
    if (!containerRef.current) return
    setZoomRaw(
      calcFitZoom(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
      ),
    )
  }, [])

  // Zoom only when Ctrl/Cmd is pressed to avoid accidental zoom on normal scrolling.
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const factor = e.deltaY < 0 ? 1.08 : 0.93
      setZoomRaw((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor)))
    }
    // Ignore plain scrolling to keep the canvas anchored.
  }, [])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) dispatch(selectElement(null))
    },
    [dispatch],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        clampZoom(zoom + ZOOM_STEP)
      }
      if (e.key === '-') {
        e.preventDefault()
        clampZoom(zoom - ZOOM_STEP)
      }
      if (e.key === '0') {
        e.preventDefault()
        fitZoom()
      }
    },
    [zoom, clampZoom, fitZoom],
  )

  const canvasVisualTop = containerH / 2 - (CANVAS.HEIGHT * zoom) / 2
  const toolbarTop = Math.max(8, canvasVisualTop - 44 - 16)

  return (
    <ViewportContext.Provider value={{ zoom }}>
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        style={{ background: '#dde1e7', cursor: 'default' }}
        onWheel={handleWheel}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        aria-label="Canvas viewport"
        role="region"
      >
        <div
          className="pointer-events-none absolute inset-x-0 z-60 flex justify-center"
          style={{ top: toolbarTop }}
        >
          <div className="pointer-events-auto">
            <TextToolbar />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className="pointer-events-auto"
            style={{
              width: CANVAS.WIDTH,
              height: CANVAS.HEIGHT,
              flexShrink: 0,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
            }}
          >
            <Canvas />
          </div>
        </div>

        <div
          role="toolbar"
          aria-label="Zoom controls"
          className="absolute right-4 bottom-4 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-1 py-0.5 shadow-md"
        >
          <button
            onClick={() => clampZoom(zoom - ZOOM_STEP)}
            aria-label="Zoom out"
            title="Zoom out (Ctrl+-)"
            className={btnBase}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="4" y="11" width="16" height="2" rx="1" />
            </svg>
          </button>

          <button
            onClick={() => setZoomRaw(1)}
            aria-label={`Zoom ${Math.round(zoom * 100)}% — click to reset to 100%`}
            title="Reset zoom"
            className={`${btnBase} min-w-[3.25rem] font-mono text-xs`}
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={() => clampZoom(zoom + ZOOM_STEP)}
            aria-label="Zoom in"
            title="Zoom in (Ctrl++)"
            className={btnBase}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="4" y="11" width="16" height="2" rx="1" />
              <rect x="11" y="4" width="2" height="16" rx="1" />
            </svg>
          </button>

          <div aria-hidden="true" className="mx-0.5 h-4 w-px bg-gray-200" />

          <button
            onClick={fitZoom}
            aria-label="Fit canvas to screen"
            title="Fit to screen (Ctrl+0)"
            className={btnBase}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M8 21H5a2 2 0 0 0-2-2v-3M21 16v3a2 2 0 0 1-2 2h-3" />
            </svg>
          </button>
        </div>
      </div>
    </ViewportContext.Provider>
  )
}
