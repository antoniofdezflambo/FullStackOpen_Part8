import { useQuery } from '@apollo/client/react'

import { ALL_BOOKS, ME } from '../../queries'

const Recommendations = (props) => {
  const result = useQuery(ALL_BOOKS)
  const user = useQuery(ME).data.me
  
  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const recommendedBooks = result.data.allBooks.filter(book => book.genres.includes(user.favoriteGenre))

  return (
    <div>
      <h2>Recommendations</h2>

      <p>
        Books in your favorite genre: <strong>{user.favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations