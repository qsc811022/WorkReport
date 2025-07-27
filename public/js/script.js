// 時段列表
const hours = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

// 任務類型（必須與 DB 的 TaskTypes.Id 對應）
const taskTypes = ['Meeting', 'Development', 'Testing', 'Code Review', 'Documentation'];

// 建立畫面欄位
const container = document.getElementById('log-container');
hours.forEach((slot, index) => {
  const row = document.createElement('div');
  row.className = 'log-row';
  row.innerHTML = `
    <label>${slot}</label>
    <select>
      ${taskTypes.map((type, i) => `<option value="${i + 1}">${type}</option>`).join('')}
    </select>
    <input type="text" placeholder="補充內容">
  `;
  container.appendChild(row);
});

// ⬇️ 取得目前選取日期
function getSelectedDate() {
  const dateInput = document.getElementById('work-date');
  return dateInput?.value || new Date().toISOString().slice(0, 10);
}

// ⬇️ 儲存工時
function saveLogs() {
  const rows = document.querySelectorAll('.log-row');
  const logs = [];

  rows.forEach((row, i) => {
    const hourSlot = hours[i];
    const taskTypeId = parseInt(row.querySelector('select').value);
    const taskDetail = row.querySelector('input').value.trim();
    logs.push({ hourSlot, taskTypeId, taskDetail });
  });

  const data = {
    userId: config.userId,
    workDate: getSelectedDate(), // ✅ 使用選取的日期
    logs
  };

  fetch('/api/worklogs/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert("✅ 儲存成功！");
      } else {
        alert("❌ 儲存失敗：" + result.detail);
      }
    })
    .catch(err => {
      console.error("❌ 儲存時發生錯誤", err);
      alert("❌ 儲存時發生錯誤：" + err.message);
    });
}

// ⬇️ 根據日期讀取紀錄（loadLogsByDate 替代 loadTodayLogs）
function loadLogsByDate(date) {
  fetch(`/api/worklogs/by-date/${config.userId}/${date}`)
    .then(res => res.json())
    .then(data => {
      const rows = document.querySelectorAll('.log-row');

      // 清空欄位
      rows.forEach(row => {
        row.querySelector('select').value = 1;
        row.querySelector('input').value = '';
      });

      // 套用讀取資料
      if (data.success && Array.isArray(data.logs)) {
        data.logs.forEach(log => {
          const index = hours.findIndex(h => h === log.HourSlot);
          if (index !== -1) {
            const row = rows[index];
            row.querySelector('select').value = log.TaskTypeId;
            row.querySelector('input').value = log.TaskDetail || '';
          }
        });
      }
    })
    .catch(err => {
      console.error("載入工時失敗", err);
    });
}

// ⬇️ 頁面載入時
window.onload = () => {
  const dateInput = document.getElementById('work-date');
  dateInput.value = new Date().toISOString().slice(0, 10); // 預設今天
  loadLogsByDate(dateInput.value); // 載入今天的資料

  dateInput.addEventListener('change', () => {
    loadLogsByDate(dateInput.value); // 日期改變時載入
  });
};

function generateReport() {
  const workDate = document.getElementById('work-date').value; // 抓取使用者選的日期
  const rows = document.querySelectorAll('.log-row');           // 每一行工時資料
  const hours = [
    '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00',
    '15:00-16:00', '16:00-17:00', '17:00-18:00'
  ];

  let result = `【${workDate} 工時紀錄】\n\n`;

  rows.forEach((row, i) => {
    const time = hours[i]; // 時段
    const type = row.querySelector('select').selectedOptions[0].text; // 工時類型
    const detail = row.querySelector('input').value.trim();           // 補充內容

    result += `${time}：${type}${detail ? `（${detail}）` : ''}\n`;
  });

  document.getElementById('output').textContent = result;
}

function submitWeeklyReport() {
  const startDate = prompt("請輸入本週開始日期 (YYYY-MM-DD)");
  const endDate = prompt("請輸入本週結束日期 (YYYY-MM-DD)");
  const reportText = document.getElementById('output').textContent.trim(); // ⬅️ 修正：去掉空白

  if (!startDate || !endDate || !reportText) {
    alert("❌ 資料不完整，無法送出");
    return;
  }

  const data = {
    UserId: config.userId,     // ✅ 注意大小寫，對應後端欄位
    StartDate: startDate,
    EndDate: endDate,
    ReportText: reportText
  };

  fetch('/api/weeklyreports/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (!res.ok) {
        // 如果回傳不是 200~299，拋出錯誤以進入 catch
        throw new Error(`伺服器錯誤：${res.status}`);
      }
      return res.json();
    })
    .then(result => {
      if (result.success) {
        alert("✅ 週報送出成功！");
      } else {
        alert("❌ 送出失敗：" + (result.message || result.detail || '未知錯誤'));
      }
    })
    .catch(err => {
      console.error("❌ 發生錯誤", err);
      alert("❌ 發生錯誤：" + err.message);
    });
}