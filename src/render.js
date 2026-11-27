// render.js - Hàm tiện ích: escapeHtml (lớp phòng thủ) và layout chung cho trang

const { isSafe } = require('./store');

// ===== LỚP PHÒNG THỦ QUAN TRỌNG NHẤT =====
// Chuyển các ký tự đặc biệt của HTML thành entity, để trình duyệt hiển thị
// chúng như VĂN BẢN chứ không phải THẺ HTML/script. Đây là cách chống XSS cơ bản.
function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Thanh trạng thái + điều hướng + nút công tắc chế độ, dùng chung cho mọi trang.
// CSS và JS được nạp từ file ngoài (/style.css, /app.js) để không bị CSP chặn ở
// chế độ AN TOÀN — trong khi CSP vẫn chặn <script> nội tuyến do hacker chèn vào.
function layout(title, bodyHtml) {
  const safe = isSafe();
  const modeClass = safe ? 'safe' : 'vuln';
  const modeLabel = safe ? 'AN TOÀN' : 'CÓ LỖ HỔNG';
  const modeText = safe ? 'Đã áp dụng các biện pháp phòng thủ' : 'Dữ liệu không được lọc — XSS hoạt động';
  const toggleLabel = safe ? '↺ Chuyển sang CÓ LỖ HỔNG' : '🛡 Chuyển sang AN TOÀN';

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} · XSS Lab</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body class="mode-${modeClass}">
  <div class="statusbar ${modeClass}">
    <div class="mode">
      <span class="dot"></span>
      <span>Chế độ: <span class="badge">${modeLabel}</span></span>
      <span class="mode-text">— ${modeText}</span>
    </div>
    <form method="POST" action="/toggle-mode">
      <button class="toggle" type="submit">${toggleLabel}</button>
    </form>
  </div>
  <nav>
    <span class="brand">Vuln<span>Bank</span></span>
    <a class="link" href="/">Trang chủ</a>
    <a class="link" href="/reflected">Reflected XSS</a>
    <a class="link" href="/stored">Stored XSS</a>
    <a class="link" href="/dom">DOM-based XSS</a>
  </nav>
  <div class="wrap">
    <div class="shield-note">
      <span class="ico">🛡️</span>
      <span>Đang ở chế độ AN TOÀN — output đã được escape, cookie đặt cờ HttpOnly và áp dụng Content-Security-Policy. Các payload XSS sẽ bị vô hiệu hóa.</span>
    </div>
    ${bodyHtml}
  </div>
  <div class="toast" id="toast"></div>
  <script src="/app.js"></script>
</body>
</html>`;
}

module.exports = { escapeHtml, layout };
