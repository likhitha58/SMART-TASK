// 📁 server/routes/userRoutes.js or server/controllers/userController.js
import express from 'express';
import { poolPromise, sql } from '../db.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Users');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a single user
router.post('/add', async (req, res) => {
  const { Name, Email, Username, Password } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.VarChar, Name)
      .input('Email', sql.VarChar, Email)
      .input('Username', sql.VarChar, Username)
      .input('Password', sql.VarChar, Password)
      .query(`INSERT INTO Users (Name, Email, Username, Password)
              VALUES (@Name, @Email, @Username, @Password)`);
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ message: 'Failed to add user' });
  }
});

// BULK fetch users
router.post('/bulk', async (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'No user IDs provided' });
  }

  try {
    const pool = await poolPromise;
    const idList = userIds.map(id => `'${id}'`).join(','); // quoted for SQL

    const result = await pool.request().query(`
      SELECT ID AS id, FullName AS name, Email AS email
      FROM Users
      WHERE ID IN (${idList})
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users in bulk:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
