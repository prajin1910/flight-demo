import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiLock, FiMail, FiNavigation } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.username}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
          <div className="text-center mb-6 sm:mb-8 md:mb-6 lg:mb-7">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 p-2.5 sm:p-3 md:p-2.5 lg:p-3 rounded-xl shadow-large">
                <FiNavigation className="h-7 w-7 sm:h-8 sm:w-8 md:h-7 md:w-7 lg:h-8 lg:w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 md:mb-2 lg:mb-3 bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-sm sm:text-base md:text-sm lg:text-base text-secondary-600 dark:text-secondary-300">
              Sign in to access your account
            </p>
            <p className="mt-2 text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">
                  <FiMail className="inline w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                  Email Address
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
                    placeholder="Enter your email address"
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
                    autoComplete="current-password"
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
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
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
                className="btn-primary w-full py-3 sm:py-4 text-sm sm:text-base font-bold flex items-center justify-center space-x-2 group"
              >
                {isLoading ? (
                  <>
                    <div className="spinner-sm"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Your Account</span>
                    <FiNavigation className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

            {/* Professional Demo Credentials Section */}
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300 dark:border-secondary-600" />
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-3 bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-medium">
                    Demo Credentials
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@flights.com', password: 'trilogy123' })}
                  className="card-interactive p-3 text-left hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded">
                      <FiLock className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-xs">Admin Access</p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400">admin@flights.com</p>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'user@example.com', password: 'password123' })}
                  className="card-interactive p-3 text-left hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300"
                >
                  <div className="flex items-center space-x-2">
                    <div className="bg-secondary-100 dark:bg-secondary-800 p-1.5 rounded">
                      <FiMail className="w-3 h-3 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-xs">Demo User</p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400">user@example.com</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;