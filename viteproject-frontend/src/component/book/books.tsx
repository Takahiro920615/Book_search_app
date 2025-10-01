// viteproject-frontend/src/component/book/books.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleAuth from '../auth/GoogleAuth';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: { thumbnail: string };
  };
  isFavorite: boolean;
}

const Books: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]); // お気に入り本
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // ユーザー認証
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

  // お気に入りID取得
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (!token || !userId) return;
      try {
        const response = await axios.get('http://localhost:3000/api/v1/favorites', {
          headers: { Authorization: token, 'Content-Type': 'application/json' },
        });
        setFavoriteIds(new Set(response.data.book_ids));
      } catch (err: any) {
        console.error('お気に入り取得エラー:', err);
        setError(err.response?.data?.error || 'お気に入りの取得に失敗しました');
      }
    };
    fetchFavorites();
  }, [userId]);

  // お気に入り本の詳細取得
  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      if (!favoriteIds.size) {
        setFavoriteBooks([]);
        return;
      }
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Keyが設定されていません');
        
        const promises = Array.from(favoriteIds).map(bookId =>
          axios.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`, {
            params: { key: apiKey },
          })
        );
        const responses = await Promise.all(promises);
        const books = responses.map(res => ({
          ...res.data,
          isFavorite: true,
        }));
        setFavoriteBooks(books);
      } catch (err: any) {
        console.error('お気に入り詳細取得エラー:', err);
        setError(err.message || 'お気に入り詳細の取得に失敗しました');
      }
    };
    fetchFavoriteDetails();
  }, [favoriteIds]);

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
        params: { q: query, key: apiKey },
      });
      const items = (response.data.items || []).map((item: any) => ({
        ...item,
        isFavorite: favoriteIds.has(item.id),
      }));
      setBooks(items);
    } catch (error: any) {
      console.error('検索エラー:', error);
      setError(error.message || '本の検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // お気に入りトグル
  const toggleFavorite = async (bookId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('ログインが必要です');
      navigate('/?message=ログインが必要です', { replace: true });
      return;
    }

    const isFav = favoriteIds.has(bookId);
    const url = isFav
      ? `http://localhost:3000/api/v1/favorites/${bookId}`
      : 'http://localhost:3000/api/v1/favorites';
    const method = isFav ? 'delete' : 'post';
    const data = isFav ? {} : { book_id: bookId };

    try {
      setError(null);
      await axios({
        method,
        url,
        headers: { Authorization: token, 'Content-Type': 'application/json' },
        data,
      });

      // 楽観的更新
      const newIds = new Set(favoriteIds);
      if (isFav) {
        newIds.delete(bookId);
      } else {
        newIds.add(bookId);
      }
      setFavoriteIds(newIds);
      setBooks(books.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
    } catch (err: any) {
      console.error('お気に入り更新エラー:', err);
      setError(err.response?.data?.error || 'お気に入りの更新に失敗しました');
    }
  };

  // Google認証コールバック
  const handleAuthSuccess = (user: any) => {
    setUser(user);
    console.log('ログインしたユーザー:', user);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>本一覧ページ (ユーザーID: {userId})</h1>

      {!user ? (
        <GoogleAuth onSuccess={handleAuthSuccess} />
      ) : (
        <p>Googleログイン済み: {user.name || 'ユーザー名不明'}</p>
      )}

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

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* お気に入り本セクション */}
      <div style={{ marginTop: '20px' }}>
        <h2>お気に入り本</h2>
        {favoriteBooks.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {favoriteBooks.map((book) => (
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
                <button
                  onClick={() => toggleFavorite(book.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                  {book.isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>お気に入り本がありません。</p>
        )}
      </div>

      {/* 検索結果セクション */}
      <div style={{ marginTop: '20px' }}>
        <h2>検索結果</h2>
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
                <button
                  onClick={() => toggleFavorite(book.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                >
                  {book.isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                </button>
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
