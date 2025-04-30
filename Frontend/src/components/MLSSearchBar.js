import React, { useState } from 'react';

const MLSSearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await onSearch({
        query: searchQuery.trim(),
        directSearch: true
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="mls-search-bar-container">
      <div className="mls-search-bar">
        <div className="search-input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search MLS listings (address, city, or ZIP)"
            className="search-input"
          />
          {isLoading && (
            <div className="search-loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSearch} 
          className="search-button"
          disabled={isLoading}
        >
          Search MLS
        </button>
      </div>

      {error && (
        <div className="search-error">
          {error}
        </div>
      )}
    </div>
  );
};

export default MLSSearchBar; 