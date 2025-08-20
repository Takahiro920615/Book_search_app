// src/Users.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';
import './Users.css';

interface UserData {
  id: number;
  email: string;
  last_login?: string;
}

function Users() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Users.tsx: Current pathname:', location.pathname); // デバッグ用
    console.log('Users.tsx: Query params:', window.location.search); // デバッグ用

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found, please log in.');
        console.error('No token in localStorage');
        navigate('/', { replace: true });
        return;
      }

      try {
        console.log('Sending token:', token);
        const response = await axios.get('http://localhost:3000/api/user', {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        console.log('User data:', response.data);
        setUserData(response.data);
        setMessage('User data loaded successfully!');
      } catch (error: any) {
        console.error('User data error:', error.response || error);
        setMessage(`Failed to load user data: ${error.response?.data?.error || error.message}`);
        if (error.response?.status === 302) {
          console.error('Redirect detected:', error.response.headers.location);
          setMessage(`Redirected to: ${error.response.headers.location}`);
        }
      }
    };

    fetchUserData();
  }, [navigate, location.pathname, location.search]); // location.search を追加

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('トークンがありません。ログインしてください。');
      navigate('/', { replace: true });
      return;
    }
  
    try {
      await axios.delete('http://localhost:3000/api/sign_out', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true, // CSRF トークンが必要な場合
      });
      localStorage.removeItem('token');
      setMessage('ログアウトしました！');
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('ログアウトエラー:', error.response || error);
      setMessage(`ログアウトに失敗しました: ${error.response?.data?.error || error.message}`);
      // 401 や 422 の場合、トークンを削除してリダイレクト
      if (error.response?.status === 401 || error.response?.status === 422) {
        localStorage.removeItem('token');
        setMessage('トークンが無効です。ログイン画面に戻ります。');
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="users-container">
      <div className="users-box">
        <h2 className="users-title">User Dashboard</h2>
        {userData ? (
          <div className="user-info">
            <p className="welcome-text">Welcome, {userData.email || 'User'}!</p>
            <p className="text-gray-600">User ID: {userData.id}</p>
            <p className="text-gray-600">Last Login: {userData.last_login || 'N/A'}</p>
          </div>
        ) : (
          <p className="loading-text">Loading user data...</p>
        )}
        <div className="button-group">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Users;