const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Task = sequelize.define(
  'Task',
  {
    taskId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'userId',
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('To-do', 'In progress', 'Done'),
      allowNull: false,
      defaultValue: 'To-do',
    },
    estimate_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    logged_time: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    timeLogHistory: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: true,
      defaultValue: 'Medium',
    },
  },
  {
    sequelize,
    modelName: 'Task',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

User.hasMany(Task, { foreignKey: 'userId' });
Task.belongsTo(User, { foreignKey: 'userId' });

module.exports = Task;
