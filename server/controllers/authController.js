import express from 'express';

const router = express.Router();

router.post('/login', login);

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query('SELECT * FROM Users WHERE Username = @username AND Password = @password');

    if (result.recordset.length > 0) {
      res.status(200).json({ message: 'Login successful', token: 'dummy_token' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default router;
