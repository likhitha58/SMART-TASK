import { poolPromise, sql } from '../config/db.js';
import fs from 'fs';
import path from 'path';

export const addReview = async (req, res) => {
  try {
    const { taskId, reviewRound, notes } = req.body;
    const reviewerId = req.user.id;

    const pool = await poolPromise;
    const request = pool.request();

    request.input('TaskID', sql.Int, taskId);
    request.input('ReviewerID', sql.Int, reviewerId);
    request.input('ReviewRound', sql.Int, reviewRound);
    request.input('Notes', sql.NVarChar(sql.MAX), notes);

    const result = await request.query(`
      INSERT INTO TaskReviews (TaskID, ReviewerID, ReviewRound, Notes)
      OUTPUT INSERTED.ID
      VALUES (@TaskID, @ReviewerID, @ReviewRound, @Notes)
    `);

    const reviewId = result.recordset[0].ID;

    const attachments = req.files || [];
    const titlesArray = Array.isArray(req.body.attachmentTitles)
      ? req.body.attachmentTitles
      : [req.body.attachmentTitles];

    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      const title = titlesArray[i] || file.originalname;

      await pool.request()
        .input('ReviewID', sql.Int, reviewId)
        .input('Title', sql.NVarChar, title)
        .input('FileName', sql.NVarChar, file.filename)
        .query(`
          INSERT INTO ReviewAttachments (ReviewID, Title, FileName)
          VALUES (@ReviewID, @Title, @FileName)
        `);
    }

    res.status(201).json({ message: 'Review added successfully', reviewId });
  } catch (error) {
    console.error('❌ Error in addReview:', error);
    res.status(500).json({ message: 'Server error while adding review' });
  }
};

export const getReviewsByTaskId = async (req, res) => {
  const { taskId } = req.params;

  try {
    const pool = await poolPromise;

    const reviewsResult = await pool.request()
      .input('TaskID', sql.Int, taskId)
      .query(`
        SELECT R.*, U.FullName AS ReviewerName, U.Photo AS ReviewerPhoto
        FROM TaskReviews R
        JOIN Users U ON R.ReviewerID = U.ID
        WHERE R.TaskID = @TaskID
        ORDER BY R.ReviewRound ASC
      `);

    const reviews = reviewsResult.recordset;

    for (let review of reviews) {
      const attachmentsResult = await pool.request()
        .input('ReviewID', sql.Int, review.ID)
        .query(`
          SELECT ID, Title, FileName, UploadedAt
          FROM ReviewAttachments
          WHERE ReviewID = @ReviewID
        `);

      review.Attachments = attachmentsResult.recordset;
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error('❌ Error in getReviewsByTaskId:', error);
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
};

export const downloadReviewAttachment = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.resolve('uploads', filename); // ensure uploads folder is correctly set

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
};
