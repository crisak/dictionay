/* eslint-disable no-undef */
const ID_CONTEXT_MENU = 'saveWord'

chrome.runtime.onInstalled.addListener(() => {
  console.debug('chrome.runtime.onInstalled')

  chrome.contextMenus.create({
    id: ID_CONTEXT_MENU,
    title: 'Guardar palabra',
    contexts: ['selection'],
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage()
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === ID_CONTEXT_MENU) {
    sendOpenPopupMessage(tab.id, info.selectionText)
  }
})

chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-word') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'getSelectedText' },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              'Error getting selected text:',
              chrome.runtime.lastError,
            )
          } else if (response && response.selectedText) {
            sendOpenPopupMessage(tabs[0].id, response.selectedText)
          }
        },
      )
    })
  }
})

function sendOpenPopupMessage(tabId, word) {
  chrome.tabs.sendMessage(
    tabId,
    {
      action: 'openPopup',
      word: word,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError)
      }
    },
  )
}

// Mantén el código existente y añade esto:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'getSelectedText' },
        (response) => {
          sendResponse(response)
        },
      )
    })
    return true // Indica que la respuesta será asíncrona
  }
})
