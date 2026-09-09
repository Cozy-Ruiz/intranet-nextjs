const mysql = require('mysql2/promise');
const oracle = require('oracledb');

// Inicializa Oracle en Thick mode si se configura la ruta del cliente
const oracleClientLibDir = process.env.ORACLE_CLIENT_LIB_DIR;
if (oracleClientLibDir) {
  oracle.initOracleClient({ libDir: oracleClientLibDir });
} else if (process.env.ORACLE_MODE === 'thick') {
  throw new Error('ORACLE_CLIENT_LIB_DIR debe estar configurado para Oracle Thick mode');
} else {
  console.warn('Oracle Thin mode active: set ORACLE_MODE=thick and ORACLE_CLIENT_LIB_DIR to use Thick mode if your server version requires it.');
}

// Usa variables de entorno o valores por defecto
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306, // 👈 aquí va el puerto
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8'
});

const oraclePoolPromise = oracle.createPool({
  user: process.env.ORACLE_USER || 'scia',
  password: process.env.ORACLE_PASS || 'scia',
  connectString: `${process.env.ORACLE_HOST || 'localhost'}:${process.env.ORACLE_PORT || 1521}/${process.env.ORACLE_SERVICE_NAME || 'ORCL'}`,
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60
});

const oraclePool = {
  execute: async (sql, binds = [], options = {}) => {
    const pool = await oraclePoolPromise;
    const connection = await pool.getConnection();
    try {
      return await connection.execute(sql, binds, options);
    } finally {
      await connection.close();
    }
  },
  getConnection: async () => {
    const pool = await oraclePoolPromise;
    return pool.getConnection();
  },
  close: async () => {
    const pool = await oraclePoolPromise;
    return pool.close(0);
  }
};

// Exporta ambos pools para usarlos en otros módulos
module.exports = { mysqlPool: pool, oraclePool };