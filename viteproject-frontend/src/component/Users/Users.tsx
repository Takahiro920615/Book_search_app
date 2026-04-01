// src/Users.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Users.css';
import Icon from '../Users/icon';
import { BASE_URL } from '@/lib/api';


interface UserData {
  id: number;
  email: string;
  name?: string;
  last_login?: string;
}

const FallingBooksBackground = () => {

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

function Users() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('/no_image.jpg');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log('Users.tsx: Current pathname:', location.pathname);
    console.log('Users.tsx: Query params:', window.location.search);
    // クエリパラメータからトークン取得（OmniAuth/Googleログイン用）
    const urlParams = new URLSearchParams(location.search);
    const tokenFromQuery = urlParams.get('auth_token');
    if (tokenFromQuery) {
      const bearerToken = `Bearer ${tokenFromQuery}`;
      localStorage.setItem('token', bearerToken);
      console.log('Token saved from query param:', bearerToken);
      // クエリパラメータをクリア（URLをきれいに）
      navigate(location.pathname, { replace: true });
  }

  // トークンがなければログイン画面へ
  if (!localStorage.getItem('token')) {
    navigate('/?message=ログインが必要です', { replace: true });
    return;
  }

  const fetchUserData = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const response = await axios.get(`${BASE_URL}/api/user`, {
        headers: {
          Authorization: currentToken,
        }
      });
      console.log('User data fetched:', response.data);
      setUserData(response.data.user ?? response.data);
      setMessage('ユーザー情報を取得しました！');
      // ★重要: ここでトークンを再確認・保存（万が一レスポンスに新しいトークンが返ってきた場合）
      // 通常は不要ですが、安全のため
      if (response.headers.authorization) {
        localStorage.setItem('token', response.headers.authorization);
      }
    } catch (error: any) {
      console.error('Fetch user error:', error.response?.data || error);
      const errMsg = error.response?.data?.error || error.message;

      if (error.response?.status === 401) {
        setMessage('認証エラーです。再ログインしてください。');
        localStorage.removeItem('token');
        navigate('/?message=認証エラーが発生しました。再ログインしてください。', { replace: true });
      } else {
        setMessage(`ユーザー情報の取得に失敗しました: ${errMsg}`);
      }
    }
  };

  fetchUserData();
}, [location.search, navigate]);  // location.search を依存に追加

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
      navigate('/', { replace: true });
      return;
    }

    try {
      await axios({
        method: 'delete',
        url: `${BASE_URL}/api/sign_out`,
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true,
      });
      localStorage.removeItem('token');
      setMessage('ログアウトしました！');
      navigate('/?message=success:ログアウトしました', { replace: true });
    } catch (error: any) {
      console.error('ログアウトエラー:', error);
      localStorage.removeItem('token');  // エラーでもトークン削除（安全）
      setMessage('ログアウトに失敗しましたが、トークンをクリアしました。再ログインしてください。');
      navigate('/?message=error:ログアウトに失敗しましたが、再ログインしてください', { replace: true });
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