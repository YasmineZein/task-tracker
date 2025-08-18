import React, { useState, useEffect, useRef } from 'react';
import { taskAPI } from '../services/taskAPI';

const TimerButton = ({ task, onTimeLogged }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); 
  const [error, setError] = useState(null);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerKey = `timer_${task.taskId}`;

  // Load timer state from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem(timerKey);
    if (savedTimer) {
      try {
        const timer = JSON.parse(savedTimer);
        if (timer.isRunning) {
          const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
          setElapsedTime(elapsed);
          setIsRunning(true);
        }
      } catch {
        localStorage.removeItem(timerKey);
      }
    }
  }, [timerKey]);

  // Save timer state to localStorage
  const saveTimerState = (running, elapsed) => {
    if (running) {
      localStorage.setItem(timerKey, JSON.stringify({
        isRunning: true,
        startTime: Date.now() - elapsed * 1000,
        elapsedTime: elapsed
      }));
    } else {
      localStorage.removeItem(timerKey);
    }
  };

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
    saveTimerState(true, elapsedTime);
  };

  const stopTimer = async () => {
    if (elapsedTime > 0) {
      try {
        const duration = elapsedTime / 3600;
        await taskAPI.logTime(task.taskId, {
          duration: duration,
          note: 'Timer session'
        });
        
        if (onTimeLogged) onTimeLogged();
        setElapsedTime(0);
        saveTimerState(false, 0);
      } catch (error) {
        console.error('Error logging time:', error);
        setError('Failed to log time');
      }
    }
    setIsRunning(false);
    saveTimerState(false, 0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Timer Display */}
      {(isRunning || elapsedTime > 0) && (
        <span className="text-sm font-mono" style={{ color: '#B03052' }}>
          {formatTime(elapsedTime)}
        </span>
      )}
      
      {/* Timer Controls */}
      {!isRunning ? (
        <button
          onClick={startTimer}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Start timer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={stopTimer}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors animate-pulse"
          title="Stop timer and log time"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
      
      {/* Error display */}
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};

export default TimerButton;
