// src/Sign_up.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sign_up.css';
import { BASE_URL } from '@/lib/api';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post(`${BASE_URL}/api/sign_up`, {
        user: {
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });

      console.log('成功レスポンス:', response.data);
      console.log('Authorization header:', response.headers['authorization']);
  
      // 👇 ここが修正ポイント
      const authHeader = response.headers['authorization'];
  
      if (authHeader) {
        // すでに Bearer 付きなのでそのまま保存
        localStorage.setItem('token', authHeader);
        navigate('/users');
      } else {
        setMessage('Token not received');
      }
  
    } catch (error: any) {
      console.error('=== SignUp エラー詳細 ===');
      console.error('Status:', error.response?.status);
      console.error('全レスポンスデータ:', error.response?.data);
      console.error(
        'エラーメッセージ:',
        error.response?.data?.error ||
        error.response?.data?.errors ||
        error.message
      );
      console.error('Axios error:', error);
  
      let displayMessage = '登録に失敗しました';
  
      if (error.response?.status === 500) {
        displayMessage += '（サーバー内部エラー 500）';
      }
  
      const serverError = error.response?.data;
      if (serverError) {
        if (serverError.errors) {
          displayMessage += ': ' + Object.entries(serverError.errors)
            .map(([key, msgs]) =>
              `${key}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`
            )
            .join(' / ');
        } else if (serverError.error) {
          displayMessage += `: ${serverError.error}`;
        } else if (serverError.message) {
          displayMessage += `: ${serverError.message}`;
        } else if (typeof serverError === 'string') {
          displayMessage += `: ${serverError}`;
        }
      } else if (error.message) {
        displayMessage += `: ${error.message}`;
      }
  
      setMessage(displayMessage);
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