console.info('background script')
import { BACKEND_URL } from '../config'

// Keep track of the current article being read
var currentArticle = null

// Debug
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connected ..')
  port.onMessage.addListener((msg) => {
    console.log(msg)
  })

  port.onDisconnect.addListener((p) => {
    console.log('disconnected ', p)
    if (p.error) {
      console.log(`Disconnected due to an error: ${p.error.message}`)
    }
  })
})

// Listen for messages from everything
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log(message)
  switch (message.type) {
    case 'redirect':
      // redirect to a specific url
      await chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currentTabId = tabs[0] ? tabs[0].id : null
        chrome.tabs.update(currentTabId, { url: message.redirect })
      })

      sendResponse({ redirect: 'success' })
      break
    case 'linkClicked':
      // a link was clicked, do something with it
      console.log('URL:', message.href)
      console.log('ID:', message.id)
      console.log('Class:', message.class)
      console.log('target:', message.target)
      console.log('user_id:', message.user_id)

      const res = await fetch(BACKEND_URL + 'collect/link-clicked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          link: message.href,
          id: message.id,
          class: message.class,
          target: message.target,
          user_id: message.user_id,
        }),
      })

      const j = await res.json()

      console.log(j)

      const progress = await fetch(BACKEND_URL + 'user/status/' + message.user_id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Progress: ', progress)

      const j2 = await progress.json()

      console.log('Progress JSON: ', j2)

      sendMessageToCurrentTab(
        {
          linkClicked: 'success',
          ok: j2.ok,
          completionCode: j2.completionCode,
        },
        'linkClicked',
      )

      sendResponse({ linkClicked: 'success' })
      break
    case 'logPageContents':
      console.log(message.contents)
      const response = await fetch(BACKEND_URL + 'collect/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: message.contents,
          user_id: message.user_id,
        }),
      })

      const json = await response.json()

      sendMessageToCurrentTab(json, 'logPageContents')
      break
    case 'chat':
      fetch(BACKEND_URL + 'chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.message,
          user_id: message.user_id,
        }),
      })
        .then((response) => response.text())
        .then((chatResult) => {
          console.log(chatResult)
          chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { result: chatResult, type: 'chat' })
          })
        })
        .catch((error) => {
          console.log('Error: ' + error)
        })
      break
  }
  return true
})

/******************************************************************************
 *                           Helper Functions                                 *
 ******************************************************************************/

const getToken = async () => {
  const token = await chrome.storage.local.get(['identifier'], function (result) {
    return result.identifier
  })
  return token
}

const sendMessageToCurrentTab = (obj, type, retryCount = 0) => {
  try {
    obj.type = type
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length === 0 || !tabs[0]) {
        if (retryCount < 3) {
          // Retry up to 3 times
          console.log('Tab is not ready, retrying...')
          setTimeout(() => sendMessageToCurrentTab(obj, type, retryCount + 1), 2000) // Retry after 1 second
        } else {
          console.error('Failed to send message: Tab is not available after retries.')
        }
      } else {
        chrome.tabs.sendMessage(tabs[0].id, obj, function (response) {
          if (chrome.runtime.lastError) {
            console.log('Error sending message:', chrome.runtime.lastError.message)
          } else {
            console.log('Message sent successfully', response)
          }
        })
      }
    })
  } catch (error) {
    console.trace(error)
  }
}

export {}
