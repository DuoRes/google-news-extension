console.info('content script')

import { createChatBox, createMessageBubble } from './chatbox'
import { checkLoggedInAndLogout } from './login'

const article = document.querySelector('article')
const link = document.querySelector('link')

const redirectToForYou = () => {
  window.location.href = 'https://news.google.com/foryou?hl=en-US&gl=US&ceid=US%3Aen'
}

const logPageContents = async (user_id) => {
  const contents = []
  // get all components of the section wrapper
  const sections = document.querySelectorAll('.Ccj79')
  if (sections.length === 0) {
    console.log('No sections found.')
    redirectToForYou()
  }
  sections.forEach((section, s_idx) => {
    const oneArticle = section.querySelector('.IFHyqb')
    if (oneArticle) {
      // only one article in this section
      const title = oneArticle.querySelector('.JtKRv').innerText
      const link = oneArticle.querySelector('.WwrzSb').href
      const timestamp = oneArticle.querySelector('.hvbAAd').innerText
      const press = oneArticle.querySelector('.vr1PYe').innerText
      const img = oneArticle.querySelector('.Quavad').srcset.split(' ')[0]
      contents.push({
        index: s_idx + 1 + '.1',
        title,
        link,
        timestamp,
        press,
        img,
      })
      return
    }

    // get all articles in this section
    const prominentArticle = section.querySelector('.IBr9hb')
    const articles = section.querySelectorAll('.UwIKyb')
    if (prominentArticle) {
      // console.log(prominentArticle.querySelector('.gPFEn').innerText)
      const title = prominentArticle.querySelector('.gPFEn').innerText
      const link = prominentArticle.querySelector('.WwrzSb').href
      const timestamp = prominentArticle.querySelector('.hvbAAd').innerText
      const press = prominentArticle.querySelector('.vr1PYe').innerText
      const img = prominentArticle.querySelector('img').src
      contents.push({
        index: s_idx + 1 + '.1',
        title,
        link,
        timestamp,
        press,
        img,
      })
    }
    articles.forEach((article, a_idx) => {
      const title = article.querySelector('.gPFEn').innerText
      const link = article.querySelector('.WwrzSb').href
      const timestamp = article.querySelector('.hvbAAd').innerText
      const press = article.querySelector('.vr1PYe').innerText
      contents.push({
        index: s_idx + 1 + '.' + (a_idx + 2),
        title,
        link,
        timestamp,
        press,
      })
    })
  })
  console.log(contents)

  const result = await chrome.runtime.sendMessage({
    type: 'logPageContents',
    contents: JSON.stringify(contents),
    user_id: user_id,
  })

  console.log(result)
}

const disableLinks = async (user_id) => {
  const links = document.querySelectorAll('a')

  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault() // Disable the link
      e.stopPropagation() // Don't bubble the event up
      // Send a message to the background script
      await chrome.runtime.sendMessage(
        {
          type: 'linkClicked',
          href: e.target.href,
          id: e.target.id,
          class: e.target.className,
          target: e.target,
          user_id: user_id,
        },
        (response) => {
          location.reload()
        },
      )
    })
  })
}

const logReadingProgress = () => {
  document.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight
    const scrollTop = document.documentElement.scrollTop
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100
    console.log(scrollPercentage)
  })
}

const redirectPopup = () => {
  console.log('This is not a Google News page.')
  document.body.prepend(
    new DOMParser().parseFromString(
      `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);
      z-index: 999
      ">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 300px; background-color: white; border-radius: 10px; padding: 20px">
          <h1>Google News Recommendation</h1>
          <p>This is not a Google News page.</p>
          <p>Do you want to go to Google News?</p>
          <div style="display: flex; justify-content: space-between; margin-top: 20px">
            <button id="cancel" style="width: 100px; height: 40px; border-radius: 5px; background-color: #f44336; color: white; border: none">Cancel</button>
            <button id="go" style="width: 100px; height: 40px; border-radius: 5px; background-color: #4caf50; color: white; border: none">Go</button>
          </div>
        </div>
      </div>
    `,
      'text/html',
    ).body.firstChild,
  )
  document.getElementById('cancel').addEventListener('click', () => {
    document.body.removeChild(document.body.firstChild)
  })
  document.getElementById('go').addEventListener('click', () => {
    window.location.href = 'https://news.google.com/foryou?hl=en-US&gl=US&ceid=US%3Aen'
  })
  return
}

const pageBodyNode = document.querySelector('.afJ4ge')
const referenceForYouNode = document.querySelector('.AUWEld')
chrome.storage.local.get(null, function (items) {
  var allKeys = Object.keys(items)
  console.info(allKeys)
})

chrome.storage.local.get(['user_id'], (result) => {
  console.log('User ID: ' + result.user_id)
  if (result.user_id) {
    console.log('User ID: ' + result.user_id)
    if (document.URL.includes('news.google.com') && document.URL.includes('foryou')) {
      console.log('This is a Google News For You page: ' + document.URL)
      logPageContents(result.user_id)
      disableLinks(result.user_id)

      const chatBox = createChatBox()
      pageBodyNode.insertBefore(chatBox, referenceForYouNode)

      document.getElementById('chatbox-button').addEventListener('click', async () => {
        const message = document.getElementById('chatbox-input').value
        const user_id = result.user_id
        console.log(message)

        const response = await chrome.runtime.sendMessage({
          type: 'chat',
          message: message,
          user_id: user_id,
        })
        console.log(response)
      })

      // Listen for clicks on news articles
      document.addEventListener('click', function (event) {
        if (event.target.closest('.ipQwMb')) {
          event.preventDefault()
          event.stopPropagation()
          // This is a news article, let's track it
          var articleUrl = event.target.closest('a').href
          chrome.runtime.sendMessage({ type: 'trackArticle', url: articleUrl })
        }
      })
    } else if (document.URL.includes('google.com')) {
      console.log('This is a Google News page: ' + document.URL)
      checkLoggedInAndLogout()
    } else {
      console.log('This is not a Google News page: ' + document.URL)
      // redirectPopup()
    }
  } else {
    console.log('User ID not found.')
  }
})

// add a click event listener on all hyperlink elements
document.addEventListener('click', function (event) {
  // check if the clicked element is a hyperlink
  if (event.target.tagName === 'A' || event.target.closest('a')) {
    event.preventDefault()
    event.stopPropagation()
    // send a message to the background script with the URL of the clicked hyperlink
    chrome.runtime.sendMessage({ type: 'linkClicked', url: event.target.href })
  }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  document.getElementById('loading-spinner').style.display = 'block'
  const chatBox = document.getElementById('chatbox')
  console.log(request.result)

  // Append the user's message
  const userMessage = document.getElementById('chatbox-input').value
  const userBubble = createMessageBubble('You', userMessage)
  chatBox.insertBefore(userBubble, chatBox.firstChild)

  // Append the bot's response
  const botBubble = createMessageBubble('Bot', request.result)
  chatBox.insertBefore(botBubble, chatBox.firstChild)

  // Clear the input field
  document.getElementById('chatbox-input').value = ''

  document.getElementById('loading-spinner').style.display = 'none'

  // Scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight
})
