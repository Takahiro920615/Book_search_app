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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      setMessage('Passwords do not match!');
      return;
    }

    try {
      const response = await axios.post(
        '/api/sign_up', // Viteプロキシでhttp://localhost:3000/api/sign_upに転送
        {
          user: {
            email,
            password,
            password_confirmation: passwordConfirmation,
          },
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Response:', response.data); // デバッグ用
      const token = response.data.token || response.headers['authorization']?.replace('Bearer ', '');
      if (token) {
        localStorage.setItem('token', token); // トークンを保存
        setMessage(response.data.message);
        navigate('/users');
      } else {
        setMessage('Registration successful but no token received!');
      }
    } catch (error) {
      console.error('Registration error:', error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      setMessage(`Registration failed: ${errorMessage}`);
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
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="signup-input"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Confirm Password"
              className="signup-input"
              required
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default SignUp;