import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleAuth from '../auth/GoogleAuth';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './books.css';

// 検索/お気に入り用インターフェース
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

// 新作本用インターフェース
interface NewBook {
  id: string;
  volumeInfo: {
    title: string;           // ← 追加
    authors?: string[];
    imageLinks?: { thumbnail: string };
    language?: string;
  };
  isFavorite: boolean;
}

const Books: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<NewBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<'new' | 'search' | 'favorites'>('new');
  const [showFullDescription, setShowFullDescription] = useState<Record<string, boolean>>({});
  const [randomBooks, setRandomBooks] = useState<NewBook[]>([])

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

 // 新作本の取得（修正版）
 // 新作本の取得（修正版：日本語本50冊ランダム表示）
useEffect(() => {
  const fetchNewBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) throw new Error('Google API Keyが設定されていません');

      // 複数ページから最大100件取得
      const requests = [0, 40, 80].map(startIndex =>
        axios.get('https://www.googleapis.com/books/v1/volumes', {
          params: {
            q: '日本', // ← '*' から変更
            langRestrict: 'ja',
            orderBy: 'newest',
            maxResults: 40,
            startIndex,
            fields: 'items(id,volumeInfo(title,authors,imageLinks,language))',
            key: apiKey,
          },
        })
      );

      const responses = await Promise.all(requests);

      // 言語判定をゆるくして日本語中心の本を抽出
      const items = responses
        .flatMap(res => res.data.items || [])
        .filter(item =>
          !item.volumeInfo.language ||
          item.volumeInfo.language.toLowerCase().includes('ja')
        )
        .map((item: any) => ({
          id: item.id,
          volumeInfo: {
            title: item.volumeInfo.title || 'タイトル不明',
            authors: item.volumeInfo.authors || [],
            imageLinks: item.volumeInfo.imageLinks || { thumbnail: '' },
          },
          isFavorite: favoriteIds.has(item.id),
        }));

      // --- ランダムに50冊選択 ---
      const shuffled = items.sort(() => 0.5 - Math.random());
      const randomBooks = shuffled.slice(0, 50);

      setNewBooks(randomBooks);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        '新作本の取得に失敗しました';
      setError(`新作本の取得に失敗しました: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  fetchNewBooks();
}, []);


  // 新作本のお気に入り状態更新
  useEffect(() => {
    setNewBooks(prev =>
      prev.map(book => ({
        ...book,
        isFavorite: favoriteIds.has(book.id),
      }))
    );
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
        params: { q: query, langRestrict: 'ja', key: apiKey },
      });
      const items = (response.data.items || []).map((item: any) => ({
        ...item,
        isFavorite: favoriteIds.has(item.id),
      }));
      setBooks(items);
      setActiveSection('search');
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

      const newIds = new Set(favoriteIds);
      if (isFav) {
        newIds.delete(bookId);
      } else {
        newIds.add(bookId);
      }
      setFavoriteIds(newIds);
      setBooks(books.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
      setNewBooks(newBooks.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
      setFavoriteBooks(favoriteBooks.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
    } catch (err: any) {
      console.error('お気に入り更新エラー:', err);
      setError(err.response?.data?.error || 'お気に入りの更新に失敗しました');
    }
  };

  // 説明文トグル
  const toggleDescription = (bookId: string) => {
    setShowFullDescription(prev => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // Google認証コールバック
  const handleAuthSuccess = (user: any) => {
    setUser(user);
    console.log('ログインしたユーザー:', user);
  };

  return (
    <div className="luxury-books-container min-h-screen">
        <h1 className="text-5xl pt-16 md:text-6xl font-bold text-center mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-400">
            至高の蔵書
          </span>
        </h1>
        <p className="text-center text-amber-100/70 text-lg mb-12 italic">
          あなたの選ぶ、極上の1冊
        </p>

        {/* タブ */}
        <div className="flex justify-center gap-2 pt-8  mb-6 flex-wrap">
          <button
            onClick={() => setActiveSection('new')}
            className={`px-8 py-4 rounded-full text-lg font-medium transition-all ${activeSection === 'new' ? 'luxury-tab-active shadow-2xl' : 'bg-slate-800/50 hover:bg-slate-700/70'}`}
          >
            新刊
          </button>
          <button
            onClick={() => setActiveSection('search')}
            className={`px-8 py-4 rounded-full text-lg font-medium transition-all ${activeSection === 'search' ? 'luxury-tab-active shadow-2xl' : 'bg-slate-800/50 hover:bg-slate-700/70'}`}
          >
            検索
          </button>
          <button
            onClick={() => setActiveSection('favorites')}
            className={`px-8 py-4 rounded-full text-lg font-medium transition-all ${activeSection === 'favorites' ? 'luxury-tab-active shadow-2xl' : 'bg-slate-800/50 hover:bg-slate-700/70'}`}
          >
            お気に入り
          </button>
        </div>

        {/* 検索エリア */}
        {activeSection === 'search' && (
          <div className="flex justify-center mb-12">
            <div className="flex gap-4 max-w-2xl w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchBooks()}
                placeholder="珠玉の1冊を求めて..."
                className="luxury-input flex-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                onClick={searchBooks}
                disabled={loading}
                className="luxury-btn shadow-lg"
              >
                {loading ? '探しています...' : '探す'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-center text-red-400 font-medium bg-red-900/30 py-4 rounded-xl backdrop-blur">
            {error}
          </p>
        )}

        {/* 新刊 / お気に入り / 検索結果 */}
       <div className="grid grid-cols-5 gap-8 w-full px-8">
          {(activeSection === 'new' ? newBooks : activeSection === 'favorites' ? favoriteBooks : books).map((book) => (
        <div
          key={book.id}
          className="luxury-card" 
        >
          <div>
            <div>
              {book.volumeInfo.imageLinks?.thumbnail ? (
                <img
                  src={book.volumeInfo.imageLinks.thumbnail}
                  alt={book.volumeInfo.title}
                  className="w-40 h-56 object-cover rounded-lg shadow-2xl"
                />
              ) : (
                <div className="w-40 h-56 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-amber-200/50 rounded-lg">
                  No Image
                </div>
              )}
            </div>

            <div className="text-center flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-amber-100 line-clamp-2 mb-2">
                {book.volumeInfo.title}
              </h3>
              <p className="text-sm text-amber-200/70">
                {book.volumeInfo.authors?.join(', ') || '著者不明'}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(book.id);
              }}
              className="mt-6 luxury-heart"
            >
              {book.isFavorite ? (
                <FaHeart size={28} className="text-amber-500 drop-shadow-lg" />
              ) : (
                <FaRegHeart size={28} className="text-amber-300/60 hover:text-amber-300 transition-all" />
              )}
            </button>
          </div>
        </div>
  ))}
       </div>

        {/* 空状態 */}
        {((activeSection === 'new' && newBooks.length === 0) ||
          (activeSection === 'favorites' && favoriteBooks.length === 0) ||
          (activeSection === 'search' && books.length === 0 && !loading)) && (
          <div className="text-center py-24">
            <p className="text-3xl text-amber-200/50 italic">
              {activeSection === 'new' && '新刊がまだ到着していません...'}
              {activeSection === 'favorites' && 'まだお気に入りがありません'}
              {activeSection === 'search' && '該当する本が見つかりませんでした'}
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-24">
            <p className="text-2xl text-amber-300 animate-pulse">古書店を探しています...</p>
          </div>
        )}

        {!user ? (
          <div className="flex justify-center pt-20">
            <GoogleAuth onSuccess={handleAuthSuccess} />
          </div>
        ) : (
          <p className="text-center text-amber-100 mb-8">
            ようこそ、<span className="font-semibold text-amber-300">{user.name}</span> さん
          </p>
        )}
    </div>
          
  );
};

export default Books;