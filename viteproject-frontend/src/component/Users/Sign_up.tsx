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
          passwordConfirmation,
        },
      });
      const token = response.data.token;
      if (token) {
        const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        localStorage.setItem('token', bearerToken);
        navigate('/users');// 登録後にユーザーページへ遷移
      } else {
        setMessage('Token not received');
      }
    } catch (error) {
      setMessage(`Registration failed: ${error.response?.data?.errors || error.message}`);
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