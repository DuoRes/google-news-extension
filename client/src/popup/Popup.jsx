import './Popup.css'
import { useState, useEffect } from 'react'
import { BACKEND_URL } from '../config'

const login = async (identifier) => {
  const response = await fetch(BACKEND_URL + 'user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: identifier }),
  })
  return response.json()
}

function App() {
  const [page, setPage] = useState('login')

  const submitForm = async (event) => {
    event.preventDefault()

    const identifier = document.getElementById('identifier').value

    await chrome.storage.local.set({ identifier }, function () {
      console.log('Identifier Token saved:', identifier)
    })

    const response = await login(identifier)
    console.log('response', response)

    if (response._id) {
      setPage('logged_in')
      await chrome.storage.local.set({ user_id: response._id }, function () {
        console.log('User saved:', response)
      })
    } else {
      alert('Login Failed, please try again.')
    }
  }

  const redirectToNews = async (event) => {
    event.preventDefault()

    console.log('redirecting')

    // redirect chrome to google news page
    chrome.runtime.sendMessage(
      {
        type: 'redirect',
        redirect: 'https://news.google.com/foryou?hl=en-US&gl=US&ceid=US:en',
      },
      function (response) {
        console.log(response)
      },
    )
  }

  useEffect(() => {
    // if chrome storage has identifier, redirect to logged_in.html
    chrome.storage.local.get(['user_id'], function (result) {
      if (result.identifier) {
        setPage('logged_in')
        console.log('Identifier Token retrieved:', result.identifier)
      }
    })
  }, [])

  switch (page) {
    case 'login':
      return (
        <main>
          <h1>News Reader</h1>
          <p>
            Thank you for participating in our research! Please enter your unique participant ID to
            begin.
          </p>
          <form id="login-form">
            <label for="text">ID:</label>
            <input type="text" id="identifier" name="identifier" required />
            <button type="submit" id="login" onClick={submitForm}>
              Login
            </button>
          </form>
        </main>
      )
    case 'logged_in':
      return (
        <main>
          <h1>News Reader</h1>
          <p>
            Thank you for participating in our research, you have successfully logged in. Click the
            "redirect" button below to redirect to Google News when you're ready!
          </p>
          <br />
          <button type="submit" id="redirect" onClick={redirectToNews}>
            Redirect
          </button>
        </main>
      )
    default:
      return (
        <main>
          <h3>Error</h3>
        </main>
      )
  }
}

export default App
