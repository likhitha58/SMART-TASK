// 📁 controllers/masters/locationController.js
import sql from 'mssql';
import {config} from '../../config/db.js';

export const getAllLocations = async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Locations');
    res.json(result.recordset);

  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM Locations WHERE ID = @ID');
    res.json({ data: result.recordset[0] });
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
};

export const addLocation = async (req, res) => {
  try {
    const { State, District, LocationName, ShortName, Status } = req.body;
    const pool = await sql.connect(config);
    await pool.request()
      .input('State', sql.VarChar, State)
      .input('District', sql.VarChar, District)
      .input('LocationName', sql.VarChar, LocationName)
      .input('ShortName', sql.VarChar, ShortName)
      .input('Status', sql.VarChar, Status)
      .query(`
        INSERT INTO Locations (State, District, LocationName, ShortName, Status)
        VALUES (@State, @District, @LocationName, @ShortName, @Status)
      `);
    res.status(201).json({ message: 'Location added successfully' });
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({ error: 'Failed to add location' });
  }
};

export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { State, District, LocationName, ShortName, Status } = req.body;
    const pool = await sql.connect(config);
    await pool.request()
      .input('ID', sql.Int, id)
      .input('State', sql.VarChar, State)
      .input('District', sql.VarChar, District)
      .input('LocationName', sql.VarChar, LocationName)
      .input('ShortName', sql.VarChar, ShortName)
      .input('Status', sql.VarChar, Status)
      .query(`
        UPDATE Locations SET
          State = @State,
          District = @District,
          LocationName = @LocationName,
          ShortName = @ShortName,
          Status = @Status
        WHERE ID = @ID
      `);
    res.json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Failed to update location' });
  }
};
