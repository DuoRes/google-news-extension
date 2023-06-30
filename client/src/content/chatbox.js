const createChatBox = () => {
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
  chatBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)'

  // Style input field
  chatBoxInput.style.width = 'calc(100% - 10px)'
  chatBoxInput.style.padding = '5px'
  chatBoxInput.style.boxSizing = 'border-box'
  chatBoxInput.style.borderRadius = '5px'
  chatBoxInput.style.border = '1px solid #ddd'
  chatBoxInput.style.marginTop = '10px'
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

export default createChatBox
