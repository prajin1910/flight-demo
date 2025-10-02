import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiArrowRight, FiClock, FiMapPin, FiNavigation, FiUser } from 'react-icons/fi';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import FlightPathMap from '../components/FlightPathMap';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, flightsAPI } from '../utils/api';

const SeatSelection = () => {
  const { flightId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [flight, setFlight] = useState(null);
  const [seatMap, setSeatMap] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [contactDetails, setContactDetails] = useState({
    phone: ''
  });
  const [numSeatsRequired, setNumSeatsRequired] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [paymentMethod, setPaymentMethod] = useState('card');
  // eslint-disable-next-line no-unused-vars
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [seatRecommendations, setSeatRecommendations] = useState(null);
  const [showFlightPath, setShowFlightPath] = useState(true);
  // const [seatPreferences, setSeatPreferences] = useState({
  //   windowSeat: true,
  //   aisleSeat: false,
  //   extraLegroom: false,
  //   emergencyExit: false
  // });
  // const [showAlternativeFlights, setShowAlternativeFlights] = useState(false);
  // const [alternativeFlights, setAlternativeFlights] = useState([]);

  const searchCriteria = location.state?.searchCriteria || {};

  const fetchFlightAndSeats = useCallback(async () => {
    try {
      const [flightResponse, seatResponse] = await Promise.all([
        flightsAPI.getById(flightId),
        flightsAPI.getSeatMap(flightId)
      ]);

      setFlight(flightResponse.data.flight);
      setSeatMap(seatResponse.data.seatMap);
    } catch (error) {
      console.error('Error fetching flight data:', error);
      toast.error('Error loading flight information');
      navigate('/flights/search');
    } finally {
      setIsLoading(false);
    }
  }, [flightId, navigate]);

  const initializePassengers = useCallback(() => {
    const passengerList = Array.from({ length: numSeatsRequired }, (_, index) => ({
      title: 'Mr',
      firstName: index === 0 ? user?.username || '' : '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      nationality: 'US',
      passportNumber: '',
      mealPreference: 'none'
    }));
    setPassengers(passengerList);
    
    // Initialize contact details
    setContactDetails({
      phone: user.profile?.phone || ''
    });
  }, [numSeatsRequired, user?.username, user.profile?.phone]);

  // Handle seat recommendations from flight path analysis
  const handleSeatRecommendation = useCallback((recommendations) => {
    setSeatRecommendations(recommendations);
    toast.success('Seat recommendations updated based on sun position!');
  }, []);

  useEffect(() => {
    fetchFlightAndSeats();
  }, [flightId, fetchFlightAndSeats]);

  useEffect(() => {
    initializePassengers();
    // Clear selected seats when number of seats changes
    setSelectedSeats([]);
  }, [initializePassengers, numSeatsRequired]);

  const getSeatIcon = (seat) => {
    if (!seat.isAvailable || seat.isBlocked) return '✗';
    if (selectedSeats.includes(seat.seatNumber)) {
      const index = selectedSeats.indexOf(seat.seatNumber);
      return index + 1;
    }
    return seat.seatNumber.slice(-1);
  };

  const handleSeatClick = (seatNumber) => {
    const seat = getSeatDetails(seatNumber);
    
    if (!seat || !seat.isAvailable || seat.isBlocked) {
      toast.error('This seat is not available');
      return;
    }

    const isSelected = selectedSeats.includes(seatNumber);

    if (isSelected) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
    } else {
      // Select seat
      if (selectedSeats.length >= numSeatsRequired) {
        toast.error(`You can only select ${numSeatsRequired} seat${numSeatsRequired > 1 ? 's' : ''}`);
        return;
      }
      setSelectedSeats(prev => [...prev, seatNumber]);
    }
  };

  const getSeatDetails = (seatNumber) => {
    if (!seatMap || !seatMap.seats) return null;
    
    const seat = seatMap.seats.find(s => s.seatNumber === seatNumber);
    if (seat) {
      return {
        ...seat,
        status: seat.isAvailable && !seat.isBlocked ? 'available' : 
                seat.isBlocked ? 'blocked' : 'occupied'
      };
    }
    return null;
  };

  const getSeatClass = (seatNumber) => {
    const isSelected = selectedSeats.includes(seatNumber);
    const seat = getSeatDetails(seatNumber);
    
    if (!seat) return 'seat seat-blocked';
    
    if (isSelected) return 'seat seat-selected';
    
    let baseClass = 'seat';
    
    // Add seat recommendation highlighting
    if (seatRecommendations && seat.isAvailable && !seat.isBlocked) {
      const seatColumn = seat.position.column;
      const seatRow = seat.position.row;
      
      // Determine if this is a window seat (first or last column in the aircraft)
      const allSeatsInRow = seatMap.seats.filter(s => s.position.row === seatRow);
      const allColumns = [...new Set(allSeatsInRow.map(s => s.position.column))].sort();
      const isLeftWindow = seatColumn === allColumns[0]; // First column (A)
      const isRightWindow = seatColumn === allColumns[allColumns.length - 1]; // Last column (F)
      const isWindowSeat = isLeftWindow || isRightWindow;
      const isAisleSeat = !isWindowSeat && (seatColumn === 'C' || seatColumn === 'D');
      
      // Check if this seat matches sun-side recommendation
      const sunSide = seatRecommendations.sunSide;
      const isOnSunSide = (sunSide === 'left' && isLeftWindow) || 
                         (sunSide === 'right' && isRightWindow);
      const isOnShadeSide = (sunSide === 'right' && isLeftWindow) || 
                           (sunSide === 'left' && isRightWindow);
      
      if (isWindowSeat && isOnSunSide) {
        baseClass += ' seat-recommended-sun'; // Golden glow for sun side
      } else if (isWindowSeat && isOnShadeSide) {
        baseClass += ' seat-recommended-shade'; // Blue glow for shade side
      } else if (isAisleSeat) {
        baseClass += ' seat-recommended-aisle'; // Green glow for aisle
      }
    }
    
    // Add class-specific styling
    if (seat.class === 'first') {
      baseClass += ' border-yellow-400';
    } else if (seat.class === 'business') {
      baseClass += ' border-blue-400';
    } else {
      baseClass += ' border-gray-300';
    }
    
    if (seat.isAvailable && !seat.isBlocked) {
      return `${baseClass} seat-available`;
    } else if (seat.isBlocked) {
      return `${baseClass} seat-blocked`;
    } else {
      return `${baseClass} seat-occupied`;
    }
  };

  // const calculateTotal = () => {
  //   let total = 0;
  //   selectedSeats.forEach(seatNumber => {
  //     const seat = getSeatDetails(seatNumber);
  //     if (seat) {
  //       total += seat.price || flight?.pricing?.[searchCriteria.class] || 0;
  //     }
  //   });
  //   return total;
  // };

  // const isReadyToProceed = () => {
  //   return selectedSeats.length === requiredPassengers && 
  //          passengers.every(p => p.firstName && p.lastName && p.gender && p.dateOfBirth);
  // };

  const getSeatPrice = (seat) => {
    if (!seat) return 0;
    return seat.price || flight?.pricing[seat.class]?.price || 0;
  };

  const getTotalPrice = () => {
    if (!flight) return 0;
    
    // Base price for all seats
    const basePrice = (flight.pricing[searchCriteria.class || 'economy']?.price || 0) * numSeatsRequired;
    
    // Additional cost for selected seats (if any)
    let seatSelectionCost = 0;
    if (seatMap && selectedSeats.length > 0) {
      seatSelectionCost = selectedSeats.reduce((total, seatNumber) => {
        const seat = seatMap.seats.find(s => s.seatNumber === seatNumber);
        const seatPrice = getSeatPrice(seat);
        const baseSeatPrice = flight.pricing[searchCriteria.class || 'economy']?.price || 0;
        return total + Math.max(0, seatPrice - baseSeatPrice); // Only additional cost
      }, 0);
    }
    
    return basePrice + seatSelectionCost;
  };

  const getTaxesAndFees = () => {
    const subtotal = getTotalPrice();
    return Math.round(subtotal * 0.1) + 25; // 10% tax + $25 service fee
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getTaxesAndFees();
  };

  const handlePassengerChange = (index, field, value) => {
    setPassengers(prev => prev.map((passenger, i) => 
      i === index ? { ...passenger, [field]: value } : passenger
    ));
  };

  const validatePassengerInfo = () => {
    for (let i = 0; i < numSeatsRequired; i++) {
      const passenger = passengers[i];
      if (!passenger.firstName || !passenger.lastName || !passenger.dateOfBirth) {
        toast.error(`Please fill in all required information for passenger ${i + 1}`);
        return false;
      }
    }
    
    if (!contactDetails.phone || contactDetails.phone.trim() === '') {
      toast.error('Please provide a phone number');
      return false;
    }
    
    return true;
  };

  const handleBooking = async () => {
    if (selectedSeats.length !== numSeatsRequired) {
      toast.error(`Please select ${numSeatsRequired} seat${numSeatsRequired > 1 ? 's' : ''}`);
      return;
    }

    if (!validatePassengerInfo()) {
      return;
    }

    // Show payment modal first
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setShowPaymentModal(false);
    setIsBooking(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const bookingData = {
        flightId,
        passengers: passengers.slice(0, numSeatsRequired).map((passenger, index) => ({
          ...passenger,
          seatNumber: selectedSeats[index]
        })),
        contactDetails: {
          email: user.email,
          phone: contactDetails.phone || '000-000-0000',
          emergencyContact: {
            name: '',
            phone: '',
            relation: ''
          }
        },
        selectedSeats,
        specialServices: []
      };

      const response = await bookingsAPI.create(bookingData);
      
      if (response.data.success) {
        toast.success('Payment successful! Booking confirmed!');
        navigate('/booking/confirmation', {
          state: {
            booking: response.data.booking,
            paymentStatus: 'success'
          }
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const renderSeatMap = () => {
    if (!seatMap) return null;

    const rows = {};
    seatMap.seats.forEach(seat => {
      const row = seat.position.row;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    const sortedRows = Object.keys(rows).sort((a, b) => parseInt(a) - parseInt(b));
    
    // Group rows by class for visual separation
    const classGroups = {};
    sortedRows.forEach(rowNum => {
      const rowSeats = rows[rowNum];
      const seatClass = rowSeats[0]?.class || 'economy';
      if (!classGroups[seatClass]) classGroups[seatClass] = [];
      classGroups[seatClass].push(rowNum);
    });

    return (
      <div className="card">
        <div className="text-center mb-6">
          <div className="bg-secondary-800 dark:bg-secondary-900 text-white py-2 px-8 rounded-t-2xl inline-block">
            <FiNavigation className="inline mr-2" />
            Cockpit
          </div>
        </div>

        <div className="space-y-6">
          {['first', 'business', 'economy'].map(className => {
            if (!classGroups[className]) return null;
            
            return (
              <div key={className} className="space-y-2">
                {/* Class Section Header */}
                <div className="text-center py-2">
                  <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                    className === 'first' ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-800 dark:text-warning-300' :
                    className === 'business' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300' :
                    'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200'
                  }`}>
                    {className.charAt(0).toUpperCase() + className.slice(1)} Class
                  </div>
                </div>
                
                {/* Seats for this class */}
                <div className="space-y-2">
                  {classGroups[className].map(rowNum => {
                    const rowSeats = rows[rowNum].sort((a, b) => 
                      a.position.column.localeCompare(b.position.column)
                    );

                    return (
                      <div key={rowNum} className="flex items-center justify-center space-x-1">
                        <div className="w-8 text-center text-sm font-medium text-gray-600">
                          {rowNum}
                        </div>
                        
                        {rowSeats.map((seat, index) => {
                          const isAisle = seatMap.layout === '3-3' && index === 2;
                          
                          return (
                            <React.Fragment key={seat.seatNumber}>
                              <button
                                onClick={() => handleSeatClick(seat.seatNumber)}
                                className={`${getSeatClass(seat.seatNumber)} relative group`}
                                disabled={!seat.isAvailable || seat.isBlocked}
                                title={`${seat.seatNumber} - ${seat.class} - $${getSeatPrice(seat)}`}
                              >
                                {getSeatIcon(seat)}
                                
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                    {seat.seatNumber} • {seat.class} • ${getSeatPrice(seat)}
                                    {seat.features && seat.features.length > 0 && (
                                      <div className="text-gray-300">
                                        {seat.features.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </button>
                              
                              {isAisle && <div className="w-4"></div>}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <h4 className="text-base font-medium text-secondary-900 dark:text-white mb-4 text-center">
            Seat Legend
          </h4>
          
          {/* Basic Seat Types */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat seat-available border-secondary-300 dark:border-secondary-600">A</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">Available</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat seat-selected">1</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">Selected</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat seat-occupied">✗</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">Occupied</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat seat-blocked">✗</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">Blocked</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat border-warning-400 dark:border-warning-600 bg-white dark:bg-secondary-800">F</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">First Class</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat border-primary-400 dark:border-primary-600 bg-white dark:bg-secondary-800">B</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">Business</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              <div className="seat border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800">E</div>
              <span className="text-xs font-medium text-secondary-600 dark:text-secondary-300 text-center">Economy</span>
            </div>
          </div>

          {/* Smart Seat Recommendations */}
          {seatRecommendations && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h5 className="text-sm font-medium text-secondary-900 dark:text-white mb-3 text-center">
                ☀️ Smart Seat Recommendations
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="seat seat-available border-secondary-300 seat-recommended-sun">☀️</div>
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300 text-center">Sun Side</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 text-center">Warm & Bright Views</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="seat seat-available border-secondary-300 seat-recommended-shade">🌘</div>
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">Shade Side</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 text-center">Cool & Calm</span>
                </div>
                <div className="flex flex-col items-center space-y-2 p-4 bg-gradient-to-b from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="seat seat-available border-secondary-300 seat-recommended-aisle">🚶</div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-300 text-center">Aisle Seats</span>
                  <span className="text-xs text-green-600 dark:text-green-400 text-center">Balanced Light</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-300">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (!flight || !seatMap) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-300">Flight information not available</p>
        <button onClick={() => navigate('/flights/search')} className="btn-primary mt-4">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Flight Header */}
      <div className="card p-4 sm:p-5 md:p-5 lg:p-5 mb-6 sm:mb-7 md:mb-6 lg:mb-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-3 lg:space-x-3 mb-4 lg:mb-0">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-2.5 sm:p-3 md:p-2.5 lg:p-2.5 rounded-lg">
              <FiNavigation className="w-6 h-6 sm:w-7 sm:h-7 md:w-6 md:h-6 lg:w-6 lg:h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-xl lg:text-xl font-bold text-secondary-900 dark:text-white">
                {flight.airline.name} - {flight.flightNumber}
              </h1>
              <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-3 lg:space-x-3 text-secondary-600 dark:text-secondary-300">
                <div className="flex items-center space-x-1">
                  <FiMapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-3 lg:h-3" />
                  <span className="text-sm sm:text-base md:text-sm lg:text-sm">{flight.route.departure.airport.code} → {flight.route.arrival.airport.code}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-3 lg:h-3" />
                  <span className="text-sm sm:text-base md:text-sm lg:text-sm">
                    {new Date(flight.route.departure.time).toLocaleDateString()} • 
                    {new Date(flight.route.departure.time).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 md:p-3 lg:p-3 rounded-lg">
            <div className="text-xl sm:text-2xl md:text-xl lg:text-xl font-bold text-primary-600 dark:text-primary-400">
              Total: ${getFinalTotal()}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">
              {selectedSeats.length} of {numSeatsRequired} seats selected
            </div>
          </div>
        </div>
      </div>

      {/* Flight Path Map & Sun Position Analysis */}
      {showFlightPath && flight && (
        <div className="mb-6 sm:mb-7 md:mb-6 lg:mb-7">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-3 lg:mb-4">
            <h2 className="text-lg sm:text-xl md:text-lg lg:text-xl font-semibold text-secondary-900 dark:text-white">
              🗺️ Flight Path & Sun Position Analysis
            </h2>
            <button
              onClick={() => setShowFlightPath(false)}
              className="text-sm text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white"
            >
              Hide Map
            </button>
          </div>
          <FlightPathMap 
            flight={flight} 
            onSeatRecommendation={handleSeatRecommendation}
          />
        </div>
      )}

      {/* Show Flight Path Toggle */}
      {!showFlightPath && (
        <div className="mb-6 sm:mb-7 md:mb-6 lg:mb-7 text-center">
          <button
            onClick={() => setShowFlightPath(true)}
            className="btn-secondary"
          >
            🗺️ Show Flight Path & Sun Analysis
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-5 lg:gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <h2 className="text-base sm:text-lg md:text-base lg:text-lg font-semibold mb-3 sm:mb-4 md:mb-3 lg:mb-4 text-secondary-900 dark:text-white">Select Your Seats</h2>
          {renderSeatMap()}
        </div>

        {/* Passenger Information */}
        <div className="space-y-4 sm:space-y-5 md:space-y-4 lg:space-y-5">
          {/* Number of Seats Selection */}
          <div className="card p-3 sm:p-4 md:p-4 lg:p-4">
            <h3 className="text-base sm:text-lg md:text-base lg:text-base font-semibold mb-4 sm:mb-5 md:mb-4 lg:mb-4 text-secondary-900 dark:text-white flex items-center">
              <FiUser className="mr-2 w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
              Booking Details
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 md:p-3 lg:p-3 rounded-lg">
              <label className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2 sm:mb-3">
                Number of Seats Required
              </label>
              <select
                value={numSeatsRequired}
                onChange={(e) => setNumSeatsRequired(parseInt(e.target.value))}
                className="input-field w-full bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-600 text-secondary-900 dark:text-white"
              >
                {[...Array(9)].map((_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-white dark:bg-secondary-800">
                    {i + 1} Seat{i > 0 ? 's' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                You can book between 1-9 seats per booking. Passenger information will be required for each seat.
              </p>
            </div>
          </div>

          <div className="card p-3 sm:p-4 md:p-4 lg:p-4">
            <h3 className="text-base sm:text-lg md:text-base lg:text-base font-semibold mb-4 sm:mb-5 md:mb-4 lg:mb-4 text-secondary-900 dark:text-white">Passenger Information</h3>
            
            {passengers.slice(0, numSeatsRequired).map((passenger, index) => (
              <div key={index} className="mb-5 sm:mb-6 md:mb-5 lg:mb-6 last:mb-0 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg p-3 sm:p-4 md:p-4 lg:p-4">
                <h4 className="font-medium text-secondary-900 dark:text-white mb-3 sm:mb-4 md:mb-3 lg:mb-3 flex items-center text-sm sm:text-base md:text-sm lg:text-base">
                  <FiUser className="mr-2 w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-4 lg:h-4" />
                  Passenger {index + 1}
                  {selectedSeats[index] && (
                    <span className="ml-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 sm:px-3 sm:py-1 md:px-2 md:py-1 lg:px-2 lg:py-1 rounded-full text-xs sm:text-sm md:text-xs lg:text-xs">
                      Seat {selectedSeats[index]}
                    </span>
                  )}
                </h4>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-gray-600 p-3 sm:p-4 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Title
                      </label>
                      <select
                        value={passenger.title}
                        onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                        className="input-field text-xs sm:text-sm w-full bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-600 text-secondary-900 dark:text-white"
                      >
                        <option value="Mr" className="bg-white dark:bg-secondary-800">Mr</option>
                        <option value="Mrs" className="bg-white dark:bg-secondary-800">Mrs</option>
                        <option value="Ms" className="bg-white dark:bg-secondary-800">Ms</option>
                        <option value="Dr" className="bg-white dark:bg-secondary-800">Dr</option>
                      </select>
                    </div>
                    <div className="bg-white dark:bg-gray-600 p-3 sm:p-4 rounded-lg">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                        Gender
                      </label>
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="input-field text-xs sm:text-sm w-full bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-600 text-secondary-900 dark:text-white"
                      >
                        <option value="male" className="bg-white dark:bg-secondary-800">Male</option>
                        <option value="female" className="bg-white dark:bg-secondary-800">Female</option>
                        <option value="other" className="bg-white dark:bg-secondary-800">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.firstName}
                      onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                      className="input-field text-xs sm:text-sm bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-600 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={passenger.lastName}
                      onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                      className="input-field text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      value={passenger.dateOfBirth}
                      onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                      className="input-field text-sm"
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meal Preference
                    </label>
                    <select
                      value={passenger.mealPreference}
                      onChange={(e) => handlePassengerChange(index, 'mealPreference', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="none">No preference</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="non-vegetarian">Non-vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="kosher">Kosher</option>
                      <option value="halal">Halal</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6 text-secondary-900 dark:text-white">Contact Information</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field text-sm w-full bg-secondary-50 dark:bg-secondary-800/50"
                />
              </div>
              
              <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={contactDetails.phone}
                  onChange={(e) => setContactDetails(prev => ({ ...prev, phone: e.target.value }))}
                  className="input-field text-sm w-full bg-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-600 text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-secondary-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6 text-secondary-900 dark:text-white">Booking Summary</h3>
            
            <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <div className="bg-white dark:bg-gray-600 p-4 rounded-lg flex justify-between items-center">
                <span className="text-secondary-600 dark:text-secondary-300 font-medium">Base Price ({numSeatsRequired} × ${flight.pricing[searchCriteria.class || 'economy']?.price || 0})</span>
                <span className="font-semibold text-secondary-900 dark:text-white text-lg">${(flight.pricing[searchCriteria.class || 'economy']?.price || 0) * numSeatsRequired}</span>
              </div>
              
              {selectedSeats.length > 0 && (
                <div className="bg-white dark:bg-gray-600 p-4 rounded-lg flex justify-between items-center">
                  <span className="text-secondary-600 dark:text-secondary-300 font-medium">Seat Selection Fee</span>
                  <span className="font-semibold text-secondary-900 dark:text-white text-lg">
                    ${getTotalPrice() - (flight.pricing[searchCriteria.class || 'economy']?.price || 0) * numSeatsRequired}
                  </span>
                </div>
              )}
              
              <div className="bg-white dark:bg-gray-600 p-4 rounded-lg flex justify-between items-center">
                <span className="text-secondary-600 dark:text-secondary-300 font-medium">Taxes & Fees</span>
                <span className="font-semibold text-secondary-900 dark:text-white text-lg">${getTaxesAndFees()}</span>
              </div>
              
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-5 rounded-lg border-2 border-primary-200 dark:border-primary-700">
                <div className="flex justify-between items-center">
                  <span className="text-primary-700 dark:text-primary-300 font-bold text-lg">Total Amount</span>
                  <span className="text-primary-600 dark:text-primary-400 font-bold text-2xl">
                    ${getFinalTotal()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleBooking}
              disabled={selectedSeats.length !== numSeatsRequired || isBooking}
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBooking ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Proceed to Payment</span>
                  <FiArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
            
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary w-full py-3 flex items-center justify-center space-x-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Flight Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Complete Payment
            </h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Total Amount</span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    ${getFinalTotal()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {numSeatsRequired} seat{numSeatsRequired > 1 ? 's' : ''} • {selectedSeats.join(', ')}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border-2 border-primary-200 rounded-lg bg-primary-50 dark:bg-primary-900/20 dark:border-primary-700">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">CARD</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">Credit/Debit Card</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Secure payment processing</div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;