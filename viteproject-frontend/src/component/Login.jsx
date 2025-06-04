import { useState } from 'react'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/sign_in', {
        user: { email, password }
      })
      const token = response.headers.authorization
      if (!token) {
        setMessage('No token received in response!')
        return
      }
      localStorage.setItem('token', token)
      setMessage('Login successful!')
      console.log('Token saved:', token) // デバッグ用
    } catch (error) {
      setMessage(`Login failed: ${error.response?.data?.error || error.message}`)
      console.error('Login error:', error.response || error) // デバッグ用
    }
  }

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMessage('No token found, already logged out!')
      return
    }
    try {
      await axios.delete('/api/sign_out', {
        headers: { Authorization: token }
      })
      localStorage.removeItem('token') // トークンを削除
      setEmail('') // フォームをリセット
      setPassword('')
      setMessage('Logout successful!')
    } catch (error) {
      setMessage(`Logout failed: ${error.response?.data?.error || error.message}`)
      console.error('Logout error:', error.response || error)
    }
  }

  const testAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMessage('No token found!')
      return
    }
    try {
      const response = await axios.get('/api/protected', {
        headers: { Authorization: token }
      })
      setMessage(`Protected response: ${JSON.stringify(response.data)}`)
      console.log(response.data)
    } catch (error) {
      setMessage(`Protected request failed: ${error.response?.data?.error || error.message}`)
      console.error('Protected error:', error.response || error)
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Login</button> {/* ログインボタンを追加 */}
      </form>
      <button onClick={testAuth}>Test Protected Endpoint</button> {/* フォーム外に移動 */}
      <button onClick={handleLogout}>Logout</button>
      {message && <p>{message}</p>}
    </div>
  )
}

export default Login