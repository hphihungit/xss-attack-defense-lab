// dom.js - Route phuc vu trang DOM-based XSS (trang tinh nam trong /public)
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/dom', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'dom.html'));
});

module.exports = router;
