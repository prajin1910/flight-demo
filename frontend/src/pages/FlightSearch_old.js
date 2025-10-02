import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock, FiMapPin, FiNavigation, FiArrowRight, FiSearch, FiX, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import AutocompleteInput from '../components/AutocompleteInput';
import api from '../utils/api';

const FlightSearch = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced search filters - from, to, and date
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: '',
    selectedDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });

  const [currentDate] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  const [isRouteSearch, setIsRouteSearch] = useState(false); // Track if searching by route (from/to)

  // Load all today's flights on component mount
  useEffect(() => {
    loadTodaysFlights();
  }, []);

  // Filter flights in real-time as user types
  useEffect(() => {
    filterFlights();
  }, [searchFilters.from, searchFilters.to, flights]);

  const loadTodaysFlights = async () => {
    try {
      setLoading(true);
      // Load all available flights for today
      const response = await api.get('/api/flights/search?page=1&limit=50');
      setFlights(response.data.flights || []);
    } catch (error) {
      console.error('Error loading flights:', error);
      setError('Failed to load flights');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFlights = () => {
    let filtered = flights;

    // Filter by departure city/airport
    if (searchFilters.from.trim()) {
      filtered = filtered.filter(flight => 
        flight.route.departure.airport.city.toLowerCase().includes(searchFilters.from.toLowerCase()) ||
        flight.route.departure.airport.name.toLowerCase().includes(searchFilters.from.toLowerCase()) ||
        flight.route.departure.airport.code.toLowerCase().includes(searchFilters.from.toLowerCase())
      );
    }

    // Filter by arrival city/airport
    if (searchFilters.to.trim()) {
      filtered = filtered.filter(flight => 
        flight.route.arrival.airport.city.toLowerCase().includes(searchFilters.to.toLowerCase()) ||
        flight.route.arrival.airport.name.toLowerCase().includes(searchFilters.to.toLowerCase()) ||
        flight.route.arrival.airport.code.toLowerCase().includes(searchFilters.to.toLowerCase())
      );
    }

    setFilteredFlights(filtered);
  };

  const handleSearchInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSearch = () => {
    setSearchFilters({
      from: '',
      to: ''
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDuration = (durationObj) => {
    if (typeof durationObj === 'object' && durationObj.hours !== undefined) {
      return `${durationObj.hours}h ${durationObj.minutes || 0}m`;
    }
    // Fallback for legacy format
    const hours = Math.floor(durationObj / 60);
    const mins = durationObj % 60;
    return `${hours}h ${mins}m`;
  };

  const handleFlightSelect = (flightId) => {
    navigate(`/flights/${flightId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading today's flights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Today's Flights
          </h1>
          <p className="text-gray-600 text-lg">
            {currentDate} • {filteredFlights.length} flights available
          </p>
        </div>

        {/* Simple Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchFilters.from}
                  onChange={(e) => handleSearchInputChange('from', e.target.value)}
                  placeholder="From (City, Airport, Code)"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="hidden md:block">
              <FiArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex-1">
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchFilters.to}
                  onChange={(e) => handleSearchInputChange('to', e.target.value)}
                  placeholder="To (City, Airport, Code)"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {(searchFilters.from || searchFilters.to) && (
              <button
                onClick={clearSearch}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-colors"
                title="Clear search"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {(searchFilters.from || searchFilters.to) && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Showing {filteredFlights.length} flights
                {searchFilters.from && ` from ${searchFilters.from}`}
                {searchFilters.to && ` to ${searchFilters.to}`}
              </p>
            </div>
          )}
        </div>

        {/* Flight Results */}
        {error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-red-500 mb-4">
              <FiX className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Flights</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadTodaysFlights}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiNavigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchFilters.from || searchFilters.to ? 'No matching flights' : 'No flights available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchFilters.from || searchFilters.to 
                ? "No flights found for your search. Try different cities or clear your search."
                : "There are currently no flights available for today."}
            </p>
            {(searchFilters.from || searchFilters.to) && (
              <button
                onClick={clearSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <div 
                key={flight._id} 
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleFlightSelect(flight._id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Flight Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiNavigation className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{flight.airline.name}</h3>
                        <p className="text-gray-600">{flight.flightNumber} • {flight.aircraft.model}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(flight.route.departure.time)}
                        </div>
                        <div className="text-sm text-gray-600">{flight.route.departure.airport.code}</div>
                        <div className="text-xs text-gray-500">{flight.route.departure.airport.city}</div>
                      </div>
                      
                      <div className="flex-1 flex items-center">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <div className="px-3 py-1 bg-gray-100 rounded-full mx-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="w-4 h-4 mr-1" />
                            {formatDuration(flight.duration)}
                          </div>
                        </div>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(flight.route.arrival.time)}
                        </div>
                        <div className="text-sm text-gray-600">{flight.route.arrival.airport.code}</div>
                        <div className="text-xs text-gray-500">{flight.route.arrival.airport.city}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="mt-6 lg:mt-0 lg:ml-8 text-center lg:text-right">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-blue-600">
                        ${flight.pricing.economy.price}
                      </div>
                      <div className="text-sm text-gray-600">Economy Class</div>
                      <div className="text-xs text-green-600 font-medium">
                        {flight.pricing.economy.availableSeats} seats left
                      </div>
                    </div>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 w-full lg:w-auto justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlightSelect(flight._id);
                      }}
                    >
                      <span>Select Flight</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Today's Flights
          </h1>
          <p className="text-gray-600 text-lg">
            {currentDate} • {filteredFlights.length} flights available
          </p>
        </div>

        {/* Simple Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchFilters.from}
                  onChange={(e) => handleSearchInputChange('from', e.target.value)}
                  placeholder="From (City, Airport, Code)"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="hidden md:block">
              <FiArrowRight className="w-6 h-6 text-gray-400" />
            </div>

            <div className="flex-1">
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchFilters.to}
                  onChange={(e) => handleSearchInputChange('to', e.target.value)}
                  placeholder="To (City, Airport, Code)"
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {(searchFilters.from || searchFilters.to) && (
              <button
                onClick={clearSearch}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-colors"
                title="Clear search"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {(searchFilters.from || searchFilters.to) && (
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Showing {filteredFlights.length} flights
                {searchFilters.from && ` from ${searchFilters.from}`}
                {searchFilters.to && ` to ${searchFilters.to}`}
              </p>
            </div>
          )}
        </div>

        {/* Flight Results */}
        {error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-red-500 mb-4">
              <FiX className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Flights</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadTodaysFlights}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FiNavigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchFilters.from || searchFilters.to ? 'No matching flights' : 'No flights available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchFilters.from || searchFilters.to 
                ? "No flights found for your search. Try different cities or clear your search."
                : "There are currently no flights available for today."}
            </p>
            {(searchFilters.from || searchFilters.to) && (
              <button
                onClick={clearSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <div 
                key={flight._id} 
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleFlightSelect(flight._id)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Flight Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiNavigation className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{flight.airline.name}</h3>
                        <p className="text-gray-600">{flight.flightNumber} • {flight.aircraft.model}</p>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(flight.route.departure.time)}
                        </div>
                        <div className="text-sm text-gray-600">{flight.route.departure.airport.code}</div>
                        <div className="text-xs text-gray-500">{flight.route.departure.airport.city}</div>
                      </div>
                      
                      <div className="flex-1 flex items-center">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <div className="px-3 py-1 bg-gray-100 rounded-full mx-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="w-4 h-4 mr-1" />
                            {formatDuration(flight.duration)}
                          </div>
                        </div>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(flight.route.arrival.time)}
                        </div>
                        <div className="text-sm text-gray-600">{flight.route.arrival.airport.code}</div>
                        <div className="text-xs text-gray-500">{flight.route.arrival.airport.city}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Action */}
                  <div className="mt-6 lg:mt-0 lg:ml-8 text-center lg:text-right">
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-blue-600">
                        ${flight.pricing.economy.price}
                      </div>
                      <div className="text-sm text-gray-600">Economy Class</div>
                      <div className="text-xs text-green-600 font-medium">
                        {flight.pricing.economy.availableSeats} seats left
                      </div>
                    </div>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 w-full lg:w-auto justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlightSelect(flight._id);
                      }}
                    >
                      <span>Select Flight</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;