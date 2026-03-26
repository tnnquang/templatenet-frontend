import { createSlice } from '@reduxjs/toolkit'

interface UIState {
  selectedElementId: string | null
  editingElementId: string | null
}

const initialState: UIState = {
  selectedElementId: null,
  editingElementId: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectElement(state, action: { payload: string | null }) {
      state.selectedElementId = action.payload
      if (action.payload === null) {
        state.editingElementId = null
      }
    },

    enterEditMode(state, action: { payload: string }) {
      state.editingElementId = action.payload
    },

    exitEditMode(state) {
      state.editingElementId = null
    },
  },
})

export const { selectElement, enterEditMode, exitEditMode } = uiSlice.actions
export default uiSlice.reducer
