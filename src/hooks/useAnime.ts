import { useCallback } from 'react'

import { animate } from 'animejs'

export function useAnime() {
  const fadeIn = useCallback((el: HTMLElement | null) => {
    if (!el) return
    animate(el, {
      opacity: [0, 1],
      translateY: [-6, 0],
      duration: 140,
      ease: 'outQuart',
    })
  }, [])

  const scaleIn = useCallback((el: HTMLElement | null) => {
    if (!el) return
    animate(el, {
      opacity: [0, 1],
      scale: [0.94, 1],
      duration: 160,
      ease: 'outBack',
    })
  }, [])

  return { fadeIn, scaleIn }
}
