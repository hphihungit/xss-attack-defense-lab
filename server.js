// server.js - Ung dung nan nhan "VulnBank" (cong 3000)
//
// CANH BAO: Ung dung nay CO CHU DICH de lo hong XSS cho muc dich hoc tap.
// Chi chay cuc bo (localhost), du lieu gia. KHONG trien khai ra Internet.

const express = require('express');
const { isSafe } = require('./src/store');

const homeRouter = require('./src/routes/home');
const reflectedRouter = require('./src/routes/reflected');
const storedRouter = require('./src/routes/stored');
const domRouter = require('./src/routes/dom');

const app = express();
const PORT = 3000;

// Doc du lieu form (POST)
app.use(express.urlencoded({ extended: false }));

// Dat cookie phien gia + header bao mat tuy theo che do.
// Day la noi minh hoa ro nhat phan PHONG THU.
app.use((req, res, next) => {
  const safe = isSafe();

  // Cookie phien gia dong vai "token dang nhap" ma hacker muon trom.
  // - VULNERABLE: khong HttpOnly -> JavaScript (document.cookie) doc duoc.
  // - SAFE: HttpOnly -> JavaScript khong doc duoc cookie nua.
  res.cookie('session', 'FAKE-SESSION-TOKEN-12345', {
    httpOnly: safe,
    sameSite: 'lax',
  });

  // Content-Security-Policy: o che do SAFE.
  // - script-src 'self'    : chi cho phep JS tu chinh trang nay (/app.js, /dom.js),
  //                          CHAN moi <script> noi tuyen va thuoc tinh onerror/onclick
  //                          cua hacker -> payload XSS khong chay.
  // - img-src 'self'       : chan gui du lieu (cookie) sang server hacker qua Image().
  // - style-src cho phep 'unsafe-inline' de CSS van hoat dong (style khong phai vector XSS o day).
  if (safe) {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'"
    );
  }

  next();
});

// Tranh loi 404 favicon tren console (tra ve 204 No Content)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Phuc vu file tinh (vd trang DOM) - khong de lo thu muc src
app.use(express.static('public'));

// Cac route
app.use('/', homeRouter);
app.use('/', reflectedRouter);
app.use('/', storedRouter);
app.use('/', domRouter);

app.listen(PORT, () => {
  console.log('==============================================');
  console.log(' VulnBank (ung dung nan nhan) dang chay tai:');
  console.log(' http://localhost:' + PORT);
  console.log(' Che do mac dinh: VULNERABLE (co lo hong)');
  console.log(' Nho chay ca hacker-server.js (cong 4000) cho demo trom cookie.');
  console.log('==============================================');
});
