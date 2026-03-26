import { createSelector } from '@reduxjs/toolkit'

import { elementsAdapter } from '@/store/slices/canvasSlice'
import type { RootState } from '@/store/store'

const adapterSelectors = elementsAdapter.getSelectors<RootState>(
  (state) => state.canvas.elements,
)

export const selectAllElements = adapterSelectors.selectAll
export const selectElementIds = adapterSelectors.selectIds
export const selectElementById = adapterSelectors.selectById

export const selectSelectedElementId = (state: RootState) =>
  state.ui.selectedElementId
export const selectEditingElementId = (state: RootState) =>
  state.ui.editingElementId

export const selectSelectedElement = createSelector(
  [
    selectSelectedElementId,
    (state: RootState) => state.canvas.elements.entities,
  ],
  (id, entities) => (id ? (entities[id] ?? null) : null),
)

export const selectCanUndo = (state: RootState) =>
  state.canvas.history.past.length > 0
export const selectCanRedo = (state: RootState) =>
  state.canvas.history.future.length > 0
