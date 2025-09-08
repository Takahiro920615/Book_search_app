// src/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Login.jsx: Current pathname:', location.pathname);
    console.log('Login.jsx: Query params:', window.location.search);

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    const hasRedirected = sessionStorage.getItem('oauth_redirect_done');

    console.log('Login.jsx: hasRedirected:', hasRedirected);
    console.log('Login.jsx: Message from query:', message);

    // クエリパラメータのメッセージをセット
    if (message) {
      setMessage(decodeURIComponent(message));
      window.history.replaceState(null, '', '/');
    } else if (error) {
      setMessage(`Googleログインエラー: ${decodeURIComponent(error)}`);
      window.history.replaceState(null, '', '/');
    }

    // クッキー優先でトークンを取得
    const tokenFromCookie = Cookies.get('auth_token');
    const tokenFromStorage = localStorage.getItem('token');
    console.log('Login.jsx: Token from cookie:', tokenFromCookie);
    console.log('Login.jsx: Token from localStorage:', tokenFromStorage);

    // トークンがあればデコードして jti を確認（デバッグ用）
    if (tokenFromCookie || tokenFromStorage) {
      const token = tokenFromCookie ? `Bearer ${tokenFromCookie}` : tokenFromStorage;
      try {
        // 簡易デコード（Base64デコードでペイロードを確認）
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Login.jsx: Decoded token payload:', payload);
      } catch (e) {
        console.error('Login.jsx: Failed to decode token:', e);
      }
    }

    // クッキーにトークンがあれば優先的に保存し、リダイレクト
    if (tokenFromCookie && !hasRedirected) {
      const token = `Bearer ${tokenFromCookie}`;
      localStorage.setItem('token', token);
      console.log('Login.jsx: Saved token:', token);
      sessionStorage.setItem('oauth_redirect_done', 'true');
      Cookies.remove('auth_token'); // クッキーをクリア
      window.history.replaceState(null, '', '/users');
      navigate('/users', { replace: true });
    } else if (!tokenFromCookie && tokenFromStorage && !hasRedirected && location.pathname === '/users') {
      // localStorage にトークンがある場合、/users に留まる
      console.log('Login.jsx: Using token from localStorage');
      sessionStorage.setItem('oauth_redirect_done', 'true');
    } else if (!tokenFromCookie && !tokenFromStorage && location.pathname === '/users') {
      // トークンがない場合、ログイン画面にリダイレクト
      setMessage('トークンがありません。ログインしてください。');
      console.error('Login.jsx: No token for /users');
      navigate('/', { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        'http://localhost:3000/api/sign_in',
        { user: { email, password } },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true,
        }
      );

      const { token } = response.data;
      if (!token) {
        setMessage('トークンが受信できませんでした！');
        return;
      }

      const bearerToken = `Bearer ${token}`;
      localStorage.setItem('token', bearerToken);
      console.log('Login.jsx: Saved token:', bearerToken);
      setMessage('ログインしました！');
      navigate('/users', { replace: true });
    } catch (error) {
      setMessage(`ログインに失敗しました: ${error.response?.data?.error || error.message}`);
      console.error('Login error:', error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const token = Cookies.get('auth_token') ? `Bearer ${Cookies.get('auth_token')}` : localStorage.getItem('token');
    if (!token) {
      setMessage('トークンがありません。既にログアウトしています！');
      console.error('Login.jsx: No token for logout');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.delete('http://localhost:3000/api/sign_out', {
        headers: { Authorization: token },
        withCredentials: true,
      });

      // Google ログアウト URL を処理
      const { google_logout_url } = response.data;
      localStorage.removeItem('token');
      Cookies.remove('auth_token');
      sessionStorage.removeItem('oauth_redirect_done');
      setEmail('');
      setPassword('');
      setMessage('ログアウトしました！');
      if (google_logout_url) {
        console.log('Login.jsx: Redirecting to Google logout:', google_logout_url);
        window.location.href = google_logout_url; // Googleセッションをクリア
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      setMessage(`ログアウトに失敗しました: ${error.response?.data?.error || error.message}`);
      console.error('Logout error:', error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    console.log('Starting Google OAuth flow');
    sessionStorage.removeItem('oauth_redirect_done'); // リダイレクトフラグをリセット
    window.location.href = 'http://localhost:3000/api/auth/google_oauth2';
  };

  const testAuth = async () => {
    const token = Cookies.get('auth_token') ? `Bearer ${Cookies.get('auth_token')}` : localStorage.getItem('token');
    if (!token) {
      setMessage('トークンがありません。ログインしてください。');
      return;
    }

    try {
      const response = await axios.get('http://localhost:3000/api/protected_endpoint', {
        headers: { Authorization: token },
        withCredentials: true,
      });
      setMessage(`保護されたエンドポイントのレスポンス: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setMessage(`テスト失敗: ${error.response?.data?.error || error.message}`);
      console.error('Test auth error:', error.response || error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="login-input"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="login-input"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-button" disabled={isSubmitting}>
            Log In
          </button>
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="create-account-button"
            disabled={isSubmitting}
          >
            Create New Account
          </button>
          <button onClick={handleGoogleLogin} disabled={isSubmitting}>
            Login with Google
          </button>
        </form>
        <div className="button-group">
          <button onClick={testAuth} className="secondary-button" disabled={isSubmitting}>
            Test Protected Endpoint
          </button>
          <button onClick={handleLogout} className="secondary-button" disabled={isSubmitting}>
            Logout
          </button>
        </div>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default Login;