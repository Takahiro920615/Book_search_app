// src/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('oauth_redirect_done'); // テスト用に毎回リセット
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
  
    const hasRedirected = sessionStorage.getItem('oauth_redirect_done');
  
    if (token && !hasRedirected) {
      localStorage.setItem('token', `Bearer ${token}`);
      sessionStorage.setItem('oauth_redirect_done', 'true'); // ← フラグを保存
      window.history.replaceState(null, '', '/users');
      navigate('/users');
    } else if (error && !hasRedirected) {
      setMessage(`Googleログインエラー: ${decodeURIComponent(error)}`);
      sessionStorage.setItem('oauth_redirect_done', 'true'); // エラーでも一度だけ
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:3000/api/sign_in', {
        user: { email, password },
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
  
      const { token } = response.data;
      if (!token) {
        setMessage('No token received in response!');
        return;
      }
  
      localStorage.setItem('token', `Bearer ${token}`);
      setMessage('Login successful!');
      console.log('Token saved:', token);
      navigate('/users');
    } catch (error) {
      setMessage(`Login failed: ${error.response?.data?.error || error.message}`);
      console.error('Login error:', error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found, already logged out!');
      setIsSubmitting(false);
      return;
    }
    try {
      await axios.delete('http://localhost:3000/api/sign_out', {
        headers: { Authorization: token },
        withCredentials: true,
      });
      localStorage.removeItem('token');
      setEmail('');
      setPassword('');
      setMessage('Logout successful!');
      navigate('/');
    } catch (error) {
      setMessage(`Logout failed: ${error.response?.data?.error || error.message}`);
      console.error('Logout error:', error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const testAuth = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found!');
      setIsSubmitting(false);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log('Starting Google OAuth flow');
    window.location.href = 'http://localhost:3000/api/auth/google_oauth2'; // リダイレクト方式
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
          <button type="submit" className="login-button" disabled={isSubmitting}>Log In</button>
          <button type="button" onClick={() => navigate('/signup')} className="create-account-button" disabled={isSubmitting}>
            Create New Account
          </button>
          <button onClick={handleGoogleLogin} disabled={isSubmitting}>Login with Google</button>
        </form>
        <div className="button-group">
          <button onClick={testAuth} className="secondary-button" disabled={isSubmitting}>Test Protected Endpoint</button>
          <button onClick={handleLogout} className="secondary-button" disabled={isSubmitting}>Logout</button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;