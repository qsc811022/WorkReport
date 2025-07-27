// utils/hash.js

const bcrypt = require('bcrypt');

// 密碼加密函式
async function hashPassword(password) {
  const saltRounds = 10; // 加鹽次數
  return await bcrypt.hash(password, saltRounds);
}

// 密碼比對函式
async function comparePassword(inputPassword, hashedPassword) {
  return await bcrypt.compare(inputPassword, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword
};
