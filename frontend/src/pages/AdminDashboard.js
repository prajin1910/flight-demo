import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiCalendar,
    FiDollarSign,
    FiEdit2,
    FiEye,
    FiNavigation,
    FiPlus,
    FiRefreshCw,
    FiSearch,
    FiTrendingUp,
    FiUsers
} from 'react-icons/fi';
import { Navigate } from 'react-router-dom';
import AddFlightModal from '../components/AddFlightModal';
import BookingDetailsModal from '../components/BookingDetailsModal';
import EditFlightModal from '../components/EditFlightModal';
import FlightDetailsModal from '../components/FlightDetailsModal';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../utils/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Flights management state
  const [flights, setFlights] = useState([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsPagination, setFlightsPagination] = useState({});
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [showEditFlightModal, setShowEditFlightModal] = useState(false);
  const [showFlightDetailsModal, setShowFlightDetailsModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  // Bookings management state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsPagination, setBookingsPagination] = useState({});
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Users management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({});

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Helper function to safely render airport code
  const getAirportCode = (airport) => {
    if (!airport) return 'N/A';
    if (typeof airport === 'object') return airport.code || 'N/A';
    return airport;
  };

  // Helper function to safely render airport city
  const getAirportCity = (airport) => {
    if (!airport) return 'N/A';
    if (typeof airport === 'object') return airport.city || 'N/A';
    return 'N/A';
  };

  // Helper function to safely render airline name
  const getAirlineName = (airline) => {
    if (!airline) return 'N/A';
    if (typeof airline === 'object') return airline.name || 'N/A';
    return airline;
  };

  // Helper function to calculate passengers for a flight
  const getFlightPassengerCount = (flightId) => {
    const flightBookings = bookings.filter(booking => 
      booking.flight && 
      booking.flight._id === flightId &&
      booking.bookingStatus === 'confirmed'
    );
    return flightBookings.reduce((total, booking) => {
      // Count based on passengers array length or selectedSeats length, fallback to 1
      const passengerCount = booking.passengers?.length || booking.selectedSeats?.length || 1;
      return total + passengerCount;
    }, 0);
  };

  // Helper function to get total seats for a flight
  const getFlightTotalSeats = (flight) => {
    // Try multiple approaches to get total seats
    if (flight.aircraft?.totalSeats) {
      return flight.aircraft.totalSeats;
    }
    if (flight.seatMap?.seats?.length) {
      return flight.seatMap.seats.length;
    }
    // Calculate from pricing if available
    const economySeats = flight.pricing?.economy?.availableSeats || 0;
    const businessSeats = flight.pricing?.business?.availableSeats || 0;
    const firstClassSeats = flight.pricing?.firstClass?.availableSeats || 0;
    return economySeats + businessSeats + firstClassSeats;
  };

  // Helper function to get seats booked for a booking
  const getBookingSeatsCount = (booking) => {
    return booking.passengers?.length || booking.selectedSeats?.length || 1;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch flights
  const fetchFlights = useCallback(async (page = 1) => {
    setFlightsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;

      const [flightsResponse, bookingsResponse] = await Promise.all([
        adminAPI.getFlights(params),
        adminAPI.getBookings({ limit: 1000 }) // Get all bookings for accurate counting
      ]);

      console.log('Flights response:', flightsResponse.data); // Debug log
      setFlights(flightsResponse.data.flights);
      setFlightsPagination(flightsResponse.data.pagination);
      setBookings(bookingsResponse.data.bookings); // Store all bookings for counting
    } catch (error) {
      console.error('Error fetching flights:', error);
      toast.error('Failed to load flights');
    } finally {
      setFlightsLoading(false);
    }
  }, [searchTerm, filterStatus]);

  // Fetch bookings
  const fetchBookings = useCallback(async (page = 1) => {
    setBookingsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus) params.status = filterStatus;

      const response = await adminAPI.getBookings(params);
      console.log('Bookings response:', response.data); // Debug log
      setBookings(response.data.bookings);
      setBookingsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  }, [searchTerm, filterStatus]);

  // Fetch users
  const fetchUsers = useCallback(async (page = 1) => {
    setUsersLoading(true);
    try {
      const params = { page, limit: 10 };
      if (searchTerm) params.search = searchTerm;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    if (activeTab === 'flights') {
      fetchFlights();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchFlights, fetchBookings, fetchUsers]);

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const { dashboard } = response.data;
      
      console.log('Dashboard data:', dashboard); // Debug log
      
      setStats(dashboard.stats);
      setRecentBookings(dashboard.recentBookings);
      setRecentUsers(dashboard.recentUsers || []); // Use recentUsers from dashboard
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
    setFilterStatus('');
  };

  // Search handler with debounce
  const handleSearch = (term) => {
    setSearchTerm(term);
    setTimeout(() => {
      if (activeTab === 'flights') fetchFlights();
      else if (activeTab === 'bookings') fetchBookings();
      else if (activeTab === 'users') fetchUsers();
    }, 500);
  };

  // Toggle user status
  const toggleUserStatus = async (userId) => {
    try {
      const response = await adminAPI.toggleUserStatus(userId);
      toast.success(response.data.message);
      fetchUsers(); // Refresh users list
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle add flight
  const handleAddFlight = async (flightData) => {
    try {
      await adminAPI.createFlight(flightData);
      toast.success('Flight added successfully');
      setShowAddFlightModal(false);
      if (activeTab === 'flights') {
        fetchFlights(); // Refresh flights list
      }
    } catch (error) {
      console.error('Error adding flight:', error);
      toast.error('Failed to add flight');
    }
  };

  // Handle view flight
  const handleViewFlight = async (flightId) => {
    const flight = flights.find(f => f._id === flightId);
    if (flight) {
      // Fetch all bookings to ensure we have complete data for the flight
      try {
        const response = await adminAPI.getBookings({ limit: 1000 }); // Get more bookings
        setBookings(response.data.bookings);
      } catch (error) {
        console.error('Error fetching all bookings:', error);
      }
      
      setSelectedFlight(flight);
      setShowFlightDetailsModal(true);
    } else {
      toast.error('Flight not found');
    }
  };

  // Handle edit flight
  const handleEditFlight = async (flightId) => {
    try {
      const flight = flights.find(f => f._id === flightId);
      if (flight) {
        setSelectedFlight(flight);
        setShowEditFlightModal(true);
      } else {
        toast.error('Flight not found');
      }
    } catch (error) {
      console.error('Error editing flight:', error);
      toast.error('Failed to edit flight');
    }
  };

  // Handle update flight
  const handleUpdateFlight = async (flightId, flightData) => {
    try {
      await adminAPI.updateFlight(flightId, flightData);
      toast.success('Flight updated successfully');
      setShowEditFlightModal(false);
      setSelectedFlight(null);
      if (activeTab === 'flights') {
        fetchFlights(); // Refresh flights list
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      toast.error('Failed to update flight');
      throw error; // Re-throw to handle in modal
    }
  };

  // Handle view booking
  const handleViewBooking = (bookingId) => {
    const booking = bookings.find(b => b._id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowBookingDetailsModal(true);
    } else {
      toast.error('Booking not found');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-7 md:mb-6 lg:mb-7">
        <h1 className="text-2xl sm:text-3xl md:text-2xl lg:text-3xl font-bold text-secondary-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-secondary-600 dark:text-secondary-300">Manage your flight booking system</p>
      </div>

      {/* Navigation Tabs */}
      <div className="card mb-6 sm:mb-7 md:mb-6 lg:mb-7">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-3 sm:px-6 sm:py-4 md:px-5 md:py-3 lg:px-6 lg:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange('flights')}
            className={`px-4 py-3 sm:px-6 sm:py-4 md:px-5 md:py-3 lg:px-6 lg:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'flights'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Flights
          </button>
          <button
            onClick={() => handleTabChange('bookings')}
            className={`px-4 py-3 sm:px-6 sm:py-4 md:px-5 md:py-3 lg:px-6 lg:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'bookings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`px-4 py-3 sm:px-6 sm:py-4 md:px-5 md:py-3 lg:px-6 lg:py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
            }`}
          >
            Users
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 sm:space-y-7 md:space-y-6 lg:space-y-7">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-4 lg:gap-5">
            <div className="card p-4 sm:p-5 md:p-4 lg:p-5">
              <div className="flex items-center">
                <div className="p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3 sm:ml-4 md:ml-3 lg:ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Users</p>
                  <p className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{stats?.users?.total || 0}</p>
                  <div className="flex items-center mt-1">
                    <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
                    <span className="text-xs sm:text-sm md:text-xs lg:text-sm text-green-500">+{stats?.users?.thisMonth || 0} this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-5 md:p-4 lg:p-5">
              <div className="flex items-center">
                <div className="p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <FiNavigation className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-3 sm:ml-4 md:ml-3 lg:ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Flights</p>
                  <p className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{stats?.flights?.total || 0}</p>
                  <div className="flex items-center mt-1">
                    <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
                    <span className="text-xs sm:text-sm md:text-xs lg:text-sm text-green-500">{stats?.flights?.active || 0} active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-5 md:p-4 lg:p-5">
              <div className="flex items-center">
                <div className="p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-3 sm:ml-4 md:ml-3 lg:ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Bookings</p>
                  <p className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{stats?.bookings?.total || 0}</p>
                  <div className="flex items-center mt-1">
                    <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
                    <span className="text-xs sm:text-sm md:text-xs lg:text-sm text-green-500">+{stats?.bookings?.thisMonth || 0} this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-5 md:p-4 lg:p-5">
              <div className="flex items-center">
                <div className="p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-3 sm:ml-4 md:ml-3 lg:ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Passengers</p>
                  <p className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold text-secondary-900 dark:text-white">{stats?.passengers?.total || 0}</p>
                  <div className="flex items-center mt-1">
                    <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-3 md:h-3 lg:w-4 lg:h-4 text-green-500 mr-1" />
                    <span className="text-xs sm:text-sm md:text-xs lg:text-sm text-green-500">+{stats?.passengers?.thisMonth || 0} this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4 sm:p-5 md:p-4 lg:p-5">
              <div className="flex items-center">
                <div className="p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <FiDollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-secondary-900 dark:text-white">{formatCurrency(stats?.revenue?.total || 0)}</p>
                  <div className="flex items-center mt-1">
                    <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">{formatCurrency(stats?.revenue?.thisMonth || 0)} this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Bookings */}
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Bookings</h2>
                  <button
                    onClick={() => handleTabChange('bookings')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {recentBookings.length === 0 ? (
                  <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No recent bookings</p>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.slice(0, 5).map((booking) => {
                      // Safety check for booking data
                      if (!booking || !booking.flight) {
                        return null;
                      }
                      
                      return (
                        <div key={booking._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-secondary-900 dark:text-white">{booking.bookingId}</p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">
                              {getAirportCode(booking.flight?.route?.departure?.airport)} → {getAirportCode(booking.flight?.route?.arrival?.airport)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-secondary-900 dark:text-white">{formatCurrency(booking.pricing?.totalAmount || 0)}</p>
                            <p className="text-sm text-secondary-500 dark:text-secondary-400">{formatDate(booking.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="card">
              <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Recent Users</h2>
                  <button
                    onClick={() => handleTabChange('users')}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {recentUsers.length === 0 ? (
                  <p className="text-secondary-500 dark:text-secondary-400 text-center py-4">No recent users</p>
                ) : (
                  <div className="space-y-4">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {user.profile?.firstName?.charAt(0) || user.username.charAt(0)}
                              {user.profile?.lastName?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {user.profile?.firstName && user.profile?.lastName 
                                ? `${user.profile.firstName} ${user.profile.lastName}` 
                                : user.username}
                            </p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flights Tab */}
      {activeTab === 'flights' && (
        <div className="space-y-6">
          {/* Search and Add Flight */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search flights..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input-large"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-large"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddFlightModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Flight</span>
              </button>
            </div>
          </div>

          {/* Flights Table */}
          <div className="card">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Flights Management</h2>
            </div>
            <div className="overflow-x-auto">
              {flightsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : flights.length === 0 ? (
                <div className="text-center py-12">
                  <FiNavigation className="w-12 h-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
                  <p className="text-secondary-500 dark:text-secondary-400">No flights found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Flight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Passengers/Seats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {flights.map((flight) => {
                      // Safety check for flight data
                      if (!flight || !flight.route) {
                        return null;
                      }
                      
                      return (
                        <tr key={flight._id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">{flight.flightNumber}</p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {getAirlineName(flight.airline)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {getAirportCode(flight.route?.departure?.airport)} → {getAirportCode(flight.route?.arrival?.airport)}
                              </p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {getAirportCity(flight.route?.departure?.airport)} → {getAirportCity(flight.route?.arrival?.airport)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm text-secondary-900 dark:text-white">
                                {flight.route?.departure?.time ? new Date(flight.route.departure.time).toLocaleDateString() : 'N/A'}
                              </p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {flight.route?.departure?.time && flight.route?.arrival?.time ? (
                                  <>
                                    {new Date(flight.route.departure.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                    {new Date(flight.route.arrival.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </>
                                ) : 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="text-sm font-medium text-secondary-900 dark:text-white">
                                {getFlightPassengerCount(flight._id)} / {getFlightTotalSeats(flight)}
                              </p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {getFlightTotalSeats(flight) > 0 ? 
                                  `${((getFlightPassengerCount(flight._id) / getFlightTotalSeats(flight)) * 100).toFixed(1)}% occupied` : 
                                  'No seats configured'
                                }
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-medium text-secondary-900 dark:text-white">
                              {formatCurrency(flight.pricing?.economy?.price || 0)}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              flight.status === 'scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' :
                              flight.status === 'boarding' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              flight.status === 'departed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              flight.status === 'arrived' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {flight.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewFlight(flight._id)}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                title="View Flight Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditFlight(flight._id)}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                title="Edit Flight"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {flightsPagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    Showing {(flightsPagination.currentPage - 1) * 10 + 1} to{' '}
                    {Math.min(flightsPagination.currentPage * 10, flightsPagination.totalFlights)} of{' '}
                    {flightsPagination.totalFlights} flights
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchFlights(flightsPagination.currentPage - 1)}
                      disabled={flightsPagination.currentPage === 1}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded">
                      {flightsPagination.currentPage}
                    </span>
                    <button
                      onClick={() => fetchFlights(flightsPagination.currentPage + 1)}
                      disabled={flightsPagination.currentPage === flightsPagination.totalPages}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input-large"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-large"
                >
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="card">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Bookings Management</h2>
            </div>
            <div className="overflow-x-auto">
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FiCalendar className="w-12 h-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
                  <p className="text-secondary-500 dark:text-secondary-400">No bookings found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Passenger
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Flight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Seats Booked
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {bookings.map((booking) => {
                      // Safety check for booking data
                      if (!booking || !booking.flight || !booking.user) {
                        return null;
                      }
                      
                      return (
                        <tr key={booking._id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">{booking.bookingId}</p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">PNR: {booking.bookingReference?.pnr || 'N/A'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">{booking.user.username}</p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">{booking.user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">{booking.flight.flightNumber}</p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {getAirlineName(booking.flight.airline)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {getAirportCode(booking.flight?.route?.departure?.airport)} → {getAirportCode(booking.flight?.route?.arrival?.airport)}
                              </p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {booking.flight?.route?.departure?.time ? new Date(booking.flight.route.departure.time).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-secondary-900 dark:text-white">
                                {getBookingSeatsCount(booking)} seat{getBookingSeatsCount(booking) !== 1 ? 's' : ''}
                              </p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {booking.selectedSeats?.join(', ') || `${getBookingSeatsCount(booking)} passenger${getBookingSeatsCount(booking) !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="font-medium text-secondary-900 dark:text-white">
                              {formatCurrency(booking.pricing?.totalAmount || 0)}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                              booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                              'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            }`}>
                              {booking.bookingStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-secondary-900 dark:text-white">{formatDate(booking.createdAt)}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewBooking(booking._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Booking Details"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {bookingsPagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    Showing {(bookingsPagination.currentPage - 1) * 10 + 1} to{' '}
                    {Math.min(bookingsPagination.currentPage * 10, bookingsPagination.totalBookings)} of{' '}
                    {bookingsPagination.totalBookings} bookings
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchBookings(bookingsPagination.currentPage - 1)}
                      disabled={bookingsPagination.currentPage === 1}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded">
                      {bookingsPagination.currentPage}
                    </span>
                    <button
                      onClick={() => fetchBookings(bookingsPagination.currentPage + 1)}
                      disabled={bookingsPagination.currentPage === bookingsPagination.totalPages}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="card p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-secondary-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-large"
                />
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card">
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Users Management</h2>
            </div>
            <div className="overflow-x-auto">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <FiUsers className="w-12 h-12 text-secondary-400 dark:text-secondary-500 mx-auto mb-4" />
                  <p className="text-secondary-500 dark:text-secondary-400">No users found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-secondary-50 dark:bg-secondary-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {user.profile?.firstName?.charAt(0) || user.username.charAt(0)}
                                {user.profile?.lastName?.charAt(0) || ''}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-secondary-900 dark:text-white">{user.username}</p>
                              <p className="text-sm text-secondary-600 dark:text-secondary-300">
                                {user.profile?.firstName} {user.profile?.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-secondary-900 dark:text-white">{user.email}</p>
                            <p className="text-sm text-secondary-600 dark:text-secondary-300">{user.profile?.phone || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm text-secondary-900 dark:text-white">{formatDate(user.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => toggleUserStatus(user._id)}
                              className={`text-sm px-3 py-1 rounded ${
                                user.isActive 
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {usersPagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-secondary-200 dark:border-secondary-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary-700 dark:text-secondary-300">
                    Showing {(usersPagination.currentPage - 1) * 10 + 1} to{' '}
                    {Math.min(usersPagination.currentPage * 10, usersPagination.totalUsers)} of{' '}
                    {usersPagination.totalUsers} users
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => fetchUsers(usersPagination.currentPage - 1)}
                      disabled={usersPagination.currentPage === 1}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      Page {usersPagination.currentPage} of {usersPagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchUsers(usersPagination.currentPage + 1)}
                      disabled={usersPagination.currentPage === usersPagination.totalPages}
                      className="btn-secondary px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Flight Modal */}
      {showAddFlightModal && <AddFlightModal onClose={() => setShowAddFlightModal(false)} onAdd={handleAddFlight} />}

      {/* Edit Flight Modal */}
      {showEditFlightModal && selectedFlight && (
        <EditFlightModal 
          flight={selectedFlight} 
          onClose={() => {
            setShowEditFlightModal(false);
            setSelectedFlight(null);
          }} 
          onUpdate={handleUpdateFlight}
        />
      )}

      {/* Flight Details Modal */}
      {showFlightDetailsModal && selectedFlight && (
        <FlightDetailsModal 
          flight={selectedFlight} 
          bookings={bookings}
          onClose={() => {
            setShowFlightDetailsModal(false);
            setSelectedFlight(null);
          }} 
        />
      )}

      {/* Booking Details Modal */}
      {showBookingDetailsModal && selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => {
            setShowBookingDetailsModal(false);
            setSelectedBooking(null);
          }} 
        />
      )}

      {/* Quick Actions */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTabChange('flights')}
            className="btn-secondary flex items-center justify-center space-x-2 p-4"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add New Flight</span>
          </button>
          
          <button
            onClick={fetchDashboardData}
            className="btn-secondary flex items-center justify-center space-x-2 p-4"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Refresh Data</span>
          </button>
          
          <button
            onClick={() => handleTabChange('bookings')}
            className="btn-secondary flex items-center justify-center space-x-2 p-4"
          >
            <FiEye className="w-5 h-5" />
            <span>View All Bookings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;