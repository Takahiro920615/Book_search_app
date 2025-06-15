// src/Users.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found, please log in.');
        navigate('/');
        return;
      }
      try {
        const response = await axios.get('/api/user', { // Vite プロキシを使用
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'Accept': 'application/json', // JSON レスポンスを明示
          },
        });
        setUserData(response.data);
        setMessage('User data loaded successfully!');
      } catch (error) {
        setMessage(`Failed to load user data: ${error.response?.data?.error || error.message}`);
        console.error('User data error:', error.response || error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found, already logged out!');
      navigate('/');
      return;
    }
    try {
      await axios.delete('/api/sign_out', {
        headers: { Authorization: token },
      });
      localStorage.removeItem('token');
      setMessage('Logout successful!');
      navigate('/');
    } catch (error) {
      setMessage(`Logout failed: ${error.response?.data?.error || error.message}`);
      console.error('Logout error:', error.response || error);
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