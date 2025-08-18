import React, { useState, useEffect, useRef } from 'react';
import { taskAPI } from '../services/taskAPI';

const Timer = ({ taskId, onTimeLogged, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [manualTime, setManualTime] = useState('');
  const [note, setNote] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const fetchTimeEntries = async () => {
    try {
      console.log('Fetching time entries for task:', taskId);
      const response = await taskAPI.getTimeSummary(taskId);
      console.log('Time summary response:', response);
      
      if (response.success) {
        const entries = response.timeSummary.timeLogHistory || [];
        console.log('Setting time entries:', entries);
        setTimeEntries(entries);
      } else {
        console.error('Failed to fetch time summary:', response.message);
        setError('Failed to load time entries: ' + response.message);
      }
    } catch (error) {
      console.error('Error fetching time entries:', error);
      setError('Failed to load time entries: ' + error.message);
    }
  };

  // Fetch existing time entries when component mounts
  useEffect(() => {
    fetchTimeEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, elapsedTime]);

  const startTimer = () => {
    setIsRunning(true);
    setError(null);
  };

  const stopTimer = async () => {
    if (elapsedTime > 0) {
      await logTime(elapsedTime / 3600, 'Timer session'); 
      setElapsedTime(0);
    }
    setIsRunning(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setError(null);
  };

  const logTime = async (duration, logNote = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.logTime(taskId, {
        duration: parseFloat(duration),
        note: logNote || note
      });

      if (response.success) {
        console.log('Time logged successfully:', response);
        await fetchTimeEntries(); // Refresh entries
        setNote('');
        setManualTime('');
        setShowManualEntry(false);
        if (onTimeLogged) onTimeLogged();
        
        
        alert('Time logged successfully!');
      }
    } catch (error) {
      console.error('Error logging time:', error);
      setError('Failed to log time: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTimeLog = async (e) => {
    e.preventDefault();
    if (!manualTime || parseFloat(manualTime) <= 0) {
      setError('Please enter a valid duration');
      return;
    }
    await logTime(manualTime, note);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry({
      ...entry,
      editDuration: entry.duration,
      editNote: entry.note || ''
    });
  };

  const saveEditedEntry = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await taskAPI.updateTimeEntry(taskId, editingEntry.entryId, {
        duration: parseFloat(editingEntry.editDuration),
        note: editingEntry.editNote || ''
      });

      if (response.success) {
        await fetchTimeEntries();
        setEditingEntry(null);
        if (onTimeLogged) onTimeLogged();
        alert('Time entry updated successfully!');
      }
    } catch (error) {
      console.error('Error updating time entry:', error);
      setError('Failed to update time entry: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingEntry(null);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (hours) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold" style={{ color: '#3D0301' }}>
            Time Tracker
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold mb-4" style={{ color: '#3D0301' }}>
            {formatTime(elapsedTime)}
          </div>
          
          {/* Timer Controls */}
          <div className="flex justify-center space-x-3">
            {!isRunning ? (
              <button
                onClick={startTimer}
                disabled={loading}
                className="flex items-center px-4 py-2 text-white rounded-xl transition-all duration-200 transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                Pause
              </button>
            )}
            
            {elapsedTime > 0 && (
              <>
                <button
                  onClick={stopTimer}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stop & Log
                </button>
                <button
                  onClick={resetTimer}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Manual Time Entry Toggle */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="text-sm px-4 py-2 border-2 rounded-xl transition-colors"
            style={{ 
              borderColor: '#D76C82', 
              backgroundColor: showManualEntry ? '#D76C82' : '#EBE8DB',
              color: showManualEntry ? 'white' : '#374151'
            }}
          >
            {showManualEntry ? 'Hide Manual Entry' : 'Manual Time Entry'}
          </button>
        </div>

        {/* Manual Time Entry Form */}
        {showManualEntry && (
          <form onSubmit={handleManualTimeLog} className="mb-6 p-4 border border-gray-200 rounded-xl">
            <h4 className="font-semibold mb-3" style={{ color: '#3D0301' }}>Log Time Manually</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="e.g., 1.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="What did you work on?"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !manualTime}
                className="w-full px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #B03052, #3D0301)' }}
              >
                {loading ? 'Logging...' : 'Log Time'}
              </button>
            </div>
          </form>
        )}

        {/* Time Entries List */}
        <div>
          <h4 className="font-semibold mb-3" style={{ color: '#3D0301' }}>
            Time Entries ({timeEntries.length})
          </h4>
          
          {timeEntries.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No time entries yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {timeEntries.map((entry) => (
                <div key={entry.entryId} className="border border-gray-200 rounded-lg p-3">
                  {editingEntry && editingEntry.entryId === entry.entryId ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Duration (hours)</label>
                          <input
                            type="number"
                            step="0.25"
                            min="0.25"
                            value={editingEntry.editDuration}
                            onChange={(e) => setEditingEntry({...editingEntry, editDuration: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Note</label>
                          <input
                            type="text"
                            value={editingEntry.editNote}
                            onChange={(e) => setEditingEntry({...editingEntry, editNote: e.target.value})}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Add a note about what you worked on..."
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={saveEditedEntry}
                          disabled={loading}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-lg" style={{ color: '#3D0301' }}>
                            {formatDuration(entry.duration)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        {entry.note ? (
                          <p className="text-sm text-gray-600 mt-1 italic">"{entry.note}"</p>
                        ) : (
                          <p className="text-sm text-gray-400 mt-1">No note added</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit entry"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!entry.note && (
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="px-2 py-1 text-xs text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Add note"
                          >
                            + Note
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timer;
