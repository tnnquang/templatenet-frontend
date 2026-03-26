import { memo } from 'react'

import TextElement from '@/components/elements/TextElement'
import type { TextElement as TextElementType } from '@/models/element'
import { useAppSelector } from '@/store/hooks'
import { selectElementById } from '@/store/selectors'
import type { RootState } from '@/store/store'

interface Props {
  id: string
}

/**
 * Routes an element ID to its concrete component.
 * React.memo ensures re-render only when this element's data changes.
 * Adding a new type: add a case here + an entry in toolbarRegistry.
 */
function CanvasElement({ id }: Props) {
  const element = useAppSelector((state: RootState) =>
    selectElementById(state, id),
  )

  if (!element) return null

  switch (element.type) {
    case 'text':
      return <TextElement element={element as TextElementType} />
    default:
      return null
  }
}

export default memo(CanvasElement)
