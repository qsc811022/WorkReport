const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db'); // 匯入 sql 跟資料庫連線 pool

// ✅ 儲存或更新單日所有小時的工作紀錄
router.post('/save', async (req, res) => {
  const { userId, workDate, logs } = req.body;

  if (!userId || !workDate || !Array.isArray(logs)) {
    return res.status(400).json({ error: '缺少必要欄位 userId / workDate / logs' });
  }

  try {
    const pool = await poolPromise;

    for (const log of logs) {
      const request = pool.request();

      // 檢查該筆資料是否已存在
      const check = await request
        .input('UserId', sql.Int, userId)
        .input('WorkDate', sql.Date, workDate)
        .input('HourSlot', sql.NVarChar(20), log.hourSlot) // ⚠️ 改這裡：HourSlot 是文字
        .query(`
          SELECT COUNT(*) AS Count
          FROM WorkLogs
          WHERE UserId = @UserId AND WorkDate = @WorkDate AND HourSlot = @HourSlot
        `);

      const exists = check.recordset[0].Count > 0;

      // 再產生一個新的 request（避免重複使用同一個）
      const actionRequest = pool.request()
        .input('UserId', sql.Int, userId)
        .input('WorkDate', sql.Date, workDate)
        .input('HourSlot', sql.NVarChar(20), log.hourSlot)
        .input('TaskTypeId', sql.Int, log.taskTypeId)
        .input('TaskDetail', sql.NVarChar(500), log.taskDetail || '');

      if (exists) {
        // ✅ 已存在 → 更新
        await actionRequest.query(`
          UPDATE WorkLogs
          SET TaskTypeId = @TaskTypeId, TaskDetail = @TaskDetail
          WHERE UserId = @UserId AND WorkDate = @WorkDate AND HourSlot = @HourSlot
        `);
      } else {
        // ✅ 不存在 → 新增
        await actionRequest.query(`
          INSERT INTO WorkLogs (UserId, WorkDate, HourSlot, TaskTypeId, TaskDetail)
          VALUES (@UserId, @WorkDate, @HourSlot, @TaskTypeId, @TaskDetail)
        `);
      }
    }

    res.json({ success: true, message: '✅ 工時已成功儲存（含更新）' });
  } catch (err) {
    console.error('❌ 儲存工時錯誤：', err);
    res.status(500).json({ error: '資料庫錯誤', detail: err.message });
  }
});


// ✅ 查詢使用者今天的工時紀錄
router.get('/today/:userId', async (req, res) => {
  const userId = req.params.userId;
  const today = new Date().toISOString().slice(0, 10); // 取今日 YYYY-MM-DD

  try {
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request
      .input('UserId', sql.Int, userId)
      .input('WorkDate', sql.Date, today)
      .query(`
        SELECT HourSlot, TaskTypeId, TaskDetail
        FROM WorkLogs
        WHERE UserId = @UserId AND WorkDate = @WorkDate
        ORDER BY HourSlot
      `);

    res.json({ success: true, logs: result.recordset });
  } catch (err) {
    console.error("查詢今天工時紀錄失敗：", err);
    res.status(500).json({ error: '查詢失敗', detail: err.message });
  }
});

// ✅ 查詢特定日期的工時紀錄
router.get('/by-date/:userId/:date', async (req, res) => {
  const { userId, date } = req.params;

  try {
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request
      .input('UserId', sql.Int, userId)
      .input('WorkDate', sql.Date, date)
      .query(`
        SELECT *
        FROM WorkLogs
        WHERE UserId = @UserId AND WorkDate = @WorkDate
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ 查詢工時紀錄失敗：", err);
    res.status(500).json({ error: '查詢失敗', detail: err.message });
  }
});

// ✅ 寫入每週週報資料
router.post('/weeklyreports/submit', async (req, res) => {
  const { userId, startDate, endDate, reportText } = req.body;

  if (!userId || !startDate || !endDate || !reportText) {
    return res.status(400).json({ success: false, detail: '資料缺漏' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request();

    await request
      .input('UserId', sql.Int, userId)
      .input('StartDate', sql.Date, startDate)
      .input('EndDate', sql.Date, endDate)
      .input('ReportText', sql.NVarChar(sql.MAX), reportText)
      .query(`
        INSERT INTO WeeklyReports (UserId, StartDate, EndDate, ReportText)
        VALUES (@UserId, @StartDate, @EndDate, @ReportText)
      `);

    res.json({ success: true });
  } catch (err) {
    console.error('寫入週報時發生錯誤：', err);
    res.status(500).json({ success: false, detail: err.message });
  }
});

module.exports = router;
