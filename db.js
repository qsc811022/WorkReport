const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,       // 例如 'localhost'
  database: process.env.DB_NAME,
  options: {
    encrypt: false,                     // 依你的環境而定
    trustServerCertificate: true
  }
};

// 建立一個全域連線池
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ MSSQL 資料庫連線成功');
    return pool;
  })
  .catch(err => {
    console.error('❌ 資料庫連線失敗：', err);
  });

module.exports = {
  sql,
  poolPromise
};
