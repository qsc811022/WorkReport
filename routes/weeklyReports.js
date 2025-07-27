const express = require('express');
const router = express.Router();
const sql = require('mssql');

const db = require('../db'); // 你自己的 db.js 連線檔案

// 儲存週報（新增或更新）
router.post('/save', async (req, res) => {
  const { userId, startDate, endDate, reportText } = req.body;

  if (!userId || !startDate || !endDate || !reportText) {
    return res.status(400).json({ success: false, message: '缺少必要欄位' });
  }

  try {
    // 先查是否已存在
    const [rows] = await pool.query(
      'SELECT Id FROM WeeklyReports WHERE UserId = ? AND StartDate = ?',
      [userId, startDate]
    );

    if (rows.length > 0) {
      // 更新
      await pool.query(
        'UPDATE WeeklyReports SET ReportText = ?, EndDate = ? WHERE Id = ?',
        [reportText, endDate, rows[0].Id]
      );
    } else {
      // 新增
      await pool.query(
        'INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText) VALUES (?, ?, ?, ?)',
        [userId, startDate, endDate, reportText]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ 儲存週報失敗', err);
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// ✅ POST /api/weeklyreports/submit
router.post('/submit', async (req, res) => {
  try {
    const { UserId, StartDate, EndDate, ReportText } = req.body;

    const pool = await db; // 取得連線池
    await pool.request()
      .input('UserId', sql.Int, UserId)
      .input('StartDate', sql.Date, StartDate)
      .input('EndDate', sql.Date, EndDate)
      .input('ReportText', sql.NVarChar(sql.MAX), ReportText)
      .input('CreatedAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText, CreatedAt)
        VALUES (@UserId, @StartDate, @EndDate, @ReportText, @CreatedAt)
      `);

    res.json({ success: true, message: '週報已成功寫入資料庫' });
  } catch (err) {
    console.error('寫入週報時發生錯誤：', err);
    res.status(500).json({ success: false, message: '寫入失敗', error: err.message });
  }
});

module.exports = router;
