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
    case 'trackArticle':
      // track a new article
      currentArticle = {
        url: message.url,
        startTime: new Date(),
      }
      break
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

      const progress = await fetch(BACKEND_URL + 'user/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: message.user_id,
        }),
      })

      console.log(res)

      sendResponse({
        linkClicked: 'success',
        ok: progress.ok,
        completionCode: progress.completionCode,
      })
      break
    case 'logPageContents':
      console.log(message.contents)
      const currentStance = await fetch(BACKEND_URL + 'collect/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: message.contents,
          user_id: message.user_id,
        }),
      })

      console.log(currentStance)

      if (currentStance > 80) {
      } else if (currentStance < -80) {
      }

      sendResponse({ result: result })
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
            chrome.tabs.sendMessage(tabs[0].id, { result: chatResult })
          })
        })
        .catch((error) => {
          console.log('Error: ' + error)
        })
      break
  }
  return true
})

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (
    currentArticle &&
    tabId === tab.id &&
    changeInfo.status === 'complete' &&
    tab.url === currentArticle.url
  ) {
    // The user finished loading the article, let's track their reading progress
    var endTime = new Date()
    var readingTime = endTime - currentArticle.startTime
    // You can do something with the reading time here, like send it to an analytics service
    console.log('User spent ' + readingTime + ' ms reading ' + currentArticle.url)
    // Reset the current article
    currentArticle = null
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

export {}
