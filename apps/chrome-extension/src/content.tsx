/* eslint-disable @typescript-eslint/no-explicit-any */
// import React from 'react'
import { createRoot } from 'react-dom/client'
import { PopupContent } from './features/popup/components/PopupContent'
import { AuthProvider } from './features/authentication/componentes'
import { Popup } from './features/popup/components/Popup'

const EXTENSION_ID = 'crisak-dictionary'

// Handle the getSelectedText action
function handleGetSelectedText(sendResponse: any) {
  const selectedText = window?.getSelection()?.toString()
  sendResponse({ selectedText: selectedText })
}

const container = document.createElement('div')
container.id = `${EXTENSION_ID}-container`
document.body.appendChild(container)

// Agregar estilos para la animación de los puntos de carga
const styleSheet = document.createElement('style')
styleSheet.textContent = `
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
      }
    `
document.head.appendChild(styleSheet)

const root = createRoot(container)

let currentPopup: null | (() => void) = null

const showPopup = (word: string, rect: DOMRect) => {
  if (currentPopup) {
    currentPopup()
  }

  const closePopup = () => {
    root.render(null)
    currentPopup = null
  }

  root.render(
    <Popup onClose={closePopup} rect={rect}>
      <AuthProvider redirect>
        <PopupContent word={word} />
      </AuthProvider>
    </Popup>,
  )

  currentPopup = closePopup

  setTimeout(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const popup = document.getElementById(`${EXTENSION_ID}-container`)
      if (popup && !popup.contains(e.target as Node)) {
        closePopup()
        document.removeEventListener('click', handleOutsideClick)
      }
    }
    document.addEventListener('click', handleOutsideClick)
  }, 0)
}

;(chrome as any).runtime.onMessage.addListener(
  (request: any, _sender: any, sendResponse: any) => {
    const selection = window.getSelection()
    const text = request?.word?.trim()

    if (!selection) {
      sendResponse({ success: false, error: 'Unknown action' })
      return true
    }

    if (request.action === 'openPopup') {
      showPopup(text, selection.getRangeAt(0).getBoundingClientRect())
      sendResponse({ success: true })
    } else if (request.action === 'getSelectedText') {
      handleGetSelectedText(sendResponse)
    } else {
      console.debug('Unknown action received:', request.action)
      sendResponse({ success: false, error: 'Unknown action' })
    }

    return true
  },
)

// Mantén el código existente y asegúrate de tener este listener:
;(chrome as any).runtime.onMessage.addListener(
  (request: any, _sender: any, sendResponse: any) => {
    if (request.action === 'getSelectedText') {
      const selectedText = window.getSelection()?.toString() || ''
      sendResponse({ selectedText })
    }
    return true
  },
)
