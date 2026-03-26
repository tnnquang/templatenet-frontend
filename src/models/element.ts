import { CANVAS } from '@/configs/constants'

export type ElementType = 'text'

export interface BaseElement {
  id: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  isLocked: boolean
  /** Empty string means the element has no link. */
  href: string
}

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  textDecoration: 'none' | 'underline'
  textAlign: 'left' | 'center' | 'right'
  color: string
}

export interface TextElement extends BaseElement {
  type: 'text'
  content: string
  style: TextStyle
}

export type CanvasElement = TextElement

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Cuprum, sans-serif',
  fontSize: 56,
  fontWeight: 'bold',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'center',
  color: '#ffffff',
}

export function createTextElement(
  overrides?: Partial<Omit<TextElement, 'type'>>,
): TextElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x: 0,
    y: 280,
    width: CANVAS.WIDTH,
    height: 120,
    zIndex: 10,
    isLocked: false,
    href: '',
    content: 'SHADOWBYTE',
    style: { ...DEFAULT_TEXT_STYLE },
    ...overrides,
  }
}
