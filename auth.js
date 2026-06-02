// ===== Supabase Auth 模組 =====
// 設定你的 Supabase 專案資訊（從 Supabase Dashboard > Project Settings > API 取得）
const SUPABASE_URL = 'https://besrhrxpzgovqjpdzaow.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DlJ8EoFKvIknLU-RiHvnPA_bI67kVMU';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let _authMode = 'login'; // 'login' | 'register'

// ===== 顯示 / 隱藏登入畫面 =====
function showLoginScreen() {
  document.getElementById('loginOverlay').style.display = 'flex';
}

function hideLoginScreen() {
  document.getElementById('loginOverlay').style.display = 'none';
}

// ===== 訊息顯示 =====
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('authSuccess').style.display = 'none';
}

function showAuthSuccess(msg) {
  const el = document.getElementById('authSuccess');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('authError').style.display = 'none';
}

function hideAuthMessages() {
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authSuccess').style.display = 'none';
}

// ===== 切換登入 / 註冊模式 =====
function switchAuthMode() {
  hideAuthMessages();
  document.getElementById('authEmail').value = '';
  document.getElementById('authPassword').value = '';
  document.getElementById('authConfirmPassword').value = '';

  if (_authMode === 'login') {
    _authMode = 'register';
    document.getElementById('authTitle').textContent = '建立新帳號';
    document.getElementById('authConfirmWrap').style.display = 'block';
    document.getElementById('authSubmitBtn').textContent = '註冊';
    document.getElementById('authToggleText').textContent = '已有帳號？';
    document.getElementById('authToggleLink').textContent = '直接登入';
  } else {
    _authMode = 'login';
    document.getElementById('authTitle').textContent = '英語核心字彙學習工具';
    document.getElementById('authConfirmWrap').style.display = 'none';
    document.getElementById('authSubmitBtn').textContent = '登入';
    document.getElementById('authToggleText').textContent = '還沒有帳號？';
    document.getElementById('authToggleLink').textContent = '立即註冊';
  }
}

// ===== 登入 / 註冊統一入口 =====
function doAuthSubmit() {
  if (_authMode === 'login') {
    doLogin();
  } else {
    doRegister();
  }
}

// ===== 登入 =====
async function doLogin() {
  const email    = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const btn      = document.getElementById('authSubmitBtn');

  if (!email || !password) { showAuthError('請輸入帳號和密碼'); return; }

  btn.disabled    = true;
  btn.textContent = '登入中…';
  hideAuthMessages();

  const { error } = await _supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showAuthError('帳號或密碼錯誤，請再試一次');
    btn.disabled    = false;
    btn.textContent = '登入';
  } else {
    hideLoginScreen();
    updateAuthUserInfo();
  }
}

// ===== 註冊 =====
async function doRegister() {
  const email    = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value;
  const confirm  = document.getElementById('authConfirmPassword').value;
  const btn      = document.getElementById('authSubmitBtn');

  if (!email || !password || !confirm) { showAuthError('請填寫所有欄位'); return; }
  if (password !== confirm) { showAuthError('兩次密碼不一致，請重新輸入'); return; }
  if (password.length < 6)  { showAuthError('密碼至少需要 6 個字元'); return; }

  btn.disabled    = true;
  btn.textContent = '註冊中…';
  hideAuthMessages();

  const { error } = await _supabase.auth.signUp({ email, password });

  btn.disabled    = false;
  btn.textContent = '註冊';

  if (error) {
    showAuthError('註冊失敗：' + error.message);
  } else {
    showAuthSuccess('註冊成功！請確認你的信箱完成驗證，再回來登入。');
    // 3 秒後自動切回登入模式
    setTimeout(() => switchAuthMode(), 3000);
  }
}

// ===== 登出 =====
async function doLogout() {
  await _supabase.auth.signOut();
  document.getElementById('authUserInfo').textContent = '';
  showLoginScreen();
}

// ===== 顯示目前登入帳號 =====
async function updateAuthUserInfo() {
  const { data: { user } } = await _supabase.auth.getUser();
  if (user) {
    document.getElementById('authUserInfo').textContent = user.email;
  }
}

// ===== 初始化：檢查是否已有登入 Session =====
async function initAuth() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    hideLoginScreen();
    updateAuthUserInfo();
  } else {
    showLoginScreen();
  }

  _supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      hideLoginScreen();
      updateAuthUserInfo();
    } else {
      showLoginScreen();
    }
  });
}

// ===== 鍵盤快捷鍵 =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('authEmail').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('authPassword').focus();
  });
  document.getElementById('authPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (_authMode === 'register') {
        document.getElementById('authConfirmPassword').focus();
      } else {
        doLogin();
      }
    }
  });
  document.getElementById('authConfirmPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') doRegister();
  });
  initAuth();
});
