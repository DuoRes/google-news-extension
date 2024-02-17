console.info('content script')

import { createChatBox, createMessageBubble } from './chatbox'
import { checkLoggedInAndLogout } from './login'

const redirectToForYou = () => {
  window.location.href = 'https://news.google.com/foryou?hl=en-US&gl=US&ceid=US%3Aen'
}

var chatBotName = 'Chris'
var displayChatBox = false

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

  await chrome.runtime.sendMessage({
    type: 'logPageContents',
    contents: JSON.stringify(contents),
    user_id: user_id,
  })
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

const pageBodyNode = document
  .evaluate('//main', document, null, XPathResult.ANY_TYPE, null)
  .iterateNext()
const referenceForYouNode = document
  .evaluate("//h2[contains(., 'For you')]", document, null, XPathResult.ANY_TYPE, null)
  .iterateNext()

console.log('referenceForYouNode', referenceForYouNode)

chrome.storage.local.get(null, function (items) {
  var allKeys = Object.keys(items)
  console.info(allKeys)
})

chrome.storage.local.get(
  ['user_id', 'displayChatBox', 'chatBotName', 'chatRecord', 'displayWarningMessage'],
  async (result) => {
    console.log('User ID: ' + result.user_id)
    console.log('Display Chat Box: ' + result.displayChatBox)
    console.log('Chat Bot Name: ' + result.chatBotName)
    console.log('displayWarningMessage: ' + result.displayWarningMessage)

    if (result.user_id) {
      if (result.chatBotName) {
        chatBotName = result.chatBotName
      }

      console.log('User ID: ' + result.user_id)

      if (document.URL.includes('news.google.com') && document.URL.includes('foryou')) {
        console.log('This is a Google News For You page: ' + document.URL)
        await logPageContents(result.user_id)
        disableLinks(result.user_id)

        chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
          if (request.type === 'logPageContents') {
            const currentStance = request.currentStance
            console.log('currentStance', currentStance)
            if (result.displayWarningMessage && Math.abs(currentStance.currentStance) > 80) {
              alert(
                'Warning: ' +
                  (currentStance.currentStance > 0
                    ? 'You are leaning towards conservative news sources.'
                    : 'You are leaning towards liberal news sources.'),
              )
            }
          }
        })

        if (result.displayChatBox) {
          const chatBox = createChatBox()
          pageBodyNode.appendChild(chatBox)
        }

        document.getElementById('chatbox-button').addEventListener('click', async () => {
          const message = document.getElementById('chatbox-input').value
          const user_id = result.user_id
          console.log(message)

          await chrome.runtime.sendMessage({
            type: 'chat',
            message: message,
            user_id: user_id,
          })
        })

        const chatBox = document.getElementById('chatbox')

        result.chatRecord.messages.forEach((message) => {
          if (message.role === 'assistant') {
            const botBubble = createMessageBubble(chatBotName, message.content)
            chatBox.insertBefore(botBubble, chatBox.firstChild)
          }
          if (message.role === 'user') {
            const userBubble = createMessageBubble('You', message.content)
            chatBox.insertBefore(userBubble, chatBox.firstChild)
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
  },
)

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.type === 'chat') {
    document.getElementById('loading-spinner').style.display = 'block'
    const chatBox = document.getElementById('chatbox')
    console.log(request.result)

    // Append the user's message
    const userMessage = document.getElementById('chatbox-input').value
    const userBubble = createMessageBubble('You', userMessage)
    chatBox.insertBefore(userBubble, chatBox.firstChild)

    // Append the bot's response
    const botBubble = createMessageBubble(chatBotName, request.result)
    chatBox.insertBefore(botBubble, chatBox.firstChild)

    // Clear the input field
    document.getElementById('chatbox-input').value = ''

    document.getElementById('loading-spinner').style.display = 'none'

    // Scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight
  } else if (request.type === 'linkClicked' && request.ok) {
    document.body.prepend(
      new DOMParser().parseFromString(
        `
                  <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);
                  z-index: 999
                  ">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 300px; background-color: white; border-radius: 10px; padding: 20px">
                      <h1>Google News Recommendation</h1>
                      <p>Thank you for participating in our study!</p>
                      <p>Your completion code is: ${request.completionCode}</p>
                      <p>Please copy and paste this code into the HIT on MTurk.</p>
                      <div style="display: flex; justify-content: space-between; margin-top: 20px">
                      </div>
                    </div>
                  </div>
                `,
        'text/html',
      ).body.firstChild,
    )
  }
})
