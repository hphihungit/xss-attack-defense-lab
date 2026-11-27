// home.js - Trang chủ giới thiệu lab + công tắc chế độ
const express = require('express');
const router = express.Router();
const { layout } = require('../render');
const { isSafe, toggleMode } = require('../store');

router.get('/', (req, res) => {
  const modeNow = isSafe()
    ? '<span class="pill safe">AN TOÀN</span>'
    : '<span class="pill vuln">CÓ LỖ HỔNG</span>';

  const body = `
  <div class="card">
    <h1>🧪 Lab mô phỏng Tấn công &amp; Phòng thủ XSS</h1>
    <p class="lead">Một ứng dụng web nhỏ (“VulnBank”) <strong>cố ý</strong> để ít lọc dữ liệu,
    phục vụ bài tập lớn môn An toàn thông tin. Toàn bộ chạy cục bộ (localhost), dữ liệu giả,
    chỉ dùng để <strong>học tập và demo trong lớp</strong>.</p>

    <p>Dùng nút ở thanh trên cùng để chuyển qua lại giữa hai chế độ — chế độ hiện tại: ${modeNow}</p>
    <ul>
      <li><span class="pill vuln">CÓ LỖ HỔNG</span> in dữ liệu người dùng nguyên văn ra HTML (lỗi) → XSS chạy được.</li>
      <li><span class="pill safe">AN TOÀN</span> escape output + cookie HttpOnly + header CSP → XSS bị chặn.</li>
    </ul>
  </div>

  <div class="card">
    <h2>Ba loại XSS được demo</h2>
    <div class="grid">
      <a class="tile" href="/reflected">
        <div class="ico">🔁</div>
        <h3>Reflected XSS</h3>
        <p>Payload nằm trong URL, bị “phản xạ” lại ngay trong phản hồi của máy chủ.</p>
      </a>
      <a class="tile" href="/stored">
        <div class="ico">💾</div>
        <h3>Stored XSS</h3>
        <p>Payload được <em>lưu</em> trên máy chủ và chạy với mọi người xem. Kèm kịch bản đánh cắp cookie.</p>
      </a>
      <a class="tile" href="/dom">
        <div class="ico">🧩</div>
        <h3>DOM-based XSS</h3>
        <p>Lỗ hổng nằm hoàn toàn ở JavaScript phía client (innerHTML + location.hash).</p>
      </a>
    </div>
  </div>

  <div class="card">
    <h2>Gợi ý trình tự khi thuyết trình</h2>
    <ol class="steps">
      <li>Bắt đầu ở chế độ <span class="pill vuln">CÓ LỖ HỔNG</span> để minh họa tấn công thành công.</li>
      <li>Chạy lần lượt: Reflected → Stored (kèm trộm cookie) → DOM-based.</li>
      <li>Chuyển sang <span class="pill safe">AN TOÀN</span> và lặp lại để thấy các biện pháp phòng thủ chặn được tấn công.</li>
    </ol>
    <div class="hint">
      <b>Lưu ý đạo đức:</b> đây là môi trường thí nghiệm cục bộ với dữ liệu giả.
      Kỹ thuật này chỉ dùng để hiểu và phòng chống, không áp dụng lên hệ thống của người khác.
    </div>
  </div>`;
  res.send(layout('Trang chủ', body));
});

// Công tắc đổi chế độ, dùng chung cho cả ứng dụng
router.post('/toggle-mode', (req, res) => {
  toggleMode();
  const back = req.get('referer') || '/';
  res.redirect(back);
});

module.exports = router;
