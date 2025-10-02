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
    <div className="min-h-screen flex items-center justify-center py-16 px-6 lg:px-8 relative">
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-secondary-950 dark:via-secondary-900 dark:to-primary-950/30"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 via-transparent to-secondary-600/5 dark:from-primary-500/10 dark:via-transparent dark:to-secondary-500/10"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/10 dark:bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative max-w-lg w-full">
        <div className="card-elevated bg-white/90 dark:bg-secondary-900/90 backdrop-blur-2xl p-12 border-2 border-white/20 dark:border-secondary-700/30">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 p-4 rounded-2xl shadow-large">
                <FiNavigation className="h-12 w-12 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-secondary-900 via-primary-700 to-secondary-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              Sign in to access your account
            </p>
            <p className="mt-3 text-sm text-secondary-500 dark:text-secondary-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-3">
                  <FiMail className="inline w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
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
                    className="input-large pl-12"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-3">
                  <FiLock className="inline w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
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
                    className="input-large pl-12 pr-12"
                    placeholder="Enter your password"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform duration-200"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300" />
                    ) : (
                      <FiEye className="h-5 w-5 text-secondary-400 dark:text-secondary-500 hover:text-secondary-600 dark:hover:text-secondary-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-5 text-lg font-bold flex items-center justify-center space-x-3 group"
              >
                {isLoading ? (
                  <>
                    <div className="spinner-sm"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Your Account</span>
                    <FiNavigation className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>
            </div>

            {/* Professional Demo Credentials Section */}
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300 dark:border-secondary-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-medium">
                    Demo Credentials
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'admin@flights.com', password: 'trilogy123' })}
                  className="card-interactive p-4 text-left hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                      <FiLock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">Admin Access</p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400">admin@flights.com</p>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ email: 'user@example.com', password: 'password123' })}
                  className="card-interactive p-4 text-left hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-secondary-100 dark:bg-secondary-800 p-2 rounded-lg">
                      <FiMail className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">Demo User</p>
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