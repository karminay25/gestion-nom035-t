import sql from 'mssql';

const config: sql.config = {
  user: process.env.CONTPAQI_SQL_USER || 'sa',
  password: process.env.CONTPAQI_SQL_PASSWORD || 'Compac01',
  server: process.env.CONTPAQI_SQL_SERVER || '192.168.1.147',
  database: 'ctlola',
  connectionTimeout: 60000,
  requestTimeout: 60000,
  options: {
    instanceName: process.env.CONTPAQI_SQL_INSTANCE || 'COMPAC',
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

/**
 * Obtiene un pool de conexión a una base de datos específica de CONTPAQi.
 */
export async function getPool(dbName?: string) {
  try {
    const poolConfig = { ...config, database: dbName || config.database };
    const pool = await new sql.ConnectionPool(poolConfig).connect();
    return pool;
  } catch (err) {
    console.error('SQL Connection Error: ', err);
    throw err;
  }
}

/**
 * Ejecuta una consulta simple en una base de datos.
 */
export async function query(sqlQuery: string, dbName?: string) {
  const pool = await getPool(dbName);
  try {
    const result = await pool.request().query(sqlQuery);
    return result;
  } finally {
    await pool.close();
  }
}
