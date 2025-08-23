// src/Users.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    console.log('Users.tsx: Current pathname:', location.pathname);
    console.log('Users.tsx: Query params:', window.location.search);

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('トークンがありません。ログインしてください。');
        console.error('No token in localStorage');
        navigate('/?message=ログインが必要です', { replace: true });
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
          withCredentials: true, // クッキーを送信
        });

        console.log('User data:', response.data);
        setUserData(response.data);
        setMessage('ユーザー情報を取得しました！');
      } catch (error: any) {
        console.error('User data error:', error.response || error);
        setMessage(`ユーザー情報の取得に失敗しました: ${error.response?.data?.error || error.message}`);
        if ([401, 422].includes(error.response?.status)) {
          localStorage.removeItem('token');
          navigate('/?message=トークンが無効です。再度ログインしてください。', { replace: true });
        }
      }
    };

    fetchUserData();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('トークンがありません。ログインしてください。');
      navigate('/?message=ログインが必要です', { replace: true });
      return;
    }

    try {
      await axios.delete('http://localhost:3000/api/sign_out', {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      localStorage.removeItem('token');
      setMessage('ログアウトしました！');
      navigate('/?message=ログアウトしました', { replace: true });
    } catch (error: any) {
      console.error('ログアウトエラー:', error.response || error);
      setMessage(`ログアウトに失敗しました: ${error.response?.data?.error || error.message}`);
      if ([401, 422, 500].includes(error.response?.status)) {
        localStorage.removeItem('token');
        navigate('/?message=トークンが無効です。ログイン画面に戻ります。', { replace: true });
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