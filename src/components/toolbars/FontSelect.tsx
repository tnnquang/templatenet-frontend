import { useCallback, useEffect, useRef, useState } from 'react'

import { animate } from 'animejs'

import { FONT_OPTIONS } from '@/configs/constants'

interface Props {
  value: string
  onChange: (value: string) => void
}

const options = FONT_OPTIONS as ReadonlyArray<{ label: string; value: string }>

export default function FontSelect({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<(HTMLDivElement | null)[]>([])

  const currentLabel = options.find((f) => f.value === value)?.label ?? value

  const close = useCallback(() => {
    setIsOpen(false)
    setFocusedIdx(-1)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [isOpen, close])

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      animate(dropdownRef.current, {
        opacity: [0, 1],
        translateY: [-6, 0],
        duration: 140,
        ease: 'outQuart',
      })
    }
  }, [isOpen])

  useEffect(() => {
    optionRefs.current[focusedIdx]?.scrollIntoView({ block: 'nearest' })
  }, [focusedIdx])

  const open = () => {
    const currentIdx = options.findIndex((f) => f.value === value)
    setFocusedIdx(currentIdx)
    setIsOpen(true)
  }

  const select = (optionValue: string) => {
    onChange(optionValue)
    close()
  }

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open()
    }
  }

  const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIdx((i) => Math.min(i + 1, options.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIdx((i) => Math.max(i - 1, 0))
    }
    if ((e.key === 'Enter' || e.key === ' ') && focusedIdx >= 0) {
      e.preventDefault()
      select(options[focusedIdx].value)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Font family: ${currentLabel}`}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        className={[
          'flex h-7 w-32 items-center justify-between gap-1.5 rounded border bg-white px-2.5',
          'text-sm text-gray-700 transition-colors',
          'hover:border-purple-400 hover:text-purple-700',
          'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none',
          isOpen ? 'border-purple-400 text-purple-700' : 'border-gray-200',
        ].join(' ')}
      >
        <span className="truncate font-medium">{currentLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label="Font family"
          tabIndex={-1}
          onKeyDown={handleDropdownKeyDown}
          className="absolute top-full left-0 z-50 mt-1 w-max min-w-full overflow-hidden rounded-xl border border-gray-100 bg-white py-1.5 shadow-xl shadow-gray-200/60"
        >
          {options.map((font, idx) => {
            const isSelected = font.value === value
            const isFocused = idx === focusedIdx
            return (
              <div
                key={font.value}
                ref={(el) => {
                  optionRefs.current[idx] = el
                }}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onPointerEnter={() => setFocusedIdx(idx)}
                onClick={() => select(font.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    select(font.value)
                  }
                }}
                className={[
                  'flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
                  isFocused || isSelected
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50',
                ].join(' ')}
                style={{ fontFamily: font.value }}
              >
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
                {font.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
