// 📁 backend/controllers/masters/departmentController.js
// import sql from 'mssql';
import { config } from '../../config/db.js'; 
import { poolPromise, sql } from '../../config/db.js'; 
// import pool from '../config/db.js'; 
export const addDepartment = async (req, res) => {
  const { DepartmentName, ShortName, Status } = req.body;
  try {
    let pool = await sql.connect(config);
    await pool
      .request()
      .input('DepartmentName', sql.VarChar, DepartmentName)
      .input('ShortName', sql.VarChar, ShortName)
      .input('Status', sql.VarChar, Status)
      .query('INSERT INTO Departments (DepartmentName, ShortName, Status) VALUES (@DepartmentName, @ShortName, @Status)');

    res.status(201).json({ message: 'Department added successfully' });
  } catch (err) {
    console.error('Error inserting department:', err);
    res.status(500).json({ message: 'Failed to add department' });
  }
};

export const getDepartments = async (req, res) => {
  try {
    let pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Departments ORDER BY ID DESC');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ message: 'Failed to fetch departments' });
  }
};

export const getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM Departments WHERE ID = @ID');

    if (result.recordset.length > 0) {
      res.json(result.recordset[0]); // ✅ return only one object
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    console.error('DB Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const editDepartment = async (req, res) => {
  const { id } = req.params;
  const { DepartmentName, ShortName, Status } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('ID', sql.Int, id)
      .input('DepartmentName', sql.NVarChar, DepartmentName)
      .input('ShortName', sql.NVarChar, ShortName)
      .input('Status', sql.NVarChar, Status)
      .query(`
        UPDATE Departments
        SET DepartmentName = @DepartmentName,
            ShortName = @ShortName,
            Status = @Status
        WHERE ID = @ID
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department updated successfully' });
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// export { editDepartment, getDepartments, addDepartment /* and others */ };

