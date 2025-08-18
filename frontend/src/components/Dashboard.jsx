import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/taskAPI';
import { userAPI } from '../services/userAPI';
import Timer from './Timer';
import TimerButton from './TimerButton';
import RunningTimersDisplay from './RunningTimersDisplay';
import UserProfile from './UserProfile';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState(null);
  const navigate = useNavigate();

  // Function to fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getAllTasks();
      
      if (response.success) {
        setTasks(response.tasks || []);
        console.log('Tasks fetched successfully:', response.tasks);
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message);
      
      // If token is invalid, redirect to login
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Function to fetch complete user profile including created_at
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success) {
        setUser(response.user);
        // Update localStorage with complete user data
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If token is invalid, redirect to login
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  }, [navigate]);

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
      
      // Fetch complete user profile and tasks
      fetchUserProfile();
      fetchTasks();
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate, fetchTasks, fetchUserProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Profile management handlers
  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleAccountDelete = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Task management functions
  const handleCreateTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null); 
      console.log('Creating task with data:', taskData);
      
      const response = await taskAPI.createTask(taskData);
      console.log('Create task response:', response);
      
      if (response.success) {
        console.log('Task created successfully, refreshing tasks...');
        await fetchTasks(); // Refresh tasks
        setShowTaskModal(false);
        setSelectedTask(null);
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error in handleCreateTask:', error);
      setError(`Failed to create task: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      setLoading(true);
      const response = await taskAPI.updateTask(taskId, taskData);
      if (response.success) {
        await fetchTasks(); // Refresh tasks
        setShowTaskModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        const response = await taskAPI.deleteTask(taskId);
        if (response.success) {
          await fetchTasks(); // Refresh tasks
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const openTaskModal = (task = null) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setSelectedTask(null);
    setShowTaskModal(false);
  };

  const openTimerModal = (task) => {
    setSelectedTaskForTimer(task);
    setShowTimer(true);
  };

  const closeTimerModal = () => {
    setSelectedTaskForTimer(null);
    setShowTimer(false);
  };

  const toggleFilters = () => {
    if (showFilters) {
      // Clear filters when hiding them
      setSearchTerm('');
      setFilterStatus('All');
      setFilterPriority('All');
    }
    setShowFilters(!showFilters);
  };

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  const pendingTasks = tasks.filter(task => task.status === 'To-do').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In progress').length;

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#3D0301' }}>
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
          <div className="rounded-2xl p-8 mb-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #D76C82, #B03052)', textAlign: 'center' }}>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg opacity-90">
              Ready to tackle your tasks today? Let's get organized!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={fetchTasks}
                  className="ml-auto text-red-600 hover:text-red-800 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
              <div className="flex items-center">
                <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-700">Loading tasks...</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: '#EBE8DB' }}>
                  <svg className="h-6 w-6" style={{ color: '#3D0301' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>{totalTasks}</p>
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
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>{completedTasks}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center">
                <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: '#EBE8DB' }}>
                  <svg className="h-6 w-6" style={{ color: '#F39C12' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>{inProgressTasks}</p>
                  <p className="text-gray-600">In Progress</p>
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
                  <p className="text-2xl font-bold" style={{ color: '#3D0301' }}>{pendingTasks}</p>
                  <p className="text-gray-600">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3D0301' }}>Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => openTaskModal()}
                className="flex items-center justify-center p-4 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg" 
                style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Task
              </button>
              <button 
                onClick={() => setActiveView('tasks')}
                className="flex items-center justify-center p-4 bg-white border-2 text-gray-700 rounded-xl hover:bg-opacity-80 transition-all duration-200" 
                style={{ borderColor: '#D76C82', backgroundColor: '#EBE8DB' }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View All
              </button>
              <button 
                onClick={() => {
                  setActiveView('tasks');
                  toggleFilters();
                }}
                className={`flex items-center justify-center p-4 bg-white border-2 text-gray-700 rounded-xl hover:bg-opacity-80 transition-all duration-200 ${showFilters ? 'ring-2 ring-pink-500' : ''}`}
                style={{ borderColor: '#D76C82', backgroundColor: showFilters ? '#D76C82' : '#EBE8DB', color: showFilters ? 'white' : '#374151' }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button 
                onClick={() => setActiveView('overview')}
                className="flex items-center justify-center p-4 bg-white border-2 text-gray-700 rounded-xl hover:bg-opacity-80 transition-all duration-200" 
                style={{ borderColor: '#D76C82', backgroundColor: '#EBE8DB' }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Overview
              </button>
            </div>
          </div>

          {/* Main Content Area - Conditional Rendering */}
          {activeView === 'overview' ? (
            /* Profile Section */
            <UserProfile 
              user={user} 
              onProfileUpdate={handleProfileUpdate}
              onAccountDelete={handleAccountDelete}
            />
          ) : (
            /* Tasks Management View */
            <div className="space-y-6">
              {/* Filters and Search - Only show when showFilters is true */}
              {showFilters && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h3 className="text-xl font-bold" style={{ color: '#3D0301' }}>Search & Filter Tasks</h3>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search tasks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="All">All Status</option>
                        <option value="To-do">To-do</option>
                        <option value="In progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      >
                        <option value="All">All Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tasks List */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold" style={{ color: '#3D0301' }}>
                      Your Tasks ({filteredTasks.length})
                    </h3>
                    <button
                      onClick={() => openTaskModal()}
                      className="px-4 py-2 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                      style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
                      <div className="mt-6">
                        <button
                          onClick={() => openTaskModal()}
                          className="inline-flex items-center px-4 py-2 text-white rounded-xl"
                          style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
                        >
                          + Create Task
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTasks.map((task) => (
                        <TaskCard 
                          key={task.taskId} 
                          task={task} 
                          onEdit={openTaskModal} 
                          onDelete={handleDeleteTask}
                          onOpenTimer={openTimerModal}
                          onTimeLogged={fetchTasks}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal 
          task={selectedTask} 
          onSave={selectedTask ? handleUpdateTask : handleCreateTask}
          onClose={closeTaskModal}
        />
      )}

      {/* Timer Modal */}
      {showTimer && selectedTaskForTimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Timer 
            taskId={selectedTaskForTimer.taskId}
            onTimeLogged={() => {
              fetchTasks();
              closeTimerModal();
            }}
            onClose={closeTimerModal}
          />
        </div>
      )}

      {/* Running Timers Display */}
      <RunningTimersDisplay tasks={tasks} />
    </div>
  );
};

// TaskCard Component
const TaskCard = ({ task, onEdit, onDelete, onOpenTimer, onTimeLogged }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'bg-green-100 text-green-800 border-green-200';
      case 'In progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'To-do': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const formatLoggedTime = (hours) => {
    if (!hours || hours === 0) return '0m';
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          
          {task.description && (
            <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due: {formatDate(task.due_date)}
            </div>
            {task.estimate_time && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Est: {task.estimate_time}h
              </div>
            )}
            {task.logged_time > 0 && (
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Logged: {formatLoggedTime(task.logged_time)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {/* Timer Button */}
          <TimerButton task={task} onTimeLogged={onTimeLogged} />
          
          {/* Full Timer Modal Button */}
          <button
            onClick={() => onOpenTimer(task)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Open time tracker"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.taskId)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// TaskModal Component
const TaskModal = ({ task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'To-do',
    priority: task?.priority || 'Medium',
    estimate_time: task?.estimate_time || '',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    const taskData = {
      ...formData,
      estimate_time: formData.estimate_time ? parseInt(formData.estimate_time) : null,
      due_date: formData.due_date || null,
    };

    console.log('TaskModal submitting data:', taskData);
    console.log('Task prop:', task);

    try {
      if (task) {
        await onSave(task.taskId, taskData);
      } else {
        await onSave(taskData);
      }
    } catch (error) {
      console.error('Error in TaskModal submit:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: '#3D0301' }}>
              {task ? 'Edit Task' : 'Create New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="To-do">To-do</option>
                  <option value="In progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (hours)
                </label>
                <input
                  type="number"
                  name="estimate_time"
                  value={formData.estimate_time}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white rounded-xl transition-colors"
                style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
