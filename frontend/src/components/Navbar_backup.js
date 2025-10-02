import { useState } from 'react';
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
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-2xl border-b border-secondary-200/60 dark:border-secondary-700/60 shadow-large">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Enhanced Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 group">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl md:rounded-2xl shadow-large group-hover:shadow-extra-large transition-all duration-300">
                  <FiNavigation className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <div className="absolute inset-0 bg-primary-500/30 dark:bg-primary-400/30 rounded-lg sm:rounded-xl md:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent tracking-tight">
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
              className="p-2 md:p-3 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100/80 dark:hover:bg-secondary-800/80 rounded-lg md:rounded-2xl transition-all duration-300 hover:scale-110 group"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <FiSun className="h-4 w-4 md:h-5 md:w-5 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <FiMoon className="h-4 w-4 md:h-5 md:w-5 group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {!isAuthenticated() ? (
              <div className="flex items-center space-x-2 md:space-x-3 ml-2 md:ml-4">
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="relative ml-2 md:ml-4">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 md:space-x-3 text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm md:text-base">{user?.username}</span>
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
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
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

        {/* Mobile Navigation - Improved Sidebar */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
              onClick={() => setIsMenuOpen(false)}
            ></div>
            
            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white/95 dark:bg-secondary-900/95 backdrop-blur-xl border-l border-secondary-200/50 dark:border-secondary-700/50 z-50 transform translate-x-0 transition-all duration-300 ease-out shadow-2xl md:hidden">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-3 border-b border-secondary-200/50 dark:border-secondary-700/50 bg-secondary-50/50 dark:bg-secondary-800/50">
                <div className="flex items-center space-x-2">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600 p-1.5 rounded-lg shadow-medium">
                    <FiNavigation className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-secondary-900 dark:text-white">SkyBooker</span>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">Flight Booking</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-lg transition-all duration-200"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex flex-col h-full overflow-y-auto">
                {/* Navigation Links */}
                <div className="flex-1 py-3">
                  <div className="space-y-1 px-3">
                    <Link 
                      to="/" 
                      className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>🏠 Home</span>
                    </Link>
                    <Link 
                      to="/flights/search" 
                      className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>🔍 Search Flights</span>
                    </Link>
                    
                    {isAuthenticated() && (
                      <Link 
                        to="/my-bookings" 
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>📋 My Bookings</span>
                      </Link>
                    )}

                    {isAdmin() && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-3 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span>⚙️ Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  {/* Theme Toggle */}
                  <div className="px-3 mt-4 pt-3 border-t border-secondary-200/50 dark:border-secondary-700/50">
                    <button
                      onClick={toggleTheme}
                      className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                    >
                      {isDark ? (
                        <>
                          <FiSun className="h-4 w-4 mr-2" />
                          <span>☀️ Light Mode</span>
                        </>
                      ) : (
                        <>
                          <FiMoon className="h-4 w-4 mr-2" />
                          <span>🌙 Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* User Section */}
                <div className="border-t border-secondary-200/50 dark:border-secondary-700/50 p-3 bg-secondary-50/30 dark:bg-secondary-800/30">
                  {!isAuthenticated() ? (
                    <div className="space-y-2">
                      <Link 
                        to="/login" 
                        className="block w-full text-center px-3 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        🔑 Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="block w-full text-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ✨ Sign Up
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* User Info */}
                      <div className="flex items-center space-x-2 px-3 py-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">{user?.username}</p>
                          <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{user?.email}</p>
                        </div>
                      </div>
                      
                      {/* Profile & Logout */}
                      <div className="space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-3 py-2 text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg transition-all duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <FiSettings className="mr-2 h-4 w-4" />
                          <span>👤 Profile Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm font-medium text-error-600 dark:text-error-400 hover:text-error-700 dark:hover:text-error-300 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-all duration-200"
                        >
                          <FiLogOut className="mr-2 h-4 w-4" />
                          <span>🚪 Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;