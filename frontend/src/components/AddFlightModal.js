import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMapPin, FiNavigation, FiX } from 'react-icons/fi';
import { airports } from '../data/airports';

const AddFlightModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: {
      name: '',
      code: '',
      logo: ''
    },
    route: {
      departure: {
        airport: {
          code: '',
          name: '',
          city: '',
          country: ''
        },
        time: '',
        terminal: '',
        gate: ''
      },
      arrival: {
        airport: {
          code: '',
          name: '',
          city: '',
          country: ''
        },
        time: '',
        terminal: '',
        gate: ''
      }
    },
    pricing: {
      economy: {
        price: '',
        availableSeats: 150
      },
      business: {
        price: '',
        availableSeats: 30
      },
      firstClass: {
        price: '',
        availableSeats: 12
      }
    },
    aircraft: {
      model: '',
      totalSeats: 180
    },
    status: 'scheduled',
    duration: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departureSearch, setDepartureSearch] = useState('');
  const [arrivalSearch, setArrivalSearch] = useState('');
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);
  const [showArrivalDropdown, setShowArrivalDropdown] = useState(false);

  // Filter airports based on search input
  const filteredDepartureAirports = airports.filter(airport =>
    departureSearch && departureSearch.length >= 2 && (
      airport.code.toLowerCase().includes(departureSearch.toLowerCase()) ||
      airport.name.toLowerCase().includes(departureSearch.toLowerCase()) ||
      airport.city.toLowerCase().includes(departureSearch.toLowerCase()) ||
      airport.country.toLowerCase().includes(departureSearch.toLowerCase())
    )
  ).slice(0, 8);

  const filteredArrivalAirports = airports.filter(airport =>
    arrivalSearch && arrivalSearch.length >= 2 && (
      airport.code.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
      airport.name.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
      airport.city.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
      airport.country.toLowerCase().includes(arrivalSearch.toLowerCase())
    )
  ).slice(0, 8);

  // Select airport from dropdown
  const selectAirport = (type, airport) => {
    if (type === 'departure') {
      handleInputChange('route.departure.airport.code', airport.code);
      handleInputChange('route.departure.airport.name', airport.name);
      handleInputChange('route.departure.airport.city', airport.city);
      handleInputChange('route.departure.airport.country', airport.country);
      setDepartureSearch(`${airport.code} - ${airport.city}, ${airport.country}`);
      setShowDepartureDropdown(false);
      
      // Auto-populate terminal based on airport (common terminals for major airports)
      const commonTerminals = {
        'JFK': 'Terminal 4',
        'LAX': 'Terminal 3',
        'LHR': 'Terminal 5',
        'CDG': 'Terminal 2E',
        'DXB': 'Terminal 3',
        'SIN': 'Terminal 3',
        'ICN': 'Terminal 2',
        'NRT': 'Terminal 1'
      };
      if (commonTerminals[airport.code]) {
        handleInputChange('route.departure.terminal', commonTerminals[airport.code]);
      }
    } else {
      handleInputChange('route.arrival.airport.code', airport.code);
      handleInputChange('route.arrival.airport.name', airport.name);
      handleInputChange('route.arrival.airport.city', airport.city);
      handleInputChange('route.arrival.airport.country', airport.country);
      setArrivalSearch(`${airport.code} - ${airport.city}, ${airport.country}`);
      setShowArrivalDropdown(false);
      
      // Auto-populate terminal based on airport
      const commonTerminals = {
        'JFK': 'Terminal 4',
        'LAX': 'Terminal 3',
        'LHR': 'Terminal 5',
        'CDG': 'Terminal 2E',
        'DXB': 'Terminal 3',
        'SIN': 'Terminal 3',
        'ICN': 'Terminal 2',
        'NRT': 'Terminal 1'
      };
      if (commonTerminals[airport.code]) {
        handleInputChange('route.arrival.terminal', commonTerminals[airport.code]);
      }
    }
  };

  // Auto-suggest airline code based on common airlines
  const getAirlineCode = (airlineName) => {
    const commonAirlines = {
      'Air India': 'AI',
      'American Airlines': 'AA',
      'Delta Air Lines': 'DL',
      'United Airlines': 'UA',
      'British Airways': 'BA',
      'Emirates': 'EK',
      'Singapore Airlines': 'SQ',
      'Lufthansa': 'LH',
      'Air France': 'AF',
      'KLM': 'KL',
      'Qatar Airways': 'QR',
      'Turkish Airlines': 'TK',
      'Cathay Pacific': 'CX',
      'Japan Airlines': 'JL',
      'All Nippon Airways': 'NH',
      'Korean Air': 'KE',
      'Southwest Airlines': 'WN',
      'JetBlue Airways': 'B6',
      'Alaska Airlines': 'AS',
      'Frontier Airlines': 'F9'
    };
    return commonAirlines[airlineName] || '';
  };

  // Auto-suggest aircraft model based on airline
  const getAircraftSuggestions = (airline) => {
    const aircraftByAirline = {
      'Air India': ['Boeing 787-8', 'Airbus A320', 'Boeing 777-300ER'],
      'American Airlines': ['Boeing 737-800', 'Airbus A321', 'Boeing 777-200ER'],
      'Delta Air Lines': ['Boeing 737-900', 'Airbus A350-900', 'Boeing 767-300ER'],
      'United Airlines': ['Boeing 737-900', 'Boeing 787-9', 'Airbus A320'],
      'Emirates': ['Airbus A380-800', 'Boeing 777-300ER', 'Boeing 787-10'],
      'Singapore Airlines': ['Airbus A350-900', 'Boeing 787-10', 'Airbus A380-800'],
      'British Airways': ['Boeing 787-9', 'Airbus A350-1000', 'Boeing 777-300ER']
    };
    return aircraftByAirline[airline] || ['Boeing 737-800', 'Airbus A320', 'Boeing 787-8'];
  };

  // Flight number patterns by airline
  const getFlightNumberSuggestions = (airlineCode) => {
    const patterns = {
      'AI': ['AI101', 'AI102', 'AI201', 'AI301'],
      'AA': ['AA1001', 'AA1002', 'AA2001', 'AA3001'],
      'DL': ['DL101', 'DL201', 'DL301', 'DL401'],
      'UA': ['UA801', 'UA901', 'UA1001', 'UA1101'],
      'BA': ['BA101', 'BA201', 'BA301', 'BA401'],
      'EK': ['EK201', 'EK301', 'EK401', 'EK501'],
      'SQ': ['SQ101', 'SQ201', 'SQ301', 'SQ401'],
      'LH': ['LH401', 'LH501', 'LH601', 'LH701'],
      'AF': ['AF101', 'AF201', 'AF301', 'AF401'],
      'KL': ['KL601', 'KL701', 'KL801', 'KL901']
    };
    return patterns[airlineCode] || [`${airlineCode}101`, `${airlineCode}201`, `${airlineCode}301`];
  };

  // Major airlines list
  const majorAirlines = [
    { name: 'Air India', code: 'AI' },
    { name: 'American Airlines', code: 'AA' },
    { name: 'Delta Air Lines', code: 'DL' },
    { name: 'United Airlines', code: 'UA' },
    { name: 'British Airways', code: 'BA' },
    { name: 'Emirates', code: 'EK' },
    { name: 'Singapore Airlines', code: 'SQ' },
    { name: 'Lufthansa', code: 'LH' },
    { name: 'Air France', code: 'AF' },
    { name: 'KLM Royal Dutch Airlines', code: 'KL' },
    { name: 'Qatar Airways', code: 'QR' },
    { name: 'Turkish Airlines', code: 'TK' },
    { name: 'Cathay Pacific', code: 'CX' },
    { name: 'Japan Airlines', code: 'JL' },
    { name: 'All Nippon Airways', code: 'NH' },
    { name: 'Korean Air', code: 'KE' },
    { name: 'Southwest Airlines', code: 'WN' },
    { name: 'JetBlue Airways', code: 'B6' },
    { name: 'Alaska Airlines', code: 'AS' },
    { name: 'Frontier Airlines', code: 'F9' }
  ];

  // Common terminals by airport
  const getTerminalOptions = (airportCode) => {
    const terminalsByAirport = {
      'JFK': ['Terminal 1', 'Terminal 2', 'Terminal 4', 'Terminal 5', 'Terminal 7', 'Terminal 8'],
      'LAX': ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5', 'Terminal 6', 'Terminal 7', 'Terminal 8', 'TBIT'],
      'LHR': ['Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5'],
      'CDG': ['Terminal 1', 'Terminal 2A', 'Terminal 2B', 'Terminal 2C', 'Terminal 2D', 'Terminal 2E', 'Terminal 2F', 'Terminal 2G', 'Terminal 3'],
      'DXB': ['Terminal 1', 'Terminal 2', 'Terminal 3'],
      'SIN': ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 4'],
      'ICN': ['Terminal 1', 'Terminal 2'],
      'NRT': ['Terminal 1', 'Terminal 2', 'Terminal 3'],
      'ATL': ['Terminal N', 'Terminal S', 'Terminal T', 'Terminal A', 'Terminal B', 'Terminal C', 'Terminal D', 'Terminal E', 'Terminal F'],
      'ORD': ['Terminal 1', 'Terminal 2', 'Terminal 3', 'Terminal 5']
    };
    return terminalsByAirport[airportCode] || ['Terminal 1', 'Terminal 2', 'Terminal 3'];
  };

  // Common gate patterns
  const getGateOptions = (terminal) => {
    const gatePatterns = {
      'Terminal 1': ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'B4', 'B5'],
      'Terminal 2': ['C1', 'C2', 'C3', 'C4', 'C5', 'D1', 'D2', 'D3', 'D4', 'D5'],
      'Terminal 3': ['E1', 'E2', 'E3', 'E4', 'E5', 'F1', 'F2', 'F3', 'F4', 'F5'],
      'Terminal 4': ['G1', 'G2', 'G3', 'G4', 'G5', 'H1', 'H2', 'H3', 'H4', 'H5'],
      'Terminal 5': ['K1', 'K2', 'K3', 'K4', 'K5', 'L1', 'L2', 'L3', 'L4', 'L5']
    };
    return gatePatterns[terminal] || ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
  };

  const handleInputChange = (field, value) => {
    const fields = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < fields.length - 1; i++) {
        current = current[fields[i]];
      }
      
      current[fields[fields.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.flightNumber || !formData.airline.name || !formData.airline.code) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.route.departure.time || !formData.route.arrival.time) {
        toast.error('Please set departure and arrival times');
        return;
      }

      if (!formData.pricing.economy.price || formData.pricing.economy.price <= 0) {
        toast.error('Please set a valid economy price');
        return;
      }

      // Validate dates
      const departureTime = new Date(formData.route.departure.time);
      const arrivalTime = new Date(formData.route.arrival.time);
      
      if (departureTime >= arrivalTime) {
        toast.error('Arrival time must be after departure time');
        return;
      }

      // Calculate duration
      const duration = Math.round((arrivalTime - departureTime) / (1000 * 60 * 60 * 100)) / 10;
      
      const flightData = {
        ...formData,
        duration: duration > 0 ? `${Math.floor(duration)}h ${Math.round((duration % 1) * 60)}m` : '1h 0m',
        pricing: {
          economy: {
            ...formData.pricing.economy,
            price: parseFloat(formData.pricing.economy.price)
          },
          business: {
            ...formData.pricing.business,
            price: formData.pricing.business.price ? parseFloat(formData.pricing.business.price) : parseFloat(formData.pricing.economy.price) * 2.5
          },
          firstClass: {
            ...formData.pricing.firstClass,
            price: formData.pricing.firstClass.price ? parseFloat(formData.pricing.firstClass.price) : parseFloat(formData.pricing.economy.price) * 4
          }
        }
      };

      await onAdd(flightData);
      toast.success('Flight added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding flight:', error);
      toast.error(error.message || 'Failed to add flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white dark:bg-secondary-900 p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <FiNavigation className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Add New Flight</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Flight Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Flight Number *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.flightNumber}
                    onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                    list="flight-number-suggestions"
                    className="input-field"
                    placeholder="e.g., AI101"
                    required
                  />
                  <datalist id="flight-number-suggestions">
                    {formData.airline.code && getFlightNumberSuggestions(formData.airline.code).map((flightNum, index) => (
                      <option key={index} value={flightNum} />
                    ))}
                    <option value="AI101" />
                    <option value="AA1001" />
                    <option value="DL201" />
                    <option value="UA801" />
                    <option value="BA301" />
                    <option value="EK401" />
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airline Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.airline.name}
                    onChange={(e) => {
                      handleInputChange('airline.name', e.target.value);
                      // Auto-suggest airline code
                      const suggestedCode = getAirlineCode(e.target.value);
                      if (suggestedCode) {
                        handleInputChange('airline.code', suggestedCode);
                      }
                    }}
                    list="airline-suggestions"
                    className="input-field"
                    placeholder="e.g., Air India"
                    required
                  />
                  <datalist id="airline-suggestions">
                    {majorAirlines.map((airline, index) => (
                      <option key={index} value={airline.name} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airline Code *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.airline.code}
                    onChange={(e) => handleInputChange('airline.code', e.target.value.toUpperCase())}
                    list="airline-code-suggestions"
                    className="input-field"
                    placeholder="e.g., AI"
                    maxLength="3"
                    required
                  />
                  <datalist id="airline-code-suggestions">
                    {majorAirlines.map((airline, index) => (
                      <option key={index} value={airline.code} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Departure Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center space-x-2">
              <FiMapPin className="w-5 h-5 text-primary-600" />
              <span>Departure</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airport Search *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={departureSearch}
                    onChange={(e) => {
                      setDepartureSearch(e.target.value);
                      setShowDepartureDropdown(e.target.value.length >= 2);
                      // Clear airport data if user types new search
                      if (formData.route.departure.airport.code) {
                        handleInputChange('route.departure.airport.code', '');
                        handleInputChange('route.departure.airport.name', '');
                        handleInputChange('route.departure.airport.city', '');
                        handleInputChange('route.departure.airport.country', '');
                      }
                    }}
                    onFocus={() => setShowDepartureDropdown(departureSearch.length >= 2)}
                    onBlur={() => setTimeout(() => setShowDepartureDropdown(false), 200)}
                    className="input-field pl-10"
                    placeholder="Search by airport code, city, or name (e.g., LAX, Los Angeles, JFK)"
                    required
                  />
                  <FiMapPin className="absolute left-3 top-3 text-secondary-400 w-5 h-5 pointer-events-none" />
                  
                  {showDepartureDropdown && filteredDepartureAirports.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto" style={{ top: '100%' }}>
                      {filteredDepartureAirports.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => selectAirport('departure', airport)}
                          className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors border-b border-secondary-100 dark:border-secondary-700 last:border-b-0 focus:outline-none focus:bg-primary-50 dark:focus:bg-secondary-700"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-secondary-900 dark:text-white">
                                {airport.code} - {airport.city}
                              </div>
                              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                                {airport.name}
                              </div>
                              <div className="text-xs text-secondary-500 dark:text-secondary-500">
                                {airport.country} • {airport.region}
                              </div>
                            </div>
                            <div className="text-primary-600 dark:text-primary-400 font-mono font-bold text-lg">
                              {airport.code}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {formData.route.departure.airport.code && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Selected: {formData.route.departure.airport.code} - {formData.route.departure.airport.city}, {formData.route.departure.airport.country}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.route.departure.time}
                  onChange={(e) => handleInputChange('route.departure.time', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Terminal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.route.departure.terminal}
                    onChange={(e) => handleInputChange('route.departure.terminal', e.target.value)}
                    list="departure-terminal-options"
                    className="input-field"
                    placeholder="e.g., Terminal 1"
                  />
                  <datalist id="departure-terminal-options">
                    {formData.route.departure.airport.code && getTerminalOptions(formData.route.departure.airport.code).map((terminal, index) => (
                      <option key={index} value={terminal} />
                    ))}
                    <option value="Terminal 1" />
                    <option value="Terminal 2" />
                    <option value="Terminal 3" />
                    <option value="Terminal 4" />
                    <option value="Terminal 5" />
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Gate
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.route.departure.gate}
                    onChange={(e) => handleInputChange('route.departure.gate', e.target.value)}
                    list="departure-gate-options"
                    className="input-field"
                    placeholder="e.g., A1"
                  />
                  <datalist id="departure-gate-options">
                    {formData.route.departure.terminal && getGateOptions(formData.route.departure.terminal).map((gate, index) => (
                      <option key={index} value={gate} />
                    ))}
                    <option value="A1" />
                    <option value="A2" />
                    <option value="B1" />
                    <option value="B2" />
                    <option value="C1" />
                    <option value="C2" />
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Arrival Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 flex items-center space-x-2">
              <FiMapPin className="w-5 h-5 text-primary-600" />
              <span>Arrival</span>
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airport Search *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={arrivalSearch}
                    onChange={(e) => {
                      setArrivalSearch(e.target.value);
                      setShowArrivalDropdown(e.target.value.length >= 2);
                      // Clear airport data if user types new search
                      if (formData.route.arrival.airport.code) {
                        handleInputChange('route.arrival.airport.code', '');
                        handleInputChange('route.arrival.airport.name', '');
                        handleInputChange('route.arrival.airport.city', '');
                        handleInputChange('route.arrival.airport.country', '');
                      }
                    }}
                    onFocus={() => setShowArrivalDropdown(arrivalSearch.length >= 2)}
                    onBlur={() => setTimeout(() => setShowArrivalDropdown(false), 200)}
                    className="input-field pl-10"
                    placeholder="Search by airport code, city, or name (e.g., JFK, New York, CDG)"
                    required
                  />
                  <FiMapPin className="absolute left-3 top-3 text-secondary-400 w-5 h-5 pointer-events-none" />
                  
                  {showArrivalDropdown && filteredArrivalAirports.length > 0 && (
                    <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto" style={{ top: '100%' }}>
                      {filteredArrivalAirports.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => selectAirport('arrival', airport)}
                          className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-secondary-700 transition-colors border-b border-secondary-100 dark:border-secondary-700 last:border-b-0 focus:outline-none focus:bg-primary-50 dark:focus:bg-secondary-700"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-secondary-900 dark:text-white">
                                {airport.code} - {airport.city}
                              </div>
                              <div className="text-sm text-secondary-600 dark:text-secondary-400">
                                {airport.name}
                              </div>
                              <div className="text-xs text-secondary-500 dark:text-secondary-500">
                                {airport.country} • {airport.region}
                              </div>
                            </div>
                            <div className="text-primary-600 dark:text-primary-400 font-mono font-bold text-lg">
                              {airport.code}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {formData.route.arrival.airport.code && (
                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Selected: {formData.route.arrival.airport.code} - {formData.route.arrival.airport.city}, {formData.route.arrival.airport.country}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.route.arrival.time}
                  onChange={(e) => handleInputChange('route.arrival.time', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Terminal
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.route.arrival.terminal}
                    onChange={(e) => handleInputChange('route.arrival.terminal', e.target.value)}
                    list="arrival-terminal-options"
                    className="input-field"
                    placeholder="e.g., Terminal 1"
                  />
                  <datalist id="arrival-terminal-options">
                    {formData.route.arrival.airport.code && getTerminalOptions(formData.route.arrival.airport.code).map((terminal, index) => (
                      <option key={index} value={terminal} />
                    ))}
                    <option value="Terminal 1" />
                    <option value="Terminal 2" />
                    <option value="Terminal 3" />
                    <option value="Terminal 4" />
                    <option value="Terminal 5" />
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Gate
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.route.arrival.gate}
                    onChange={(e) => handleInputChange('route.arrival.gate', e.target.value)}
                    list="arrival-gate-options"
                    className="input-field"
                    placeholder="e.g., B5"
                  />
                  <datalist id="arrival-gate-options">
                    {formData.route.arrival.terminal && getGateOptions(formData.route.arrival.terminal).map((gate, index) => (
                      <option key={index} value={gate} />
                    ))}
                    <option value="A1" />
                    <option value="A2" />
                    <option value="B1" />
                    <option value="B2" />
                    <option value="C1" />
                    <option value="C2" />
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Aircraft Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Aircraft</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Aircraft Model *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.aircraft.model}
                    onChange={(e) => {
                      handleInputChange('aircraft.model', e.target.value);
                      // Auto-adjust seat count based on aircraft model
                      const model = e.target.value.toLowerCase();
                      if (model.includes('a380')) {
                        handleInputChange('aircraft.totalSeats', 550);
                      } else if (model.includes('777-300') || model.includes('a350-900')) {
                        handleInputChange('aircraft.totalSeats', 350);
                      } else if (model.includes('787') || model.includes('a330')) {
                        handleInputChange('aircraft.totalSeats', 250);
                      } else if (model.includes('737') || model.includes('a320')) {
                        handleInputChange('aircraft.totalSeats', 180);
                      }
                    }}
                    list="aircraft-suggestions"
                    className="input-field"
                    placeholder="e.g., Boeing 737-800"
                    required
                  />
                  <datalist id="aircraft-suggestions">
                    {formData.airline.name && getAircraftSuggestions(formData.airline.name).map((aircraft, index) => (
                      <option key={index} value={aircraft} />
                    ))}
                    <option value="Boeing 737-800" />
                    <option value="Boeing 737-900" />
                    <option value="Boeing 777-200ER" />
                    <option value="Boeing 777-300ER" />
                    <option value="Boeing 787-8" />
                    <option value="Boeing 787-9" />
                    <option value="Boeing 787-10" />
                    <option value="Airbus A320" />
                    <option value="Airbus A321" />
                    <option value="Airbus A330-300" />
                    <option value="Airbus A350-900" />
                    <option value="Airbus A380-800" />
                  </datalist>
                </div>
                {formData.airline.name && (
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                    Common for {formData.airline.name}: {getAircraftSuggestions(formData.airline.name).slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Total Capacity *
                </label>
                <input
                  type="number"
                  value={formData.aircraft.totalSeats}
                  onChange={(e) => handleInputChange('aircraft.totalSeats', parseInt(e.target.value) || 180)}
                  className="input-field"
                  placeholder="180"
                  min="50"
                  max="850"
                  required
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Economy: {formData.pricing.economy.availableSeats} | 
                  Business: {formData.pricing.business.availableSeats} | 
                  First: {formData.pricing.firstClass.availableSeats}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Pricing (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Economy Price *
                </label>
                <input
                  type="number"
                  value={formData.pricing.economy.price}
                  onChange={(e) => handleInputChange('pricing.economy.price', e.target.value)}
                  className="input-field"
                  placeholder="299"
                  min="50"
                  step="0.01"
                  required
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Available seats: {formData.pricing.economy.availableSeats}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Business Price
                </label>
                <input
                  type="number"
                  value={formData.pricing.business.price}
                  onChange={(e) => handleInputChange('pricing.business.price', e.target.value)}
                  className="input-field"
                  placeholder="749 (auto: 2.5x economy)"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Available seats: {formData.pricing.business.availableSeats}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  First Class Price
                </label>
                <input
                  type="number"
                  value={formData.pricing.firstClass.price}
                  onChange={(e) => handleInputChange('pricing.firstClass.price', e.target.value)}
                  className="input-field"
                  placeholder="1196 (auto: 4x economy)"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Available seats: {formData.pricing.firstClass.availableSeats}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Flight Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200 dark:border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding Flight...</span>
                </div>
              ) : (
                'Add Flight'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFlightModal;