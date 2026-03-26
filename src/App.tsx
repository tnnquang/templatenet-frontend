import { useEffect, useRef } from 'react'

import CanvasViewport from '@/components/Canvas/CanvasViewport'
import { createTextElement } from '@/models/element'
import { useAppDispatch } from '@/store/hooks'
import { seedElement } from '@/store/slices/canvasSlice'

function App() {
  const dispatch = useAppDispatch()

  // Guard prevents StrictMode's double-invoke from seeding two elements.
  // The Redux store persists across StrictMode's unmount/remount cycle,
  // so the element added on the first mount is still there on the second.
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    dispatch(seedElement(createTextElement()))
  }, [dispatch])

  return (
    <div className="flex h-screen flex-col bg-[#f0f0f0]">
      <CanvasViewport />
    </div>
  )
}

export default App
