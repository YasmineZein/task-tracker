const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.post('/tasks', async (req, res) => {
  const { title, description, status, estimate_time, logged_time, userId } =
    req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: 'Title is required.' });
  }

  try {
    const task = await Task.create({
      title,
      description: description || null,
      status: status || 'To-do',
      estimate_time: estimate_time || null,
      logged_time: logged_time || 0,
      userId,
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
    const tasks = await Task.findAll();
    return res.status(200).json({ success: true, tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findByPk(id);
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
  const { title, description, status, estimate_time, logged_time } = req.body;
  try {
    const task = await Task.findByPk(id);
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
    const task = await Task.findByPk(id);
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
module.exports = router;
