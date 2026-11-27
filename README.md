# Lab mô phỏng Tấn công & Phòng thủ XSS

Bài tập lớn môn **An toàn thông tin**. Một ứng dụng web nhỏ ("VulnBank") *cố ý*
để lỗ hổng XSS nhằm minh họa cách hacker chèn script độc hại, kèm công tắc
**VULNERABLE ⇄ SAFE** để so sánh trước/sau khi vá.

> ⚠️ **Chỉ dùng để học tập.** Toàn bộ chạy cục bộ (localhost), dữ liệu giả.
> Không triển khai ra Internet, không nhắm vào hệ thống của người khác.

---

## 1. Cài đặt & chạy

Yêu cầu: đã cài [Node.js](https://nodejs.org) (phiên bản 16 trở lên).

```bash
cd d:\xss-attack
npm install
```

Mở **2 cửa sổ terminal**:

```bash
# Terminal 1 - ứng dụng nạn nhân (cổng 3000)
node server.js

# Terminal 2 - server của hacker thu cookie (cổng 4000)
node hacker-server.js
```

Rồi mở trình duyệt:
- Ứng dụng nạn nhân: <http://localhost:3000>
- Trang quản trị của hacker: <http://localhost:4000>

Mặc định ứng dụng ở chế độ **VULNERABLE** (thanh đỏ trên cùng). Bấm nút trên
thanh đó để chuyển qua lại **SAFE**.

---

## 2. Lý thuyết tóm tắt: XSS là gì?

**XSS (Cross-Site Scripting)** là lỗ hổng cho phép kẻ tấn công chèn mã
JavaScript độc hại vào trang web, để mã đó **chạy trong trình duyệt của nạn
nhân**. Nguyên nhân gốc: ứng dụng lấy dữ liệu do người dùng nhập và **đưa thẳng
vào HTML mà không xử lý (không escape)**, khiến trình duyệt hiểu nhầm dữ liệu đó
là mã lệnh.

Khi script chạy trong phiên của nạn nhân, hacker có thể: đánh cắp cookie/phiên
đăng nhập, giả mạo thao tác thay nạn nhân, chỉnh sửa nội dung trang, chuyển
hướng sang trang lừa đảo...

Ba loại chính:

| Loại | Payload nằm ở đâu | Đặc điểm |
|------|------------------|----------|
| **Reflected** | Trong URL/request, bị "phản xạ" lại ngay trong phản hồi | Hacker gửi link bẫy cho nạn nhân |
| **Stored** | Được **lưu** trên server (bình luận, hồ sơ...) | Nguy hiểm nhất — chạy với **mọi** người xem |
| **DOM-based** | Xử lý hoàn toàn ở JavaScript phía client | Server có thể không hề thấy payload |

---

## 3. Kịch bản demo khi thuyết trình

### A. Reflected XSS — `/reflected`
1. Ở chế độ VULNERABLE, mở trang **Reflected XSS**, bấm "Mở link tấn công mẫu"
   (hoặc dán `<script>alert('Reflected XSS')</script>` vào ô tìm kiếm).
2. → Hộp thoại `alert` hiện ra: script đã chạy.
3. Chuyển sang **SAFE**, thử lại → payload chỉ hiện ra dạng **văn bản**, không chạy.
4. Giải thích: chế độ SAFE đã `escapeHtml()` dữ liệu trước khi in ra.

### B. Stored XSS + đánh cắp cookie — `/stored` (phần trọng tâm)
1. Ở chế độ VULNERABLE, mở **Stored XSS**. Copy **payload (2)** (đánh cắp cookie)
   và gửi dưới dạng một bình luận.
2. Trang tự tải lại → payload đã lưu chạy ngay, âm thầm gửi `document.cookie`
   sang server hacker.
3. Mở <http://localhost:4000> → thấy **cookie phiên của nạn nhân đã bị trộm**
   (`session=FAKE-SESSION-TOKEN-12345`). Đây chính là hậu quả thực tế: hacker
   có thể dùng cookie này để chiếm phiên đăng nhập.
4. Mỗi người khác mở trang `/stored` cũng sẽ bị gửi cookie — vì payload được
   *lưu* lại.
5. Chuyển sang **SAFE**, tải lại `/stored`:
   - Nội dung bình luận bị escape → script hiện dạng văn bản, không chạy.
   - Cookie giờ có cờ `HttpOnly` → `document.cookie` không đọc được nó.
   - Header `Content-Security-Policy` chặn inline script.
   → Server hacker **không nhận thêm cookie nào**.

### C. DOM-based XSS — `/dom`
1. Mở trang **DOM-based XSS**, bấm "Thử payload ngay" (thêm
   `#<img src=x onerror=alert('DOM XSS')>` vào URL).
2. → `alert` chạy. Giải thích: JS client đọc `location.hash` rồi gán bằng
   `innerHTML` → trình duyệt dựng thẻ `<img>` lỗi và kích hoạt `onerror`.
3. Tích ô **"Chế độ SAFE"** rồi thử lại → dùng `textContent` nên payload chỉ là
   văn bản, không chạy. Lỗ hổng này nằm ở client nên vá cũng ở client.

---

## 4. Các biện pháp phòng thủ (thể hiện trong chế độ SAFE)

1. **Escape output theo ngữ cảnh** — biến `<`, `>`, `"`, `'`, `&` thành entity
   trước khi in ra HTML. Đây là tuyến phòng thủ chính (xem `src/render.js`).
2. **Cookie `HttpOnly`** — JavaScript không đọc được cookie phiên, giảm thiệt
   hại nếu lỡ dính XSS (xem `server.js`).
3. **Content-Security-Policy (CSP)** — chặn inline script và chặn gửi dữ liệu
   sang domain lạ (xem `server.js`).
4. **Dùng `textContent` thay cho `innerHTML`** ở phía client (xem `public/dom.html`).
5. **Validate/lọc đầu vào** và cân nhắc thư viện chuyên dụng (DOMPurify) khi
   buộc phải cho phép một phần HTML.

---

## 5. Cấu trúc dự án

```
server.js          Ứng dụng nạn nhân (cổng 3000) + logic cookie/CSP theo chế độ
hacker-server.js   Server hacker thu cookie (cổng 4000)
src/store.js       Dữ liệu + cờ SAFE_MODE (bộ nhớ)
src/render.js      escapeHtml() + layout chung
src/routes/        home / reflected / stored / dom
public/dom.html    Trang tĩnh cho DOM-based XSS
```
