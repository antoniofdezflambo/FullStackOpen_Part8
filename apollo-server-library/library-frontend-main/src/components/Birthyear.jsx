import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'

import { ALL_AUTHORS, EDIT_AUTHOR } from '../../queries'

const Birthyear = () => {

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [addBirthyear] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      const errors = error.graphQLErrors[0].extensions.error.errors
      const messages = Object.values(errors).map(e => e.message).join('\n')
      console.log(messages)
    }
  })

  const submit = async (event) => {
    event.preventDefault()

    addBirthyear({ variables: { name, setBornTo: parseInt(born) } })

    setName('')
    setBorn('')
  }

  const result = useQuery(ALL_AUTHORS)
  
    if (result.loading) {
      return <div>loading...</div>
    }
  
    const authors = result.data.allAuthors

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input value={born} onChange={({ target }) => setBorn(target.value)} />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default Birthyear