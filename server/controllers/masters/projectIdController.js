import sql from 'mssql';
import {config} from '../../config/db.js';

export const getAllProjectIds = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM ProjectIDs');
    res.json({ data: result.recordset });
  } catch (err) {
    console.error('Error fetching project IDs:', err);
    res.status(500).json({ error: 'Failed to fetch project IDs' });
  }
};

export const getProjectIdById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM ProjectIDs WHERE ID = @ID');
    res.json({ data: result.recordset[0] });
  } catch (err) {
    console.error('Error fetching project ID:', err);
    res.status(500).json({ error: 'Failed to fetch project ID' });
  }
};

export const addProjectId = async (req, res) => {
  try {
    const {
      ProjectID,
      ProjectName,
      PracticeArea,
      Client,
      NatureOfWork,
      AgreementExecutor,
      Location,
      Status
    } = req.body;

    const pool = await sql.connect(config);
    await pool.request()
      .input('ProjectID', sql.VarChar, ProjectID)
      .input('ProjectName', sql.VarChar, ProjectName)
      .input('PracticeArea', sql.VarChar, PracticeArea)
      .input('Client', sql.VarChar, Client)
      .input('NatureOfWork', sql.VarChar, NatureOfWork)
      .input('AgreementExecutor', sql.VarChar, AgreementExecutor)
      .input('Location', sql.VarChar, Location)
      .input('Status', sql.VarChar, Status)
      .query(`
        INSERT INTO ProjectIDs (ProjectID, ProjectName, PracticeArea, Client, NatureOfWork, AgreementExecutor, Location, Status)
        VALUES (@ProjectID, @ProjectName, @PracticeArea, @Client, @NatureOfWork, @AgreementExecutor, @Location, @Status)
      `);

    res.status(201).json({ message: 'Project ID added successfully' });
  } catch (err) {
    console.error('Error adding project ID:', err);
    res.status(500).json({ error: 'Failed to add project ID' });
  }
};

export const updateProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ProjectID,
      ProjectName,
      PracticeArea,
      Client,
      NatureOfWork,
      AgreementExecutor,
      Location,
      Status
    } = req.body;

    const pool = await sql.connect(config);
    await pool.request()
      .input('ID', sql.Int, id)
      .input('ProjectID', sql.VarChar, ProjectID)
      .input('ProjectName', sql.VarChar, ProjectName)
      .input('PracticeArea', sql.VarChar, PracticeArea)
      .input('Client', sql.VarChar, Client)
      .input('NatureOfWork', sql.VarChar, NatureOfWork)
      .input('AgreementExecutor', sql.VarChar, AgreementExecutor)
      .input('Location', sql.VarChar, Location)
      .input('Status', sql.VarChar, Status)
      .query(`
        UPDATE ProjectIDs SET
          ProjectID = @ProjectID,
          ProjectName = @ProjectName,
          PracticeArea = @PracticeArea,
          Client = @Client,
          NatureOfWork = @NatureOfWork,
          AgreementExecutor = @AgreementExecutor,
          Location = @Location,
          Status = @Status
        WHERE ID = @ID
      `);

    res.json({ message: 'Project ID updated successfully' });
  } catch (err) {
    console.error('Error updating project ID:', err);
    res.status(500).json({ error: 'Failed to update project ID' });
  }
};
