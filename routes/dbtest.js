const express = require('express');
const router = express.Router();
const db = require('../db'); // 匯入你自己寫的 db.js

// 測試資料庫是否成功連線
router.get('/test', async (req, res) => {
  try {
    const request = await db.request();
    const result = await request.query('SELECT GETDATE() AS Now'); // 取得資料庫目前時間
    res.json({
      message: '✅ 資料庫連線成功！',
      serverTime: result.recordset[0].Now
    });
  } catch (err) {
    console.error('❌ 資料庫連線失敗', err);
    res.status(500).json({ error: '連線錯誤', detail: err.message });
  }
});

module.exports = router;
