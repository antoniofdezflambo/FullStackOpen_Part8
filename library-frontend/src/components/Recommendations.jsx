import { useQuery } from '@apollo/client/react'

import { FILTER_BOOKS, ME } from '../queries'

const Recommendations = ({ show }) => {
  const user = useQuery(ME)
  
  const me = user.data?.me

  const filteredBooks = useQuery(FILTER_BOOKS, {
    variables: { genreToSearch: me.favoriteGenre },
    skip: !me?.favoriteGenre
  })
  
  if (!show) {
    return null
  }
  
  if (filteredBooks.loading || me.loading) {
    return <div>loading...</div>
  }

  const recommendedBooks = filteredBooks.data?.filterBooks || []

  return (
    <div>
      <h2>Recommendations</h2>

      <p>
        Books in your favorite genre: <strong>{me.favoriteGenre}</strong>
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