// dom.js - Logic cho trang DOM-based XSS. Tách ra file ngoài để được CSP cho phép
// ('self') ở chế độ AN TOÀN, trong khi <script> nội tuyến do hacker chèn bị chặn.

// Đọc dữ liệu từ phần hash của URL và hiển thị ra trang
function renderGreeting() {
  var data = decodeURIComponent(location.hash.slice(1)); // bỏ dấu '#' ở đầu
  var box = document.getElementById('greeting');
  var safe = document.getElementById('safeToggle').checked;

  if (!data) { box.textContent = '(chưa có dữ liệu)'; return; }

  if (safe) {
    // PHÒNG THỦ: textContent không diễn giải HTML -> an toàn
    box.textContent = data;
  } else {
    // LỖ HỔNG: innerHTML diễn giải chuỗi thành HTML -> script/onerror chạy được
    box.innerHTML = data;
  }
}

function updateModeLabel() {
  var safe = document.getElementById('safeToggle').checked;
  var lbl = document.getElementById('modeLabel');
  lbl.textContent = safe ? 'AN TOÀN' : 'CÓ LỖ HỔNG';
  lbl.className = 'pill ' + (safe ? 'safe' : 'vuln');
}

document.getElementById('copyBtn').addEventListener('click', function () {
  navigator.clipboard.writeText("#<img src=x onerror=\"alert('DOM XSS')\">");
  this.textContent = '✓ Đã sao chép';
  var self = this;
  setTimeout(function () { self.textContent = '📋 Sao chép payload'; }, 1600);
});

window.addEventListener('hashchange', renderGreeting);
document.getElementById('safeToggle').addEventListener('change', function () {
  updateModeLabel();
  renderGreeting();
});
updateModeLabel();
renderGreeting();
