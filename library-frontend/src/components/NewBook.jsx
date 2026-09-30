import { useMutation } from '@apollo/client/react'
import { useState } from 'react'

import { ALL_BOOKS, ADD_BOOK } from '../queries'

const NewBook = ({ show, setError }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [createBook] = useMutation(ADD_BOOK, {
    onError: (error) => {
      console.error(error.message)
      setError(error.message)
    },
    update: (cache, response) => {
      const addedBook = response.data?.addBook
      if (!addedBook) return

      const updateBookCache = (variables) => {
        cache.updateQuery({ query: ALL_BOOKS, variables }, (data) => {
          if (!data) return data
          // Evitar duplicados si la consulta ya lo incluyó
          if (data.allBooks.some((b) => b.id === addedBook.id)) {
            return data
          }
          return {
            allBooks: data.allBooks.concat(addedBook),
          }
        })
      }

      updateBookCache()
      updateBookCache({ genre: null })

      addedBook.genres.forEach((genre) => {
        updateBookCache({ genre })
      })
    }
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    console.log('add book...')

    createBook({ variables: { title, author, published: parseInt(published), genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          <label>
            title
            <input
              value={title}
              onChange={({ target }) => setTitle(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            author
            <input
              value={author}
              onChange={({ target }) => setAuthor(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            published
            <input
              type="number"
              value={published}
              onChange={({ target }) => setPublished(target.value)}
            />
          </label>
        </div>
        <div>
          <label title='genre'>
            <input
              value={genre}
              onChange={({ target }) => setGenre(target.value)}
            />
            <button onClick={addGenre} type="button">
              add genre
            </button>
          </label>
        </div>
        <div>
          <label>
            genres: {genres.join(' ')}
          </label>
        </div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
