const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// ✅ 設定 public 資料夾為靜態網站資源
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 自動導向 index.html（訪問 / 時）
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(cors()); // ✅ 啟用所有來源的跨域

// ✅ 其他 API 路由
app.use(express.json());
app.use('/api/db', require('./routes/dbtest'));
app.use('/api/worklogs', require('./routes/worklogs'));
const weeklyReportsRoute = require('./routes/weeklyReports');
app.use('/api/weeklyreports', weeklyReportsRoute);
app.listen(3000, () => {
  console.log('伺服器啟動於 http://localhost:3000');
});
