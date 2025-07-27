const express = require('express');
const path = require('path');
const router = express.Router();
const { poolPromise, sql } = require('../db'); // ✅ 修正這裡
const PDFDocument = require('pdfkit');
const fs = require('fs');

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

    const pool = await poolPromise; // ✅ 修正這裡
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
// POST 路由：產生 PDF 並傳回檔案下載
router.post('/', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: '週報內容格式錯誤' });
  }

  // 建立 PDF 文件
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // 設定中文字型（需下載對應字型）
  const fontPath = path.join(__dirname, '../fonts/NotoSansTC-Regular.otf');
  if (!fs.existsSync(fontPath)) {
    return res.status(500).send('字型檔案未找到，請確認 fonts 資料夾');
  }
  doc.font(fontPath);

  doc.fontSize(18).text('工程師每週工時紀錄表', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(text, {
    align: 'left',
    lineGap: 6
  });

  // 將 PDF 轉成 stream 傳回給前端下載
  const stream = new Readable();
  stream._read = () => {};
  doc.pipe(stream);

  res.setHeader('Content-disposition', 'attachment; filename=weekly_report.pdf');
  res.setHeader('Content-type', 'application/pdf');

  doc.end();

  doc.pipe(res);
});


module.exports = router;
