// store.js - Luu trang thai dung chung cho ca ung dung (trong bo nho)
//
// De demo don gian va de doc khi thuyet trinh, du lieu chi luu trong bo nho.
// Khoi dong lai server la du lieu tro ve mac dinh.

const state = {
  // Cong tac toan cuc: false = VULNERABLE (co lo hong), true = SAFE (da va)
  SAFE_MODE: false,

  // Danh sach binh luan cho demo Stored XSS (so luu but / guestbook)
  comments: [
    { name: 'Admin', body: 'Chao mung ban den voi so luu but cua VulnBank!' },
  ],
};

function isSafe() {
  return state.SAFE_MODE === true;
}

function toggleMode() {
  state.SAFE_MODE = !state.SAFE_MODE;
  return state.SAFE_MODE;
}

function addComment(name, body) {
  state.comments.push({ name: String(name || 'Khach'), body: String(body || '') });
}

function getComments() {
  return state.comments;
}

// Dia chi "server cua hacker" dung trong payload demo danh cap cookie
const HACKER_URL = 'http://localhost:4000';

module.exports = { state, isSafe, toggleMode, addComment, getComments, HACKER_URL };
