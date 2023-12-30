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
  const [page, setPage] = useState('')

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
      await chrome.storage.local.set(
        { user_id: response._id, displayChatBox: response.displayChatBox, stance: response.stance },
        function () {
          console.log('User saved:', response)
        },
      )
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

  const LogoutButton = () => {
    const logout = async () => {
      await chrome.storage.local.remove(['user_id'], function (result) {
        console.log('User removed:', result)
      })
      await chrome.storage.local.remove(['identifier'], function (result) {
        console.log('Identifier removed:', result)
      })
      setPage('login')
    }

    return (
      <button
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
        }}
        onClick={logout}
      >
        Logout
      </button>
    )
  }

  useEffect(() => {
    const isCached = async () => {
      const result = await chrome.storage.local.get(['user_id'])
      if (result.user_id) {
        console.log('user_id cached', result.user_id)
        return true
      }
      return false
    }

    isCached().then((cached) => {
      if (cached) {
        setPage('logged_in')
      } else {
        setPage('login')
      }
    })
  }, [])

  console.log('page', page)
  switch (page) {
    case 'login':
      return (
        <main>
          <h1>News Reader</h1>
          <p>
            Thank you for participating in our research! Please enter your unique participant ID to
            begin. Please verify that you have inputted the correct ID before submitting; we would
            not be able to compensate you if you have entered the wrong ID.
          </p>
          <form id="login-form">
            <label>ID:</label>
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
          <LogoutButton />
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
