import { findByXPath } from '../utils'

// Simulated credentials (in a real extension, this should be securely retrieved)
const username = 'mingduo.test.right.01@gmail.com'
const password = 'Mingduo@testing'

// Function to simulate typing
function simulateTyping(element, text) {
  element.focus()
  element.value = text
  element.dispatchEvent(new Event('input', { bubbles: true }))
}

// Function to alert the user for manual intervention
function alertUserForIntervention() {
  // Create an alert box or other UI element to inform the user
  const alertBox = document.createElement('div')
  alertBox.textContent =
    'Manual intervention required. Please check the page for unexpected elements.'
  alertBox.style.position = 'fixed'
  alertBox.style.bottom = '20px'
  alertBox.style.right = '20px'
  alertBox.style.backgroundColor = 'red'
  alertBox.style.color = 'white'
  alertBox.style.padding = '10px'
  alertBox.style.zIndex = '10000'
  document.body.appendChild(alertBox)
}

// Function to perform login
function performLogin() {
  if (findByXPath("//span[text()='Choose an account']")) {
    // Choose an account page
    const accountButton = findByXPath(`//div[@aria-label="${username}"]`)
    if (accountButton) {
      accountButton.click()
    } else {
      // If something unexpected happens, alert the user
      alertUserForIntervention()
    }
  }

  if (findByXPath("//span[text()='Use your Google Account']")) {
    console.log('Use your Google Account')
    const emailInput = document.querySelector('input[type="email"]')
    const nextButton = document.querySelector('button[jsname="V67aGc"]')
    if (emailInput && nextButton) {
      simulateTyping(emailInput, username)
      nextButton.click()
    }
  }

  // This selector might change
  const passwordInput = document.querySelector('input[type="password"]')

  if (emailInput && nextButton) {
    simulateTyping(emailInput, username)
    nextButton.click()

    // Wait for password field to become available
    setTimeout(() => {
      if (passwordInput) {
        simulateTyping(passwordInput, password)
        nextButton.click()
      } else {
        // If something unexpected happens, alert the user
        alertUserForIntervention()
      }
    }, 1000) // Adjust timeout as needed
  } else {
    // If login form is not as expected, alert the user
    alertUserForIntervention()
  }
}

// Function to check if already logged in and log out if necessary
export function checkLoggedInAndLogout() {
  const notloggedInIndicator = findByXPath("//a[@aria-label='Sign in']")
  console.log('sign In', notloggedInIndicator)
  const logoutButton = ''

  if (notloggedInIndicator) {
    console.log('Not logged in')
    notloggedInIndicator.click()
    performLogin()
  } else if (findByXPath("//span[text()='Use your Google Account']")) {
    console.log('Use your Google Account')
    performLogin()
  } else {
    console.log('Already logged in')
    logoutButton.click()
    performLogin()
  }
}

// Start the process
checkLoggedInAndLogout()
