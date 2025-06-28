/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react'
import { calculatePosition } from '../../../utils'

const styles = {
  popup: {
    position: 'fixed' as const,
    zIndex: 2147483647,
    backgroundColor: '#070c00cc',
    backdropFilter: 'blur(16px)',
    border: '1px solid #364e0bd1',
    borderRadius: '16px',
    padding: '16px',
    width: '300px',
    color: 'white',
  },
  closeButton: {
    position: 'absolute' as const,
    right: '8px',
    top: '4px',
    color: '#6b7280',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: '16px',
  },
  copyright: {
    color: '#6b7280',
    fontSize: '12px',
  },
  optionsButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
  },
}

type PopupProps = {
  children?: React.ReactNode
  rect: DOMRect
  onClose: () => void
}

const PopupContext = React.createContext<PopupProps | null>(null)

export const usePopup = () => {
  const context = React.useContext(PopupContext)
  if (!context) {
    throw new Error('usePopupContext must be used within a PopupProvider')
  }
  return context
}

export const Popup = ({ children, rect, onClose }: PopupProps) => {
  const popupRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (popupRef.current) {
      const { top, left } = calculatePosition(
        rect,
        popupRef.current.getBoundingClientRect(),
      )

      popupRef.current.style.top = `${top}px`
      popupRef.current.style.left = `${left}px`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rect?.top])

  return (
    <PopupContext.Provider value={{ rect, onClose }}>
      <div ref={popupRef} style={styles.popup}>
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        {/* Content */}
        {children}

        {/* Footer */}
        <footer style={styles.footer}>
          <span style={styles.copyright}>
            © 2024 Crisak -
            <button
              onClick={() =>
                (chrome as any).runtime.sendMessage({
                  action: 'openOptionsPage',
                })
              }
              style={styles.optionsButton}
            >
              Extension Options
            </button>
          </span>
        </footer>
      </div>
    </PopupContext.Provider>
  )
}
