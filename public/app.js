// app.js - JS dùng chung cho ứng dụng nạn nhân (nút "Sao chép" + toast).
// Tách ra file riêng để được Content-Security-Policy cho phép ('self'),
// trong khi CSP vẫn chặn <script> nội tuyến do hacker chèn vào.

function copyText(id) {
  var el = document.getElementById(id);
  navigator.clipboard.writeText(el.innerText).then(function () {
    var t = document.getElementById('toast');
    t.textContent = 'Đã sao chép payload!';
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 1600);
  });
}

// Gắn sự kiện cho các nút có data-copy (thay cho onclick nội tuyến, vốn bị CSP chặn)
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-copy'));
    });
  });
});
