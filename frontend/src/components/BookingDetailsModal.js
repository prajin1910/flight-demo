import { FiCalendar, FiClock, FiCreditCard, FiDollarSign, FiInfo, FiMail, FiMapPin, FiPhone, FiUser, FiUsers, FiX } from 'react-icons/fi';

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null;

  // Helper functions
  const getAirportCode = (airport) => {
    if (!airport) return 'N/A';
    if (typeof airport === 'object') return airport.code || 'N/A';
    return airport;
  };

  const getAirportName = (airport) => {
    if (!airport) return 'N/A';
    if (typeof airport === 'object') return airport.name || airport.city || 'N/A';
    return 'N/A';
  };

  const getAirlineName = (airline) => {
    if (!airline) return 'N/A';
    if (typeof airline === 'object') return airline.name || 'N/A';
    return airline;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const departureInfo = formatDateTime(booking.flight?.route?.departure?.time);
  const arrivalInfo = formatDateTime(booking.flight?.route?.arrival?.time);
  const bookingDate = formatDateTime(booking.createdAt);

  // Calculate flight duration
  const calculateDuration = () => {
    if (!booking.flight?.route?.departure?.time || !booking.flight?.route?.arrival?.time) return 'N/A';
    const departure = new Date(booking.flight.route.departure.time);
    const arrival = new Date(booking.flight.route.arrival.time);
    const diffMs = arrival - departure;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Get booking status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const seatsBooked = booking.passengers?.length || booking.selectedSeats?.length || 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Booking {booking.bookingId}
              </h2>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus}
                </span>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  PNR: {booking.bookingReference?.pnr || 'N/A'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Customer Information */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Username</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {booking.user?.username || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Email</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                  <FiMail className="w-4 h-4 mr-2" />
                  {booking.user?.email || 'N/A'}
                </p>
              </div>
              {booking.user?.profile?.phone && (
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Phone</p>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {booking.user.profile.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Flight Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2" />
              Flight Information
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Flight Details */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Flight Details</h4>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-primary-600">{booking.flight?.flightNumber || 'N/A'}</p>
                  <p className="text-gray-600 dark:text-gray-300">{getAirlineName(booking.flight?.airline)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {calculateDuration()}</p>
                </div>
              </div>

              {/* Departure */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Departure</h4>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-green-600">
                    {getAirportCode(booking.flight?.route?.departure?.airport)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {getAirportName(booking.flight?.route?.departure?.airport)}
                  </p>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    <span>{departureInfo.date}</span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiClock className="w-4 h-4 mr-1" />
                    <span className="font-semibold">{departureInfo.time}</span>
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Arrival</h4>
                <div className="space-y-2">
                  <p className="text-xl font-bold text-orange-600">
                    {getAirportCode(booking.flight?.route?.arrival?.airport)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {getAirportName(booking.flight?.route?.arrival?.airport)}
                  </p>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <FiCalendar className="w-4 h-4 mr-1" />
                    <span>{arrivalInfo.date}</span>
                  </div>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiClock className="w-4 h-4 mr-1" />
                    <span className="font-semibold">{arrivalInfo.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Seats Booked */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Seats Booked</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{seatsBooked}</p>
                </div>
                <FiUsers className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Amount</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(booking.pricing?.totalAmount || 0)}
                  </p>
                </div>
                <FiDollarSign className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Booking Date */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Booking Date</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                    {bookingDate.date.split(',')[0]}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">{bookingDate.time}</p>
                </div>
                <FiCalendar className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Payment</p>
                  <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                    {booking.paymentStatus || 'Completed'}
                  </p>
                </div>
                <FiCreditCard className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </div>

          {/* Passengers Information */}
          {booking.passengers && booking.passengers.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiUsers className="w-5 h-5 mr-2" />
                Passengers ({booking.passengers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {booking.passengers.map((passenger, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Passenger {index + 1}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-300">
                        <span className="font-medium">Name:</span> {passenger.firstName} {passenger.lastName}
                      </p>
                      {passenger.email && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Email:</span> {passenger.email}
                        </p>
                      )}
                      {passenger.phone && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Phone:</span> {passenger.phone}
                        </p>
                      )}
                      {passenger.seatNumber && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Seat:</span> {passenger.seatNumber}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Seats */}
          {booking.selectedSeats && booking.selectedSeats.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiInfo className="w-5 h-5 mr-2" />
                Selected Seats
              </h3>
              <div className="flex flex-wrap gap-2">
                {booking.selectedSeats.map((seat, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-1 text-sm font-semibold rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          {booking.pricing && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FiDollarSign className="w-5 h-5 mr-2" />
                Pricing Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {booking.pricing.basePrice && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Base Price</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(booking.pricing.basePrice)}
                    </p>
                  </div>
                )}
                {booking.pricing.taxes && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxes & Fees</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(booking.pricing.taxes)}
                    </p>
                  </div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400">Total Amount</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {formatCurrency(booking.pricing.totalAmount || 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;