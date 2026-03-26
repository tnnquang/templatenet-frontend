import { memo } from 'react'

import FontSelect from '@/components/toolbars/FontSelect'
import type { TextElement, TextStyle } from '@/models/element'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectCanRedo,
  selectCanUndo,
  selectSelectedElement,
} from '@/store/selectors'
import { redo, undo, updateElement } from '@/store/slices/canvasSlice'

const btnBase =
  'inline-flex items-center justify-center rounded p-1.5 text-gray-600 transition-colors ' +
  'hover:bg-purple-50 hover:text-purple-700 ' +
  'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1' +
  'disabled:cursor-not-allowed disabled:opacity-40'

const btnActive = 'bg-purple-100 text-purple-700'

const btnFmt =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm text-gray-600 transition-colors ' +
  'hover:bg-purple-50 hover:text-purple-700 ' +
  'focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1'

const Divider = () => (
  <div aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-gray-200" />
)

function TextToolbar() {
  const dispatch = useAppDispatch()
  const canUndo = useAppSelector(selectCanUndo)
  const canRedo = useAppSelector(selectCanRedo)
  const selectedElement = useAppSelector(
    selectSelectedElement,
  ) as TextElement | null
  const isTextEditable =
    selectedElement?.type === 'text' && !selectedElement.isLocked
  const style = isTextEditable ? selectedElement!.style : null

  const patch = (changes: Partial<TextStyle>) => {
    if (!selectedElement) return
    dispatch(
      updateElement({
        id: selectedElement.id,
        changes: { style: { ...selectedElement.style, ...changes } },
      }),
    )
  }

  if (!selectedElement || selectedElement.isLocked) return null

  return (
    <div
      role="toolbar"
      aria-label="Editor toolbar"
      className="flex h-11 items-center gap-0.5 rounded-xl border border-gray-200 bg-white px-3 shadow-lg"
    >
      <div role="group" aria-label="History">
        <button
          onClick={() => dispatch(undo())}
          disabled={!canUndo}
          aria-label="Undo"
          aria-keyshortcuts="Control+Z"
          title="Undo (Ctrl+Z)"
          className={btnBase}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>
        <button
          onClick={() => dispatch(redo())}
          disabled={!canRedo}
          aria-label="Redo"
          aria-keyshortcuts="Control+Y"
          title="Redo (Ctrl+Y)"
          className={btnBase}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>
      </div>

      {selectedElement.isLocked && (
        <p className="ml-2 text-xs text-amber-500" aria-live="polite">
          Element is locked — unlock to edit
        </p>
      )}

      {isTextEditable && style && (
        <>
          <Divider />

          <div role="group" aria-label="Font family">
            <FontSelect
              value={style.fontFamily}
              onChange={(v) => patch({ fontFamily: v })}
            />
          </div>

          <Divider />

          <div
            role="group"
            aria-label="Font size"
            className="flex h-7 items-center overflow-hidden rounded border border-gray-200 bg-white transition-colors hover:border-purple-400"
          >
            <button
              onClick={() =>
                patch({ fontSize: Math.max(8, style.fontSize - 1) })
              }
              aria-label="Decrease font size"
              title="Decrease font size"
              className="flex h-full items-center justify-center px-1.5 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700 focus-visible:outline-none"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="4" y="11" width="16" height="2" rx="1" />
              </svg>
            </button>
            <label htmlFor="tb-font-size" className="sr-only">
              Font size
            </label>
            <input
              id="tb-font-size"
              type="number"
              min={8}
              max={400}
              value={style.fontSize}
              onChange={(e) =>
                patch({
                  fontSize: Math.max(8, Math.min(400, Number(e.target.value))),
                })
              }
              aria-label="Font size in pixels"
              className="w-10 bg-transparent text-center text-sm text-gray-700 outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() =>
                patch({ fontSize: Math.min(400, style.fontSize + 1) })
              }
              aria-label="Increase font size"
              title="Increase font size"
              className="flex h-full items-center justify-center px-1.5 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-700 focus-visible:outline-none"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="4" y="11" width="16" height="2" rx="1" />
                <rect x="11" y="4" width="2" height="16" rx="1" />
              </svg>
            </button>
          </div>

          <Divider />

          <div className="flex items-center gap-1">
            <label
              htmlFor="tb-color"
              className="text-xs font-medium text-gray-500"
              title="Text color"
            >
              A
            </label>
            <input
              id="tb-color"
              type="color"
              value={style.color}
              onChange={(e) => patch({ color: e.target.value })}
              aria-label="Text color"
              title="Text color"
              className="h-6 w-7 cursor-pointer appearance-none rounded border border-gray-200 bg-white p-0.5 transition-colors outline-none hover:border-purple-400 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
            />
          </div>

          <Divider />

          <div
            role="group"
            aria-label="Text style"
            className="flex items-center gap-0.5"
          >
            <button
              onClick={() =>
                patch({
                  fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              aria-pressed={style.fontWeight === 'bold'}
              aria-label="Bold"
              title="Bold"
              className={`${btnFmt} font-bold ${style.fontWeight === 'bold' ? btnActive : ''}`}
            >
              B
            </button>
            <button
              onClick={() =>
                patch({
                  fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              aria-pressed={style.fontStyle === 'italic'}
              aria-label="Italic"
              title="Italic"
              className={`${btnFmt} italic ${style.fontStyle === 'italic' ? btnActive : ''}`}
            >
              I
            </button>
            <button
              onClick={() =>
                patch({
                  textDecoration:
                    style.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              aria-pressed={style.textDecoration === 'underline'}
              aria-label="Underline"
              title="Underline"
              className={`${btnFmt} underline ${style.textDecoration === 'underline' ? btnActive : ''}`}
            >
              U
            </button>
          </div>

          <Divider />

          <div
            role="group"
            aria-label="Text alignment"
            className="flex items-center gap-0.5"
          >
            {(
              [
                {
                  value: 'left',
                  label: 'Align left',
                  icon: (
                    <>
                      <rect x="3" y="5" width="18" height="2" rx="1" />
                      <rect x="3" y="11" width="12" height="2" rx="1" />
                      <rect x="3" y="17" width="15" height="2" rx="1" />
                    </>
                  ),
                },
                {
                  value: 'center',
                  label: 'Align center',
                  icon: (
                    <>
                      <rect x="3" y="5" width="18" height="2" rx="1" />
                      <rect x="6" y="11" width="12" height="2" rx="1" />
                      <rect x="4" y="17" width="16" height="2" rx="1" />
                    </>
                  ),
                },
                {
                  value: 'right',
                  label: 'Align right',
                  icon: (
                    <>
                      <rect x="3" y="5" width="18" height="2" rx="1" />
                      <rect x="9" y="11" width="12" height="2" rx="1" />
                      <rect x="6" y="17" width="15" height="2" rx="1" />
                    </>
                  ),
                },
              ] as const
            ).map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => patch({ textAlign: value })}
                aria-pressed={style.textAlign === value}
                aria-label={label}
                title={label}
                className={`${btnBase} ${style.textAlign === value ? btnActive : ''}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {icon}
                </svg>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default memo(TextToolbar)
