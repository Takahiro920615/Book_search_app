// src/Sign_up.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sign_up.css';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/sign_up', {
        user: {
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      const token = response.headers.authorization;
      if (!token) {
        setMessage('No token received in response!');
        return;
      }
      localStorage.setItem('token', token);
      setMessage('Sign up successful!');
      console.log('Token saved:', token);
      navigate('/users');
    } catch (error) {
      setMessage(`Sign up failed: ${error.response?.data?.error || error.message}`);
      console.error('Sign up error:', error.response || error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2 className="signup-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="signup-input"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="signup-input"
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm Password"
              className="signup-input"
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
          <button type="button" onClick={() => navigate('/login')} className="login-button">
            Back to Login
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default SignUp;