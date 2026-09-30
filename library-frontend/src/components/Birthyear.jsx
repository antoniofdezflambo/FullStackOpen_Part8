import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'

import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const Birthyear = ({ setError }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const result = useQuery(ALL_AUTHORS)

  const [addBirthyear] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
      setError(error.message)
    },
    update: (cache, response) => {
      cache.updateQuery({ query: ALL_AUTHORS }, ({ allAuthors }) => {
        const updatedAuthor = response.data.editAuthor
        return {
          allAuthors: allAuthors.map(a =>
            a.name === updatedAuthor.name ? updatedAuthor : a
          )
        }
      })
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    console.log('updating author...')

    try {
      await addBirthyear({ variables: { name, setBornTo: parseInt(born) } })

      setName('')
      setBorn('')
    } catch (error) {
      console.error(error)
    }
  }

  if (result.loading) {
    return <div>loading...</div>
  }
  
  const authors = result.data.allAuthors

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <label>
            name
            <select value={name} onChange={({ target }) => setName(target.value)}>
              <option value="">Select an author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
          </label>
        </div>
        <div>
          <label>
            born
            <input value={born} onChange={({ target }) => setBorn(target.value)} />
          </label>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Birthyear