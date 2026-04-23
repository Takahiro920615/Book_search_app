import { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, NewBook } from '../types';

export const useBookSearch = (favoriteIds: Set<string>) => {
  const [query, setQuery] = useState<string>('');
  const [books, setBooks] = useState<Book[]>([]);
  const [newBooks, setNewBooks] = useState<NewBook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 新作本の取得
  useEffect(() => {
    const fetchNewBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) throw new Error('Google API Keyが設定されていません');

        const requests = [0, 40, 80].map(startIndex =>
          axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
              q: '日本',
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

        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setNewBooks(shuffled.slice(0, 50));
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error?.message || err.message || '新作本の取得に失敗しました';
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
      prev.map(book => ({ ...book, isFavorite: favoriteIds.has(book.id) }))
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
      if (!apiKey) throw new Error('Google API Keyが設定されていません');

      const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
        params: { q: query, langRestrict: 'ja', key: apiKey },
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

  return { query, setQuery, books, setBooks, newBooks, setNewBooks, loading, error, setError, searchBooks };
};