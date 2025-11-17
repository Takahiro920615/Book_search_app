import React from 'react';

interface VolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  publisher ?: string;
  imageLinks?: { thumbnail: string };
  language?: string;
}

interface BookBase {
  id: string;
  volumeInfo: VolumeInfo;
  isFavorite: boolean;
}

type Book = BookBase & { volumeInfo: { description?: string } };
type NewBook = BookBase;// ← あとで型共有するよ！今回は仮置き

type BookType = Book | NewBook;

interface ModalBookProps {
  book: BookType;
  onClose: () => void;
}

const ModalBook: React.FC<ModalBookProps> = ({ book, onClose }) => {
  // エスケープキーでも閉じられるように
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-amber-600/30 rounded-2xl p-8 max-w-5xl w-full mx-4 shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ×ボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-400 hover:text-amber-200 transition transform hover:scale-125 z-10"
          aria-label="閉じる"
        >
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid md:grid-cols-2 gap-10">
          {/* 左：サムネイル */}
          <div className="flex justify-center">
            {book.volumeInfo.imageLinks?.thumbnail ? (
              <img
                src={book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                alt={book.volumeInfo.title}
                className="w-96 h-[540px] object-cover rounded-xl shadow-2xl border-8 border-amber-600/30 hover:border-amber-500/50 transition-all"
              />
            ) : (
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 w-96 h-[540px] rounded-xl flex items-center justify-center text-amber-300/40 text-3xl font-bold border-8 border-dashed border-amber-800/50">
                No Image
              </div>
            )}
          </div>

          {/* 右：詳細情報 */}
          <div className="space-y-7 overflow-y-auto max-h-[80vh] pr-2">
            {/* Google Books 検索術 */}
            <div className="mt-10 bg-gradient-to-r from-amber-900/20 to-slate-900/80 border border-amber-700/50 rounded-2xl p-8">
              <div className="space-y-4 text-lg font-mono">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-amber-400 min-w-32">タイトル</span>
                  <code className="bg-black/60 px-4 py-2 rounded-lg text-amber-200 border border-amber-800/50">
                    {book.volumeInfo.title}
                  </code>
                </div>

                {book.volumeInfo.authors && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-amber-400 min-w-32">著者</span>
                    <code className="bg-black/60 px-4 py-2 rounded-lg text-amber-200 border border-amber-800/50">
                      {book.volumeInfo.authors[0]}
                    </code>
                  </div>
                )}

                {/* 出版社指定（Google Books APIから取れる場合のみ） */}
                {book.volumeInfo.publisher && (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-amber-400 min-w-32">出版社指定</span>
                    <code className="bg-black/60 px-4 py-2 rounded-lg text-amber-200 border border-amber-800/50 font-mono">
                      {book.volumeInfo.publisher}
                    </code>
                  </div>
                )}

                {book.volumeInfo.description ? (
                  <div className="col-span-full mt-8 bg-gradient-to-r from-amber-900/30 via-slate-800/80 to-amber-900/30 border-2 border-amber-700/50 rounded-2xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-amber-300 mb-6 flex items-center gap-3">
                      内容紹介
                    </h3>
                    <div className="bg-slate-900/90 rounded-xl p-6 border border-amber-800/30">
                      <p className="text-amber-100 text-lg leading-relaxed whitespace-pre-wrap tracking-wide">
                        {book.volumeInfo.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-full mt-8 text-center py-12">
                    <p className="text-amber-400/60 text-xl italic">
                      この本の説明はまだ登録されていません...
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-amber-400 min-w-32">ISBN</span>
                  <code className="bg-black/60 px-4 py-2 rounded-lg text-amber-200 border border-amber-800/50">
                    {book.id}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalBook;