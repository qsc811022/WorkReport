// routes/auth.js

const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db'); // 你應該有 db.js 設定 poolPromise
const { comparePassword } = require('../utils/hash');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', username)
      .query('SELECT * FROM Users WHERE Username = @username');

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ error: '帳號不存在' });
    }

    const isMatch = await comparePassword(password, user.PasswordHash);

    if (!isMatch) {
      return res.status(401).json({ error: '密碼錯誤' });
    }

    // 你可以在這裡產生 JWT 或 session（我們先回傳成功資訊）
    res.json({
      message: '登入成功',
      user: {
        id: user.Id,
        displayName: user.DisplayName,
        role: user.Role
      }
    });
  } catch (err) {
    console.error('登入失敗：', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
});

module.exports = router;
