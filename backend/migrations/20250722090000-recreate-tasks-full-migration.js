'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create a new table with the desired final schema
    await queryInterface.createTable('Tasks_new', {
      taskId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('To-do', 'In progress', 'Done'),
        allowNull: false,
        defaultValue: 'To-do',
      },
      estimate_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      logged_time: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      timeLogHistory: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High'),
        allowNull: true,
        defaultValue: 'Medium',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    // Copy data from old Tasks to Tasks_new, mapping priority values and timestamps
    await queryInterface.sequelize.query(`
      INSERT INTO "Tasks_new" ("taskId","userId","title","description","status","estimate_time","logged_time","timeLogHistory","due_date","priority","created_at","updated_at")
      SELECT "taskId","userId","title","description","status"::text::"enum_Tasks_new_status","estimate_time", "logged_time", "timeLogHistory", "due_date",
        CASE
          WHEN "priority"::text IN ('Low','Medium','High') THEN "priority"::text
          WHEN "priority" IS NULL THEN 'Medium'
          WHEN "priority" = '1' THEN 'Low'
          WHEN "priority" = '2' THEN 'Medium'
          WHEN "priority" = '3' THEN 'High'
          ELSE 'Medium'
        END::"enum_Tasks_new_priority",
        NOW(), NOW()
      FROM "Tasks";
    `);

    // Swap tables
    await queryInterface.dropTable('Tasks');
    await queryInterface.renameTable('Tasks_new', 'Tasks');
  },

  async down(queryInterface, Sequelize) {
    // Recreate the original Tasks schema (as in the original migration)
    await queryInterface.createTable('Tasks_old', {
      taskId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('To-do', 'In progress', 'Done'),
        allowNull: false,
        defaultValue: 'To-do',
      },
      estimate_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      logged_time: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      timeLogHistory: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    // Copy data back, mapping enums to integers and casting as needed
    await queryInterface.sequelize.query(`
      INSERT INTO "Tasks_old" ("taskId","userId","title","description","status","estimate_time","logged_time","timeLogHistory","due_date","priority")
      SELECT "taskId","userId","title","description","status","estimate_time", 
        CASE WHEN "logged_time" IS NULL THEN NULL ELSE CAST("logged_time" AS INTEGER) END,
        "timeLogHistory","due_date",
        CASE
          WHEN "priority" = 'Low' THEN 1
          WHEN "priority" = 'Medium' THEN 2
          WHEN "priority" = 'High' THEN 3
          ELSE NULL
        END
      FROM "Tasks";
    `);

    await queryInterface.dropTable('Tasks');
    await queryInterface.renameTable('Tasks_old', 'Tasks');
  },
};
