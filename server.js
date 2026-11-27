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

  // Content-Security-Policy: o che do SAFE, chi cho phep tai tai nguyen tu chinh
  // trang nay -> chan inline script va chan gui du lieu sang server hacker.
  if (safe) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self'");
  }

  next();
});

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
