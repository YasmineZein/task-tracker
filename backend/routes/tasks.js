const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

//Crud operations for tasks
router.post('/tasks', async (req, res) => {
  const {
    title,
    description,
    status,
    estimate_time,
    logged_time,
    priority,
    due_date,
  } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: 'Title is required.' });
  }

  if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: 'Priority must be Low, Medium, or High.',
    });
  }

  if (status && !['To-do', 'In progress', 'Done'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be To-do, In progress, or Done.',
    });
  }

  try {
    const task = await Task.create({
      title,
      description: description || null,
      status: status || 'To-do',
      estimate_time: estimate_time || null,
      logged_time: logged_time || 0,
      priority: priority || 'Medium',
      due_date: due_date || null,
      userId: req.user.id,
    });
    return res
      .status(201)
      .json({ success: true, message: 'Task created successfully.', task });
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
    });
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: {
        taskId: id,
        userId: req.user.id,
      },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found.' });
    }
    return res.status(200).json({ success: true, task });
  } catch (err) {
    console.error('Error fetching task:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    estimate_time,
    logged_time,
    priority,
    due_date,
  } = req.body;

  if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
    return res.status(400).json({
      success: false,
      message: 'Priority must be Low, Medium, or High.',
    });
  }

  if (status && !['To-do', 'In progress', 'Done'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be To-do, In progress, or Done.',
    });
  }

  try {
    const task = await Task.findOne({
      where: {
        taskId: id,
        userId: req.user.id,
      },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found.' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.estimate_time = estimate_time || task.estimate_time;
    task.logged_time = logged_time || task.logged_time;
    task.priority = priority || task.priority;
    task.due_date = due_date || task.due_date;

    await task.save();
    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({
      where: {
        taskId: id,
        userId: req.user.id,
      },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found.' });
    }

    await task.destroy();
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

//Time Logging
router.post('/tasks/:id/time-log', async (req, res) => {
  const { id } = req.params;
  const { duration, note } = req.body;

  if (!duration || duration <= 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid duration.' });
  }

  try {
    const task = await Task.findOne({
      where: {
        taskId: id,
        userId: req.user.id,
      },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found.' });
    }

    const entryId = task.timeLogHistory.length + 1;
    task.logged_time += duration;
    task.timeLogHistory.push({ entryId, duration, date: new Date(), note });

    await task.save();
    return res.status(200).json({
      success: true,
      message: 'Time logged successfully.',
      task,
    });
  } catch (err) {
    console.error('Error logging time:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.put('/tasks/:id/time-log/:entryId', async (req, res) => {
  const { id, entryId } = req.params;
  const { duration, note } = req.body;

  if (!duration || duration <= 0) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid duration.' });
  }

  try {
    const task = await Task.findOne({
      where: {
        taskId: id,
        userId: req.user.id,
      },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found.' });
    }

    const entry = task.timeLogHistory.find(
      (e) => e.entryId === parseInt(entryId),
    );
    if (!entry) {
      return res
        .status(404)
        .json({ success: false, message: 'Time log entry not found.' });
    }

    entry.duration = duration;
    entry.note = note || entry.note;
    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Time log updated successfully.',
      task,
    });
  } catch (err) {
    console.error('Error updating time log:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/tasks/:taskId/time-summary', async (req, res) => {
  const { taskId } = req.params;
  try {
    const task = await Task.findOne({
      where: {
        taskId: taskId,
        userId: req.user.id,
      },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: 'Task not found.' });
    }

    const timeSummary = {
      totalLoggedTime: task.logged_time || 0,
      timeLogHistory: task.timeLogHistory || [],
    };

    return res.status(200).json({
      success: true,
      timeSummary,
    });
  } catch (err) {
    console.error('Error fetching time summary:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/analytics/time', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
    });
    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalTasks: 0,
          completedTasks: 0,
          totalEstimatedTime: 0,
          totalLoggedTime: 0,
          estimationAccuracy: null,
          dailyProgress: [],
          weeklyProgress: [],
        },
      });
    }

    // Aggregate analytics
    let totalEstimatedTime = 0;
    let totalLoggedTime = 0;
    let completedTasks = 0;
    let dailyProgressMap = {};
    let weeklyProgressMap = {};

    tasks.forEach((task) => {
      if (task.estimate_time) totalEstimatedTime += task.estimate_time;
      if (task.logged_time) totalLoggedTime += task.logged_time;
      if (task.status === 'Done') completedTasks++;

      // Daily/weekly progress from timeLogHistory
      if (Array.isArray(task.timeLogHistory)) {
        task.timeLogHistory.forEach((entry) => {
          const date = new Date(entry.date);
          const day = date.toISOString().split('T')[0];
          const week = `${date.getFullYear()}-W${getWeekNumber(date)}`;

          if (!dailyProgressMap[day]) dailyProgressMap[day] = 0;
          dailyProgressMap[day] += entry.duration || 0;

          if (!weeklyProgressMap[week]) weeklyProgressMap[week] = 0;
          weeklyProgressMap[week] += entry.duration || 0;
        });
      }
    });

    // Estimation accuracy: (totalEstimatedTime - totalLoggedTime) / totalEstimatedTime
    let estimationAccuracy = null;
    if (totalEstimatedTime > 0) {
      estimationAccuracy =
        ((totalEstimatedTime - totalLoggedTime) / totalEstimatedTime) * 100;
    }

    // Format daily/weekly progress
    const dailyProgress = Object.entries(dailyProgressMap).map(
      ([date, duration]) => ({ date, duration }),
    );
    const weeklyProgress = Object.entries(weeklyProgressMap).map(
      ([week, duration]) => ({ week, duration }),
    );

    return res.status(200).json({
      success: true,
      analytics: {
        totalTasks: tasks.length,
        completedTasks,
        totalEstimatedTime,
        totalLoggedTime,
        estimationAccuracy,
        dailyProgress,
        weeklyProgress,
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Helper: Get ISO week number
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

module.exports = router;
