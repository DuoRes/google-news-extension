console.info('content script')

import { createChatBox, createMessageBubble } from './chatbox'
import { checkLoggedInAndLogout } from './login'

const sections2remove = []
const sections2disable = ['.EctEBd', '.brSCsc']

const redirectToForYou = () => {
  window.location.href = 'https://news.google.com/foryou?hl=en-US&gl=US&ceid=US%3Aen'
}

const redirectToHeadlines = () => {
  window.location.href =
    'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen'
}

var chatBotName = 'Chris'
var displayChatBox = false
var pageContents = []
var currIndex = 0

const sendLogPageContents = async (user_id) => {
  console.log(pageContents)
  await chrome.runtime.sendMessage({
    type: 'logPageContents',
    contents: JSON.stringify(pageContents),
    user_id: user_id,
  })
}

const processPageContents = async (sections, user_id) => {
  for (const section of sections2remove) {
    const sectionToRemove = document.querySelectorAll(section)
    if (sectionToRemove) {
      sectionToRemove.forEach((section) => {
        section.remove()
      })
    }
  }

  for (const section of sections2disable) {
    const sectionToDisable = document.querySelectorAll(section)
    if (sectionToDisable) {
      sectionToDisable.forEach((section) => {
        section.style.pointerEvents = 'none'
        section.style.opacity = 0.5
      })
    }
  }

  sections.forEach((section, s_idx) => {
    // the geolocation based suggestion section
    const newSection = section.querySelector('.wwh0Hb')
    if (newSection) {
      currIndex += 1
      const sources = newSection.querySelectorAll('.YRegrc')
      const sectionName =
        newSection.querySelector('.Pe8HEe').innerText +
        '|' +
        newSection.querySelector('.EdjnGc').innerText
      sources.forEach((source, a_idx) => {
        const press = source.querySelector('.UiDffd').alt
        const timestamp = source.querySelector('.xsHp8').innerText
        const innerSources = source.querySelectorAll('.TPqh7b')
        innerSources.forEach((source, i_idx) => {
          const title = source.querySelector('.kEAYTc').innerText
          const link = source.querySelector('.kEAYTc').href
          const img = source.querySelector('.L8a44').src
          const type = source.querySelector('.JrYg1b').innerText
          pageContents.push({
            index: `${currIndex}.${a_idx + 1}.${i_idx + 1}`,
            title,
            link,
            img,
            press,
            type,
            timestamp,
            section: sectionName,
          })
        })
      })
    }

    const oneArticle = section.querySelector('.IFHyqb')
    if (oneArticle) {
      // only one article in this section
      currIndex += 1
      const title = oneArticle.querySelector('.JtKRv').innerText
      const link = oneArticle.querySelector('.WwrzSb').href
      const timestamp = oneArticle.querySelector('.hvbAAd').innerText
      const press = oneArticle.querySelector('.vr1PYe').innerText
      const img = oneArticle.querySelector('.Quavad') ? oneArticle.querySelector('.Quavad').src : ''
      const reporter = oneArticle.querySelector('.PJK1m')
        ? oneArticle.querySelector('.PJK1m').innerText
        : ''
      pageContents.push({
        index: currIndex + '.1',
        title,
        link,
        timestamp,
        press,
        img,
        reporter,
      })
      return
    }

    // get all articles in this section
    const prominentArticle = section.querySelector('.IBr9hb')
    const articles = section.querySelectorAll('.UwIKyb')
    currIndex += 1
    if (prominentArticle) {
      // console.log(prominentArticle.querySelector('.gPFEn').innerText)
      const title = prominentArticle.querySelector('.gPFEn').innerText
      const link = prominentArticle.querySelector('.WwrzSb').href
      const timestamp = prominentArticle.querySelector('.hvbAAd').innerText
      const press = prominentArticle.querySelector('.vr1PYe').innerText
      const img = prominentArticle.querySelector('img').src
      const reporter = prominentArticle.querySelector('.PJK1m')
        ? prominentArticle.querySelector('.PJK1m').innerText
        : ''
      pageContents.push({
        index: currIndex + '.1',
        title,
        link,
        timestamp,
        press,
        img,
        reporter,
      })
    }
    articles.forEach((article, a_idx) => {
      const title = article.querySelector('.gPFEn').innerText
      const link = article.querySelector('.WwrzSb').href
      const timestamp = article.querySelector('.hvbAAd').innerText
      const press = article.querySelector('.vr1PYe').innerText
      const reporter = prominentArticle.querySelector('.PJK1m')
        ? prominentArticle.querySelector('.PJK1m').innerText
        : ''
      var sectionName = ''
      if (prominentArticle.querySelector('.hgyOfc')) {
        sectionName += prominentArticle.querySelector('.hgyOfc').innerText
      }
      if (prominentArticle.querySelector('.Q5P2pb') && sectionName !== '') {
        sectionName += '|' + prominentArticle.querySelector('.Q5P2pb').innerText
      } else if (prominentArticle.querySelector('.Q5P2pb')) {
        sectionName += prominentArticle.querySelector('.Q5P2pb').innerText
      }
      pageContents.push({
        index: currIndex + '.' + (a_idx + 2),
        title,
        link,
        timestamp,
        press,
        reporter,
        section: sectionName,
      })
    })
  })
}

const observePageChanges = (user_id) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const addedNodes = mutation.addedNodes
        addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('Ccj79')) {
            processPageContents([node], user_id)
          }
        })
      }
    })
    disableLinks(user_id)
  })

  const observerConfig = {
    childList: true,
    subtree: true,
  }

  const targetNode = document.querySelector('main')
  observer.observe(targetNode, observerConfig)
}

const logPageContents = async (user_id, isControl = false) => {
  const sections = document.querySelectorAll('.Ccj79')
  if (sections.length === 0) {
    console.log('No sections found.')
    isControl ? redirectToHeadlines() : redirectToForYou()
  }
  processPageContents(sections, user_id)
}

const disableLinks = async (user_id) => {
  const links = document.querySelectorAll('a')

  links.forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault() // Disable the link
      e.stopPropagation() // Don't bubble the event up
      // Send messages to the background script
      await sendLogPageContents(user_id)
      await chrome.runtime.sendMessage({
        type: 'linkClicked',
        href: e.target.href,
        id: e.target.id,
        class: e.target.className,
        user_id: user_id,
      })
      location.reload()
    })
  })
}

const pageBodyNode = document
  .evaluate('//main', document, null, XPathResult.ANY_TYPE, null)
  .iterateNext()
const referenceForYouNode =
  document
    .evaluate("//h2[contains(., 'For you')]", document, null, XPathResult.ANY_TYPE, null)
    .iterateNext() ||
  document
    .evaluate("//h1[contains(., 'Headlines')]", document, null, XPathResult.ANY_TYPE, null)
    .iterateNext()

console.log('referenceForYouNode', referenceForYouNode)

chrome.storage.local.get(null, function (items) {
  var allKeys = Object.keys(items)
  console.info(allKeys)
})

chrome.storage.local.get(
  [
    'user_id',
    'displayChatBox',
    'chatBotName',
    'chatRecord',
    'displayWarningMessage',
    'completed',
    'isControl',
  ],
  async (result) => {
    console.log('User ID: ' + result.user_id)
    console.log('Display Chat Box: ' + result.displayChatBox)
    console.log('Chat Bot Name: ' + result.chatBotName)
    console.log('displayWarningMessage: ' + result.displayWarningMessage)
    console.log('completed: ' + result.completed)
    console.log('isControl: ' + result.isControl)

    if (result.completed) {
      console.log('Completion Code: ' + result.completionCode)
      completionCode()
    }

    if (result.user_id) {
      if (result.chatBotName) {
        chatBotName = result.chatBotName
      }

      console.log('User ID: ' + result.user_id)

      if (
        document.URL.includes('news.google.com') &&
        (document.URL.includes('foryou') || document.URL.includes('topics'))
      ) {
        console.log('This is a Google News For You page: ' + document.URL)
        await logPageContents(result.user_id, result.isControl)
        observePageChanges(result.user_id)
        disableLinks(result.user_id)

        chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
          if (request.type === 'logPageContents') {
            const currentStance = request.currentStance
            console.log('currentStance', currentStance)
            if (result.displayWarningMessage && Math.abs(currentStance) > 80) {
              alert(
                'Warning: ' +
                  (currentStance > 0
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
    console.log('OK', request.ok)
    chrome.storage.local.set({ completed: true })
    completionCode()
  }
})

function completionCode() {
  document.body.prepend(
    new DOMParser().parseFromString(
      `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5);
          z-index: 999
          ">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 400px; height: 300px; background-color: white; border-radius: 10px; padding: 20px; color: black; display: flex; flex-direction: column; justify-content: space-between;">
            <h1 style="margin-bottom: 10px">Thank you!</h1>
            <p>You have finished the main part of the study. Please complete the following post-task questionnaire. After completing the questionnaire, you will receive a completion code to paste into Prolific.</p>
            <a href="https://berkeley.qualtrics.com/jfe/form/SV_39pHRQ7mlex9Dv0" target="_blank" style="text-align: center; background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px; text-decoration: none; text-align: center; margin-top: 20px">Post-task questionnaire</a>
            <p>If you have any questions, please contact the researcher at <a href="mailto:help@haasresearch.org">help@haasresearch.org</a></p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px">
            </div>
          </div>
          </div>
        `,
      'text/html',
    ).body.firstChild,
  )
}
