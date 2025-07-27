const express = require('express');
const router = express.Router();
// const db = require('../db');
const { sql, poolPromise } = require('../db');

// 儲存單日所有小時的工作紀錄
router.post('/save', async (req, res) => {
  const { userId, workDate, logs } = req.body;

  if (!userId || !workDate || !Array.isArray(logs)) {
    return res.status(400).json({ error: '缺少必要欄位 userId / workDate / logs' });
  }

  try {
    for (const log of logs) {
      const request = await db.request();
      await request
        .input('UserId', userId)
        .input('WorkDate', workDate)
        .input('HourSlot', log.hourSlot)
        .input('TaskTypeId', log.taskTypeId) // FK 對應 TaskTypes.Id
        .input('TaskDetail', log.taskDetail || '')
        .query(`
          INSERT INTO WorkLogs (UserId, WorkDate, HourSlot, TaskTypeId, TaskDetail)
          VALUES (@UserId, @WorkDate, @HourSlot, @TaskTypeId, @TaskDetail)
        `);
    }

    res.json({ success: true, message: '✅ 工時已成功儲存' });
  } catch (err) {
    console.error('❌ 儲存工時錯誤：', err);
    res.status(500).json({ error: '資料庫錯誤', detail: err.message });
  }
});

// 查詢使用者今天的工時紀錄
router.get('/today/:userId', async (req, res) => {
  const userId = req.params.userId;
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    const request = await db.request();
    const result = await request
      .input('UserId', userId)
      .input('WorkDate', today)
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

router.post('/save', async (req, res) => {
  const { userId, workDate, logs } = req.body;

  if (!userId || !workDate || !Array.isArray(logs)) {
    return res.status(400).json({ error: '缺少必要欄位 userId / workDate / logs' });
  }

  try {
    for (const log of logs) {
      const request = await db.request();

      // 先檢查這筆資料是否已存在
      const check = await request
        .input('UserId', userId)
        .input('WorkDate', workDate)
        .input('HourSlot', log.hourSlot)
        .query(`
          SELECT COUNT(*) AS Count
          FROM WorkLogs
          WHERE UserId = @UserId AND WorkDate = @WorkDate AND HourSlot = @HourSlot
        `);

      const exists = check.recordset[0].Count > 0;

      if (exists) {
        // 如果已存在 → 更新 TaskTypeId 和 TaskDetail
        await request
          .input('TaskTypeId', log.taskTypeId)
          .input('TaskDetail', log.taskDetail || '')
          .query(`
            UPDATE WorkLogs
            SET TaskTypeId = @TaskTypeId, TaskDetail = @TaskDetail
            WHERE UserId = @UserId AND WorkDate = @WorkDate AND HourSlot = @HourSlot
          `);
      } else {
        // 不存在 → 新增資料
        await request
          .input('TaskTypeId', log.taskTypeId)
          .input('TaskDetail', log.taskDetail || '')
          .query(`
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
router.get('/by-date/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;

    const pool = await poolPromise;
    const result = await pool.request()
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




module.exports = router;
