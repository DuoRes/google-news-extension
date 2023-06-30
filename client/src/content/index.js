console.info('content script')

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
    const prominentArticle = section.querySelector('.IBr9hb')
    const articles = section.querySelectorAll('.UwIKyb')
    console.log(articles[0].querySelector('.JtKRv').innerText)
    if (prominentArticle) {
      const title = prominentArticle.querySelector('.JtKRv').innerText
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
      const title = article.querySelector('.JtKRv').innerText
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

// Function to create a chat box
const createChatBox = () => {
  // Create chat box elements
  const chatBox = document.createElement('div')
  const chatBoxInput = document.createElement('input')
  const chatBoxButton = document.createElement('button')

  // Style chat box
  chatBox.style.position = 'fixed'
  chatBox.style.bottom = '0'
  chatBox.style.right = '0'
  chatBox.style.width = '300px'
  chatBox.style.height = '400px'
  chatBox.style.backgroundColor = '#f0f0f0'
  chatBox.style.overflowY = 'auto'
  chatBox.style.padding = '10px'
  chatBox.style.boxSizing = 'border-box'

  // Style input field
  chatBoxInput.style.width = '100%'
  chatBoxInput.style.boxSizing = 'border-box'
  chatBoxInput.id = 'chatbox-input'

  // Style send button
  chatBoxButton.style.width = '100%'
  chatBoxButton.innerText = 'Send'
  chatBoxButton.id = 'chatbox-button'

  // Append elements to chat box
  chatBox.appendChild(chatBoxInput)
  chatBox.appendChild(chatBoxButton)

  // Add chat box to top of the page
  document.body.prepend(chatBox)

  console.log('Chat box created')

  // Set up event handler for the Send button
  document.getElementById('chatbox-button').addEventListener('click', async () => {
    const message = document.getElementById('chatbox-input').value
    const user_id = result.user_id // This should be replaced with the actual user_id from your script

    const response = await chrome.runtime.sendMessage({
      type: 'chat',
      message: message,
      user_id: user_id,
    })

    const chatBox = document.querySelector('div')
    const messagePara = document.createElement('p')
    messagePara.textContent = 'You: ' + message
    chatBox.appendChild(messagePara)

    const responsePara = document.createElement('p')
    responsePara.textContent = 'Bot: ' + response.result
    chatBox.appendChild(responsePara)

    // Clear the input field
    document.getElementById('chatbox-input').value = ''
  })
}

chrome.storage.local.get(['user_id'], (result) => {
  console.log('User ID: ' + result.user_id)
  if (result.user_id) {
    console.log('User ID: ' + result.user_id)
    if (document.URL.includes('news.google.com') && document.URL.includes('foryou')) {
      logPageContents(result.user_id)
      createChatBox()
      // Listen for clicks on news articles
      document.addEventListener('click', function (event) {
        if (event.target.closest('.ipQwMb')) {
          // This is a news article, let's track it
          var articleUrl = event.target.closest('a').href
          chrome.runtime.sendMessage({ type: 'trackArticle', url: articleUrl })
        }
      })
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
  if (event.target.tagName === 'A') {
    // send a message to the background script with the URL of the clicked hyperlink
    chrome.runtime.sendMessage({ type: 'linkClicked', url: event.target.href })
  }
})
