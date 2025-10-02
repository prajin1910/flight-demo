import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowRight, FiCalendar, FiCheckCircle, FiMapPin, FiNavigation, FiClock as FiScheduled, FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const FlightSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced search filters - from, to, and date
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: '',
    selectedDate: '' // Empty by default to show all flights
  });

  const [isRouteSearch, setIsRouteSearch] = useState(false); // Track if searching by route (from/to)
  const [isDateSearch, setIsDateSearch] = useState(false); // Track if searching by date

  // Parse URL parameters and navigation state on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const departureDateParam = searchParams.get('departureDate');
    
    // Check for prefilled destination from navigation state
    const prefilledDestination = location.state?.prefilledDestination;

    if (fromParam || toParam || departureDateParam || prefilledDestination) {
      setSearchFilters({
        from: fromParam || '',
        to: toParam || prefilledDestination || '',
        selectedDate: departureDateParam || ''
      });
      
      // Set search flags based on what parameters we have
      if (departureDateParam) {
        setIsDateSearch(true);
      }
    }
  }, [location.search, location.state]);

  // Load flights based on current filters
  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      // Load all available flights
      const response = await api.get('/flights/search?page=1&limit=100');
      setFlights(response.data.flights || []);
    } catch (error) {
      console.error('Error loading flights:', error);
      setError('Failed to load flights');
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFlights = useCallback(() => {
    let filtered = flights;

    // If searching by route (from/to), show flights across all dates
    if (searchFilters.from.trim() || searchFilters.to.trim()) {
      setIsRouteSearch(true);
      
      // Filter by departure city/airport/state/country
      if (searchFilters.from.trim()) {
        const fromQuery = searchFilters.from.toLowerCase();
        
        // Extract city name, airport code, and country from formatted queries like "New York, USA (JFK)"
        const cityMatch = fromQuery.match(/^([^,]+)/); // Get text before first comma
        const codeMatch = fromQuery.match(/\(([^)]+)\)/); // Get text inside parentheses
        const countryMatch = fromQuery.match(/,\s*([^(]+)/); // Get text between comma and parentheses
        
        filtered = filtered.filter(flight => {
          const departure = flight.route.departure.airport;
          const cityName = departure.city.toLowerCase();
          const airportName = departure.name.toLowerCase();
          const airportCode = departure.code.toLowerCase();
          const stateName = departure.state ? departure.state.toLowerCase() : '';
          const countryName = departure.country ? departure.country.toLowerCase() : '';
          
          // Check direct matches with the full query
          const directMatch = (
            cityName.includes(fromQuery) ||
            airportName.includes(fromQuery) ||
            airportCode.includes(fromQuery) ||
            stateName.includes(fromQuery) ||
            countryName.includes(fromQuery)
          );
          
          // Check matches with extracted parts
          let partialMatch = false;
          
          if (cityMatch) {
            const extractedCity = cityMatch[1].trim();
            partialMatch = partialMatch || cityName.includes(extractedCity) || airportName.includes(extractedCity);
          }
          
          if (codeMatch) {
            const extractedCode = codeMatch[1].trim();
            partialMatch = partialMatch || airportCode.includes(extractedCode);
          }
          
          if (countryMatch) {
            const extractedCountry = countryMatch[1].trim();
            partialMatch = partialMatch || countryName.includes(extractedCountry) || stateName.includes(extractedCountry);
          }
          
          return directMatch || partialMatch;
        });
      }

      // Filter by arrival city/airport/state/country
      if (searchFilters.to.trim()) {
        const toQuery = searchFilters.to.toLowerCase();
        
        // Extract city name, airport code, and country from formatted queries like "Tokyo, Japan (NRT)"
        const cityMatch = toQuery.match(/^([^,]+)/); // Get text before first comma
        const codeMatch = toQuery.match(/\(([^)]+)\)/); // Get text inside parentheses
        const countryMatch = toQuery.match(/,\s*([^(]+)/); // Get text between comma and parentheses
        
        filtered = filtered.filter(flight => {
          const arrival = flight.route.arrival.airport;
          const cityName = arrival.city.toLowerCase();
          const airportName = arrival.name.toLowerCase();
          const airportCode = arrival.code.toLowerCase();
          const stateName = arrival.state ? arrival.state.toLowerCase() : '';
          const countryName = arrival.country ? arrival.country.toLowerCase() : '';
          
          // Check direct matches with the full query
          const directMatch = (
            cityName.includes(toQuery) ||
            airportName.includes(toQuery) ||
            airportCode.includes(toQuery) ||
            stateName.includes(toQuery) ||
            countryName.includes(toQuery)
          );
          
          // Check matches with extracted parts
          let partialMatch = false;
          
          if (cityMatch) {
            const extractedCity = cityMatch[1].trim();
            partialMatch = partialMatch || cityName.includes(extractedCity) || airportName.includes(extractedCity);
          }
          
          if (codeMatch) {
            const extractedCode = codeMatch[1].trim();
            partialMatch = partialMatch || airportCode.includes(extractedCode);
          }
          
          if (countryMatch) {
            const extractedCountry = countryMatch[1].trim();
            partialMatch = partialMatch || countryName.includes(extractedCountry) || stateName.includes(extractedCountry);
          }
          
          return directMatch || partialMatch;
        });
      }
    } else if (searchFilters.selectedDate && isDateSearch) {
      // Only filter by date if user has selected a date and we're in date search mode
      setIsRouteSearch(false);
      const selectedDate = new Date(searchFilters.selectedDate);
      
      filtered = filtered.filter(flight => {
        const flightDate = new Date(flight.route.departure.time);
        return (
          flightDate.getFullYear() === selectedDate.getFullYear() &&
          flightDate.getMonth() === selectedDate.getMonth() &&
          flightDate.getDate() === selectedDate.getDate()
        );
      });
    } else {
      // No filters applied - show all scheduled flights
      setIsRouteSearch(false);
      // Only show flights that haven't departed yet
      const now = new Date();
      filtered = filtered.filter(flight => {
        const flightTime = new Date(flight.route.departure.time);
        return flightTime >= now; // Only future/current flights
      });
    }

    setFilteredFlights(filtered);
  }, [flights, searchFilters, isDateSearch]);

  // Filter flights in real-time as user types or changes date
  useEffect(() => {
    if (flights.length > 0) {
      filterFlights();
    }
  }, [flights, filterFlights]);

  const handleSearchInputChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value,
      // Clear date when starting route search
      selectedDate: value.trim() ? '' : prev.selectedDate
    }));
    
    // If user starts typing in route fields, disable date search
    if (value.trim()) {
      setIsDateSearch(false);
    }
  };

  const handleDateChange = (date) => {
    setSearchFilters(prev => ({
      ...prev,
      selectedDate: date,
      from: '', // Clear route search when changing date
      to: ''
    }));
    setIsDateSearch(true); // Enable date filtering when user selects a date
    setIsRouteSearch(false);
  };

  const clearSearch = () => {
    setSearchFilters({
      from: '',
      to: '',
      selectedDate: ''
    });
    setIsDateSearch(false);
    setIsRouteSearch(false);
  };

  const getFlightStatus = (departureTime) => {
    const now = new Date();
    const flightTime = new Date(departureTime);
    
    if (flightTime < now) {
      return { status: 'departed', label: 'Departed', icon: FiCheckCircle, color: 'text-red-600' };
    } else {
      return { status: 'scheduled', label: 'Scheduled', icon: FiScheduled, color: 'text-blue-600' };
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getSelectedDateLabel = () => {
    if (!searchFilters.selectedDate) {
      return 'All Scheduled Flights';
    }
    
    const selected = new Date(searchFilters.selectedDate);
    const today = new Date();
    
    if (selected.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (selected.getTime() < today.getTime()) {
      return 'Past Date';
    } else {
      return 'Future Date';
    }
  };

  const handleFlightSelect = (flightId) => {
    navigate(`/flights/${flightId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-950 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-secondary-600 dark:text-secondary-300">Loading flights...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-secondary-900 dark:to-secondary-950 p-2 sm:p-3 md:p-4 lg:p-4 xl:p-5">
      <div className="max-w-6xl mx-auto px-1 sm:px-2 md:px-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-6 lg:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
            {isRouteSearch ? 'Route Search Results' : 
             isDateSearch ? `Flights on ${getSelectedDateLabel()}` : 
             'All Scheduled Flights'}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300 text-sm sm:text-base md:text-base lg:text-base">
            {isRouteSearch 
              ? `${filteredFlights.length} flights found across all dates`
              : isDateSearch && searchFilters.selectedDate
                ? `${formatDate(searchFilters.selectedDate)} • ${filteredFlights.length} flights available`
                : `${filteredFlights.length} scheduled flights available`
            }
          </p>
        </div>

        {/* Search Controls */}
        <div className="glass-card mb-4 sm:mb-6 md:mb-6 lg:mb-6 p-3 sm:p-4 md:p-5 lg:p-5">
          {/* Date Selector - Always show but optional */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 sm:mb-3">
              Filter by Date (Optional)
            </label>
            <div className="relative max-w-md">
              <FiCalendar className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-secondary-600 dark:text-secondary-300 w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              <input
                type="date"
                value={searchFilters.selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                placeholder="Select a date to filter flights"
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-3 lg:py-3 text-sm sm:text-base md:text-sm lg:text-sm border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [color-scheme:dark] shadow-sm"
              />
            </div>
            {!searchFilters.selectedDate && (
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-2">
                Leave empty to see all scheduled flights
              </p>
            )}
          </div>

          {/* Route Search */}
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-4 lg:gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <FiMapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
                <input
                  type="text"
                  value={searchFilters.from}
                  onChange={(e) => handleSearchInputChange('from', e.target.value)}
                  placeholder="From (City, Airport, Code)"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 md:py-3 lg:py-3 text-sm sm:text-base md:text-sm lg:text-sm border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-secondary-400 dark:placeholder-secondary-500 shadow-sm"
                />
              </div>
            </div>

            <div className="hidden md:block flex-shrink-0">
              <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-4 md:h-4 lg:w-4 lg:h-4 text-secondary-400 dark:text-secondary-500" />
            </div>

            <div className="flex-1 w-full">
              <div className="relative">
                <FiMapPin className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
                <input
                  type="text"
                  value={searchFilters.to}
                  onChange={(e) => handleSearchInputChange('to', e.target.value)}
                  placeholder="To (City, Airport, Code)"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 md:py-3 lg:py-3 text-sm sm:text-base md:text-sm lg:text-sm border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-secondary-400 dark:placeholder-secondary-500 shadow-sm"
                />
              </div>
            </div>

            {(searchFilters.from || searchFilters.to) && (
              <button
                onClick={clearSearch}
                className="bg-secondary-100 dark:bg-secondary-700 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-secondary-600 dark:text-secondary-300 p-2.5 sm:p-3 md:p-2.5 lg:p-2.5 rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg transition-colors flex-shrink-0"
                title="Clear search"
              >
                <FiX className="w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              </button>
            )}
          </div>

          {/* Search Summary */}
          {(searchFilters.from || searchFilters.to) && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary-200 dark:border-secondary-700 text-center">
              <p className="text-xs sm:text-sm md:text-sm lg:text-sm text-secondary-600 dark:text-secondary-300">
                Showing {filteredFlights.length} flights
                {searchFilters.from && ` from ${searchFilters.from}`}
                {searchFilters.to && ` to ${searchFilters.to}`}
                <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">(across all dates)</span>
              </p>
            </div>
          )}
        </div>

        {/* Flight Results */}
        {error ? (
          <div className="card text-center max-w-lg mx-auto">
            <div className="text-error-500 dark:text-error-400 mb-4">
              <FiX className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">Error Loading Flights</h3>
            <p className="text-secondary-600 dark:text-secondary-300 mb-4">{error}</p>
            <button
              onClick={loadFlights}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredFlights.length === 0 ? (
          <div className="card text-center max-w-lg mx-auto">
            <FiNavigation className="w-16 h-16 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
              {isRouteSearch ? 'No flights available for this route' : 
               isDateSearch ? 'No flights scheduled for this date' : 'No flights available'}
            </h3>
            <p className="text-secondary-600 dark:text-secondary-300 mb-6">
              {isRouteSearch 
                ? `No flights found ${searchFilters.from ? `from ${searchFilters.from}` : ''}${searchFilters.to ? ` to ${searchFilters.to}` : ''} at this time. Try searching different cities, states, or countries.`
                : isDateSearch
                  ? `There are no flights scheduled for ${formatDate(searchFilters.selectedDate)}.`
                  : 'There are no scheduled flights available at this time.'
              }
            </p>
            <div className="space-y-3">
              <button
                onClick={clearSearch}
                className="btn-primary mr-3"
              >
                Clear Search
              </button>
              {isRouteSearch && (
                <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-4">
                  <p>Search tips:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Try searching by city names (e.g., "New York", "London")</li>
                    <li>Use state names for domestic searches (e.g., "California", "Texas")</li>
                    <li>Search by country for international routes (e.g., "India", "Japan")</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-4">
            {filteredFlights.map((flight) => {
              const flightStatus = getFlightStatus(flight.route.departure.time);
              const StatusIcon = flightStatus.icon;
              
              return (
                <div 
                  key={flight._id} 
                  className={`card p-3 sm:p-4 md:p-4 lg:p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-700 ${
                    flightStatus.status === 'departed' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (flightStatus.status !== 'departed') {
                      handleFlightSelect(flight._id);
                    } else {
                      toast.error('This flight has already departed and cannot be booked');
                    }
                  }}
                >
                  <div className="space-y-3 sm:space-y-4 md:space-y-4 lg:space-y-4">
                    {/* Header with Airline, Date and Status */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 lg:space-x-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 lg:w-9 lg:h-9 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <FiNavigation className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-4 md:h-4 lg:w-4 lg:h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base text-secondary-900 dark:text-white">{flight.airline.name}</h3>
                          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">{flight.flightNumber} • {flight.aircraft.model}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        {/* Flight Date */}
                        <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
                          {formatDate(flight.route.departure.time)}
                        </div>
                        
                        {/* Flight Status */}
                        <div className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full ${
                          flightStatus.status === 'departed' 
                            ? 'bg-red-100 dark:bg-red-900/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <StatusIcon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${flightStatus.color}`} />
                          <span className={`text-xs font-medium ${flightStatus.color}`}>
                            {flightStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Route Information */}
                    <div className="flex items-center justify-between px-2 sm:px-3 md:px-4">
                      {/* Departure */}
                      <div className="text-left flex-1">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
                          {formatTime(flight.route.departure.time)}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-white mb-1">
                          {flight.route.departure.airport.code}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                          {flight.route.departure.airport.name}
                        </div>
                        <div className="text-xs text-secondary-600 dark:text-secondary-400">
                          {flight.route.departure.airport.city}, {flight.route.departure.airport.country}
                        </div>
                      </div>
                      
                      {/* Flight Duration & Path */}
                      <div className="flex-1 flex flex-col items-center justify-center mx-3 sm:mx-4 md:mx-8">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-1 sm:mb-2">
                          <FiNavigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-white">
                            {formatDuration(flight.duration)}
                          </div>
                          <div className="text-xs text-success-600 dark:text-success-400 font-medium">
                            Non-stop
                          </div>
                        </div>
                      </div>
                      
                      {/* Arrival */}
                      <div className="text-right flex-1">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white mb-1 sm:mb-2">
                          {formatTime(flight.route.arrival.time)}
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-white mb-1">
                          {flight.route.arrival.airport.code}
                        </div>
                        <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 mb-1">
                          {flight.route.arrival.airport.name}
                        </div>
                        <div className="text-xs text-secondary-600 dark:text-secondary-400">
                          {flight.route.arrival.airport.city}, {flight.route.arrival.airport.country}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row - Pricing and Action */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-secondary-200 dark:border-secondary-700 flex-wrap gap-2">
                      <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-6">
                        <div>
                          <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${flight.pricing.economy.price}
                          </div>
                          <div className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">Economy Class</div>
                        </div>
                        <div className="text-xs sm:text-sm text-success-600 dark:text-success-400 font-medium">
                          {flight.pricing.economy.availableSeats} seats left
                        </div>
                      </div>
                      
                      <button 
                        className={`px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 font-medium text-sm sm:text-base ${
                          flightStatus.status === 'departed' 
                            ? 'bg-red-300 dark:bg-red-600 text-red-700 dark:text-red-300 cursor-not-allowed' 
                            : 'btn-primary hover:scale-105'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (flightStatus.status !== 'departed') {
                            handleFlightSelect(flight._id);
                          } else {
                            toast.error('This flight has already departed and cannot be booked');
                          }
                        }}
                        disabled={flightStatus.status === 'departed'}
                      >
                        <span>{flightStatus.status === 'departed' ? 'Flight Departed' : 'Select Flight'}</span>
                        {flightStatus.status !== 'departed' && <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;