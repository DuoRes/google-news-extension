export function createChatBox() {
  // Create chat box elements
  const chatBox = document.createElement('div')
  const chatBoxInput = document.createElement('input')
  const chatBoxButton = document.createElement('button')
  const toggleButton = document.createElement('button')

  // Style chat box
  chatBox.style.position = 'fixed'
  chatBox.style.bottom = '10px'
  chatBox.style.right = '10px'
  chatBox.style.width = '300px'
  chatBox.style.height = '400px'
  chatBox.style.backgroundColor = 'white'
  chatBox.style.overflowY = 'auto'
  chatBox.style.padding = '10px'
  chatBox.style.boxSizing = 'border-box'
  chatBox.style.zIndex = '9999'
  chatBox.style.borderRadius = '10px'
  chatBox.style.display = 'flex'
  chatBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)'
  chatBox.style.flexDirection = 'column'
  chatBox.id = 'chatbox'

  // Style input field
  chatBoxInput.style.padding = '5px'
  chatBoxInput.style.boxSizing = 'border-box'
  chatBoxInput.style.borderRadius = '5px'
  chatBoxInput.style.border = '1px solid #ddd'
  chatBoxInput.style.marginTop = '5px'
  chatBoxInput.style.marginBottom = '5px'
  chatBoxInput.id = 'chatbox-input'

  // Style send button
  chatBoxButton.style.width = '100%'
  chatBoxButton.style.backgroundColor = '#317efb'
  chatBoxButton.style.color = 'white'
  chatBoxButton.style.border = 'none'
  chatBoxButton.style.padding = '10px 0'
  chatBoxButton.style.marginTop = '10px'
  chatBoxButton.style.borderRadius = '5px'
  chatBoxButton.style.cursor = 'pointer'
  chatBoxButton.style.fontSize = '14px'
  chatBoxButton.innerText = 'Send'
  chatBoxButton.id = 'chatbox-button'

  // Style toggle button
  toggleButton.style.width = '100%'
  toggleButton.style.backgroundColor = '#ddd'
  toggleButton.style.color = 'black'
  toggleButton.style.border = 'none'
  toggleButton.style.padding = '10px 0'
  toggleButton.style.borderRadius = '5px'
  toggleButton.style.cursor = 'pointer'
  toggleButton.style.fontSize = '14px'
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
