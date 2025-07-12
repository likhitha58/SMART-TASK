// controllers/reviewController.js
import sql from 'mssql';
import { poolPromise } from '../config/db.js';

// ✅ GET All Tasks Created by Logged-In User (with Department Name)
export const getOwnCreatedTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT 
          T.ID, 
          T.Title, 
          T.Priority, 
          T.DueDate, 
          T.CreatedAt,
          T.Department, 
          D.DepartmentName, -- ✅ JOIN to get department name
          U.FullName AS CreatorName,
          U.Photo AS CreatorPhoto
        FROM Tasks T
        LEFT JOIN Users U ON T.AssignedById = U.ID
        LEFT JOIN Departments D ON T.Department = D.DepartmentName
        WHERE T.AssignedById = @UserID
          AND NOT EXISTS (
            SELECT 1 
            FROM CurrentTask CT 
            WHERE CT.TaskID = T.ID AND CT.TaskStatus = 1
          )
      `);

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('❌ Failed to fetch created tasks:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



// 2️⃣ Save Review Notes and Status to CurrentTask
export const saveReview = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { notes, status } = req.body;
    const userId = req.user.id;

    const pool = await poolPromise;

    await pool.request()
      .input('TaskID', sql.Int, taskId)
      .input('TaskCount', sql.Int, 1) // Optional: auto-increment logic can be added later
      .input('Notes', sql.VarChar(sql.MAX), notes)
      .input('Status', sql.SmallInt, status)
      .input('UserID', sql.Int, userId)
      .query(`
        INSERT INTO CurrentTask (
          TaskID, TaskCount,
          TaskReminderDueDate, TaskDueDate,
          TaskReviewNotes, TaskStatus, TaskCompletedOn,
          CreatedBy, CreatedOn, UpdatedBy, UpdatedOn
        )
        VALUES (
          @TaskID, @TaskCount,
          NULL, NULL,
          @Notes, @Status, NULL,
          @UserID, GETDATE(), @UserID, GETDATE()
        )
      `);

    res.status(200).json({ message: '✅ Review saved in CurrentTask.' });
  } catch (err) {
    console.error('❌ Error saving review:', err);
    res.status(500).json({ message: 'Failed to save review.' });
  }
};

// 3️⃣ Upload Attachments for Review
export const uploadReviewAttachments = async (req, res) => {
  try {
    const { taskId, attachmentTitles } = req.body;
    const uploadedBy = req.user.id;
    const files = req.files;

    if (!files?.length) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const pool = await poolPromise;

    for (let i = 0; i < files.length; i++) {
      const title = Array.isArray(attachmentTitles) ? attachmentTitles[i] : attachmentTitles;
      const file = files[i];

      await pool.request()
        .input('TaskID', sql.Int, taskId)
        .input('Title', sql.VarChar(255), title || 'Untitled')
        .input('FileName', sql.VarChar(255), file.filename)
        .input('UploadedBy', sql.Int, uploadedBy)
        .query(`
          INSERT INTO Attachments (TaskID, Title, FileName, UploadedBy)
          VALUES (@TaskID, @Title, @FileName, @UploadedBy)
        `);
    }

    res.status(200).json({
      message: '✅ Attachments uploaded.',
      attachments: files.map((file, index) => ({
        Title: Array.isArray(attachmentTitles) ? attachmentTitles[index] : attachmentTitles,
        FileName: file.filename
      }))
    });
  } catch (err) {
    console.error('❌ Error uploading attachments:', err);
    res.status(500).json({ message: 'Failed to upload attachments.' });
  }
};

// 4️⃣ Fetch Review Page Data (Task Info, Creator Info, Attachments, Participants)
export const getReviewData = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const pool = await poolPromise;

    // 🔍 Task + Creator Info
    const taskResult = await pool.request()
      .input('ID', sql.Int, id)
      .query(`
        SELECT 
          T.ID, T.Title, T.Description, T.Subject, T.Priority, 
          T.DueDate, T.EndDate, T.Recurrence, T.RecurrenceSummary,
          T.Status, T.Department, T.Location, T.ProjectID, T.AssignedById,
          T.Notes,
          U.FullName AS CreatorName, U.Photo AS CreatorPhoto
        FROM Tasks T
        LEFT JOIN Users U ON T.AssignedById = U.ID
        WHERE T.ID = @ID
      `);

    const task = taskResult.recordset[0];
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    // 👥 Participants with their Notes and Attachments
    const participantsResult = await pool.request()
      .input('TaskID', sql.Int, id)
      .query(`
        SELECT 
          U.ID,
          U.FullName AS Name,
          U.Photo,
          (
            SELECT TOP 1 Notes FROM TaskNotes 
            WHERE TaskID = TA.TaskID AND UserID = TA.UserID
            ORDER BY UpdatedAt DESC
          ) AS Notes,
          (
            SELECT 
              A.Title, A.FileName
            FROM Attachments A
            WHERE A.TaskID = TA.TaskID AND A.UploadedBy = TA.UserID
            FOR JSON PATH
          ) AS Attachments
        FROM TaskAssignments TA
        JOIN Users U ON TA.UserID = U.ID
        WHERE TA.TaskID = @TaskID
      `);

    // 📎 Attachments for the entire task
    const attachmentsResult = await pool.request()
      .input('TaskID', sql.Int, id)
      .query(`SELECT * FROM Attachments WHERE TaskID = @TaskID`);

    const isCreator = userId === task.AssignedById;

    const creatorPhoto = task.CreatorPhoto
      ? `${process.env.BASE_URL}/uploads/${task.CreatorPhoto}`
      : null;

    // 🔄 Parse JSON attachments inside each participant
    const participants = participantsResult.recordset.map(p => ({
      ...p,
      Attachments: p.Attachments ? JSON.parse(p.Attachments) : []
    }));

    res.status(200).json({
      task: {
        ...task,
        CreatorName: task.CreatorName || 'Admin',
        CreatorPhoto: creatorPhoto
      },
      attachments: attachmentsResult.recordset || [],
      participants,
      isCreator
    });
  } catch (err) {
    console.error('❌ Error loading review data:', err.message, err.stack);
    res.status(500).json({ message: 'Failed to load review data.' });
  }
};
