'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('Tasks', {
      taskId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Tasks');
  },
};
