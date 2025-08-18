import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('Dashboard - Token:', token);
    console.log('Dashboard - User data:', userData);
    
    if (!token || !userData) {
      console.log('No token or user data, redirecting to login');
      navigate('/login');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      console.log('Dashboard - Parsed user:', parsedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #EBE8DB, #f8f8f8)' }}>
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}>
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Task Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}>
                  <span className="text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium hidden sm:block" style={{ color: '#3D0301' }}>
                  {user.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="rounded-2xl p-8 mb-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #D76C82, #B03052)' }}>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg opacity-90">
              Ready to tackle your tasks today? Let's get organized!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: '#EBE8DB' }}>
                  <svg className="h-6 w-6" style={{ color: '#3D0301' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>0</p>
                  <p className="text-gray-600">Total Tasks</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: '#EBE8DB' }}>
                  <svg className="h-6 w-6" style={{ color: '#B03052' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>0</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: '#EBE8DB' }}>
                  <svg className="h-6 w-6" style={{ color: '#D76C82' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>0</p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D0301' }}>Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="flex items-center justify-center p-4 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Task
              </button>
              <button className="flex items-center justify-center p-4 bg-white border-2 text-gray-700 rounded-xl hover:bg-opacity-80 transition-all duration-200" style={{ borderColor: '#D76C82', backgroundColor: '#EBE8DB' }}>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All
              </button>
              <button className="flex items-center justify-center p-4 bg-white border-2 text-gray-700 rounded-xl hover:bg-opacity-80 transition-all duration-200" style={{ borderColor: '#D76C82', backgroundColor: '#EBE8DB' }}>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              <button className="flex items-center justify-center p-4 bg-white border-2 text-gray-700 rounded-xl hover:bg-opacity-80 transition-all duration-200" style={{ borderColor: '#D76C82', backgroundColor: '#EBE8DB' }}>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center" style={{ color: '#3D0301' }}>
              <svg className="h-6 w-6 mr-2" style={{ color: '#B03052' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}>
                    <span className="text-white text-lg font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: '#3D0301' }}>{user.name}</p>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-sm px-2 py-1 rounded" style={{ backgroundColor: '#EBE8DB', color: '#3D0301' }}>
                    {user.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span style={{ color: '#3D0301' }}>Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
