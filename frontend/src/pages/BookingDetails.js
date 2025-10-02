import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheck, FiDownload, FiMail, FiMapPin, FiNavigation, FiUser, FiX } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { bookingsAPI } from '../utils/api';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await bookingsAPI.getById(bookingId);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Booking not found');
      navigate('/my-bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setIsCancelling(true);
    try {
      const response = await bookingsAPI.cancelBooking(bookingId, {
        reason: cancelReason
      });
      
      if (response.data.success) {
        toast.success(`Booking cancelled successfully! Refund of $${response.data.refundAmount} will be processed within 12 hours.`);
        setShowCancelModal(false);
        fetchBookingDetails(); // Refresh booking details
      } else {
        toast.error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancellation error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await bookingsAPI.checkIn(bookingId);
      toast.success('Check-in successful!');
      fetchBookingDetails(); // Refresh booking details
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.response?.data?.message || 'Check-in failed');
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  const canCancel = () => {
    if (!booking) return false;
    if (booking.bookingStatus === 'cancelled') return false;
    
    const departureTime = new Date(booking.flight.route.departure.time);
    const now = new Date();
    const hoursDifference = (departureTime - now) / (1000 * 60 * 60);
    
    return hoursDifference > 2; // Can cancel if more than 2 hours before departure
  };

  const canCheckIn = () => {
    if (!booking) return false;
    if (booking.bookingStatus !== 'confirmed') return false;
    if (booking.checkInStatus.isCheckedIn) return false;
    
    const departureTime = new Date(booking.flight.route.departure.time);
    const now = new Date();
    const hoursDifference = (departureTime - now) / (1000 * 60 * 60);
    
    return hoursDifference <= 24 && hoursDifference > 0; // Can check-in 24 hours before to departure
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-300">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600 dark:text-secondary-300">Booking not found</p>
        <button onClick={() => navigate('/my-bookings')} className="btn-primary mt-4">
          Back to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="card-elevated p-8 mb-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              Booking Details
            </h1>
            <div className="flex items-center space-x-6 text-secondary-600 dark:text-secondary-300">
              <span className="text-lg">Booking ID: <strong className="text-secondary-900 dark:text-white">{booking.bookingId}</strong></span>
              <span className="text-lg">PNR: <strong className="text-secondary-900 dark:text-white">{booking.bookingReference.pnr}</strong></span>
            </div>
          </div>
          <div className="mt-6 lg:mt-0 flex items-center space-x-3">
            <span className={`px-6 py-3 rounded-full text-sm font-semibold ${getStatusColor(booking.bookingStatus)}`}>
              {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
            </span>
            {booking.checkInStatus.isCheckedIn && (
              <span className="px-6 py-3 rounded-full text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/30">
                Checked In
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Flight Information */}
      <div className="card-elevated p-8 mb-10">
        <h2 className="text-2xl font-bold mb-8 flex items-center text-secondary-900 dark:text-white">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4">
            <FiNavigation className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          Flight Information
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-8">
          <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-6">
            <h3 className="font-bold text-lg text-secondary-900 dark:text-white mb-6">Flight Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600 dark:text-secondary-400 font-medium">Flight:</span>
                <span className="font-bold text-lg text-secondary-900 dark:text-white">{booking.flight.airline.name} {booking.flight.flightNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600 dark:text-secondary-400 font-medium">Aircraft:</span>
                <span className="font-semibold text-secondary-900 dark:text-white">Boeing 737-800</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary-600 dark:text-secondary-400 font-medium">Status:</span>
                <span className="font-semibold text-secondary-900 dark:text-white capitalize">{booking.flight.status}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-6">
            <h3 className="font-bold text-lg text-secondary-900 dark:text-white mb-6">Route</h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <FiMapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="font-semibold text-secondary-900 dark:text-white">Departure</span>
                </div>
                <div className="ml-2">
                  <div className="font-bold text-xl text-secondary-900 dark:text-white">{booking.flight.route.departure.airport.code}</div>
                  <div className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">{booking.flight.route.departure.airport.name}</div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                    {formatDate(booking.flight.route.departure.time)} at {formatTime(booking.flight.route.departure.time)}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-success-100 dark:bg-success-900/30 rounded-lg">
                    <FiMapPin className="w-5 h-5 text-success-600 dark:text-success-400" />
                  </div>
                  <span className="font-semibold text-secondary-900 dark:text-white">Arrival</span>
                </div>
                <div className="ml-2">
                  <div className="font-bold text-xl text-secondary-900 dark:text-white">{booking.flight.route.arrival.airport.code}</div>
                  <div className="text-sm font-medium text-secondary-600 dark:text-secondary-300 mb-1">{booking.flight.route.arrival.airport.name}</div>
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                    {formatDate(booking.flight.route.arrival.time)} at {formatTime(booking.flight.route.arrival.time)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Information */}
      <div className="card-elevated p-8 mb-10">
        <h2 className="text-2xl font-bold mb-8 flex items-center text-secondary-900 dark:text-white">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4">
            <FiUser className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          Passenger Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="border border-secondary-200 dark:border-secondary-700 rounded-lg p-4 bg-secondary-50 dark:bg-secondary-800/50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-secondary-900 dark:text-white">
                    {passenger.title} {passenger.firstName} {passenger.lastName}
                  </h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-300">Passenger {index + 1}</p>
                </div>
                <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-2 py-1 rounded text-sm font-medium">
                  {passenger.seatNumber}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Class:</span>
                  <span className="ml-2 font-medium capitalize text-secondary-900 dark:text-white">{passenger.seatClass}</span>
                </div>
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Meal:</span>
                  <span className="ml-2 font-medium capitalize text-secondary-900 dark:text-white">
                    {passenger.mealPreference === 'none' ? 'Standard' : passenger.mealPreference}
                  </span>
                </div>
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Gender:</span>
                  <span className="ml-2 font-medium capitalize text-secondary-900 dark:text-white">{passenger.gender}</span>
                </div>
                <div>
                  <span className="text-secondary-600 dark:text-secondary-400">Age:</span>
                  <span className="ml-2 font-medium text-secondary-900 dark:text-white">
                    {new Date().getFullYear() - new Date(passenger.dateOfBirth).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
            {/* Contact Information */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center text-secondary-900 dark:text-white">
          <FiMail className="mr-2" />
          Contact Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Email Address
            </label>
            <p className="text-secondary-900 dark:text-white font-medium">{booking.contactDetails.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Phone Number
            </label>
            <p className="text-secondary-900 dark:text-white font-medium">{booking.contactDetails.phone}</p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 text-secondary-900 dark:text-white">Payment Information</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-secondary-600 dark:text-secondary-400">Base Price:</span>
            <span className="font-medium text-secondary-900 dark:text-white">${booking.pricing.basePrice}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary-600 dark:text-secondary-400">Taxes & Fees:</span>
            <span className="font-medium text-secondary-900 dark:text-white">${booking.pricing.taxes + booking.pricing.fees}</span>
          </div>
          <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-secondary-900 dark:text-white">Total Paid:</span>
              <span className="text-primary-600 dark:text-primary-400">${booking.pricing.totalAmount}</span>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600 dark:text-secondary-400">Payment Status:</span>
            <span className="font-medium text-green-600 dark:text-green-400">Completed</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-secondary-600 dark:text-secondary-400">Transaction ID:</span>
            <span className="font-medium text-secondary-900 dark:text-white">{booking.paymentDetails.transactionId}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6 text-secondary-900 dark:text-white">Actions</h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center space-x-2"
          >
            <FiDownload className="w-4 h-4" />
            <span>Download Ticket</span>
          </button>
          
          {canCheckIn() && (
            <button
              onClick={handleCheckIn}
              className="btn-success flex items-center space-x-2"
            >
              <FiCheck className="w-4 h-4" />
              <span>Check In</span>
            </button>
          )}
          
          {canCancel() && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="btn-danger flex items-center space-x-2"
            >
              <FiX className="w-4 h-4" />
              <span>Cancel Booking</span>
            </button>
          )}
          
          <button
            onClick={() => navigate('/my-bookings')}
            className="btn-secondary"
          >
            Back to My Bookings
          </button>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-secondary-900 dark:text-white">Cancel Booking</h3>
            <p className="text-secondary-600 dark:text-secondary-400 mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                Reason for cancellation:
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="Please provide a reason..."
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleCancelBooking}
                disabled={isCancelling || !cancelReason.trim()}
                className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="spinner"></div>
                    <span>Cancelling...</span>
                  </div>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-secondary flex-1"
                disabled={isCancelling}
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;