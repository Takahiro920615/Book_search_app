import { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, NewBook } from '../types';
import { BASE_URL } from '@/lib/api';

export const useFavorites = (userId: string | undefined) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  const [error, setError] = useState<string | null>(null);

  // お気に入りID取得
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/favorites`, {
          withCredentials: true,
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

  // お気に入りトグル
  const toggleFavorite = async (
    bookId: string,
    books: Book[],
    setBooks: React.Dispatch<React.SetStateAction<Book[]>>,
    newBooks: NewBook[],
    setNewBooks: React.Dispatch<React.SetStateAction<NewBook[]>>,
  ) => {
    const isFav = favoriteIds.has(bookId);
    const url = isFav
      ? `${BASE_URL}/api/v1/favorites/${bookId}`
      : `${BASE_URL}/api/v1/favorites`;
    const method = isFav ? 'delete' : 'post';
    const data = isFav ? {} : { book_id: bookId };

    try {
      setError(null);
      await axios({ method, url, withCredentials: true, data });

      const newIds = new Set(favoriteIds);
      if (isFav) {
        newIds.delete(bookId);
      } else {
        newIds.add(bookId);
      }
      setFavoriteIds(newIds);
      setBooks(books.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
      setNewBooks(newBooks.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
      setFavoriteBooks(prev => prev.map(b => (b.id === bookId ? { ...b, isFavorite: !isFav } : b)));
    } catch (err: any) {
      console.error('お気に入り更新エラー:', err);
      setError(err.response?.data?.error || 'お気に入りの更新に失敗しました');
    }
  };

  return { favoriteIds, setFavoriteIds, favoriteBooks, setFavoriteBooks, toggleFavorite, error, setError };
};