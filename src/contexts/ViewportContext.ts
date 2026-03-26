import { createContext, useContext } from 'react'

interface ViewportContextValue {
  /** Current zoom level (1 = 100%). Read by useDrag to correct mouse delta. */
  zoom: number
}

export const ViewportContext = createContext<ViewportContextValue>({ zoom: 1 })

export const useViewport = () => useContext(ViewportContext)
