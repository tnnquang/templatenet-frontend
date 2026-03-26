import { useCallback, useEffect, useRef } from 'react'

import { useViewport } from '@/contexts/ViewportContext'
import { useAppDispatch } from '@/store/hooks'
import { commitPosition } from '@/store/slices/canvasSlice'
import { selectElement } from '@/store/slices/uiSlice'

interface UseDragOptions {
  id: string
  x: number
  y: number
  isLocked: boolean
}

/**
 *
 * During drag: updates DOM transform directly. Zero Redux dispatches.
 * On mouseup: ONE commitPosition dispatch.
 *
 * Mouse deltas are divided by the current viewport zoom so that
 * dragging feels 1:1 regardless of zoom level.
 */
export function useDrag({ id, x, y, isLocked }: UseDragOptions) {
  const dispatch = useAppDispatch()
  const { zoom } = useViewport()
  const elementRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  // Keep the latest zoom in a ref so mousemove always reads current scale.
  const zoomRef = useRef(zoom)
  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  // Sync transform from Redux when not dragging, including undo/redo updates.
  useEffect(() => {
    if (!isDragging.current && elementRef.current) {
      elementRef.current.style.transform = `translate(${x}px, ${y}px)`
    }
  }, [x, y])

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      e.preventDefault()
      e.stopPropagation()

      // Locked elements must still be selectable so the unlock action remains accessible.
      dispatch(selectElement(id))

      if (isLocked) return

      const startMouseX = e.clientX
      const startMouseY = e.clientY
      const startX = x
      const startY = y
      let currentX = startX
      let currentY = startY

      isDragging.current = true

      const onMouseMove = (ev: MouseEvent) => {
        if (!elementRef.current) return
        // Convert screen-space delta to canvas-space delta by dividing by zoom.
        const z = zoomRef.current
        currentX = startX + (ev.clientX - startMouseX) / z
        currentY = startY + (ev.clientY - startMouseY) / z
        // Update transform directly for smooth dragging without layout reflow.
        elementRef.current.style.transform = `translate(${currentX}px, ${currentY}px)`
      }

      const onMouseUp = () => {
        isDragging.current = false
        if (currentX !== startX || currentY !== startY) {
          dispatch(commitPosition({ id, x: currentX, y: currentY }))
        }
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    },
    [dispatch, id, x, y, isLocked],
  )

  return { elementRef, onMouseDown }
}
