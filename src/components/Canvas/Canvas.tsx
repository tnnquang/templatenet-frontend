import { useCallback, useEffect } from 'react'

import CanvasElement from '@/components/Canvas/CanvasElement'
import { CANVAS } from '@/configs/constants'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectElementIds } from '@/store/selectors'
import { redo, undo } from '@/store/slices/canvasSlice'
import { selectElement } from '@/store/slices/uiSlice'

export default function Canvas() {
  const dispatch = useAppDispatch()
  const elementIds = useAppSelector(selectElementIds)

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        dispatch(selectElement(null))
      }
    },
    [dispatch],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      if (e.key === 'z') {
        e.preventDefault()
        dispatch(e.shiftKey ? redo() : undo())
      }
      if (e.key === 'y') {
        e.preventDefault()
        dispatch(redo())
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  return (
    <div
      className="relative overflow-hidden shadow-2xl"
      style={{ width: CANVAS.WIDTH, height: CANVAS.HEIGHT }}
      onClick={handleCanvasClick}
    >
      {/* Keep pointer events on the canvas container so background clicks can clear selection. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[#7a0000]"
      />

      {elementIds.map((id) => (
        <CanvasElement key={id} id={id as string} />
      ))}
    </div>
  )
}
