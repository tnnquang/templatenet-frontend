import { memo, useCallback, useState } from 'react'

import ContextToolbar from '@/components/toolbars/ContextToolbar'
import { Z_INDEX } from '@/configs/constants'
import { useDrag } from '@/hooks/useDrag'
import type { TextElement as TextElementType } from '@/models/element'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectEditingElementId,
  selectSelectedElementId,
} from '@/store/selectors'
import { updateElement } from '@/store/slices/canvasSlice'
import { enterEditMode, exitEditMode } from '@/store/slices/uiSlice'

const RESIZE_HANDLES = [
  {
    key: 'nw',
    style: { top: -5, left: -5 },
    cursor: 'nw-resize',
    label: 'Resize top-left',
  },
  {
    key: 'n',
    style: { top: -5, left: 'calc(50% - 5px)' },
    cursor: 'n-resize',
    label: 'Resize top',
  },
  {
    key: 'ne',
    style: { top: -5, right: -5 },
    cursor: 'ne-resize',
    label: 'Resize top-right',
  },
  {
    key: 'e',
    style: { right: -5, top: 'calc(50% - 5px)' },
    cursor: 'e-resize',
    label: 'Resize right',
  },
  {
    key: 'se',
    style: { bottom: -5, right: -5 },
    cursor: 'se-resize',
    label: 'Resize bottom-right',
  },
  {
    key: 's',
    style: { bottom: -5, left: 'calc(50% - 5px)' },
    cursor: 's-resize',
    label: 'Resize bottom',
  },
  {
    key: 'sw',
    style: { bottom: -5, left: -5 },
    cursor: 'sw-resize',
    label: 'Resize bottom-left',
  },
  {
    key: 'w',
    style: { left: -5, top: 'calc(50% - 5px)' },
    cursor: 'w-resize',
    label: 'Resize left',
  },
] as const

interface Props {
  element: TextElementType
}

function TextElement({ element }: Props) {
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector(selectSelectedElementId)
  const editingId = useAppSelector(selectEditingElementId)
  const isSelected = selectedId === element.id
  const isEditing = editingId === element.id
  const [isHovered, setIsHovered] = useState(false)

  const { elementRef, onMouseDown } = useDrag({
    id: element.id,
    x: element.x,
    y: element.y,
    isLocked: element.isLocked,
  })

  const editRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      el.textContent = element.content
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    },
    [element.content],
  )

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent ?? element.content
    dispatch(exitEditMode())
    if (newContent !== element.content) {
      dispatch(
        updateElement({ id: element.id, changes: { content: newContent } }),
      )
    }
  }

  const handleDoubleClick = () => {
    if (!element.isLocked) dispatch(enterEditMode(element.id))
  }

  const textStyle: React.CSSProperties = {
    fontFamily: element.style.fontFamily,
    fontSize: element.style.fontSize,
    fontWeight: element.style.fontWeight,
    fontStyle: element.style.fontStyle,
    textDecoration: element.style.textDecoration,
    textAlign: element.style.textAlign,
    color: element.style.color,
    padding: '4px 8px',
    minHeight: '1em',
    lineHeight: 1.2,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }

  const ringColor = element.isLocked ? '#f59e0b' : '#3b82f6'

  return (
    <div
      ref={elementRef}
      role="figure"
      aria-label={`Text element: ${element.content}`}
      aria-selected={isSelected}
      aria-roledescription={
        element.isLocked ? 'locked text element' : 'draggable text element'
      }
      className="absolute top-0 left-0"
      style={{
        width: element.width,
        zIndex: isSelected ? Z_INDEX.SELECTED_ELEMENT : Z_INDEX.ELEMENT,
        transform: `translate(${element.x}px, ${element.y}px)`,
        cursor: element.isLocked ? 'default' : isEditing ? 'text' : 'move',
        willChange: 'transform',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isSelected && <ContextToolbar elementId={element.id} />}

      <div style={{ overflow: 'hidden', position: 'relative' }}>
        {isEditing ? (
          <div
            ref={editRef}
            role="textbox"
            aria-multiline="true"
            aria-label="Edit text"
            contentEditable
            suppressContentEditableWarning
            className="outline-none"
            style={{ ...textStyle, cursor: 'text' }}
            onBlur={handleBlur}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div aria-hidden="true" className="select-none" style={textStyle}>
            {element.content}
          </div>
        )}
      </div>

      {isHovered && !isEditing && element.href && (
        <div
          aria-label={`Link: ${element.href}`}
          className="absolute left-0 z-50 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 whitespace-nowrap shadow-md"
          style={{ top: 'calc(100% + 8px)' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span className="max-w-60 truncate text-xs text-blue-600 underline underline-offset-2">
            {element.href}
          </span>
          <a
            href={element.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open link in new tab"
            className="shrink-0 text-gray-400 transition-colors hover:text-blue-600"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
      )}

      {isHovered && !isSelected && !isEditing && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            outline: '2px dashed rgba(96,165,250,0.55)',
            outlineOffset: 1,
          }}
        />
      )}

      {isSelected && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ outline: `2px solid ${ringColor}`, outlineOffset: 1 }}
        />
      )}

      {isSelected && !isEditing && (
        <>
          {RESIZE_HANDLES.map(({ key, style, cursor, label }) => (
            <div
              key={key}
              aria-label={label}
              className="absolute h-2.5 w-2.5 rounded-full border-2 bg-white shadow-sm"
              style={{
                ...style,
                cursor,
                borderColor: ringColor,
                zIndex: 1,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ))}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
            style={{
              top: '100%',
              height: 22,
              background: 'rgba(96,165,250,0.5)',
            }}
          />

          <button
            aria-label="Rotate element (coming soon)"
            title="Rotate"
            className="absolute left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-blue-500 shadow-md hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1"
            style={{
              top: 'calc(100% + 22px)',
              transform: 'translateX(-50%) translateY(-50%)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M21 2v6h-6" />
              <path d="M21 13a9 9 0 1 1-3-7.7L21 8" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

export default memo(TextElement)
