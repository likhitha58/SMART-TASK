import express from 'express';
import userModel from '../models/userModel.js'; // Make sure userModel.js uses export default
import sql from 'mssql'; // Assuming you're using it somewhere in future routes

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModel.getUserByCredentials(username, password);
    if (user) {
      res.status(200).json({ success: true, message: 'Login successful', user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
