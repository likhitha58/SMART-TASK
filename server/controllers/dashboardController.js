import sql from 'mssql';
import { config } from '../config/db.js';

// Get tasks that have started (DueDate <= today and EndDate >= today)
export const getOngoingTasks = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT TOP (1000) [ID], [Title], [Description], [Subject], [Priority],
             [DueDate], [EndDate], [Recurrence], [Reminder], [Notes], [NewTaskOption],
             [CreatedAt], [WeeklyInterval], [weeklyDays], [recurrenceSummary],
             [AssignedById], [Status], [Department_Old], [ProjectID],
             [Location], [Department]
      FROM [SmartTaskDB].[dbo].[Tasks]
      WHERE CAST(DueDate AS DATE) <= CAST(GETDATE() AS DATE)
        AND CAST(EndDate AS DATE) >= CAST(GETDATE() AS DATE)
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching ongoing tasks:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get tasks that will start in the future (DueDate > today)
export const getUpcomingTasks = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT TOP (1000) [ID], [Title], [Description], [Subject], [Priority],
             [DueDate], [EndDate], [Recurrence], [Reminder], [Notes], [NewTaskOption],
             [CreatedAt], [WeeklyInterval], [weeklyDays], [recurrenceSummary],
             [AssignedById], [Status], [Department_Old], [ProjectID],
             [Location], [Department]
      FROM [SmartTaskDB].[dbo].[Tasks]
      WHERE CAST(DueDate AS DATE) > CAST(GETDATE() AS DATE)
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching upcoming tasks:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
