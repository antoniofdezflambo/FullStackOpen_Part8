import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'

import { LOGIN } from '../../queries'

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      console.log('error login:', error.message)
      // setError(error.graphQLErrors[0].message)
    }  
  })
  
  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
    }
  }, [result.data]) // eslint-disable-line

  if (!show) {
    return null
  }
 
  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })

    setPage('authors')
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          username <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          password <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm