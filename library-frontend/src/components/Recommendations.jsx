import { useQuery } from '@apollo/client/react'

import { ALL_BOOKS, ME } from '../queries'

const Recommendations = ({ show }) => {
  const user = useQuery(ME, {
    skip: !show,
  })
  
  const me = user.data?.me

  const filteredBooks = useQuery(ALL_BOOKS, {
    variables: { genre: me?.favoriteGenre },
    skip: !me?.favoriteGenre || !show,
  })
  
  if (!show) {
    return null
  }
  
  if (filteredBooks.loading || user.loading) {
    return <div>loading...</div>
  }

  if (!me) {
    return <div>No user data available</div>
  }

  const recommendedBooks = filteredBooks.data?.allBooks || []

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre: <strong>{me.favoriteGenre}</strong>
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