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

// CSS dùng chung cho toàn bộ ứng dụng nạn nhân
const STYLE = `
  :root {
    --bg: #0f172a;
    --bg-soft: #1e293b;
    --card: #ffffff;
    --ink: #0f172a;
    --muted: #64748b;
    --line: #e2e8f0;
    --brand: #6366f1;
    --brand-dark: #4f46e5;
    --danger: #ef4444;
    --danger-soft: #fef2f2;
    --safe: #10b981;
    --safe-soft: #ecfdf5;
    --warn: #f59e0b;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
    margin: 0; background: #f1f5f9; color: var(--ink); line-height: 1.65;
  }
  a { color: var(--brand-dark); }

  /* Thanh trạng thái chế độ */
  .statusbar {
    padding: 14px 24px; display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; color: #fff; font-size: .98rem;
    box-shadow: 0 2px 12px rgba(0,0,0,.15);
  }
  .statusbar.vuln { background: linear-gradient(135deg, #ef4444, #b91c1c); }
  .statusbar.safe { background: linear-gradient(135deg, #10b981, #047857); }
  .statusbar .mode { display: flex; align-items: center; gap: 10px; }
  .statusbar .dot { width: 11px; height: 11px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(255,255,255,.3); }
  .statusbar .badge {
    background: rgba(255,255,255,.22); padding: 3px 12px; border-radius: 999px;
    font-weight: 700; letter-spacing: .5px;
  }
  .statusbar form { margin: 0; }
  .statusbar .toggle {
    background: #fff; color: var(--ink); border: 0; padding: 9px 18px; border-radius: 999px;
    font-weight: 700; cursor: pointer; font-size: .9rem; transition: transform .1s, box-shadow .2s;
    box-shadow: 0 2px 8px rgba(0,0,0,.18);
  }
  .statusbar .toggle:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.25); }

  /* Thanh điều hướng */
  nav {
    background: var(--bg); padding: 0 24px; display: flex; gap: 4px; flex-wrap: wrap;
    position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,.2);
  }
  nav .brand { color: #fff; font-weight: 800; padding: 14px 16px 14px 0; letter-spacing: .5px; }
  nav .brand span { color: #818cf8; }
  nav a.link {
    color: #cbd5e1; text-decoration: none; padding: 14px 16px; font-size: .95rem;
    border-bottom: 3px solid transparent; transition: color .15s, border-color .15s;
  }
  nav a.link:hover { color: #fff; border-bottom-color: #818cf8; }

  .wrap { max-width: 900px; margin: 28px auto; padding: 0 20px; }

  .card {
    background: var(--card); border: 1px solid var(--line); border-radius: 16px;
    padding: 26px; margin-bottom: 22px; box-shadow: 0 4px 20px rgba(15,23,42,.06);
  }
  .card h1 { margin: 0 0 6px; font-size: 1.7rem; letter-spacing: -.3px; }
  .card h2 { margin: 0 0 12px; font-size: 1.25rem; }
  .card p { margin: 10px 0; }
  .lead { color: var(--muted); font-size: 1.02rem; }

  .pill {
    display: inline-block; font-size: .78rem; font-weight: 700; padding: 3px 11px;
    border-radius: 999px; letter-spacing: .4px; vertical-align: middle;
  }
  .pill.vuln { background: var(--danger-soft); color: var(--danger); }
  .pill.safe { background: var(--safe-soft); color: var(--safe); }

  label { display: block; font-weight: 600; margin: 16px 0 6px; font-size: .95rem; }
  input[type=text], textarea {
    width: 100%; padding: 11px 14px; border: 1.5px solid var(--line); border-radius: 10px;
    font-size: 1rem; font-family: inherit; transition: border-color .15s, box-shadow .15s;
  }
  input[type=text]:focus, textarea:focus {
    outline: none; border-color: var(--brand); box-shadow: 0 0 0 4px rgba(99,102,241,.15);
  }
  textarea { min-height: 92px; resize: vertical; }

  .btn {
    display: inline-flex; align-items: center; gap: 7px; background: var(--brand); color: #fff;
    border: 0; padding: 11px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;
    text-decoration: none; margin-top: 12px; font-size: .95rem;
    transition: background .15s, transform .1s, box-shadow .2s; box-shadow: 0 2px 10px rgba(99,102,241,.3);
  }
  .btn:hover { background: var(--brand-dark); transform: translateY(-1px); box-shadow: 0 5px 16px rgba(99,102,241,.4); }
  .btn.ghost { background: #f1f5f9; color: var(--ink); box-shadow: none; }
  .btn.ghost:hover { background: #e2e8f0; }

  code, pre {
    background: #0f172a; color: #e2e8f0; border-radius: 10px;
    font-family: ui-monospace, 'Cascadia Code', Consolas, monospace;
  }
  code { padding: 2px 7px; font-size: .9em; }
  :not(pre) > code { background: #eef2ff; color: var(--brand-dark); }
  pre {
    padding: 16px 18px; overflow-x: auto; white-space: pre-wrap; word-break: break-all;
    font-size: .9rem; border: 1px solid #1e293b; position: relative;
  }

  .result {
    border-left: 4px solid var(--brand); background: #f8fafc; padding: 14px 18px;
    border-radius: 0 10px 10px 0; margin: 18px 0;
  }

  .comment {
    border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; margin: 12px 0;
    background: #fafafa;
  }
  .comment .who { font-weight: 700; color: var(--brand-dark); display: flex; align-items: center; gap: 8px; }
  .comment .who::before {
    content: ''; width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #818cf8, #6366f1); display: inline-block; flex: 0 0 auto;
  }
  .comment .body { margin-top: 6px; }

  .hint {
    background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid var(--warn);
    border-radius: 10px; padding: 13px 16px; font-size: .93rem; margin-top: 16px;
  }
  .hint b { color: #b45309; }

  .steps { counter-reset: step; list-style: none; padding: 0; margin: 0; }
  .steps li { position: relative; padding: 4px 0 4px 40px; margin: 8px 0; }
  .steps li::before {
    counter-increment: step; content: counter(step);
    position: absolute; left: 0; top: 2px; width: 28px; height: 28px; border-radius: 50%;
    background: var(--brand); color: #fff; font-weight: 700; font-size: .85rem;
    display: flex; align-items: center; justify-content: center;
  }

  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
  .tile {
    border: 1px solid var(--line); border-radius: 14px; padding: 18px; text-decoration: none;
    color: inherit; transition: transform .12s, box-shadow .2s, border-color .2s; display: block;
  }
  .tile:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,23,42,.1); border-color: var(--brand); }
  .tile h3 { margin: 0 0 6px; font-size: 1.1rem; }
  .tile .ico { font-size: 1.6rem; }
  .tile p { color: var(--muted); font-size: .9rem; margin: 6px 0 0; }

  .danger { color: var(--danger); font-weight: 700; }
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: #0f172a; color: #fff; padding: 11px 20px; border-radius: 999px; font-weight: 600;
    opacity: 0; pointer-events: none; transition: opacity .25s, transform .25s; z-index: 100;
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

  /* ===== Giao diện riêng cho chế độ AN TOÀN: đổi màu nhấn sang xanh lá ===== */
  .mode-safe { background: #f0fdf4; }
  .mode-safe nav { background: #052e16; }
  .mode-safe nav .brand span { color: #4ade80; }
  .mode-safe nav a.link:hover { border-bottom-color: #4ade80; }
  .mode-safe .card { border-color: #bbf7d0; box-shadow: 0 4px 20px rgba(5,46,22,.07); }
  .mode-safe .btn { background: var(--safe); box-shadow: 0 2px 10px rgba(16,185,129,.3); }
  .mode-safe .btn:hover { background: #059669; box-shadow: 0 5px 16px rgba(16,185,129,.45); }
  .mode-safe .btn.ghost { background: #dcfce7; color: #065f46; box-shadow: none; }
  .mode-safe .btn.ghost:hover { background: #bbf7d0; }
  .mode-safe input[type=text]:focus, .mode-safe textarea:focus {
    border-color: var(--safe); box-shadow: 0 0 0 4px rgba(16,185,129,.18);
  }
  .mode-safe :not(pre) > code { background: #dcfce7; color: #047857; }
  .mode-safe .result { border-left-color: var(--safe); background: #f0fdf4; }
  .mode-safe .comment .who { color: #047857; }
  .mode-safe .comment .who::before { background: linear-gradient(135deg, #4ade80, #10b981); }
  .mode-safe .steps li::before { background: var(--safe); }
  .mode-safe .tile:hover { border-color: var(--safe); box-shadow: 0 10px 24px rgba(5,46,22,.12); }
  .mode-safe a { color: #047857; }

  /* Huy hiệu "đã bảo vệ" chỉ hiện ở chế độ AN TOÀN */
  .mode-vuln .shield-note { display: none; }
  .shield-note {
    display: flex; align-items: center; gap: 12px; background: var(--safe-soft);
    border: 1px solid #a7f3d0; border-left: 4px solid var(--safe); border-radius: 12px;
    padding: 14px 18px; margin-bottom: 22px; color: #065f46; font-weight: 600;
  }
  .shield-note .ico { font-size: 1.5rem; }
`;

// JS nhỏ cho nút "Sao chép" (hiện toast). Nằm trong trang nạn nhân.
const COPY_JS = `
  function copyText(id, btn) {
    var el = document.getElementById(id);
    navigator.clipboard.writeText(el.innerText).then(function () {
      var t = document.getElementById('toast');
      t.textContent = 'Đã sao chép payload!';
      t.classList.add('show');
      setTimeout(function () { t.classList.remove('show'); }, 1600);
    });
  }
`;

// Thanh trạng thái + điều hướng + nút công tắc chế độ, dùng chung cho mọi trang
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
  <style>${STYLE}</style>
</head>
<body class="mode-${modeClass}">
  <div class="statusbar ${modeClass}">
    <div class="mode">
      <span class="dot"></span>
      <span>Chế độ: <span class="badge">${modeLabel}</span></span>
      <span style="opacity:.85">— ${modeText}</span>
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
  <script>${COPY_JS}</script>
</body>
</html>`;
}

module.exports = { escapeHtml, layout };
