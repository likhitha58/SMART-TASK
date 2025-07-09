// 📁 server/controllers/taskController.js (ESM)
import { poolPromise, sql } from '../config/db.js';


export const updateTask = async (req, res) => {
  const { id } = req.params;
  const requestingUserId = req.user.id;

  let {
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
    weeklyDays,
    recurrenceSummary,
    assignedUsers = [],
    attachmentTitles = []
  } = req.body;

  try {
    const pool = await poolPromise;

    const taskCheck = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT AssignedById FROM Tasks WHERE ID = @ID');

    if (taskCheck.recordset.length === 0)
      return res.status(404).json({ message: 'Task not found' });

    const task = taskCheck.recordset[0];

    const assignedResult = await pool.request()
      .input('TaskID', sql.Int, id)
      .query('SELECT UserID FROM TaskAssignments WHERE TaskID = @TaskID');

    const assignedUserIds = assignedResult.recordset.map(u => u.UserID);
    const isCreator = task.AssignedById === requestingUserId;
    const isAssignee = assignedUserIds.includes(requestingUserId);

    if (!isCreator && !isAssignee)
      return res.status(403).json({ message: 'Not authorized to update this task' });

    // ✅ Parse stringified JSON fields safely
    let parsedWeeklyDays = [];
    try {
      parsedWeeklyDays = typeof weeklyDays === 'string' ? JSON.parse(weeklyDays) : weeklyDays;
    } catch (e) {
      console.warn('⚠️ Could not parse weeklyDays:', weeklyDays);
    }

    let parsedAssignedUsers = [];

    try {
      if (Array.isArray(assignedUsers)) {
        parsedAssignedUsers = assignedUsers;
      } else if (typeof assignedUsers === 'string') {
        // Case 1: JSON string like "[5,6]"
        if (assignedUsers.trim().startsWith('[')) {
          parsedAssignedUsers = JSON.parse(assignedUsers);
        } else {
          // Case 2: Just a single user ID as string e.g. "5"
          parsedAssignedUsers = [parseInt(assignedUsers)];
        }
      } else if (typeof assignedUsers === 'number') {
        parsedAssignedUsers = [assignedUsers];
      }
    } catch (err) {
      console.warn('⚠️ Failed to parse assignedUsers:', assignedUsers);
      parsedAssignedUsers = [];
    }


    let parsedAttachmentTitles = [];
    try {
      parsedAttachmentTitles = typeof attachmentTitles === 'string' ? [attachmentTitles] : attachmentTitles;
    } catch (e) {
      console.warn('⚠️ Could not parse attachmentTitles:', attachmentTitles);
    }

    const weeklyDaysString = Array.isArray(parsedWeeklyDays) ? parsedWeeklyDays.join(',') : '';

    if (isCreator) {
      const request = pool.request();
      request.input('ID', sql.Int, id);
      request.input('Title', sql.NVarChar, title);
      request.input('Department', sql.NVarChar, department || null);
      request.input('Subject', sql.NVarChar, subject);
      request.input('ProjectID', sql.NVarChar, projectId);
      request.input('Location', sql.NVarChar, location);
      request.input('Priority', sql.NVarChar, priority);
      request.input('DueDate', sql.Date, dueDate);
      request.input('EndDate', sql.Date, endDate);
      request.input('Recurrence', sql.NVarChar, recurrence);
      request.input('WeeklyInterval', sql.Int, weeklyInterval || null);
      request.input('Reminder', sql.NVarChar, reminder);
      request.input('Notes', sql.NVarChar, notes);
      request.input('NewTaskOption', sql.Int, newTaskOption || null);
      request.input('WeeklyDays', sql.NVarChar, weeklyDaysString);
      request.input('RecurrenceSummary', sql.NVarChar, recurrenceSummary);

      await request.query(`
        UPDATE Tasks SET
          Title=@Title, Department=@Department, Subject=@Subject,
          ProjectID=@ProjectID, Location=@Location, Priority=@Priority,
          DueDate=@DueDate, EndDate=@EndDate, Recurrence=@Recurrence,
          WeeklyInterval=@WeeklyInterval, Reminder=@Reminder, Notes=@Notes,
          NewTaskOption=@NewTaskOption, WeeklyDays=@WeeklyDays,
          RecurrenceSummary=@RecurrenceSummary
        WHERE ID=@ID
      `);

      await pool.request()
        .input('TaskID', sql.Int, id)
        .query('DELETE FROM TaskAssignments WHERE TaskID = @TaskID');

      for (const userId of parsedAssignedUsers) {
        await pool.request()
          .input('TaskID', sql.Int, id)
          .input('UserID', sql.Int, userId)
          .query('INSERT INTO TaskAssignments (TaskID, UserID) VALUES (@TaskID, @UserID)');
      }
    }

    if (!isCreator && isAssignee && notes) {
      const now = new Date();
      await pool.request()
        .input('TaskID', sql.Int, id)
        .input('UserID', sql.Int, requestingUserId)
        .input('Notes', sql.NVarChar(sql.MAX), notes)
        .input('Now', sql.DateTime, now)
        .query(`
          MERGE TaskNotes AS target
          USING (SELECT @TaskID AS TaskID, @UserID AS UserID) AS source
          ON (target.TaskID = source.TaskID AND target.UserID = source.UserID)
          WHEN MATCHED THEN 
            UPDATE SET Notes = @Notes, UpdatedAt = @Now
          WHEN NOT MATCHED THEN
            INSERT (TaskID, UserID, Notes, CreatedAt)
            VALUES (@TaskID, @UserID, @Notes, @Now);
        `);
    }

    if ((isCreator || isAssignee) && req.files?.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const title = Array.isArray(parsedAttachmentTitles)
          ? parsedAttachmentTitles[i] || file.originalname
          : file.originalname;

        await pool.request()
          .input('TaskID', sql.Int, id)
          .input('Title', sql.NVarChar, title)
          .input('FileName', sql.NVarChar, file.filename)
          .input('UploadedBy', sql.Int, requestingUserId)
          .query(`
            INSERT INTO Attachments (TaskID, Title, FileName, UploadedBy)
            VALUES (@TaskID, @Title, @FileName, @UploadedBy)
          `);
      }
    }

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ message: err.message || 'Server error' });
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
  const taskId = parseInt(req.params.id);
  if (isNaN(taskId)) {
    return res.status(400).json({ message: 'Invalid task ID' });
  }

  const loggedInUser = req.user;

  try {
    const pool = await poolPromise;

    // ✅ Removed invalid join
    const taskResult = await pool
      .request()
      .input("TaskID", sql.Int, taskId)
      .query(`SELECT * FROM Tasks WHERE ID = @TaskID`);

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
        T.Department,
        D.DepartmentName,
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
      WHERE T.Status = 0
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
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
          T.Department,
          D.DepartmentName, -- ✅ Add this
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
        LEFT JOIN Departments D ON T.Department = D.ID -- ✅ JOIN with Departments
        LEFT JOIN TaskAssignments TA ON T.ID = TA.TaskID
        WHERE (T.AssignedById = @userId OR TA.UserID = @userId)
        AND T.Status = 0
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching user tasks:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};


// Upload Attachment
export const uploadAttachment = async (req, res) => {
  try {
    const { title, taskId } = req.body;
    const file = req.file;

    if (!file || !title || !taskId) {
      return res.status(400).json({ message: 'Missing required data or file' });
    }

    const pool = await poolPromise;

    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .input('Title', sql.VarChar, title)
      .input('FileName', sql.VarChar, file.filename)
      .query(`
        INSERT INTO Attachments (TaskID, Title, FileName)
        VALUES (@TaskID, @Title, @FileName)
      `);

    res.status(200).json({
      message: 'Attachment uploaded successfully',
      attachment: {
        Title: title,
        FilePath: file.filename,
      },
    });
  } catch (error) {
    console.error('❌ Upload Attachment Error:', error);
    res.status(500).json({ message: 'Server error during attachment upload' });
  }
};

