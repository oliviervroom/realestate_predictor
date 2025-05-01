import React, { useState, useRef } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const suggestionsRef = useRef(null);

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const searchParams = {
        query: query.trim()
      };

      await onSearch(searchParams);
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
    <div className="search-bar-container">
      <div className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter location, address, or ZIP code"
            className="search-input"
          />
          {isLoading && (
            <div className="search-loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        <button 
          onClick={() => handleSearch()} 
          className="search-button"
          disabled={isLoading}
        >
          Search
        </button>
      </div>

      {error && (
        <div className="search-error">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-container" ref={suggestionsRef}>
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.line && (
                <div className="suggestion-line">{suggestion.line}</div>
              )}
              <div className="suggestion-details">
                {suggestion.city && (
                  <span className="suggestion-city">{suggestion.city}</span>
                )}
                {suggestion.state_code && (
                  <span className="suggestion-state">{suggestion.state_code}</span>
                )}
                {suggestion.postal_code && (
                  <span className="suggestion-zip">{suggestion.postal_code}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 