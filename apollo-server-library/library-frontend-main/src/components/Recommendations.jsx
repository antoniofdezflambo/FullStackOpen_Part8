import { useQuery } from '@apollo/client/react'

import { ME, FILTER_BOOKS } from '../../queries'

const Recommendations = (props) => { 
  const me = useQuery(ME)
  const user = me.data?.me

  const filteredBooks = useQuery(FILTER_BOOKS, {
    variables: { genreToSearch: user?.favoriteGenre },
    skip: !user?.favoriteGenre
  })
  
  if (!props.show) {
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