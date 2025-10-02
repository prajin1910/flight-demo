import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiLogOut, FiMenu, FiMoon, FiNavigation, FiSettings, FiSun, FiX } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const toggleMenu = () => {
    console.log('Toggle menu clicked, current state:', isMenuOpen);
    setIsMenuOpen(!isMenuOpen);
    console.log('New state will be:', !isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className="sticky top-0 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-2xl border-b border-secondary-200/60 dark:border-secondary-700/60 shadow-large" style={{ zIndex: 1000 }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18 lg:h-16">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 md:space-x-3 lg:space-x-3 group">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 p-2 sm:p-2.5 md:p-2.5 lg:p-2.5 rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg shadow-large group-hover:shadow-extra-large transition-all duration-300">
                  <FiNavigation className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-5 lg:w-5 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <div className="absolute inset-0 bg-primary-500/30 dark:bg-primary-400/30 rounded-lg sm:rounded-xl md:rounded-lg lg:rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl md:text-xl lg:text-xl font-bold bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent tracking-tight">
                  SkyBooker
                </span>
                <span className="hidden sm:block text-xs text-secondary-500 dark:text-secondary-400 font-medium tracking-wider uppercase">
                  Professional Flight Booking
                </span>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className="nav-link group relative">
              <span>Home</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link to="/flights/search" className="nav-link group relative">
              <span>Search Flights</span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
            
            {isAuthenticated() && (
              <Link to="/my-bookings" className="nav-link group relative">
                <span>My Bookings</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
            )}

            {isAdmin() && (
              <Link to="/admin" className="nav-link group relative">
                <span>Admin Panel</span>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
            )}

            {/* Enhanced Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2 lg:p-2 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100/80 dark:hover:bg-secondary-800/80 rounded-lg md:rounded-lg lg:rounded-lg transition-all duration-300 hover:scale-110 group"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <FiSun className="h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <FiMoon className="h-4 w-4 md:h-4 md:w-4 lg:h-4 lg:w-4 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {!isAuthenticated() ? (
              <div className="flex items-center space-x-2 md:space-x-2 lg:space-x-2 ml-2 md:ml-3 lg:ml-3">
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative ml-2 md:ml-3 lg:ml-3">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 md:space-x-2 lg:space-x-2 text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1.5 md:px-2 md:py-1.5 lg:px-2 lg:py-1.5 rounded-lg md:rounded-lg lg:rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
                >
                  <div className="w-6 h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm lg:text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm md:text-sm lg:text-sm">{user?.username}</span>
                </button>

                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-secondary-900 rounded-xl shadow-large border border-secondary-200 dark:border-secondary-700 py-2 z-20 animate-fade-in-down">
                      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-secondary-200 dark:border-secondary-700">
                        <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">{user?.username}</p>
                        <p className="text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-3 sm:px-4 py-2 sm:py-3 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FiSettings className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 sm:px-4 py-2 sm:py-3 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors duration-200"
                      >
                        <FiLogOut className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-1 sm:space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
            >
              {isDark ? <FiSun className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiMoon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            
            <button
              onClick={toggleMenu}
              className="p-1.5 sm:p-2 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMenuOpen ? <FiX className="h-5 w-5 sm:h-6 sm:w-6" /> : <FiMenu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Portal Version */}
        {isMenuOpen && createPortal(
          <div 
            className="lg:hidden fixed inset-0" 
            style={{ 
              zIndex: 999999,
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              style={{ 
                zIndex: 999998,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <div 
              className="absolute top-0 left-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
              style={{ 
                zIndex: 999999,
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100vh',
                maxHeight: '100vh'
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <FiNavigation className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">SkyBooker</span>
                    <p className="text-xs text-gray-500">Flight Booking</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* User Profile */}
                {isAuthenticated() && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{user?.username}</h3>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <Link 
                    to="/" 
                    className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">🏠</span>
                    Home
                  </Link>
                  
                  <Link 
                    to="/flights/search" 
                    className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="mr-3">✈️</span>
                    Search Flights
                  </Link>
                  
                  {isAuthenticated() && (
                    <Link 
                      to="/my-bookings" 
                      className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">📋</span>
                      My Bookings
                    </Link>
                  )}

                  {isAdmin() && (
                    <Link 
                      to="/admin" 
                      className="flex items-center px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mr-3">⚙️</span>
                      Admin Panel
                    </Link>
                  )}
                </nav>

                {/* Auth Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {!isAuthenticated() ? (
                    <div className="space-y-2">
                      <Link 
                        to="/login" 
                        className="block w-full text-center px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/register" 
                        className="block w-full text-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiLogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </nav>
  );
};

export default Navbar;