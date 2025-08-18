// API base configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log('API Response status:', response.status);
  console.log('API Response ok:', response.ok);
  
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      console.log('Error response data:', errorData);
      errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
    } catch (parseError) {
      console.log('Failed to parse error response as JSON:', parseError);
      errorMessage = `HTTP error! status: ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  console.log('Success response data:', data);
  return data;
};

// Task API functions
export const taskAPI = {
  // Get all tasks for the authenticated user
  getAllTasks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Get a specific task by ID
  getTaskById: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Update an existing task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Log time for a task
  logTime: async (taskId, timeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/time-log`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(timeData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error logging time:', error);
      throw error;
    }
  },

  // Get time summary for a task
  getTimeSummary: async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/time-summary`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching time summary:', error);
      throw error;
    }
  },

  // Get analytics
  getAnalytics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/time`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },
};

// Export default for convenience
export default taskAPI;
