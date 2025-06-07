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
      const response = await axios.post('/api/sign_up', {
        user: {
          email,
          password,
          password_confirmation: passwordConfirmation
        }
      });

      const token = response.headers.authorization;
      if (token) {
        localStorage.setItem('token', token);
        setMessage('Registration successful! You can now log in.');
      } else {
        setMessage('Registration successful but no token received!');
      }
    } catch (error) {
      setMessage(`Registration failed: ${error.response?.data?.error || error.message}`);
      console.error('Registration error:', error.response || error);
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