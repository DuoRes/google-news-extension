console.info('background script')
import { BACKEND_URL } from '../config'

// Keep track of the current article being read
var currentArticle = null

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
    case 'logPageContents':
      console.log(message.contents)
      const result = await fetch(BACKEND_URL + 'collect/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: message.contents,
          user_id: message.user_id,
        }),
      })

      console.log(result)

      sendResponse({ result: result })
      break
    case 'chat':
      console.log(message)
      const token = await getToken()
      const chatResult = await fetch(BACKEND_URL + 'chat/gpt-3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: message.message,
          user_id: message.user_id,
        }),
      })

      console.log(chatResult)

      if (chatResult.status !== 200) {
        console.log('Error: ' + chatResult.status)
        sendResponse({ result: 'Error: ' + chatResult.status })
        break
      }

      console.log(chatResult)

      sendResponse({ result: chatResult })
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
