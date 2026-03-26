import type { FC } from 'react'

import TextToolbar from '@/components/toolbars/TextToolbar'
import type { ElementType } from '@/models/element'

/**
 * Maps each element type to its top toolbar component.
 * Adding a new element type: just add one entry here.
 */
export const toolbarRegistry: Partial<Record<ElementType, FC>> = {
  text: TextToolbar,
}
