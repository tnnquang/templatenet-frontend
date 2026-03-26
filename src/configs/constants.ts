export const CANVAS = {
  WIDTH: 1200,
  HEIGHT: 675,
} as const

export const HISTORY_LIMIT = 50

export const Z_INDEX = {
  ELEMENT: 10,
  SELECTED_ELEMENT: 20,
  CONTEXT_TOOLBAR: 30,
  TOP_TOOLBAR: 100,
} as const

export const FONT_OPTIONS = [
  { label: 'Cuprum', value: 'Cuprum, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
] as const
