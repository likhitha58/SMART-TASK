import express from 'express';
// import sql from 'mssql';
import multer from 'multer';
import path from 'path';
import { sql, config as dbConfig } from '../config/db.js';


const router = express.Router();

// Setup for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // ensure folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage }); // Corrected to use storage config

// POST: Add a new employee
router.post('/', upload.single('photo'), async (req, res) => {
  const { fullname, email, username, password, mobile, department, role, status } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('FullName', sql.VarChar, fullname)
      .input('Email', sql.VarChar, email)
      .input('Username', sql.VarChar, username)
      .input('Password', sql.VarChar, password)
      .input('Mobile', sql.VarChar, mobile)
      .input('Department', sql.VarChar, department)
      .input('Role', sql.VarChar, role)
      .input('Status', sql.VarChar, status)
      .input('Photo', sql.VarChar, photo)
      .query(`
        INSERT INTO Users (FullName, Email, Username, Password, Mobile, Department, Role, Status, Photo)
        VALUES (@FullName, @Email, @Username, @Password, @Mobile, @Department, @Role, @Status, @Photo)
      `);

    res.status(200).json({ message: 'Employee added successfully' });
  } catch (err) {
    console.error('Error inserting employee:', err);
    res.status(500).json({ error: 'Failed to add employee' });
  }
});

// GET all employees
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Users');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT: Update employee by ID
router.put('/update/:id', upload.single('photo'), async (req, res) => {
  const { id } = req.params;
  const {
    fullname,
    email,
    username,
    mobile,
    department,
    role,
    status,
    password
  } = req.body;

  const photo = req.file ? req.file.filename : null;

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input('id', sql.Int, id)
      .input('fullname', sql.VarChar, fullname)
      .input('email', sql.VarChar, email)
      .input('username', sql.VarChar, username)
      .input('mobile', sql.VarChar, mobile)
      .input('department', sql.VarChar, department)
      .input('role', sql.VarChar, role)
      .input('status', sql.VarChar, status)
      .input('password', sql.VarChar, password)
      .input('photo', sql.VarChar, photo)
      .query(`
        UPDATE Users
        SET
          FullName = @fullname,
          Email = @email,
          Username = @username,
          Mobile = @mobile,
          Department = @department,
          Role = @role,
          Status = @status,
          Password = @password,
          Photo = COALESCE(@photo, Photo)
        WHERE Id = @id
      `);

    res.status(200).json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error('Error updating employee:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

// GET: Get employee by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE Id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.recordset[0];
    res.status(200).json({
      id: user.Id,
      fullname: user.FullName,
      email: user.Email,
      username: user.Username,
      mobile: user.Mobile,
      department: user.Department,
      role: user.Role,
      status: user.Status,
      photo: user.Photo, // ✅ Add this line
    });


  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Fetch failed' });
  }
});

export default router;
