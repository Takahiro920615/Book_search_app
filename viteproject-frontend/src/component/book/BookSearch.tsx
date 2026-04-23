import React from 'react';

interface Props {
  query: string;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
}

const BookSearch: React.FC<Props> = ({ query, loading, onQueryChange, onSearch }) => {
  return (
    <div className="flex justify-center mb-12">
      <div className="flex gap-4 max-w-2xl w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="珠玉の1冊を求めて..."
          className="luxury-input flex-1 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="luxury-btn shadow-lg"
        >
          {loading ? '探しています...' : '探す'}
        </button>
      </div>
    </div>
  );
};

export default BookSearch;