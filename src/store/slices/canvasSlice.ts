import {
  type EntityState,
  type Update,
  createEntityAdapter,
  createSlice,
  current,
} from '@reduxjs/toolkit'

import { HISTORY_LIMIT } from '@/configs/constants'
import type { CanvasElement } from '@/models/element'

const elementsAdapter = createEntityAdapter<CanvasElement>()

type ElementsSnapshot = EntityState<CanvasElement, string>

interface CanvasState {
  elements: EntityState<CanvasElement, string>
  history: {
    past: ElementsSnapshot[]
    future: ElementsSnapshot[]
  }
}

const initialState: CanvasState = {
  elements: elementsAdapter.getInitialState(),
  history: { past: [], future: [] },
}

/** Snapshot current elements into past before a mutation. */
function pushHistory(state: CanvasState) {
  state.history.past.push(current(state.elements) as ElementsSnapshot)
  if (state.history.past.length > HISTORY_LIMIT) {
    state.history.past.shift()
  }
  state.history.future = []
}

const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    addElement(state, action: { payload: CanvasElement }) {
      pushHistory(state)
      elementsAdapter.addOne(state.elements, action.payload)
    },

    /** Seed initial elements without recording undo history. */
    seedElement(state, action: { payload: CanvasElement }) {
      elementsAdapter.addOne(state.elements, action.payload)
    },

    updateElement(state, action: { payload: Update<CanvasElement, string> }) {
      pushHistory(state)
      elementsAdapter.updateOne(state.elements, action.payload)
    },

    /** Commits the final drag position and records undo history. */
    commitPosition(
      state,
      action: { payload: { id: string; x: number; y: number } },
    ) {
      pushHistory(state)
      elementsAdapter.updateOne(state.elements, {
        id: action.payload.id,
        changes: { x: action.payload.x, y: action.payload.y },
      })
    },

    removeElement(state, action: { payload: string }) {
      pushHistory(state)
      elementsAdapter.removeOne(state.elements, action.payload)
    },

    duplicateElement(state, action: { payload: string }) {
      const el = state.elements.entities[action.payload]
      if (!el) return
      pushHistory(state)
      const clone: CanvasElement = {
        ...el,
        id: crypto.randomUUID(),
        x: el.x + 20,
        y: el.y + 20,
        zIndex: el.zIndex + 1,
      }
      elementsAdapter.addOne(state.elements, clone)
    },

    undo(state) {
      if (state.history.past.length === 0) return
      // Return a plain state object so Immer uses it directly without castDraft.
      const currentElems = current(state.elements) as ElementsSnapshot
      const past = current(state.history.past) as ElementsSnapshot[]
      const future = current(state.history.future) as ElementsSnapshot[]
      return {
        elements: past[past.length - 1],
        history: {
          past: past.slice(0, -1),
          future: [currentElems, ...future],
        },
      }
    },

    redo(state) {
      if (state.history.future.length === 0) return
      const currentElems = current(state.elements) as ElementsSnapshot
      const past = current(state.history.past) as ElementsSnapshot[]
      const future = current(state.history.future) as ElementsSnapshot[]
      return {
        elements: future[0],
        history: {
          past: [...past, currentElems],
          future: future.slice(1),
        },
      }
    },
  },
})

export const {
  addElement,
  seedElement,
  updateElement,
  commitPosition,
  removeElement,
  duplicateElement,
  undo,
  redo,
} = canvasSlice.actions

export { elementsAdapter }
export default canvasSlice.reducer
