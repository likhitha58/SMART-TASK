// db.js
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  user: 'admin',
  password: 'admin123',
  server: 'localhost',
  database: 'SmartTaskDB',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('❌ Database Connection Failed:', err);
    throw err;
  });

export { sql, config, poolPromise }; // ✅ Named exports
