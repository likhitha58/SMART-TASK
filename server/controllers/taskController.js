// 📁 server/controllers/taskController.js (ESM)
import { poolPromise, sql } from '../config/db.js';

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id;

  const {
    title,
    department,
    subject,
    projectId,
    location,
    priority,
    dueDate,
    endDate,
    recurrence,
    weeklyInterval,
    reminder,
    notes,
    newTaskOption,
    assignedUsers = [],
    attachments = [],
    weeklyDays,
    recurrenceSummary,
  } = req.body;

  try {
    const pool = await poolPromise;

    const taskCheck = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT AssignedById FROM Tasks WHERE ID = @ID');

    if (taskCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskCheck.recordset[0];

    const assignedResult = await pool.request()
      .input('TaskID', sql.Int, id)
      .query(`SELECT UserID FROM TaskAssignments WHERE TaskID = @TaskID`);

    const assignedUserIds = assignedResult.recordset.map(u => u.UserID);
    const isCreator = task.AssignedById === requestingUserId;
    const isAssignee = assignedUserIds.includes(requestingUserId);

    if (!isCreator && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    if (isCreator) {
      const request = pool.request();

      request.input('ID', sql.Int, id);
      request.input('Title', sql.NVarChar, title);
      request.input('Department', sql.NVarChar, department);
      request.input('Subject', sql.NVarChar, subject);
      request.input('ProjectID', sql.NVarChar, projectId);
      request.input('Location', sql.NVarChar, location);
      request.input('Priority', sql.NVarChar, priority);
      request.input('DueDate', sql.Date, dueDate);

      let validEndDate = null;
      if (endDate && !isNaN(new Date(endDate))) {
        validEndDate = endDate;
      }
      request.input('EndDate', sql.Date, validEndDate);

      request.input('Recurrence', sql.NVarChar, recurrence);
      request.input('WeeklyInterval', sql.Int, weeklyInterval || null);
      request.input('Reminder', sql.NVarChar, reminder);
      request.input('Notes', sql.NVarChar, notes);
      request.input('NewTaskOption', sql.Int, newTaskOption);
      request.input('WeeklyDays', sql.NVarChar, weeklyDays);

      request.input('RecurrenceSummary', sql.NVarChar, String(recurrenceSummary || ''));

      await request.query(`
        UPDATE Tasks SET 
          Title = @Title,
          Department = @Department,
          Subject = @Subject,
          ProjectID = @ProjectID,
          Location = @Location,
          Priority = @Priority,
          DueDate = @DueDate,
          EndDate = @EndDate,
          Recurrence = @Recurrence,
          WeeklyInterval = @WeeklyInterval,
          Reminder = @Reminder,
          Notes = @Notes,
          NewTaskOption = @NewTaskOption,
          WeeklyDays = @WeeklyDays,
          RecurrenceSummary = @RecurrenceSummary
        WHERE ID = @ID
      `);
    }

    if (notes && isAssignee && !isCreator) {
      await pool.request()
        .input('ID', sql.Int, id)
        .input('Notes', sql.NVarChar, notes)
        .query(`UPDATE Tasks SET Notes = @Notes WHERE ID = @ID`);
    }

    if (req.files && req.files.length > 0) {
      const titlesArray = Array.isArray(req.body.attachmentTitles)
        ? req.body.attachmentTitles
        : [req.body.attachmentTitles];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const title = titlesArray[i] || file.originalname;

        if (!file || !file.filename) continue;

        await pool.request()
          .input('TaskID', sql.Int, id)
          .input('Title', sql.NVarChar, title)
          .input('FileName', sql.NVarChar, file.filename)
          .query('INSERT INTO Attachments (TaskID, Title, FileName) VALUES (@TaskID, @Title, @FileName)');
      }
    }

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

export const addTask = async (req, res) => {
  const {
    title,
    department,
    subject,
    projectId,
    location,
    priority,
    dueDate,
    endDate,
    recurrence,
    reminder,
    notes,
    newTaskOption,
    weeklyDays,
    recurrenceSummary,
    weeklyInterval,
    assignedUsers = [],
  } = req.body;

  const attachments = req.files || [];
  const attachmentTitles = req.body.attachmentTitles;
  const titlesArray = Array.isArray(attachmentTitles) ? attachmentTitles : [attachmentTitles];

  try {
    const pool = await poolPromise;
    const request = pool.request();

    let weeklyDaysString = '';
    if (weeklyDays) {
      try {
        const parsed = typeof weeklyDays === 'string' ? JSON.parse(weeklyDays) : weeklyDays;
        weeklyDaysString = Array.isArray(parsed) ? parsed.join(',') : '';
      } catch (err) {
        console.warn('Invalid weeklyDays JSON:', weeklyDays);
      }
    }

    request.input('Title', sql.NVarChar, title);
    request.input('Department', sql.NVarChar, department);
    request.input('Subject', sql.NVarChar, subject);
    request.input('ProjectID', sql.NVarChar, projectId);
    request.input('Location', sql.NVarChar, location);
    request.input('Priority', sql.NVarChar, priority);
    request.input('DueDate', sql.Date, dueDate);
    request.input('EndDate', sql.Date, endDate);
    request.input('Recurrence', sql.NVarChar, recurrence);
    request.input('Reminder', sql.NVarChar, reminder);
    request.input('Notes', sql.NVarChar, notes);
    request.input('NewTaskOption', sql.Int, newTaskOption);
    request.input('WeeklyDays', sql.NVarChar, weeklyDaysString);
    request.input('RecurrenceSummary', sql.NVarChar, String(recurrenceSummary || ''));
    request.input('AssignedById', sql.Int, req.user.id);
    request.input('WeeklyInterval', sql.Int, weeklyInterval);

    const insertResult = await request.query(`
      INSERT INTO Tasks (
        Title, Department, Subject, ProjectID, Location, Priority,
        DueDate, EndDate, Recurrence, Reminder, Notes, NewTaskOption,
        WeeklyDays, RecurrenceSummary, AssignedById, WeeklyInterval
      )
      OUTPUT INSERTED.ID
      VALUES (
        @Title, @Department, @Subject, @ProjectID, @Location, @Priority,
        @DueDate, @EndDate, @Recurrence, @Reminder, @Notes, @NewTaskOption,
        @WeeklyDays, @RecurrenceSummary, @AssignedById, @WeeklyInterval
      )
    `);

    const taskId = insertResult.recordset[0].ID;

    for (const userId of Array.isArray(assignedUsers) ? assignedUsers : [assignedUsers]) {
      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('UserID', sql.Int, userId)
        .query(`INSERT INTO TaskAssignments (TaskID, UserID) VALUES (@TaskID, @UserID)`);
    }

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      const title = titlesArray[i] || file.originalname;

      if (!file || !file.filename) continue;

      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('Title', sql.NVarChar, title)
        .input('FileName', sql.NVarChar, file.filename)
        .query(`INSERT INTO Attachments (TaskID, Title, FileName) VALUES (@TaskID, @Title, @FileName)`);
    }

    res.status(200).json({ message: 'Task added successfully', taskId });
  } catch (err) {
    console.error('❌ Error adding task:', err);
    res.status(500).json({ message: 'Server error while adding task' });
  }
};

export const getTaskById = async (req, res) => {
  const taskId = req.params.id;
  const loggedInUser = req.user;

  try {
    const pool = await poolPromise;

    const taskResult = await pool
      .request()
      .input("TaskID", sql.Int, taskId)
      .query(`
        SELECT 
          T.*, 
          D.DepartmentName AS Department
        FROM Tasks T
        LEFT JOIN Departments D ON T.Department = D.ID
        WHERE T.ID = @TaskID
      `);

    const task = taskResult.recordset[0];

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const assigneesResult = await pool
      .request()
      .input("TaskID", sql.Int, taskId)
      .query("SELECT UserID FROM TaskAssignments WHERE TaskID = @TaskID");

    const assignedUserIds = assigneesResult.recordset.map(row => row.UserID);

    const isCreator = task.AssignedById === loggedInUser.id;
    const isAssignee = assignedUserIds.includes(loggedInUser.id);

    if (!isCreator && !isAssignee) {
      return res.status(403).json({ message: "Access denied" });
    }

    const attachmentResult = await pool
      .request()
      .input("TaskID", sql.Int, taskId)
      .query("SELECT Title, FileName FROM Attachments WHERE TaskID = @TaskID");

    const creatorResult = await pool
      .request()
      .input("UserID", sql.Int, task.AssignedById)
      .query("SELECT FullName, Photo FROM Users WHERE ID = @UserID");

    const creator = creatorResult.recordset[0];

    const enrichedTask = {
  ...task,
  IsCreator: isCreator,
  IsAssignee: isAssignee,
  CreatorName: creator?.FullName || "Unknown",
  creatorPhoto: creator?.Photo || "",
  AssignedUsers: assignedUserIds.map((uid) => ({ UserID: uid })),
  Attachments: attachmentResult.recordset,
  RecurrenceSummary: task.RecurrenceSummary,
  Department: task.Department // Optional if already part of task
};


    res.status(200).json(enrichedTask);
  } catch (error) {
    console.error("❌ Error in getTaskById:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT 
        T.ID,
        T.Title,
        D.DepartmentName AS Department,
        T.Subject,
        T.ProjectID,
        T.Location,
        T.Priority,
        T.DueDate,
        T.EndDate,
        T.Recurrence,
        T.Reminder,
        T.Notes,
        T.NewTaskOption,
        T.CreatedAt,
        T.WeeklyInterval,
        T.WeeklyDays,
        T.RecurrenceSummary,
        T.AssignedById,
        T.Status
      FROM Tasks T
      LEFT JOIN Departments D ON T.Department = D.ID
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await poolPromise;

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT DISTINCT 
          T.ID,
          T.Title,
          D.DepartmentName AS Department,
          T.Subject,
          T.ProjectID,
          T.Location,
          T.Priority,
          T.DueDate,
          T.EndDate,
          T.Recurrence,
          T.Reminder,
          T.Notes,
          T.NewTaskOption,
          T.CreatedAt,
          T.WeeklyInterval,
          T.WeeklyDays,
          T.RecurrenceSummary,
          T.AssignedById,
          T.Status
        FROM Tasks T
        LEFT JOIN TaskAssignments TA ON T.ID = TA.TaskID
        LEFT JOIN Departments D ON T.Department = D.ID
        WHERE T.AssignedById = @userId OR TA.UserID = @userId
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching user tasks:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export default {
  updateTask,
  getTaskById,
  getAllTasks,
  addTask,
  getUserTasks,
};
