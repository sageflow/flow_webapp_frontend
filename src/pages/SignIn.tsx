import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FormField from '../components/common/FormField';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { GENDER_CONSTANTS, GRADE_LEVEL_CONSTANTS, ACADEMIC_STATUS_CONSTANTS, LANGUAGE_CONSTANTS } from '../constants';
import { handleError } from '../utils';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();

  // Get the intended destination from location state, or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(formData);
      // Redirect to intended destination or dashboard
      navigate(from, { replace: true });
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-montserrat font-bold text-heading">SageFlow</span>
          </div>
          
          <h1 className="text-h1 text-heading mb-2">Welcome Back</h1>
          <p className="text-body text-body">Sign in to your SageFlow account</p>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onClose={clearError}
            className="mb-6"
          />
        )}

        {/* Sign In Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Username or Email"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username or email"
              required
              autoComplete="username"
              disabled={loading}
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  disabled={loading}
                />
                <span className="text-sm text-label">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-body text-body">
            Don't have an account?{' '}
            <Link to="/" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-label mb-4">Quick Sign Up Links</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              to="/signup/student" 
              className="px-4 py-2 bg-positive text-white rounded-button text-sm font-medium hover:bg-positive/90 transition-colors"
            >
              Student Sign Up
            </Link>
            <Link 
              to="/signup/teacher" 
              className="px-4 py-2 bg-accent text-white rounded-button text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Teacher Sign Up
            </Link>
            <Link 
              to="/signup/guardian" 
              className="px-4 py-2 bg-action text-white rounded-button text-sm font-medium hover:bg-action/90 transition-colors"
            >
              Guardian Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
