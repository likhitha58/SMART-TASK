import sql from 'mssql';
import { config } from '../config/db.js';

// 1️⃣ GET all completed tasks (status = 1)
export const getAllTaskHistory = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
  SELECT DISTINCT 
    T.*, 
    D.DepartmentName
  FROM Tasks T
  LEFT JOIN CurrentTask CT ON T.ID = CT.TaskID
  LEFT JOIN Departments D ON T.Department = D.ID
  WHERE T.Status = 1 OR CT.TaskStatus = 1
  ORDER BY T.CreatedAt DESC
`);

    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error fetching all completed tasks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// 2️⃣ FILTER completed tasks based on optional filters
export const filterTaskHistory = async (req, res) => {
  try {
    const { projectId, department, taskName, fromDate, toDate } = req.query;

    let query = `
  SELECT DISTINCT 
    T.*, 
    D.DepartmentName 
  FROM Tasks T
  LEFT JOIN CurrentTask CT ON T.ID = CT.TaskID
  LEFT JOIN Departments D ON T.Department = D.ShortName
  WHERE (T.Status = 1 OR CT.TaskStatus = 1)
`;


    const conditions = [];
    const inputParams = [];

    if (projectId) {
      conditions.push('T.ProjectID = @projectId');
      inputParams.push({ name: 'projectId', type: sql.VarChar, value: projectId });
    }

    if (department) {
      conditions.push('D.DepartmentName = @department');
      inputParams.push({ name: 'department', type: sql.VarChar, value: department });

    }

    if (taskName) {
      conditions.push('T.Title LIKE @taskName');
      inputParams.push({ name: 'taskName', type: sql.VarChar, value: `%${taskName}%` });
    }

    if (fromDate && toDate) {
      conditions.push('T.CreatedAt BETWEEN @fromDate AND @toDate');
      inputParams.push({ name: 'fromDate', type: sql.DateTime, value: fromDate });
      inputParams.push({ name: 'toDate', type: sql.DateTime, value: toDate });
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY T.CreatedAt DESC';

    const pool = await sql.connect(config);
    const request = pool.request();

    inputParams.forEach(param => {
      request.input(param.name, param.type, param.value);
    });

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error filtering task history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 3️⃣ GET task history details by task ID (creator + participants + attachments + notes)
export const getTaskHistoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);

    // 🔹 Fetch main task + creator info
    const [taskResult, reviewResult] = await Promise.all([
      pool.request()
        .input('taskId', sql.Int, id)
        .query(`
          SELECT 
            T.ID, T.Title, T.CreatedAt, T.EndDate, T.Status, T.Notes AS CreatorNotes, 
            T.AssignedById AS CreatorId, U.FullName AS CreatorName, U.Photo AS CreatorPhoto
          FROM Tasks T
          LEFT JOIN Users U ON T.AssignedById = U.ID
          WHERE T.ID = @taskId
        `),
      pool.request()
        .input('taskId', sql.Int, id)
        .query(`SELECT TaskReviewNotes FROM CurrentTask WHERE TaskID = @taskId`)
    ]);

    const task = taskResult.recordset[0];
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const reviewNotes = reviewResult.recordset[0]?.TaskReviewNotes || '';

    // 🔹 Fetch creator attachments
    const creatorAttachments = await pool.request()
      .input('taskId', sql.Int, id)
      .input('creatorId', sql.Int, task.CreatorId)
      .query(`
        SELECT Title, FileName 
        FROM Attachments 
        WHERE TaskID = @taskId AND UploadedBy = @creatorId
      `);

    // 🔹 Fetch participants (assigned users who added notes)
    const assignedUserResults = await pool.request()
      .input('taskId', sql.Int, id)
      .query(`
        SELECT DISTINCT U.ID, U.FullName, U.Photo
        FROM TaskNotes TN
        INNER JOIN Users U ON TN.UserID = U.ID
        WHERE TN.TaskID = @taskId
      `);

    const assignedUsers = [];

    for (const user of assignedUserResults.recordset) {
      // 📝 Notes
      const notesResult = await pool.request()
        .input('taskId', sql.Int, id)
        .input('userId', sql.Int, user.ID)
        .query(`
          SELECT Notes 
          FROM TaskNotes 
          WHERE TaskID = @taskId AND UserID = @userId
        `);

      // 📎 Attachments
      const attResult = await pool.request()
        .input('taskId', sql.Int, id)
        .input('userId', sql.Int, user.ID)
        .query(`
          SELECT Title, FileName 
          FROM Attachments 
          WHERE TaskID = @taskId AND UploadedBy = @userId
        `);

      assignedUsers.push({
        id: user.ID,
        name: user.FullName,
        photo: user.Photo,
        notes: notesResult.recordset.map(row => row.Notes).join('\n') || '',
        attachments: attResult.recordset
      });
    }

    // ✅ Final response
    res.json({
      task: {
        ID: task.ID,
        Title: task.Title,
        CreatedAt: task.CreatedAt,
        EndDate: task.EndDate,
        Status: task.Status,
        CreatorId: task.CreatorId,
        CreatorName: task.CreatorName,
        CreatorPhoto: task.CreatorPhoto,
        CreatorNotes: task.CreatorNotes || '',
        TaskReviewNotes: reviewNotes,
        attachments: creatorAttachments.recordset,
        assignedUsers: assignedUsers
      }
    });

  } catch (err) {
    console.error('❌ Error fetching task history:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
