import { useEffect, useState } from 'react';
import { FiCalendar, FiCheck, FiDownload, FiHome, FiMail, FiMapPin, FiNavigation, FiUser } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  const { booking } = location.state || {};

  useEffect(() => {
    if (!booking) {
      navigate('/');
      return;
    }

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [booking, navigate]);

  if (!booking) {
    return null;
  }

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

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full mb-6">
            <FiCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Your flight has been successfully booked
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Confirmation details have been sent to your email
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {booking.flight.airline.name} - {booking.flight.flightNumber}
                </h2>
                <div className="flex items-center space-x-4 text-primary-100">
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-4 h-4" />
                    <span>
                      {booking.flight.route.departure.airport.code} → {booking.flight.route.arrival.airport.code}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(booking.flight.route.departure.time)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <div className="text-3xl font-bold">{booking.bookingId}</div>
                <div className="text-primary-100">Booking Reference</div>
              </div>
            </div>
          </div>

          {/* Flight Information */}
          <div className="p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Departure */}
              <div className="text-center lg:text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center lg:justify-start">
                  <FiNavigation className="mr-2 transform -rotate-45" />
                  Departure
                </h3>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatTime(booking.flight.route.departure.time)}
                  </div>
                  <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {booking.flight.route.departure.airport.code} - {booking.flight.route.departure.airport.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {booking.flight.route.departure.airport.city}, {booking.flight.route.departure.airport.country}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(booking.flight.route.departure.time)}
                  </div>
                  {booking.flight.route.departure.terminal && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Terminal {booking.flight.route.departure.terminal}
                    </div>
                  )}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center lg:text-right">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center lg:justify-end">
                  <FiNavigation className="mr-2 transform rotate-45" />
                  Arrival
                </h3>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatTime(booking.flight.route.arrival.time)}
                  </div>
                  <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {booking.flight.route.arrival.airport.code} - {booking.flight.route.arrival.airport.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {booking.flight.route.arrival.airport.city}, {booking.flight.route.arrival.airport.country}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(booking.flight.route.arrival.time)}
                  </div>
                  {booking.flight.route.arrival.terminal && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Terminal {booking.flight.route.arrival.terminal}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div className="border-t dark:border-gray-600 pt-8 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <FiUser className="mr-2" />
                Passenger Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {booking.passengers.map((passenger, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-lg">
                          {passenger.title} {passenger.firstName} {passenger.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Passenger {index + 1}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-4 py-2 rounded-full text-sm font-medium">
                          Seat {passenger.seatNumber}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white dark:bg-gray-600 p-3 rounded-md">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Class:</span>
                        <span className="font-medium capitalize text-gray-900 dark:text-white">{passenger.seatClass}</span>
                      </div>
                      <div className="bg-white dark:bg-gray-600 p-3 rounded-md">
                        <span className="text-gray-600 dark:text-gray-400 block mb-1">Meal:</span>
                        <span className="font-medium capitalize text-gray-900 dark:text-white">
                          {passenger.mealPreference === 'none' ? 'Standard' : passenger.mealPreference}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            {booking.contactDetails && (
              <div className="border-t dark:border-gray-600 pt-8 mb-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FiMail className="mr-2" />
                  Contact Information
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {booking.contactDetails.phone && (
                      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">📞 Phone</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-white">
                          {booking.contactDetails.phone}
                        </div>
                      </div>
                    )}
                    {booking.contactDetails.email && (
                      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">✉️ Email</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white break-all">
                          {booking.contactDetails.email}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Booking Summary */}
            <div className="border-t dark:border-gray-600 pt-8 mb-8">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">{booking.bookingId}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Booking ID</div>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">{booking.bookingReference.pnr}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">PNR</div>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">${booking.pricing.totalAmount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Paid</div>
                  </div>
                  <div className="bg-white dark:bg-gray-600 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {booking.passengers.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Passenger{booking.passengers.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-8 mx-2">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-4 text-lg">Important Information</h3>
              <ul className="space-y-3 text-sm text-yellow-700 dark:text-yellow-200">
                <li className="flex items-start">
                  <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
                  <span>Please arrive at the airport at least 2 hours before domestic flights and 3 hours before international flights</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
                  <span>Online check-in will be available 24 hours before departure</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
                  <span>Ensure all passengers carry valid identification documents</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
                  <span>Booking confirmation and boarding pass QR code have been sent to your email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-600 dark:text-yellow-400 mr-2">•</span>
                  <span>For any changes or cancellations, contact customer support or visit your bookings page</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mx-2">
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleDownloadTicket}
              className="btn-primary px-10 py-4 flex items-center space-x-3 text-lg font-medium w-full sm:w-auto"
            >
              <FiDownload className="w-5 h-5" />
              <span>Download Ticket</span>
            </button>
            
            <Link
              to={`/booking/${booking._id}`}
              className="btn-secondary px-10 py-4 flex items-center space-x-3 text-lg font-medium w-full sm:w-auto"
            >
              <FiMail className="w-5 h-5" />
              <span>View Details</span>
            </Link>
            
            <Link
              to="/my-bookings"
              className="btn-secondary px-10 py-4 flex items-center space-x-3 text-lg font-medium w-full sm:w-auto"
            >
              <FiUser className="w-5 h-5" />
              <span>My Bookings</span>
            </Link>
            
            <Link
              to="/"
              className="btn-secondary px-10 py-4 flex items-center space-x-3 text-lg font-medium w-full sm:w-auto"
            >
              <FiHome className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center mt-12 px-4">
          <p className="text-gray-600 dark:text-gray-300 mb-3 text-lg">
            Thank you for choosing SkyBooker! Have a wonderful journey.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact our 24/7 customer support at support@skyBooker.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;