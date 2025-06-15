// src/Login.jsx
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
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/sign_in', {
        user: { email, password },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      let token = response.headers.authorization;
      if (!token) {
        setMessage('No token received in response!');
        return;
      }
  
      // ✅ 2重 Bearer 対策：既に含まれているか厳密にチェック
      if (!/^Bearer\s/.test(token)) {
        token = `Bearer ${token}`;
      }
  
      localStorage.setItem('token', token);
      setMessage('Login successful!');
      console.log('Token saved:', token);
      navigate('/users');
    } catch (error) {
      setMessage(`Login failed: ${error.response?.data?.error || error.message}`);
      console.error('Login error:', error.response || error);
    }
  };
  

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found, already logged out!');
      return;
    }
    try {
      await axios.delete('http://localhost:3000/api/sign_out', {
        headers: { Authorization: token },
      });
      localStorage.removeItem('token');
      setEmail('');
      setPassword('');
      setMessage('Logout successful!');
      navigate('/');
    } catch (error) {
      setMessage(`Logout failed: ${error.response?.data?.error || error.message}`);
      console.error('Logout error:', error.response || error);
    }
  };

  const testAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found!');
      return;
    }
    try {
      const response = await axios.get('http://localhost:3000/api/protected', {
        headers: { Authorization: token },
      });
      setMessage(`Protected response: ${JSON.stringify(response.data)}`);
      console.log(response.data);
    } catch (error) {
      setMessage(`Protected request failed: ${error.response?.data?.error || error.message}`);
      console.error('Protected error:', error.response || error);
    }
  };

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
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-button">Log In</button>
          <button type="button" onClick={() => navigate('/signup')} className="create-account-button">
            Create New Account
          </button>
        </form>
        <div className="button-group">
          <button onClick={testAuth} className="secondary-button">Test Protected Endpoint</button>
          <button onClick={handleLogout} className="secondary-button">Logout</button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;
