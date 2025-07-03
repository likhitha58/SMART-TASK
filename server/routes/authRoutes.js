import express from 'express';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'; // ✅ Import JWT
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.getUserByCredentials(username, password);
    if (user) {
      // ✅ Create JWT with fullName and photo
      const token = jwt.sign(
        {
          id: user.ID,
          username: user.Username,
          fullName: user.FullName,
          photo: user.Photo,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
console.log("JWT_SECRET used to sign:", process.env.JWT_SECRET);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.ID,
          username: user.Username,
          fullName: user.FullName,
          photo: user.Photo,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;
