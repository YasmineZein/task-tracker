import React, { useState, useEffect } from 'react';

const RunningTimersDisplay = ({ tasks }) => {
  const [runningTimers, setRunningTimers] = useState(new Map());

  useEffect(() => {
    const timers = new Map();
    
    // Check localStorage for running timers
    tasks.forEach(task => {
      const timerKey = `timer_${task.taskId}`;
      const timerData = localStorage.getItem(timerKey);
      if (timerData) {
        try {
          const timer = JSON.parse(timerData);
          if (timer.isRunning) {
            timers.set(task.taskId, {
              ...timer,
              task: task
            });
          }
        } catch {
          localStorage.removeItem(timerKey);
        }
      }
    });
    
    setRunningTimers(timers);
  }, [tasks]);

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

  if (runningTimers.size === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm">
        <h4 className="font-semibold text-sm mb-3" style={{ color: '#3D0301' }}>
          Running Timers ({runningTimers.size})
        </h4>
        <div className="space-y-2">
          {Array.from(runningTimers.values()).map(timer => (
            <div key={timer.task.taskId} className="flex items-center justify-between text-sm">
              <span className="truncate mr-2">{timer.task.title}</span>
              <span className="font-mono text-green-600">
                {formatTime(timer.elapsedTime || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RunningTimersDisplay;
