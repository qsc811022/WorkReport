// ✅ 定義時段欄位
const hours = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

// ✅ 任務類型清單，這些 ID 要對應 DB 的 TaskTypes.Id
const taskTypes = ['Meeting', 'Development', 'Testing', 'Code Review', 'Documentation'];

// ✅ 建立畫面欄位（每小時一行）
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

// ✅ 抓取目前使用者選的日期（預設今天）
function getSelectedDate() {
  const dateInput = document.getElementById('work-date');
  return dateInput?.value || new Date().toISOString().slice(0, 10);
}

// ✅ 儲存工時紀錄
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
    workDate: getSelectedDate(),
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

// ✅ 根據日期載入工時紀錄
function loadLogsByDate(date) {
  fetch(`/api/worklogs/by-date/${config.userId}/${date}`)
    .then(res => res.json())
    .then(data => {
      const rows = document.querySelectorAll('.log-row');
      rows.forEach(row => {
        row.querySelector('select').value = 1;
        row.querySelector('input').value = '';
      });

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
      console.error("❌ 載入工時失敗", err);
    });
}

// ✅ 頁面載入時預設今天日期 + 載入資料
window.onload = () => {
  const dateInput = document.getElementById('work-date');
  dateInput.value = new Date().toISOString().slice(0, 10);
  loadLogsByDate(dateInput.value);

  // 改變日期就載入資料
  dateInput.addEventListener('change', () => {
    loadLogsByDate(dateInput.value);
  });
};

// ✅ 預覽週報格式（套用目前畫面內容）
function generateReport() {
  const workDate = document.getElementById('work-date').value;
  const rows = document.querySelectorAll('.log-row');
  let result = `【${workDate} 工時紀錄】\n\n`;

  rows.forEach((row, i) => {
    const time = hours[i];
    const type = row.querySelector('select').selectedOptions[0].text;
    const detail = row.querySelector('input').value.trim();
    result += `${time}：${type}${detail ? `（${detail}）` : ''}\n`;
  });

  // 顯示到 textarea
  document.getElementById('output').value = result;
}

async function submitWeeklyReport() {
  const content = document.getElementById("output").value.trim();
  if (!content) {
    alert("內容為空，請先加入每日工時");
    return;
  }

  const response = await fetch('/api/weeklyReport', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    alert("❌ 產出失敗！");
    return;
  }

  // 將回傳的 PDF Blob 自動下載
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'weekly_report.pdf';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

