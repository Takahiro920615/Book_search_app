import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      navigate('/users')
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
      navigate('/');
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
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="login-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
            />
          </div>
          <button type="submit" className="login-button">Sign In</button>
        </form>
        <div className="button-group">
          <button onClick={testAuth} className="secondary-button">Test Protected Endpoint</button>
          <button onClick={handleLogout} className="secondary-button">Logout</button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  )
}

export default Login