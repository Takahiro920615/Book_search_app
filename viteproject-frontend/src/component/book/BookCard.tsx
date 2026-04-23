import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Book, NewBook } from './types';

interface Props {
  book: Book | NewBook;
  onCardClick: (book: Book | NewBook) => void;
  onToggleFavorite: (bookId: string) => void;
}

const BookCard: React.FC<Props> = ({ book, onCardClick, onToggleFavorite }) => {
  return (
    <div
      className="luxury-card"
      onClick={() => onCardClick(book)}
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
            onToggleFavorite(book.id);
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
  );
};

export default BookCard;