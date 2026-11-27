// reflected.js - Demo Reflected XSS qua ô tìm kiếm (query string ?q=...)
const express = require('express');
const router = express.Router();
const { layout, escapeHtml } = require('../render');
const { isSafe } = require('../store');

router.get('/reflected', (req, res) => {
  const q = req.query.q;
  let resultHtml = '';

  if (q !== undefined) {
    if (isSafe()) {
      // PHÒNG THỦ: escape trước khi in ra -> payload hiển thị dạng văn bản
      resultHtml = `<div class="result">Kết quả tìm kiếm cho: <strong>${escapeHtml(q)}</strong>
        <p style="margin:6px 0 0">Không tìm thấy kết quả nào.</p></div>`;
    } else {
      // LỖ HỔNG: nối thẳng giá trị người dùng vào HTML -> script trong q sẽ chạy
      resultHtml = `<div class="result">Kết quả tìm kiếm cho: <strong>${q}</strong>
        <p style="margin:6px 0 0">Không tìm thấy kết quả nào.</p></div>`;
    }
  }

  // Payload mẫu + link tấn công sẵn để copy
  const payload = `<script>alert('Reflected XSS')</script>`;
  const attackUrl = `/reflected?q=${encodeURIComponent(payload)}`;

  const modeTag = isSafe() ? '<span class="pill safe">AN TOÀN</span>' : '<span class="pill vuln">CÓ LỖ HỔNG</span>';

  const body = `
  <div class="card">
    <h1>🔁 Reflected XSS — Ô tìm kiếm ${modeTag}</h1>
    <p class="lead">Từ khóa bạn nhập sẽ được <em>phản xạ</em> lại ngay trong trang kết quả.
    Ở chế độ CÓ LỖ HỔNG, máy chủ nối thẳng từ khóa vào HTML mà không escape.</p>

    <form method="GET" action="/reflected">
      <label for="q">Tìm kiếm</label>
      <input type="text" id="q" name="q" value="" placeholder="Nhập từ khóa cần tìm..." autofocus>
      <button class="btn" type="submit">🔍 Tìm</button>
    </form>

    ${resultHtml}
  </div>

  <div class="card">
    <h2>Payload thử nghiệm</h2>
    <p>Dán payload sau vào ô tìm kiếm (hoặc bấm nút mở link tấn công):</p>
    <pre id="payload">${escapeHtml(payload)}</pre>
    <button class="btn ghost" data-copy="payload">📋 Sao chép payload</button>
    <a class="btn" href="${attackUrl}">🚀 Mở link tấn công mẫu</a>
    <div class="hint">
      Payload khác để thử: <code>${escapeHtml("<img src=x onerror=alert('Reflected')>")}</code>.
      Trong thực tế, hacker gửi link chứa payload cho nạn nhân (qua email, tin nhắn) để dụ họ bấm vào.
    </div>
  </div>`;
  res.send(layout('Reflected XSS', body));
});

module.exports = router;
