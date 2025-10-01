// viteproject-frontend/src/component/book/books.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleAuth from '../auth/GoogleAuth';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail: string };
  };
}

const Books: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>(''); // 検索クエリ
  const [books, setBooks] = useState<Book[]>([]); // 検索結果
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const [user, setUser] = useState<any>(null); // 認証済みユーザー

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('ログインが必要です');
        navigate('/?message=ログインが必要です', { replace: true });
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/api/user', {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true,
        });

        if (response.data.id !== parseInt(userId || '0', 10)) {
          setError('不正なユーザーIDです');
          navigate('/?message=不正なアクセスです', { replace: true });
        }
      } catch (error: any) {
        console.error('ユーザー検証エラー:', error);
        setError('ユーザー認証に失敗しました');
        localStorage.removeItem('token');
        navigate('/?message=トークンが無効です。再度ログインしてください', { replace: true });
      }
    };

    verifyUser();
  }, [userId, navigate]);

  // 本の検索
  const searchBooks = async () => {
    if (!query.trim()) {
      setError('検索クエリを入力してください');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error('Google API Keyが設定されていません');
      }
      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: {
          q: query,
          key: apiKey,
        },
      });
      setBooks(response.data.items || []);
    } catch (error: any) {
      console.error('検索エラー:', error);
      setError(error.message || '本の検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 認証成功時のコールバック
  const handleAuthSuccess = (user: any) => {
    setUser(user);
    console.log('ログインしたユーザー:', user);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>本一覧ページ</h1>

      {/* 認証コンポーネント */}
      {!user ? (
        <GoogleAuth onSuccess={handleAuthSuccess} />
      ) : (
        <p>ログイン済み: {user.name || 'ユーザー名不明'}</p>
      )}

      {/* 検索フォーム */}
      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="本のタイトルや著者を入力"
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        />
        <button
          onClick={searchBooks}
          disabled={loading}
          style={{ padding: '8px 16px' }}
        >
          {loading ? '検索中...' : '検索'}
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 検索結果 */}
      <div style={{ marginTop: '20px' }}>
        {books.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {books.map((book) => (
              <li
                key={book.id}
                style={{
                  marginBottom: '20px',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '10px',
                }}
              >
                <h3>{book.volumeInfo.title}</h3>
                <p>著者: {book.volumeInfo.authors?.join(', ') || '不明'}</p>
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                    style={{ maxWidth: '100px' }}
                  />
                )}
                <p>
                  {book.volumeInfo.description?.slice(0, 200) || '説明なし'}
                  {book.volumeInfo.description && book.volumeInfo.description.length > 200
                    ? '...'
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>本が見つかりませんでした。検索してください。</p>
        )}
      </div>
    </div>
  );
};

export default Books;