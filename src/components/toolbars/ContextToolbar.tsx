import { memo, useEffect, useRef, useState } from 'react'

import { useAnime } from '@/hooks/useAnime'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectElementById } from '@/store/selectors'
import {
  duplicateElement,
  removeElement,
  updateElement,
} from '@/store/slices/canvasSlice'
import { selectElement } from '@/store/slices/uiSlice'
import type { RootState } from '@/store/store'

interface Props {
  elementId: string
}

const btnBase =
  'inline-flex items-center justify-center rounded p-1.5 text-gray-500 transition-colors ' +
  'hover:bg-purple-50 hover:text-purple-700 ' +
  'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1'

function ContextToolbar({ elementId }: Props) {
  const dispatch = useAppDispatch()
  const element = useAppSelector((state: RootState) =>
    selectElementById(state, elementId),
  )
  const toolbarRef = useRef<HTMLDivElement>(null)
  const linkPopoverRef = useRef<HTMLDivElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)
  const { fadeIn } = useAnime()

  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [linkDraft, setLinkDraft] = useState('')

  useEffect(() => {
    fadeIn(toolbarRef.current)
  }, [fadeIn])

  useEffect(() => {
    if (isLinkOpen) linkInputRef.current?.focus()
  }, [isLinkOpen])

  useEffect(() => {
    if (!isLinkOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (
        !linkPopoverRef.current?.contains(e.target as Node) &&
        !toolbarRef.current?.contains(e.target as Node)
      ) {
        setIsLinkOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isLinkOpen])

  if (!element) return null

  const isLocked = element.isLocked
  const hasLink = !!element.href

  const openLink = () => {
    setLinkDraft(element!.href)
    setIsLinkOpen((v) => !v)
  }

  const saveLink = () => {
    const href = linkDraft.trim()
    dispatch(updateElement({ id: elementId, changes: { href } }))
    setIsLinkOpen(false)
  }

  const removeLink = () => {
    dispatch(updateElement({ id: elementId, changes: { href: '' } }))
    setLinkDraft('')
    setIsLinkOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveLink()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setIsLinkOpen(false)
    }
  }

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Element actions"
      className="absolute -top-10 left-1/2 z-30 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-1 py-1 shadow-md"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => dispatch(duplicateElement(elementId))}
        aria-label="Duplicate element"
        title="Duplicate"
        className={btnBase}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="8" y="8" width="13" height="13" rx="2" />
          <path d="M4 16V5a1 1 0 0 1 1-1h11" />
        </svg>
      </button>

      <button
        onClick={() =>
          dispatch(
            updateElement({ id: elementId, changes: { isLocked: !isLocked } }),
          )
        }
        aria-pressed={isLocked}
        aria-label={isLocked ? 'Unlock element' : 'Lock element'}
        title={isLocked ? 'Unlock' : 'Lock'}
        className={`${btnBase} ${isLocked ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700' : ''}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          {isLocked ? (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </>
          ) : (
            <>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </>
          )}
        </svg>
      </button>

      <button
        onClick={() => {
          dispatch(removeElement(elementId))
          dispatch(selectElement(null))
        }}
        aria-label="Delete element"
        title="Delete"
        className={`${btnBase} hover:bg-red-50 hover:text-red-600`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>

      <button
        onClick={openLink}
        aria-pressed={isLinkOpen}
        aria-label={hasLink ? 'Edit link' : 'Add link'}
        title={hasLink ? 'Edit link' : 'Add link'}
        className={`${btnBase} ${hasLink ? 'text-blue-600 hover:bg-blue-50 hover:text-blue-700' : ''} ${isLinkOpen ? 'bg-purple-50 text-purple-700' : ''}`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>

      {isLinkOpen && (
        <div
          ref={linkPopoverRef}
          role="dialog"
          aria-label="Edit link"
          className="absolute top-full left-1/2 z-40 mt-2 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-2 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            aria-hidden="true"
            className="shrink-0"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>

          <input
            ref={linkInputRef}
            type="url"
            placeholder="Paste URL..."
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="URL"
            className="w-52 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />

          {hasLink && (
            <button
              onClick={removeLink}
              aria-label="Remove link"
              title="Remove link"
              className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          <button
            onClick={saveLink}
            aria-label="Save link"
            title="Save (Enter)"
            className="shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(ContextToolbar)
