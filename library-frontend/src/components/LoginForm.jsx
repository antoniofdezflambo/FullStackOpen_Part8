import { useState } from 'react'
import { useMutation } from '@apollo/client/react'

import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setPage, setError }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [ login ] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data.login.value
      setToken(token)
      localStorage.setItem('library-user-token', token)
      
      setPage('authors')

      setUsername('')
      setPassword('')
    },
    onError: (error) => {
      console.error(error.message)
      setError(error.message)
    }
  })

  const submit = (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
  }

  if (!show) {
    return null
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>
            username <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete='current-username' />
          </label>
        </div>
        <div>
          <label>
            password <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' />
          </label>
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm