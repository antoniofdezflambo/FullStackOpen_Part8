import { useState } from "react"
import { useQuery } from "@apollo/client/react"

import { ALL_BOOKS } from "../queries"

const Books = (props) => {
  const [ filter, setFilter ] = useState(null)
  const books = useQuery(ALL_BOOKS)
  const filteredBooks = useQuery(ALL_BOOKS, {
    variables: { genre: filter }
  })

  if (!props.show) {
    return null
  }

  if(books.loading || filteredBooks.loading) {
    return <div>Loading...</div>
  }

  const allGenres = [...new Set(books.data?.allBooks.flatMap((b) => b.genres) || [])]

  const booksToShow = filteredBooks.data?.allBooks || []

  return (
    <div>
      <h2>books</h2>

      <div>
        <p>in genre <strong>{filter}</strong></p>
      </div>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {allGenres.map((genre) => (
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
