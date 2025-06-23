import { poolPromise, sql } from '../db.js'; // Add `.js` extension for ESM imports
import express from 'express';

export const getAllUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Users');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addUser = async (req, res) => {
  const { Name, Email, Username, Password } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Name', sql.VarChar, Name)
      .input('Email', sql.VarChar, Email)
      .input('Username', sql.VarChar, Username)
      .input('Password', sql.VarChar, Password)
      .query('INSERT INTO Users (Name, Email, Username, Password) VALUES (@Name, @Email, @Username, @Password)');
    
    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ message: 'Failed to add user' });
  }
};


export default userController;