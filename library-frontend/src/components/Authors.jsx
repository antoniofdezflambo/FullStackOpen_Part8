import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const query = gql`
  query {
    allAuthors {
      name
      born
      bookCount
  }
}
`

const Authors = (props) => {
  const result = useQuery(query)

  if (!props.show) {
    return null
  }

  if(result.loading) {
    return <div>Loading...</div>
  }

  const authors = result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
