import { useEffect, useRef, useState } from 'react';
import { FiMapPin, FiX } from 'react-icons/fi';
import { formatAirportDisplay, searchAirports } from '../data/airports';

const AutocompleteInput = ({ 
  value, 
  onChange, 
  placeholder, 
  icon: Icon = FiMapPin,
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.length >= 2) {
      const results = searchAirports(newValue);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    
    onChange(newValue);
  };

  const handleSuggestionClick = (airport) => {
    const formattedValue = formatAirportDisplay(airport);
    setInputValue(formattedValue);
    onChange(formattedValue);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          listRef.current && !listRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-5 h-5 z-10" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 2) {
              const results = searchAirports(inputValue);
              setSuggestions(results);
              setIsOpen(results.length > 0);
            }
          }}
          placeholder={placeholder}
          required={required}
          className="w-full pl-12 pr-10 py-4 text-lg border-2 border-secondary-200 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all duration-200 placeholder-secondary-400 dark:placeholder-secondary-500"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300 z-10"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div 
          ref={listRef}
          className="absolute top-full left-0 right-0 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-600 rounded-xl shadow-xl dark:shadow-secondary-900/20 z-50 mt-2 max-h-80 overflow-y-auto"
        >
          {suggestions.map((airport, index) => (
            <div
              key={`${airport.code}-${index}`}
              onClick={() => handleSuggestionClick(airport)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-secondary-100 dark:border-secondary-700 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                  : 'hover:bg-secondary-50 dark:hover:bg-secondary-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                      {airport.code}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-secondary-900 dark:text-white truncate">
                    {airport.city}
                  </div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400 truncate">
                    {airport.name}
                  </div>
                  <div className="text-xs text-secondary-400 dark:text-secondary-500">
                    {airport.country} • {airport.region}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;