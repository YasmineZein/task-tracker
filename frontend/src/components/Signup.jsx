import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      const response = await axios.post('http://localhost:3000/api/auth/signup', signupData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#D76C82' }}>
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex h items-center justify-center lg:justify-start lg:pl-8 lg:pr-4">
        <div className="w-full max-w-md">
            <div className="bg-white py-5 px-8 shadow-2xl rounded-3xl border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
                <div className="text-center mb-3">
                    <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}>
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: '#3D0301' }}>
                        Join Task Tracker
                    </h2>
                    <p className="text-gray-600">
                        Start organizing your tasks today
                    </p>
                </div>

                <form className="space-y-2" onSubmit={handleSubmit}>
                    {error && (
                        <div className="border border-red-200 text-red-700 px-4 py-2 rounded-xl flex items-center space-x-2 animate-shake" style={{ backgroundColor: '#EBE8DB' }}>
                            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-1">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#3D0301' }}>
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:z-10 transition-all duration-200 hover:border-gray-400"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#3D0301' }}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:z-10 transition-all duration-200 hover:border-gray-400"
                                placeholder="Enter your email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#3D0301' }}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:z-10 transition-all duration-200 hover:border-gray-400"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2" style={{ color: '#3D0301' }}>
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:z-10 transition-all duration-200 hover:border-gray-400"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #B03052, #3D0301)',
                                focusRingColor: '#B03052'
                            }}
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Creating account...</span>
                                </div>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-2 text-center">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link
                        to="/login"
                        className="font-semibold transition-colors duration-200"
                        style={{ color: '#B03052' }}
                    >
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
      </div>

      {/* Right side - Welcome Message */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-6 xl:p-8">
        <div className="text-center text-white max-w-md xl:max-w-lg">
          <div className="mb-6">
            <div className="mx-auto h-16 w-16 xl:h-20 xl:w-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl" style={{ backgroundColor: '#EBE8DB' }}>
              <svg className="h-8 w-8 xl:h-10 xl:w-10" style={{ color: '#3D0301' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl xl:text-4xl font-bold mb-4 leading-tight">
            Organize Your
            <br />
            <span style={{ color: '#EBE8DB' }}>Tasks Beautifully</span>
          </h1>
          
          <p className="text-base xl:text-lg mb-6 leading-relaxed opacity-90">
            Take control of your productivity with our elegant task management system. 
            Simple, powerful, and designed for the way you work.
          </p>
          
          <div className="space-y-3 text-sm xl:text-base opacity-80">
            <div className="flex items-center justify-center space-x-3">
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#EBE8DB' }}></div>
              <span>Create and organize tasks effortlessly</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#EBE8DB' }}></div>
              <span>Track your progress in real-time</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#EBE8DB' }}></div>
              <span>Stay motivated and productive</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl" style={{ backgroundColor: 'rgba(235, 232, 219, 0.1)' }}>
            <p className="text-sm xl:text-base italic font-light">
              "Success is not final, failure is not fatal: it is the courage to continue that counts."
            </p>
            <p className="text-xs xl:text-sm mt-2 opacity-75">- Winston Churchill</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
