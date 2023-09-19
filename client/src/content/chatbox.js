const chatBoxStyles = {
  position: 'fixed',
  bottom: '10px',
  right: '10px',
  width: '300px',
  height: '400px',
  backgroundColor: 'white',
  overflowY: 'auto',
  padding: '10px',
  boxSizing: 'border-box',
  zIndex: '9999',
  borderRadius: '10px',
  display: 'flex',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  flexDirection: 'column',
}

const inputStyles = {
  padding: '5px',
  boxSizing: 'border-box',
  borderRadius: '5px',
  border: '1px solid #ddd',
  marginTop: '5px',
  marginBottom: '5px',
}

const buttonStyles = {
  width: '100%',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
}

const chatBoxButtonStyles = {
  backgroundColor: '#317efb',
  color: 'white',
  border: 'none',
  padding: '10px 0',
  marginTop: '10px',
}

const toggleButtonStyles = {
  backgroundColor: '#ddd',
  color: 'black',
  border: 'none',
  padding: '10px 0',
  marginTop: '10px',
}

export function createChatBox() {
  // Create chat box elements
  const chatBox = document.createElement('div')
  const chatBoxInput = document.createElement('input')
  const chatBoxButton = document.createElement('button')
  const toggleButton = document.createElement('button')

  // Style chat box
  Object.assign(chatBox.style, chatBoxStyles)

  // Style input field
  Object.assign(chatBoxInput.style, inputStyles)
  chatBoxInput.id = 'chatbox-input'

  // Style send button
  Object.assign(chatBoxButton.style, buttonStyles, chatBoxButtonStyles)
  chatBoxButton.innerText = 'Send'
  chatBoxButton.id = 'chatbox-button'

  // Style toggle button
  Object.assign(toggleButton.style, buttonStyles, toggleButtonStyles)
  toggleButton.innerText = 'Minimize'
  toggleButton.id = 'toggle-button'

  // loading animation
  const loadingSpinner = document.createElement('div')
  loadingSpinner.style.display = 'none' // Initially hidden
  loadingSpinner.innerText = 'Loading...' // Or replace with your own animation
  loadingSpinner.id = 'loading-spinner'
  chatBox.appendChild(loadingSpinner)

  // Toggle chat box visibility
  toggleButton.addEventListener('click', () => {
    if (chatBoxInput.style.display !== 'none') {
      chatBoxInput.style.display = 'none'
      chatBox.style.height = '54px'
      toggleButton.innerText = 'Open Chat Box'
    } else {
      chatBoxInput.style.display = 'block'
      chatBoxButton.style.display = 'block'
      chatBox.style.height = '400px'
      toggleButton.innerText = 'Minimize'
    }
  })

  // Append elements to chat box
  chatBox.appendChild(toggleButton)
  chatBox.appendChild(chatBoxInput)
  chatBox.appendChild(chatBoxButton)
  return chatBox // return the created chat box
}

export function createMessageBubble(sender, message) {
  const messageBubble = document.createElement('div')
  messageBubble.style.backgroundColor = sender === 'Bot' ? '#317efb' : '#ddd'
  messageBubble.style.color = sender === 'Bot' ? 'white' : 'black'
  messageBubble.style.padding = '10px'
  messageBubble.style.marginTop = '10px'
  messageBubble.style.borderRadius = '10px'
  messageBubble.style.wordBreak = 'break-word' // To prevent long words from overflowing

  const messageText = document.createElement('p')
  messageText.style.margin = '0'
  messageText.innerText = `${sender}: ${message}`

  messageBubble.appendChild(messageText)

  return messageBubble
}

export default createChatBox
