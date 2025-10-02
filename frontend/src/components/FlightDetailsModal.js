import { FiCalendar, FiClock, FiDollarSign, FiInfo, FiMapPin, FiUsers, FiX } from 'react-icons/fi';

const FlightDetailsModal = ({ flight, onClose, bookings = [] }) => {
  if (!flight) return null;

  // Calculate passenger statistics
  const flightBookings = bookings.filter(booking => 
    booking.flight && 
    (booking.flight._id === flight._id || booking.flight.flightNumber === flight.flightNumber)
  );
  
  const totalPassengers = flightBookings.reduce((total, booking) => {
    return total + (booking.passengers?.length || 1);
  }, 0);

  const totalSeats = flight.seatMap?.seats?.length || 0;
  const availableSeats = totalSeats - totalPassengers;
  const occupancyRate = totalSeats > 0 ? ((totalPassengers / totalSeats) * 100).toFixed(1) : 0;

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

  const departureInfo = formatDateTime(flight.route?.departure?.time);
  const arrivalInfo = formatDateTime(flight.route?.arrival?.time);

  // Calculate flight duration
  const calculateDuration = () => {
    if (!flight.route?.departure?.time || !flight.route?.arrival?.time) return 'N/A';
    const departure = new Date(flight.route.departure.time);
    const arrival = new Date(flight.route.arrival.time);
    const diffMs = arrival - departure;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Flight {flight.flightNumber}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                {getAirlineName(flight.airline)}
              </p>
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
          {/* Flight Route */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Departure */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <FiMapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Departure</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {getAirportCode(flight.route?.departure?.airport)}
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  {getAirportName(flight.route?.departure?.airport)}
                </p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 mt-3">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{departureInfo.date}</span>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <FiClock className="w-4 h-4 mr-2" />
                  <span className="text-xl font-semibold">{departureInfo.time}</span>
                </div>
              </div>
            </div>

            {/* Flight Duration */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 flex flex-col items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Flight Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{calculateDuration()}</p>
                <div className="mt-4 w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Arrival */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <FiMapPin className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Arrival</h3>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {getAirportCode(flight.route?.arrival?.airport)}
                </p>
                <p className="text-green-700 dark:text-green-300">
                  {getAirportName(flight.route?.arrival?.airport)}
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400 mt-3">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">{arrivalInfo.date}</span>
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <FiClock className="w-4 h-4 mr-2" />
                  <span className="text-xl font-semibold">{arrivalInfo.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Passengers */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Passengers</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{totalPassengers}</p>
                </div>
                <FiUsers className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            {/* Available Seats */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Available Seats</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{availableSeats}</p>
                </div>
                <FiInfo className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-teal-900 dark:text-teal-100">{occupancyRate}%</p>
                </div>
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Flight Status */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Status</p>
                  <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100 capitalize">
                    {flight.status || 'Scheduled'}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full ${
                  flight.status === 'scheduled' ? 'bg-blue-500' :
                  flight.status === 'boarding' ? 'bg-yellow-500' :
                  flight.status === 'departed' ? 'bg-green-500' :
                  flight.status === 'arrived' ? 'bg-purple-500' :
                  'bg-red-500'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FiDollarSign className="w-5 h-5 mr-2" />
              Pricing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {flight.pricing?.economy && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Economy Class</h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(flight.pricing.economy.price)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flight.pricing.economy.availableSeats || 0} seats available
                  </p>
                </div>
              )}
              {flight.pricing?.business && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Business Class</h4>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(flight.pricing.business.price)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flight.pricing.business.availableSeats || 0} seats available
                  </p>
                </div>
              )}
              {flight.pricing?.firstClass && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white">First Class</h4>
                  <p className="text-2xl font-bold text-gold-600 dark:text-yellow-400">
                    {formatCurrency(flight.pricing.firstClass.price)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {flight.pricing.firstClass.availableSeats || 0} seats available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bookings for this Flight */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Bookings ({flightBookings.length})
            </h3>
            {flightBookings.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No bookings for this flight yet.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {flightBookings.map((booking) => (
                  <div key={booking._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.bookingId}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {booking.user?.username || 'N/A'} • {booking.passengers?.length || 1} passenger(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(booking.pricing?.totalAmount || 0)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default FlightDetailsModal;