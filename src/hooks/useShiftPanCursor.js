import { useEffect } from 'react'

/**
 * Toggles a CSS class on the pane container while Shift is held,
 * so cursor styling can indicate pan mode.
 */
export function useShiftPanCursor(containerRef) {
  useEffect(() => {
    const updatePanMode = (isPanning) => {
      const container = containerRef.current
      if (!container) return
      container.classList.toggle('panning-mode', isPanning)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        updatePanMode(true)
      }
    }

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        updatePanMode(false)
      }
    }

    const handleBlur = () => {
      updatePanMode(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      updatePanMode(false)
    }
  }, [containerRef])
}

export default useShiftPanCursor
