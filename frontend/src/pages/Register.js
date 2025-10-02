import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLock, FiMail, FiNavigation, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return false;
    }

    if (formData.username.length < 3) {
      toast.error('Username must be at least 3 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        toast.success(`Welcome to SkyBooker, ${result.user.username}!`);
        navigate('/');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative">
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950/30"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-transparent to-secondary-600/5 dark:from-primary-500/10 dark:via-transparent dark:to-secondary-500/10"></div>
      
      {/* Floating elements */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-56 lg:h-56 bg-primary-400/10 dark:bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-72 lg:h-72 bg-secondary-400/10 dark:bg-secondary-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative max-w-md w-full">
        <div className="card-elevated bg-white/90 dark:bg-secondary-900/90 backdrop-blur-2xl p-6 sm:p-8 md:p-6 lg:p-7 border-2 border-white/20 dark:border-secondary-700/30">
          <div className="text-center mb-5 sm:mb-6 md:mb-5 lg:mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-xl shadow-large">
                <FiNavigation className="h-7 w-7 sm:h-8 sm:w-8 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold mb-2 bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
              Create your account
            </h2>
            <p className="text-xs sm:text-sm md:text-xs lg:text-sm text-secondary-600 dark:text-secondary-300">
              Or{' '}
              <Link 
                to="/login" 
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                sign in to your existing account
              </Link>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs sm:text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">
                  <FiUser className="inline w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter your username"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-4 w-4 text-secondary-400 dark:text-secondary-500" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">
                  <FiMail className="inline w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-4 w-4 text-secondary-400 dark:text-secondary-500" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">
                  <FiLock className="inline w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-secondary-400 dark:text-secondary-500" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                    onClick={() => togglePasswordVisibility('password')}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300" />
                    ) : (
                      <FiEye className="h-4 w-4 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">
                  <FiLock className="inline w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-field pl-10 pr-10"
                    placeholder="Confirm your password"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 text-secondary-400 dark:text-secondary-500" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform duration-200"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-4 w-4 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300" />
                    ) : (
                      <FiEye className="h-4 w-4 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 sm:py-4 text-sm sm:text-base font-bold flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="spinner-sm"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <FiNavigation className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                By creating an account, you agree to our{' '}
                <button type="button" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 underline">
                  Privacy Policy
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;