import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/userAPI';
import { getTimeSince, formatDate } from '../utils/dateUtils';

const UserProfile = ({ user, onProfileUpdate, onAccountDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await userAPI.updateProfile(formData);
      
      if (response.success) {
        // Update localStorage with new user data and token
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        // Call the callback to update parent component
        onProfileUpdate(response.user);
        setIsEditing(false);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAPI.deleteAccount();
      
      if (response.success) {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Call the callback to handle account deletion
        onAccountDelete();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      name: user.name,
      email: user.email,
    });
    setIsEditing(false);
    setError(null);
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center" style={{ color: '#3D0301' }}>
          <svg className="h-6 w-6 mr-2" style={{ color: '#B03052' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Your Profile
        </h3>
        {!isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
            >
              Edit Profile
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-xl transition-all duration-200 transform hover:scale-105 hover:bg-red-600"
            >
              Delete Account
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      ) : (
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
              <span style={{ color: '#3D0301' }} title={formatDate(user.created_at)}>
                {getTimeSince(user.created_at)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including tasks.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;