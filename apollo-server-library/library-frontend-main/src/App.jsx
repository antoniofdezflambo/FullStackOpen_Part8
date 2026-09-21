import { useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client/react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'
import { BOOK_ADDED, ALL_BOOKS } from '../queries'

export const updateCache = (cache, query, addedBook) => {
  const uniqById = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      return seen.has(item.id) ? false : seen.add(item.id)
    })
  }

  cache.updateQuery(query, (data) => {
    if (!data || !data.allBooks) return data
    return {
      allBooks: uniqById(data.allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()

    setPage('authors')
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      console.log('Book added: ', addedBook)
      window.alert(`Libro añadido: ${addedBook.title}`)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    },
    onError: (error) => {
      console.error('Subscription error:', error)
    }
  })

  if (!token) {
    return (
      <div>
        <div>
          <button onClick={() => setPage('authors')}>authors</button>
          <button onClick={() => setPage('books')}>books</button>
          <button onClick={() => setPage('login')}>login</button>
        </div>
        
        <Authors show={page === 'authors'} />

        <Books show={page === 'books'} />

        <LoginForm show={page === 'login'} setToken={setToken} setPage={setPage} />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')} >add book</button>
        <button onClick={() => setPage('recommendations')}>recommendations</button>
        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Recommendations show={page === 'recommendations'} />
    </div>
  )
}

export default App
