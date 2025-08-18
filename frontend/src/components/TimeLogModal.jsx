import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/taskAPI';

const TimeLogModal = ({ task, onClose, onTimeLogged }) => {
  const [activeTab, setActiveTab] = useState('log'); 
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Form state for manual time entry
  const [formData, setFormData] = useState({
    duration: '',
    notes: '',
    start_time: new Date().toISOString().slice(0, 16), 
    end_time: new Date().toISOString().slice(0, 16)
  });

  // Fetch time log entries when component mounts or task changes
  const fetchTimeEntries = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskAPI.getTimeLog(task.taskId);
      if (response.success) {
        setTimeEntries(response.timeLogEntries || []);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [task]);

  useEffect(() => {
    if (task && activeTab === 'history') {
      fetchTimeEntries();
    }
  }, [task, activeTab, fetchTimeEntries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      setError('Please enter a valid duration');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const timeData = {
        duration: parseFloat(formData.duration),
        notes: formData.notes,
        start_time: formData.start_time ? new Date(formData.start_time).toISOString() : null,
        end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null
      };

      if (editingEntry) {
        await taskAPI.updateTimeLogEntry(task.taskId, editingEntry.id, timeData);
        setEditingEntry(null);
      } else {
        await taskAPI.logTime(task.taskId, timeData);
      }

      // Reset form
      setFormData({
        duration: '',
        notes: '',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: new Date().toISOString().slice(0, 16)
      });

      // Refresh entries and notify parent
      await fetchTimeEntries();
      if (onTimeLogged) {
        onTimeLogged(task.taskId, timeData);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormData({
      duration: entry.duration.toString(),
      notes: entry.notes || '',
      start_time: entry.start_time ? new Date(entry.start_time).toISOString().slice(0, 16) : '',
      end_time: entry.end_time ? new Date(entry.end_time).toISOString().slice(0, 16) : ''
    });
    setActiveTab('log');
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }

    try {
      setLoading(true);
      await taskAPI.deleteTimeLogEntry(task.taskId, entryId);
      await fetchTimeEntries();
      if (onTimeLogged) {
        onTimeLogged(task.taskId);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const getTotalTime = () => {
    return timeEntries.reduce((sum, entry) => sum + entry.duration, 0).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#3D0301' }}>
                Time Logging - {task.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total logged: {getTotalTime()}h
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mt-4">
            <button
              onClick={() => setActiveTab('log')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'log'
                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {editingEntry ? 'Edit Entry' : 'Log Time'}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              History ({timeEntries.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'log' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="e.g., 1.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select
                  </label>
                  <div className="flex space-x-2">
                    {[0.25, 0.5, 1, 2].map(hours => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, duration: hours.toString() }))}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {formatDuration(hours)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                  placeholder="What did you work on?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                {editingEntry && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEntry(null);
                      setFormData({
                        duration: '',
                        notes: '',
                        start_time: new Date().toISOString().slice(0, 16),
                        end_time: new Date().toISOString().slice(0, 16)
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-white rounded-xl transition-colors disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
                >
                  {loading ? 'Saving...' : editingEntry ? 'Update Entry' : 'Log Time'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading time entries...</p>
                </div>
              ) : timeEntries.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No time entries</h3>
                  <p className="mt-1 text-sm text-gray-500">Start by logging some time on this task.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeEntries.map((entry) => (
                    <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-semibold text-lg" style={{ color: '#3D0301' }}>
                              {formatDuration(entry.duration)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(entry.logged_at)}
                            </span>
                          </div>
                          
                          {entry.notes && (
                            <p className="text-gray-700 text-sm mb-2">{entry.notes}</p>
                          )}
                          
                          <div className="text-xs text-gray-500 space-y-1">
                            {entry.start_time && (
                              <div>Start: {formatDate(entry.start_time)}</div>
                            )}
                            {entry.end_time && (
                              <div>End: {formatDate(entry.end_time)}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit entry"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete entry"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeLogModal;
