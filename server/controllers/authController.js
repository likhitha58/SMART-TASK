import express from 'express';
import jwt from 'jsonwebtoken';
import { poolPromise, sql } from '../config/db.js';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret'; // 🔐 Use env in prod

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT * FROM Users WHERE Username = @username AND Password = @password');

    const user = result.recordset[0];

    if (user) {
      // ✅ Generate JWT with user ID and username
      const token = jwt.sign(
        {
          id: user.ID, // assuming your Users table has a column named ID
          username: user.Username,
          photo: user.Photo, 
        },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.status(200).json({ message: 'Login successful', token });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

router.post('/login', login);

export default router;
