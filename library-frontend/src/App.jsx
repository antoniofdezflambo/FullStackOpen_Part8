import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

import { addBookToCache } from '../utils/apolloCache'

import { BOOK_ADDED } from './queries'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('library-user-token'))
  const [page, setPage] = useState('authors')
  const [errorMessage, setErrorMessage] = useState('')
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 3000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()

    setPage('authors')
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      window.alert(`${addedBook.title} added`)
      addBookToCache(client.cache, addedBook)
    },
    onError: (error) => {
      console.error('Subscription error:', error)
    },
  })

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!token && <button onClick={() => setPage("login")}>login</button>}
        {token && <button onClick={() => setPage("add")}>add book</button>}
        {token && <button onClick={() => setPage("recommend")}>recommend</button>}
        {token && <button onClick={logout}>logout</button>}
      </div>

      <div>
        <p style={{ color: "red" }}>{errorMessage}</p>
      </div>

      <Authors show={page === "authors"} token={token} setError={notify} />

      <Books show={page === "books"} setError={notify} />

      <NewBook show={page === "add"} />

      <Recommendations show={page === "recommend"} />

      <LoginForm
        show={page === "login"}
        setToken={setToken}
        setPage={setPage}
        setError={notify}
       />
    </div>
  )
}

export default App
