// src/Users.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Users.css';
import Icon from '../Users/icon';


interface UserData {
  id: number;
  email: string;
  name?: string;
  last_login?: string;
}

function Users() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('/no_image.jpg');
  const navigate = useNavigate();
  const location = useLocation();
  const LOCAL_BOOK_IMAGES = [
    '/image1.jpg',
    '/image2.jpg',
    '/image3.jpg',
    '/image4.jpg',
    '/image5.jpg',
    '/image6.jpg',
    '/image7.jpg',
    '/image8.jpg',
    '/image9.jpg',
    '/image10.jpg',
  ];

  const FallingBooksBackground = () => {
    return (
      <div className="falling-books-wrapper">
        {[...Array(20)].map((_, i) => {
         const imageSrc = LOCAL_BOOK_IMAGES[Math.floor(Math.random() * LOCAL_BOOK_IMAGES.length)];
         const baseSize = 90;
         const size = baseSize + Math.random() * 130; // 90〜220pxでさらにダイナミック
         const left = Math.random() * 100;
         const duration = Math.random() * 25 + 20;   // 20〜45秒でゆ〜っくり
         const delay = Math.random() * 15;
         // 回転方向をランダムに（時計回り or 反時計回り）
         const rotationDirection = Math.random() > 0.5 ? 1 : -1;
          return (
            <img
              key={i}
              src={imageSrc}
              alt="falling book"
              className="falling-book-local"
              style={{
                width: `${size}px`,
                height: 'auto',
                left: `${left}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>
    );
  };

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

  // Load persisted image after user data is available
  useEffect(() => {
    if (!userData?.email) return;
    try {
      const key = `userImage:${userData.email}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setImageUrl(saved);
      } else {
        setImageUrl('/no_image.jpg');
      }
    } catch (e) {
      console.error('Failed to load image from localStorage', e);
    }
  }, [userData?.email]);

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

  
  const goToBooks = () => {
    if (userData?.id) {
      navigate(`/users/${userData.id}/books`);
    }else{
      setMessage('ユーザー情報を取得できませんでした');
    }
  };


  return (
    <>
      {/* ★背景に降る本（ページ全体に固定）★ */}
      <FallingBooksBackground />
    <div className="users-container">
      <div className="users-box">
        <h2 className="users-title">User Dashboard</h2>
        {userData ? (
          <div className="user-info">
            <p className="welcome-text">
              Welcome, {userData.name || userData.email || 'User'}!
            </p>
            <img src={imageUrl} alt="User" className="user-image" />
            <div className="flex justify-center">
              <Icon
                buttonLabel="画像を選択"
                onSelect={(_, file) => {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const dataUrl =
                      typeof reader.result === "string" ? reader.result : "";
                    if (!dataUrl) return;
                    setImageUrl(dataUrl);

                    try {
                      if (userData?.email) {
                        const key = `userImage:${userData.email}`;
                        localStorage.setItem(key, dataUrl);
                      }
                    } catch (e) {
                      console.error("Failed to save image to localStorage", e);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          </div>
        ) : (
          <p className="loading-text">Loading user data...</p>
        )}
        <div className="button-group">
         <button onClick={goToBooks} className="book-index">本一覧ページ</button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
    </>
  );
}

export default Users;