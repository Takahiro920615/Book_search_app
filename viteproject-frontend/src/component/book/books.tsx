import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleAuth from '../auth/GoogleAuth';
import './books.css';
import ModalBook from './modal_book';
import BookCard from './BookCard';
import BookSearch from './BookSearch';
import { useFavorites } from './hooks/useFavorites';
import { useBookSearch } from './hooks/useBookSearch';
import { Book, NewBook } from './types';
import { BASE_URL } from '@/lib/api';

const Books: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'new' | 'search' | 'favorites'>('new');
  const [selectedBook, setSelectedBook] = useState<Book | NewBook | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    favoriteIds,
    setFavoriteIds,
    favoriteBooks,
    setFavoriteBooks,
    toggleFavorite,
    error: favoriteError,
    setError: setFavoriteError,
  } = useFavorites(userId);

  const {
    query,
    setQuery,
    books,
    setBooks,
    newBooks,
    setNewBooks,
    loading,
    error: searchError,
    setError: setSearchError,
    searchBooks,
  } = useBookSearch(favoriteIds);

  const error = favoriteError || searchError;

  // ユーザー認証
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });
        if (response.data.id !== parseInt(userId || '0', 10)) {
          navigate('/?message=不正なアクセスです', { replace: true });
        } else {
          if (response.data.email) setUserEmail(response.data.email);
        }
      } catch {
        navigate('/?message=トークンが無効です。再度ログインしてください', { replace: true });
      }
    };
    verifyUser();
  }, [userId, navigate]);

  // ユーザー画像取得
  useEffect(() => {
    if (!userEmail) return;
    const saved = localStorage.getItem(`userImage:${userEmail}`);
    setUserImageUrl(saved || '/no_image.png');
  }, [userEmail]);

  const handleToggleFavorite = (bookId: string) => {
    toggleFavorite(bookId, books, setBooks, newBooks, setNewBooks);
  };

  const handleSearch = async () => {
    await searchBooks();
    setActiveSection('search');
  };

  const displayBooks = activeSection === 'new' ? newBooks : activeSection === 'favorites' ? favoriteBooks : books;

  return (
    <div className="luxury-books-container min-h-screen">
      <h1 className="text-5xl pt-16 md:text-6xl font-bold text-center mb-2 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-400">
          至高の蔵書
        </span>
      </h1>

      {userImageUrl && (
        <div className="flex justify-center mb-4">
          <img src={userImageUrl} alt="User" className="books-user-icon" />
        </div>
      )}

      <p className="text-center text-amber-100/70 text-lg mb-8 italic">
        あなたの選ぶ、極上の1冊
      </p>

      <div className="flex justify-center mb-6">
        <button onClick={() => navigate('/users')} className="luxury-btn shadow-lg">
          ホーム画面へ戻る
        </button>
      </div>

      {/* タブ */}
      <div className="flex justify-center gap-2 pt-8 mb-6 flex-wrap">
        {(['new', 'search', 'favorites'] as const).map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-8 py-4 rounded-full text-lg font-medium transition-all ${
              activeSection === section ? 'luxury-tab-active shadow-2xl' : 'bg-slate-800/50 hover:bg-slate-700/70'
            }`}
          >
            {section === 'new' ? '新刊' : section === 'search' ? '検索' : 'お気に入り'}
          </button>
        ))}
      </div>

      {activeSection === 'search' && (
        <BookSearch
          query={query}
          loading={loading}
          onQueryChange={setQuery}
          onSearch={handleSearch}
        />
      )}

      {error && (
        <p className="text-center text-red-400 font-medium bg-red-900/30 py-4 rounded-xl backdrop-blur">
          {error}
        </p>
      )}

      <div className="grid grid-cols-5 gap-8 w-full px-8">
        {displayBooks.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onCardClick={(b) => { setSelectedBook(b); setIsModalOpen(true); }}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {/* 空状態 */}
      {displayBooks.length === 0 && !loading && (
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
          <GoogleAuth onSuccess={(u) => setUser(u)} />
        </div>
      ) : (
        <p className="text-center text-amber-100 mb-8">
          ようこそ、<span className="font-semibold text-amber-300">{user.name}</span> さん
        </p>
      )}

      {isModalOpen && selectedBook && (
        <ModalBook book={selectedBook} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default Books;