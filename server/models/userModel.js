// userModel.js

import { sql, config as dbConfig } from '../config/db.js';

// Function to get user by username and password (for login)
export async function getUserByCredentials(username, password) {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .input('Username', sql.VarChar, username)
      .input('Password', sql.VarChar, password)
      .query('SELECT * FROM Users WHERE Username = @Username AND Password = @Password');

    return result.recordset[0]; // Return first match (if any)
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Function to add a new user
export async function addUser(name, email, username, password) {
  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input('Name', sql.VarChar, name)
      .input('Email', sql.VarChar, email)
      .input('Username', sql.VarChar, username)
      .input('Password', sql.VarChar, password)
      .query('INSERT INTO Users (Name, Email, Username, Password) VALUES (@Name, @Email, @Username, @Password)');

    return { message: 'User added successfully' };
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
}



export default {
  getUserByCredentials,
  addUser
};