import { useState, useEffect } from 'react'
import { useLazyQuery, useQuery } from '@apollo/client/react'

import { ALL_BOOKS, FILTER_BOOKS } from '../../queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [ getFilteredBooks, filteredBooks] = useLazyQuery(FILTER_BOOKS)

  const [ genres, setGenres ] = useState([])
  const [ filter, setFilter ] = useState(null)
  const [ books, setBooks ] = useState([])

  useEffect(() => {
    if (result.data) {
      const allGenres = result.data.allBooks.flatMap(book => book.genres)

      setBooks(result.data.allBooks)

      setGenres([...new Set(allGenres)])
    }
  }, [result.data])
  
  useEffect(() => {
    if(filter) {
      getFilteredBooks({ variables: { genreToSearch: filter } })
    } else if(result.data?.allBooks){
      setBooks(result.data.allBooks)
    }
  }, [filter, result.data, getFilteredBooks])

  useEffect(() => {
    if(filteredBooks.data) {
      setBooks(filteredBooks.data.filterBooks)
    }
  }, [filteredBooks.data])

  if (!props.show) {
    return null
  }
  
  if (result.loading) {
    return <div>loading...</div>
  }
  
  return (
    <div>
      <h2>Books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map((genre) => (
          <button key={genre} onClick={() => setFilter(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => setFilter(null)}>All genres</button>
      </div>
    </div>
  )
}

export default Books
