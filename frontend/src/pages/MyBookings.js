import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiEye, FiMapPin, FiNavigation, FiRefreshCw, FiUser, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [sortBy, setSortBy] = useState('date-desc'); // date-asc, date-desc, status
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900/30';
      case 'cancelled': return 'text-error-600 dark:text-error-400 bg-error-100 dark:bg-error-900/30';
      case 'pending': return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/30';
      case 'completed': return 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30';
      default: return 'text-secondary-600 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-700';
    }
  };

  const getFlightStatus = (booking) => {
    const now = new Date();
    const departureTime = new Date(booking.flight.route.departure.time);
    const arrivalTime = new Date(booking.flight.route.arrival.time);

    if (booking.bookingStatus === 'cancelled') return 'cancelled';
    
    // Check if flight has completed (arrived)
    if (now > arrivalTime) return 'completed';
    
    // Check if flight has departed but not yet arrived
    if (now > departureTime) return 'in-flight';
    
    // Check if flight is very close to departure (within 2 hours)
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
    if (hoursUntilDeparture <= 2 && hoursUntilDeparture > 0) return 'boarding-soon';
    
    // Future flight
    return 'upcoming';
  };

  const canCancelBooking = (booking) => {
    if (booking.bookingStatus === 'cancelled') return false;
    
    const now = new Date();
    const departureTime = new Date(booking.flight.route.departure.time);
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);
    
    // Can cancel if more than 24 hours before departure
    return hoursUntilDeparture > 24;
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking || !cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      console.log('Attempting to cancel booking:', {
        bookingId: cancellingBooking._id,
        reason: cancelReason
      });

      const response = await bookingsAPI.cancelBooking(cancellingBooking._id, {
        reason: cancelReason
      });

      console.log('Cancel booking response:', response.data);

      if (response.data.success) {
        toast.success(`Booking cancelled successfully! Refund of $${response.data.refundAmount} will be processed within 12 hours.`);
        
        // Update the booking in the local state
        setBookings(prev => prev.map(booking => 
          booking._id === cancellingBooking._id 
            ? { ...booking, bookingStatus: 'cancelled' }
            : booking
        ));
        
        setCancellingBooking(null);
        setCancelReason('');
      } else {
        console.log('Cancel booking failed:', response.data);
        toast.error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const filterBookings = (bookings) => {
    let filtered = bookings;

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(booking => {
        const status = getFlightStatus(booking);
        return filter === status || (filter === 'upcoming' && ['upcoming', 'boarding-soon'].includes(status));
      });
    }

    // Sort bookings
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.flight.route.departure.time) - new Date(b.flight.route.departure.time);
        case 'date-desc':
          return new Date(b.flight.route.departure.time) - new Date(a.flight.route.departure.time);
        case 'status':
          return a.bookingStatus.localeCompare(b.bookingStatus);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  const filteredBookings = filterBookings(bookings);

  const getBookingCounts = () => {
    const all = bookings.length;
    const upcoming = bookings.filter(b => ['upcoming', 'boarding-soon'].includes(getFlightStatus(b))).length;
    const inFlight = bookings.filter(b => getFlightStatus(b) === 'in-flight').length;
    const completed = bookings.filter(b => getFlightStatus(b) === 'completed').length;
    const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    
    return { all, upcoming, inFlight, completed, cancelled };
  };

  const counts = getBookingCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-300">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-2 sm:mb-3">My Bookings</h1>
        <p className="text-sm sm:text-base md:text-lg text-secondary-600 dark:text-secondary-300">Manage and track all your flight bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10">
        <div className="card-elevated p-3 sm:p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg sm:rounded-xl">
              <FiNavigation className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="text-xs sm:text-sm font-medium text-secondary-500 dark:text-secondary-400">Upcoming</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white">{counts.upcoming}</p>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-3 sm:p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg sm:rounded-xl">
              <FiClock className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-warning-600 dark:text-warning-400" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="text-xs sm:text-sm font-medium text-secondary-500 dark:text-secondary-400">In Flight</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white">{counts.inFlight}</p>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-3 sm:p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-success-100 dark:bg-success-900/30 rounded-lg sm:rounded-xl">
              <FiUser className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-success-600 dark:text-success-400" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="text-xs sm:text-sm font-medium text-secondary-500 dark:text-secondary-400">Completed</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white">{counts.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="card-elevated p-3 sm:p-4 md:p-6">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 bg-error-100 dark:bg-error-900/30 rounded-lg sm:rounded-xl">
              <FiRefreshCw className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-error-600 dark:text-error-400" />
            </div>
            <div className="ml-2 sm:ml-3 md:ml-4">
              <p className="text-xs sm:text-sm font-medium text-secondary-500 dark:text-secondary-400">Cancelled</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-secondary-900 dark:text-white">{counts.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

            {/* Filters and Sorting */}
      <div className="card-elevated p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                filter === 'all'
                  ? 'btn-primary shadow-lg'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 hover:shadow-md'
              }`}
            >
              <span className="hidden sm:inline">All ({counts.all})</span>
              <span className="sm:hidden">All</span>
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                filter === 'upcoming'
                  ? 'btn-primary shadow-lg'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 hover:shadow-md'
              }`}
            >
              <span className="hidden sm:inline">Upcoming ({counts.upcoming})</span>
              <span className="sm:hidden">Upcoming</span>
            </button>
            <button
              onClick={() => setFilter('in-flight')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                filter === 'in-flight'
                  ? 'btn-primary shadow-lg'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 hover:shadow-md'
              }`}
            >
              <span className="hidden sm:inline">In Flight ({counts.inFlight})</span>
              <span className="sm:hidden">Flying</span>
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                filter === 'completed'
                  ? 'btn-primary shadow-lg'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 hover:shadow-md'
              }`}
            >
              <span className="hidden sm:inline">Completed ({counts.completed})</span>
              <span className="sm:hidden">Done</span>
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                filter === 'cancelled'
                  ? 'btn-primary shadow-lg'
                  : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 hover:shadow-md'
              }`}
            >
              <span className="hidden sm:inline">Cancelled ({counts.cancelled})</span>
              <span className="sm:hidden">Cancelled</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <label className="text-xs sm:text-sm font-semibold text-secondary-700 dark:text-secondary-300">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field min-w-0 w-full sm:min-w-[160px] text-xs sm:text-sm"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center max-w-lg mx-auto">
          <FiNavigation className="w-16 h-16 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
            {filter === 'all' ? 'No bookings found' : `No ${filter} bookings`}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-300 mb-6">
            {filter === 'all' 
              ? "You haven't made any flight bookings yet."
              : filter === 'in-flight'
              ? "You don't have any flights currently in progress."
              : `You don't have any ${filter} bookings.`
            }
          </p>
          <Link to="/flights/search" className="btn-primary">
            Book Your First Flight
          </Link>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {filteredBookings.map((booking) => {
            const flightStatus = getFlightStatus(booking);
            return (
              <div key={booking._id} className="card-elevated hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      {/* Booking Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3 sm:mb-0">
                          <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white">
                            {booking.flight.airline.name} {booking.flight.flightNumber}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                            </span>
                            {booking.checkInStatus.isCheckedIn && (
                              <span className="px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30">
                                Checked In
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">Booking ID</p>
                          <p className="font-bold text-sm sm:text-base md:text-lg text-secondary-900 dark:text-white">{booking.bookingId}</p>
                        </div>
                      </div>

                      {/* Flight Route */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                        <div>
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                            <div className="p-1.5 sm:p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white">Departure</span>
                          </div>
                          <div className="ml-1 sm:ml-2">
                            <p className="font-bold text-xl sm:text-2xl text-secondary-900 dark:text-white">{booking.flight.route.departure.airport.code}</p>
                            <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1 line-clamp-2">{booking.flight.route.departure.airport.name}</p>
                            <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
                              {formatDate(booking.flight.route.departure.time)} at {formatTime(booking.flight.route.departure.time)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center my-4 sm:my-0">
                          <div className="text-center">
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-700 rounded-xl">
                              <FiNavigation className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400 mx-auto mb-1 sm:mb-2" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 mt-1 sm:mt-2">Direct Flight</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                            <div className="p-1.5 sm:p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                              <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5 text-success-600 dark:text-success-400" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-secondary-900 dark:text-white">Arrival</span>
                          </div>
                          <div className="ml-1 sm:ml-2">
                            <p className="font-bold text-xl sm:text-2xl text-secondary-900 dark:text-white">{booking.flight.route.arrival.airport.code}</p>
                            <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1 line-clamp-2">{booking.flight.route.arrival.airport.name}</p>
                            <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
                              {formatDate(booking.flight.route.arrival.time)} at {formatTime(booking.flight.route.arrival.time)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Passenger Info */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-secondary-50 dark:bg-secondary-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 md:space-x-8">
                          <span className="flex items-center space-x-2">
                            <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600 dark:text-secondary-400" />
                            <span className="font-medium text-sm sm:text-base text-secondary-900 dark:text-white">
                              {booking.passengers.length} Passenger{booking.passengers.length > 1 ? 's' : ''}
                            </span>
                          </span>
                          <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="font-medium">Seats:</span> {booking.passengers.map(p => p.seatNumber).join(', ')}
                          </span>
                          <span className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400">
                            <span className="font-medium">Class:</span> {booking.passengers[0].seatClass.charAt(0).toUpperCase() + booking.passengers[0].seatClass.slice(1)}
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-xl sm:text-2xl text-primary-600 dark:text-primary-400">
                            ${booking.pricing.totalAmount}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Paid</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 sm:mt-8 lg:mt-0 lg:ml-6 xl:ml-8 flex-shrink-0">
                      <div className="flex flex-row sm:flex-col lg:flex-col space-x-2 sm:space-x-0 sm:space-y-3 lg:space-y-3">
                        <Link
                          to={`/booking/${booking._id}`}
                          className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto lg:w-48 py-2 sm:py-3 text-sm"
                        >
                          <FiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Link>
                        
                        {/* Check-in functionality removed per user request */}
                        
                        {canCancelBooking(booking) && (
                          <button 
                            onClick={() => setCancellingBooking(booking)}
                            className="btn-error w-full sm:w-auto lg:w-48 py-2 sm:py-3 text-sm font-medium flex items-center justify-center space-x-2"
                          >
                            <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Cancel Booking</span>
                            <span className="sm:hidden">Cancel</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium ${
                  flightStatus === 'upcoming' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' :
                  flightStatus === 'boarding-soon' ? 'bg-warning-50 dark:bg-warning-900/20 text-warning-700 dark:text-warning-300' :
                  flightStatus === 'in-flight' ? 'bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300' :
                  flightStatus === 'completed' ? 'bg-secondary-50 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300' :
                  'bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                    <span>
                      {flightStatus === 'upcoming' && 'Flight scheduled'}
                      {flightStatus === 'boarding-soon' && 'Boarding soon - Check in now!'}
                      {flightStatus === 'in-flight' && 'Flight in progress'}
                      {flightStatus === 'completed' && 'Flight completed'}
                      {flightStatus === 'cancelled' && 'Booking cancelled'}
                    </span>
                    <span className="text-xs">
                      Booked on {formatDate(booking.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-12 text-center">
        <p className="text-secondary-600 dark:text-secondary-300 mb-4">Looking for your next adventure?</p>
        <Link to="/flights/search" className="btn-primary">
          Search New Flights
        </Link>
      </div>

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Cancel Booking</h3>
              <button
                onClick={() => {
                  setCancellingBooking(null);
                  setCancelReason('');
                }}
                className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4 mb-4">
                <p className="text-warning-800 dark:text-warning-300 text-sm">
                  <strong>Refund Policy:</strong> You will receive 80% refund of the total amount paid. 
                  The refund will be processed within 12 hours after cancellation.
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Flight: {cancellingBooking.flight.airline.name} {cancellingBooking.flight.flightNumber}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-2">
                  {cancellingBooking.flight.route.departure.airport.code} → {cancellingBooking.flight.route.arrival.airport.code}
                </p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  Total Paid: <span className="font-semibold">${cancellingBooking.pricing.totalAmount}</span>
                </p>
                <p className="text-sm text-success-600 dark:text-success-400">
                  Refund Amount: <span className="font-semibold">${Math.round(cancellingBooking.pricing.totalAmount * 0.8)}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Reason for Cancellation *
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setCancellingBooking(null);
                  setCancelReason('');
                }}
                className="flex-1 btn-secondary"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={!cancelReason.trim()}
                className="flex-1 btn-error disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;