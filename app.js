// ===== 狀態管理 =====
let currentFilter = 0;
let currentDeck = [];
let currentCardIndex = 0;
let isFlipped = false;
let currentSubject = 'home';
let suppressSeenRecord = false;

// 進度存在 localStorage
const STORAGE_KEY = 'vocab_progress';
const LOG_KEY = 'vocab_log';

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch(e) { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 學習日誌：記錄每次標記動作
function logActivity(word, action) {
  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY)) || [];
    log.push({ word, action, time: Date.now() });
    // 只保留最近 500 筆
    if (log.length > 500) log.splice(0, log.length - 500);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch(e) {}
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch(e) { return []; }
}

// 儲存測驗成績
const QUIZ_KEY = 'vocab_quiz_scores';
function saveQuizScore(correct, total) {
  try {
    const scores = JSON.parse(localStorage.getItem(QUIZ_KEY)) || [];
    scores.push({ correct, total, time: Date.now() });
    if (scores.length > 30) scores.splice(0, scores.length - 30);
    localStorage.setItem(QUIZ_KEY, JSON.stringify(scores));
  } catch(e) {}
}
function loadQuizScores() {
  try { return JSON.parse(localStorage.getItem(QUIZ_KEY)) || []; } catch(e) { return []; }
}

function getWordStatus(word) {
  const p = loadProgress();
  return p[word] || 'new'; // 'new' | 'known' | 'hard'
}

function setWordStatus(word, status) {
  const p = loadProgress();
  if (status === 'new') {
    delete p[word];
  } else {
    p[word] = status;
  }
  saveProgress(p);
  logActivity(word, status);
}

// ===== 篩選 =====
function getFilteredDeck() {
  const p = loadProgress();
  if (currentFilter === -1) return VOCAB_ALL.filter(v => p[v.word] === 'hard');
  if (currentFilter === 99 && currentLessonFilter) return VOCAB_ALL.filter(v => v.lesson === currentLessonFilter);
  return [...VOCAB_ALL];
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getLessonList() {
  return [...new Set(VOCAB_ALL.map(v => v.lesson).filter(Boolean))].sort((a, b) => {
    const order = ['L', 'R', 'U'];
    const pa = order.indexOf(a[0]);
    const pb = order.indexOf(b[0]);
    if (pa !== pb) return pa - pb;
    return a.localeCompare(b, 'en', { numeric: true });
  });
}

function populateLessonSelect() {
  const select = document.getElementById('lessonSelect');
  if (!select) return;
  const currentValue = select.value;
  select.innerHTML = '<option value="">選擇課次</option>' +
    getLessonList().map(lesson => `<option value="${lesson}">${lesson}</option>`).join('');
  select.value = currentValue && getLessonList().includes(currentValue) ? currentValue : '';
}

function setFilter(level) {
  currentFilter = level;
  currentLessonFilter = '';
  document.querySelectorAll('#subject-english .filter-btn').forEach(b => b.classList.remove('active'));
  const lessonSelect = document.getElementById('lessonSelect');
  if (lessonSelect) lessonSelect.value = '';
  // 全部按鈕 active
  if (level === 0) document.querySelector('#subject-english .filter-btn').classList.add('active');
  if (level === -1) document.getElementById('hardOnlyBtn').classList.add('active');
  currentDeck = level === 0 ? shuffleDeck(getFilteredDeck()) : getFilteredDeck();
  currentCardIndex = 0;
  isFlipped = false;
  renderCard();
  updateGlobalStats();

  if (document.getElementById('page-quiz').classList.contains('active')) {
    startQuiz();
  }
  if (document.getElementById('page-progress').classList.contains('active')) {
    renderProgress();
  }
}

let currentLessonFilter = '';

function setLessonFilter(lesson, btn) {
  currentFilter = 99;
  currentLessonFilter = lesson;
  document.querySelectorAll('#subject-english .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const lessonSelect = document.getElementById('lessonSelect');
  if (lessonSelect) lessonSelect.value = lesson;
  currentDeck = VOCAB_ALL.filter(v => v.lesson === lesson);
  currentCardIndex = 0;
  isFlipped = false;
  renderCard();
  updateGlobalStats();
  if (document.getElementById('page-quiz').classList.contains('active')) startQuiz();
  if (document.getElementById('page-progress').classList.contains('active')) renderProgress();
}

function setLessonFilterFromSelect(lesson) {
  if (!lesson) {
    setFilter(0);
    return;
  }
  setLessonFilter(lesson);
}

// ===== 頁面切換 =====
function setSubjectButtonActive(btn) {
  const backBtn = document.getElementById('homeBackBtn');
  if (backBtn) backBtn.style.display = currentSubject === 'home' ? 'none' : '';
}

function showHome() {
  currentSubject = 'home';
  const home = document.getElementById('homePage');
  if (home) home.style.display = '';
  ['english','chinese','math','social','science'].forEach(s => {
    const el = document.getElementById('subject-' + s);
    if (el) el.style.display = 'none';
  });
  setSubjectButtonActive();
  document.getElementById('headerSubtitle').textContent = '首頁 ｜ 選擇科目開始學習';
}

function switchSubject(subject) {
  const subjects = ['english','chinese','math','social','science'];
  const subtitles = {
    english: '英文 ｜ 第三次月考 ｜ L07 / L08 / L09 / R03 / U09-U12',
    chinese: '國文 ｜ 開發中',
    math:    '數學 ｜ 學測選擇題練習',
    social:  '社會 ｜ 開發中',
    science: '自然 ｜ 開發中',
  };
  currentSubject = subject;
  const home = document.getElementById('homePage');
  if (home) home.style.display = 'none';
  subjects.forEach(s => {
    document.getElementById('subject-' + s).style.display = s === subject ? '' : 'none';
  });
  setSubjectButtonActive();
  document.getElementById('headerSubtitle').textContent = subtitles[subject];
  if (subject === 'english') {
    currentDeck = shuffleDeck(getFilteredDeck());
    currentCardIndex = 0;
    isFlipped = false;
    suppressSeenRecord = true;
    renderCard();
    suppressSeenRecord = false;
    updateDailyBar();
  }
  if (subject === 'math') startMathQuiz();
}

function switchPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (btn) btn.classList.add('active');

  if (page === 'quiz') startQuiz();
  if (page === 'englishreview') renderEnglishReview();
  if (page === 'progress') renderProgress();
  if (page === 'reading') renderReadingMenu();
  if (page === 'wencianze') renderWenCianzeMenu();
}

// ===== 發音（優先真人錄音，備援 TTS）=====
const audioCache = {};

async function speak(word) {
  const clean = word.split('/')[0].split('(')[0].replace(/[^a-zA-Z\s'-]/g, '').trim();
  const key = clean.toLowerCase();
  if (!key) return;

  if (audioCache[key] !== undefined) {
    audioCache[key] ? playAudioUrl(audioCache[key]) : speakTTS(clean);
    return;
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    let url = '';
    // 優先找美式錄音
    for (const e of data) {
      for (const ph of (e.phonetics || [])) {
        if (ph.audio && ph.audio.includes('-us')) { url = ph.audio; break; }
      }
      if (url) break;
    }
    // 找任何錄音
    if (!url) {
      for (const e of data) {
        for (const ph of (e.phonetics || [])) {
          if (ph.audio) { url = ph.audio; break; }
        }
        if (url) break;
      }
    }
    audioCache[key] = url || null;
    url ? playAudioUrl(url) : speakTTS(clean);
  } catch(e) {
    audioCache[key] = null;
    speakTTS(clean);
  }
}

function playAudioUrl(url) {
  const a = new Audio(url);
  a.play().catch(() => speakTTS(url));
}

function speakTTS(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US';
  u.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const usVoice = voices.find(v => v.lang === 'en-US' && /samantha|zira|david/i.test(v.name))
                || voices.find(v => v.lang === 'en-US');
  if (usVoice) u.voice = usVoice;
  window.speechSynthesis.speak(u);
}

// ===== 單字卡 =====
function renderCard() {
  const scene = document.getElementById('cardScene');
  const front = document.getElementById('cardFront');
  const back = document.getElementById('cardBack');
  const counter = document.getElementById('cardCounter');

  if (currentDeck.length === 0) {
    counter.textContent = '此分類沒有單字';
    front.innerHTML = '<div class="empty-state"><div class="icon">📭</div>此分類目前沒有單字</div>';
    back.innerHTML = '';
    scene.classList.remove('flipped');
    return;
  }

  const v = currentDeck[currentCardIndex];
  const status = getWordStatus(v.word);
  const statusTag = status === 'known'
    ? '<span style="background:#48bb78;color:white;border-radius:8px;padding:2px 8px;font-size:0.7rem;margin-left:6px;">已學</span>'
    : status === 'hard'
    ? '<span style="background:#fc8181;color:white;border-radius:8px;padding:2px 8px;font-size:0.7rem;margin-left:6px;">困難</span>'
    : '';

  counter.textContent = `${currentCardIndex + 1} / ${currentDeck.length}`;

  front.innerHTML = `
    <div class="card-level">Level ${v.level}</div>
    <div class="card-word">${v.word}${statusTag}</div>
    <div class="card-pos">${v.pos}</div>
    <button class="speak-btn" onclick="event.stopPropagation();speak('${v.word.replace(/'/g,"\\'")}')">🔊</button>
    <div class="card-hint">點擊翻面查看中文</div>
  `;

  back.innerHTML = `
    <div class="card-level">${v.lesson || 'Level ' + v.level}</div>
    <div class="card-word-back">${v.word} <span style="color:#a0aec0;font-style:italic">(${v.pos})</span></div>
    <div class="card-zh">${v.zh}</div>
    ${v.en_def ? `<div style="font-size:0.8rem;color:#718096;margin-top:6px;padding:6px 10px;background:#f7fafc;border-radius:6px;font-style:italic;">${v.en_def}</div>` : ''}
    ${v.example ? `<div style="font-size:0.75rem;color:#a0aec0;margin-top:6px;line-height:1.5;border-top:1px solid #f0f0f0;padding-top:6px;"><em>${v.example}</em></div>` : ''}
    <button class="speak-btn" onclick="event.stopPropagation();speak('${v.word.replace(/'/g,"\\'")}')">🔊</button>
  `;

  if (isFlipped) {
    scene.classList.add('flipped');
  } else {
    scene.classList.remove('flipped');
  }

  // 只有真的在英文單字卡頁面時，才記錄今日已看過這個字。
  if (!suppressSeenRecord && currentSubject === 'english' && document.getElementById('page-flashcard').classList.contains('active')) {
    markWordSeen(v.word);
  }
}

function flipCard() {
  if (currentDeck.length === 0) return;
  isFlipped = !isFlipped;
  document.getElementById('cardScene').classList.toggle('flipped', isFlipped);
}

function nextCard() {
  if (currentDeck.length === 0) return;
  isFlipped = false;
  currentCardIndex = (currentCardIndex + 1) % currentDeck.length;
  renderCard();
}

function prevCard() {
  if (currentDeck.length === 0) return;
  isFlipped = false;
  currentCardIndex = (currentCardIndex - 1 + currentDeck.length) % currentDeck.length;
  renderCard();
}

function markCard(status) {
  if (currentDeck.length === 0) return;
  const v = currentDeck[currentCardIndex];
  const current = getWordStatus(v.word);
  // 再次點同樣的標籤 → 取消
  setWordStatus(v.word, current === status ? 'new' : status);
  renderCard();
  updateGlobalStats();
}

function shuffleCards() {
  currentDeck = shuffleDeck(currentDeck);
  currentCardIndex = 0;
  isFlipped = false;
  renderCard();
}

function resetOrder() {
  currentDeck = getFilteredDeck();
  currentCardIndex = 0;
  isFlipped = false;
  renderCard();
}

function showHardOnly() {
  setFilter(-1);
}

// ===== 測驗 =====
let quizQuestions = [];
let quizIndex = 0;
let quizCorrect = 0;
let quizWrong = 0;
let quizAnswered = false;

function startQuiz() {
  clearQuizTimer();
  const deck = getFilteredDeck();
  const minNeeded = quizMode === 'choice' ? 4 : 1;
  if (deck.length < minNeeded) {
    document.getElementById('quizContent').innerHTML = '<div class="empty-state"><div class="icon">📭</div>此分類單字不足，請切換其他篩選</div>';
    document.getElementById('quizProgress').textContent = '';
    document.getElementById('quizScore').textContent = '';
    return;
  }
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  quizQuestions = shuffled.slice(0, Math.min(20, deck.length));
  quizIndex = 0;
  quizCorrect = 0;
  quizWrong = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  document.getElementById('quizProgress').textContent = `第 ${quizIndex + 1} 題 / 共 ${quizQuestions.length} 題`;
  document.getElementById('quizScore').innerHTML = `正確：<span class="correct">${quizCorrect}</span>　錯誤：<span class="wrong">${quizWrong}</span>`;
  if (quizMode === 'spelling') { renderSpellingQuestion(); return; }

  quizAnswered = false;
  const q = quizQuestions[quizIndex];
  const allOthers = VOCAB_ALL.filter(v => v.word !== q.word);
  const wrongs = allOthers.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [q, ...wrongs].sort(() => Math.random() - 0.5);

  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-card">
      <div class="quiz-type-tag">${q.lesson ? q.lesson + ' ｜ ' : ''}選出正確的中文翻譯</div>
      <div class="quiz-question">${q.word}</div>
      <div class="quiz-question-pos">(${q.pos})</div>
      <button class="quiz-speak-btn" onclick="speak('${q.word.replace(/'/g,"\\'")}')">🔊 聽發音</button>
      <div class="options">
        ${options.map((o, i) => `
          <button class="option-btn" onclick="answerQuiz(this, '${o.zh.replace(/'/g,"\\'")}', '${q.zh.replace(/'/g,"\\'")}')">
            ${String.fromCharCode(65+i)}. ${o.zh}
          </button>
        `).join('')}
      </div>
      <div id="quizExplain" style="display:none;margin-top:14px;padding:14px;background:#f7fafc;border-radius:10px;border-left:3px solid #3182ce;font-size:0.88rem;line-height:1.8;text-align:left;"></div>
    </div>
    <button class="quiz-next-btn" id="quizNextBtn" style="display:none" onclick="nextQuizQuestion()">
      ${quizIndex + 1 < quizQuestions.length ? '下一題 →' : '查看結果'}
    </button>
  `;
  startQuizTimer();
}

function answerQuiz(btn, chosen, correct) {
  if (quizAnswered) return;
  quizAnswered = true;
  const t = getResponseTime();
  clearQuizTimer();

  const q = quizQuestions[quizIndex];
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent.trim().substring(3) === correct) b.classList.add('correct');
  });

  if (chosen === correct) {
    btn.classList.add('correct');
    quizCorrect++;
    setWordStatus(q.word, 'known');
    recordDailyResult(q.word, true, t);
    // 在正確按鈕上顯示熟練度
    btn.insertAdjacentHTML('beforeend', ' ' + getMasteryTag(t));
  } else {
    btn.classList.add('wrong');
    quizWrong++;
    setWordStatus(q.word, 'hard');
    recordDailyResult(q.word, false, t);
  }

  document.getElementById('quizScore').innerHTML = `正確：<span class="correct">${quizCorrect}</span>　錯誤：<span class="wrong">${quizWrong}</span>`;
  document.getElementById('quizNextBtn').style.display = 'block';
  updateGlobalStats();

  // 顯示中文解析（幫助英文程度較弱的學生理解）
  const expl = document.getElementById('quizExplain');
  if (expl) {
    expl.style.display = 'block';
    expl.innerHTML =
      `<div style="margin-bottom:6px;">
         <strong style="font-size:1rem;color:#2b6cb0;">${q.word}</strong>
         <span style="color:#718096;font-size:0.82rem;margin-left:4px;">${q.pos}</span>
         <span style="margin:0 6px;color:#a0aec0;">＝</span>
         <strong style="color:#c05621;">${q.zh}</strong>
         ${q.lesson ? `<span style="margin-left:8px;background:#ebf8ff;color:#2b6cb0;border-radius:6px;padding:1px 7px;font-size:0.75rem;font-weight:700;">${q.lesson}</span>` : ''}
       </div>
       ${q.en_def ? `<div style="color:#4a5568;margin-bottom:4px;">${q.en_def}</div>` : ''}
       ${q.example ? `<div style="color:#a0aec0;font-style:italic;font-size:0.82rem;">${q.example}</div>` : ''}`;
  }
}

function nextQuizQuestion() {
  quizIndex++;
  if (quizIndex >= quizQuestions.length) {
    showQuizResult();
  } else {
    renderQuizQuestion();
  }
}

function showQuizResult() {
  const total = quizQuestions.length;
  const pct = Math.round(quizCorrect / total * 100);
  saveQuizScore(quizCorrect, total);
  let emoji = pct >= 90 ? '🎉' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📚';
  document.getElementById('quizProgress').textContent = '';
  document.getElementById('quizScore').textContent = '';
  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-result">
      <h2>${emoji} 測驗完成！</h2>
      <div class="big-score">${pct}%</div>
      <p>答對 ${quizCorrect} 題，答錯 ${quizWrong} 題，共 ${total} 題</p>
      <button class="quiz-restart" onclick="startQuiz()">再測一次</button>
    </div>
  `;
}

// ===== 進度頁 =====
function renderProgress() {
  const p = loadProgress();
  const total = VOCAB_ALL.length;
  const known = Object.values(p).filter(v => v === 'known').length;
  const hard = Object.values(p).filter(v => v === 'hard').length;
  const unseen = total - known - hard;

  document.getElementById('statGrid').innerHTML = `
    <div class="stat-box"><div class="num">${total}</div><div class="lbl">全部單字</div></div>
    <div class="stat-box"><div class="num green">${known}</div><div class="lbl">已學會</div></div>
    <div class="stat-box"><div class="num red">${hard}</div><div class="lbl">困難單字</div></div>
    <div class="stat-box"><div class="num gray">${unseen}</div><div class="lbl">尚未學習</div></div>
  `;

  // 各課次進度
  let barsHTML = '';
  getLessonList().forEach(lesson => {
    const lvWords = VOCAB_ALL.filter(v => v.lesson === lesson);
    if (!lvWords.length) return;
    const lvKnown = lvWords.filter(v => p[v.word] === 'known').length;
    const pct = Math.round(lvKnown / lvWords.length * 100);
    barsHTML += `
      <div class="level-row">
        <div class="level-label">${lesson}</div>
        <div class="progress-bar-outer">
          <div class="progress-bar-inner" style="width:${pct}%"></div>
        </div>
        <div class="level-pct">${pct}%</div>
      </div>
    `;
  });
  document.getElementById('levelProgressBars').innerHTML = barsHTML;

  // 困難單字清單
  const hardWords = Object.entries(p)
    .filter(([w, s]) => s === 'hard')
    .map(([w]) => w);

  if (hardWords.length === 0) {
    document.getElementById('hardList').innerHTML = '<div class="empty-state">目前沒有困難單字</div>';
  } else {
    document.getElementById('hardList').innerHTML = hardWords.map(w => `
      <span class="hard-word-chip" onclick="markKnownFromProgress('${w.replace(/'/g,"\\'")}', this)" title="點擊標為已學">
        ${w}
      </span>
    `).join('');
  }
}

function markKnownFromProgress(word, el) {
  setWordStatus(word, 'known');
  el.classList.add('known');
  el.title = '已標為已學';
  updateGlobalStats();
  setTimeout(() => renderProgress(), 800);
}

function confirmReset() {
  if (confirm('確定要重設所有學習進度嗎？此操作無法復原。')) {
    localStorage.removeItem(STORAGE_KEY);
    renderProgress();
    updateGlobalStats();
    renderCard();
  }
}

// ===== 全域統計列 =====
function updateGlobalStats() {
  const p = loadProgress();
  const total = currentDeck.length;
  const known = currentDeck.filter(v => p[v.word] === 'known').length;
  const hard = currentDeck.filter(v => p[v.word] === 'hard').length;
  const pct = total > 0 ? Math.round(known / total * 100) : 0;
  document.getElementById('globalStats').innerHTML = `
    <span>目前範圍：<strong>${total} 字</strong></span>
    <span>已學：<strong>${known}</strong></span>
    <span>困難：<strong>${hard}</strong></span>
    <span>完成度：<strong>${pct}%</strong></span>
  `;
}

// ===== 克漏字模組 =====
let clozeCurrentAnswer = '';
let clozeBankIndex = 0;
let clozeCorrectAnswer = '';
let clozeCurrentTarget = null;
let clozeSubmitted = false;
let clozeSessionCount = 0;
let clozeCorrectCount = 0;
let clozeQuestionQueue = [];
let clozeLastQuestionKey = '';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pickTargetWord() {
  const p = loadProgress();
  const deck = getFilteredDeck();
  const basePool = deck.length > 0 ? deck : VOCAB_ALL;
  const hardWords = basePool.filter(v => p[v.word] === 'hard');
  const pool = hardWords.length > 0 && Math.random() < 0.4 ? hardWords : basePool;
  return pool[Math.floor(Math.random() * pool.length)];
}

function clozePrimaryWord(word) {
  return String(word).split('/')[0].replace(/\(.+?\)/g, '').trim();
}

function clozePosType(pos) {
  const p = String(pos).toLowerCase();
  if (p.includes('v.') || p.includes('vt.') || p.includes('vi.')) return 'verb';
  if (p.includes('adj.')) return 'adj';
  if (p.includes('adv.')) return 'adv';
  if (p.includes('prep.')) return 'prep';
  return 'noun';
}

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDistractors(target, count = 3) {
  const targetType = clozePosType(target.pos);
  const sameLevel = VOCAB_ALL.filter(v =>
    v.word !== target.word &&
    clozePosType(v.pos) === targetType &&
    v.level === target.level
  );
  const sameType = VOCAB_ALL.filter(v =>
    v.word !== target.word &&
    clozePosType(v.pos) === targetType &&
    v.level !== target.level
  );
  const fallback = VOCAB_ALL.filter(v => v.word !== target.word);
  const picked = [];

  for (const item of shuffleArray([...sameLevel, ...sameType, ...fallback])) {
    const word = clozePrimaryWord(item.word);
    if (!word || picked.includes(word) || word === clozePrimaryWord(target.word)) continue;
    picked.push(word);
    if (picked.length === count) break;
  }
  return picked;
}

function buildClozeQuestion(target) {
  const word = clozePrimaryWord(target.word);
  const type = clozePosType(target.pos);
  const templates = {
    noun: [
      {
        en: `The teacher asked the class to explain why [BLANK] was important in the story.`,
        zh: `老師請全班說明為什麼故事中的[BLANK]很重要。`,
        correct: `「${target.zh}」作為名詞，能自然表示句中的核心事物或概念。`
      },
      {
        en: `After the discussion, everyone had a clearer idea of [BLANK].`,
        zh: `討論之後，大家對[BLANK]有了更清楚的概念。`,
        correct: `這裡需要名詞當作 of 後面的受詞，「${word}」符合語法與語意。`
      }
    ],
    verb: [
      {
        en: `Before making a decision, they needed to [BLANK] the situation carefully.`,
        zh: `做決定之前，他們需要仔細地[BLANK]這個情況。`,
        correct: `空格接在 to 後面，需要原形動詞；「${target.zh}」符合動作語意。`
      },
      {
        en: `The coach encouraged the team to [BLANK] when the challenge became difficult.`,
        zh: `當挑戰變困難時，教練鼓勵隊伍要[BLANK]。`,
        correct: `這裡需要一個動詞補足 encouraged...to 的句型，「${word}」可以表達主要動作。`
      }
    ],
    adj: [
      {
        en: `The speaker gave a [BLANK] example so the students could understand the idea.`,
        zh: `講者給了一個[BLANK]的例子，讓學生能理解這個概念。`,
        correct: `空格放在名詞 example 前，需要形容詞；「${target.zh}」能修飾後面的名詞。`
      },
      {
        en: `Her [BLANK] attitude helped the group stay focused during the project.`,
        zh: `她[BLANK]的態度幫助小組在專案中保持專注。`,
        correct: `這裡需要形容詞修飾 attitude，「${word}」符合形容詞位置。`
      }
    ],
    adv: [
      {
        en: `The students listened [BLANK] while the guest shared his experience.`,
        zh: `來賓分享經驗時，學生們[BLANK]地聆聽。`,
        correct: `空格修飾動詞 listened，需要副詞；「${target.zh}」符合副詞用法。`
      },
      {
        en: `The plan changed [BLANK] after the new rule was announced.`,
        zh: `新規定宣布後，計畫[BLANK]地改變了。`,
        correct: `這裡用副詞修飾 changed，「${word}」能表示動作發生的方式。`
      }
    ],
    prep: [
      {
        en: `The report included several examples [BLANK] the main topic.`,
        zh: `報告包含了幾個[BLANK]主題的例子。`,
        correct: `空格需要介系詞連接 examples 和 topic，「${target.zh}」符合連接關係。`
      },
      {
        en: `The class had a short discussion [BLANK] the reading passage.`,
        zh: `全班針對閱讀文章進行了一段簡短討論。`,
        correct: `這裡需要介系詞帶出討論的對象，「${word}」符合句型。`
      }
    ]
  };
  const template = templates[type][clozeBankIndex++ % templates[type].length];
  const choices = shuffleArray([word, ...pickDistractors(target)]);
  const letters = ['A','B','C','D'];
  const options = {};
  let correct = 'A';
  letters.forEach((letter, index) => {
    options[letter] = choices[index];
    if (choices[index] === word) correct = letter;
  });

  return {
    word: target.word,
    pos: target.pos,
    zh: target.zh,
    level: target.level,
    passage: template.en,
    passage_zh: template.zh,
    options,
    correct_answer: correct,
    explanation: {
      chinese_translation: template.zh.replace('[BLANK]', target.zh),
      core_concept: `測驗 ${word}（${target.zh}）在句中的 ${target.pos} 用法。`,
      why_correct: template.correct,
      why_others_wrong: `其他選項雖然也是單字，但詞性或語意無法自然放進這個句子。先看空格前後的句型，再用中文意思確認。`
    }
  };
}

function clozeQuestionKey(q) {
  return `${q.lesson || ''}:${q.word || ''}:${q.passage || ''}`;
}

function getExamClozePool() {
  const source = typeof EXAM3_CLOZE !== 'undefined' ? EXAM3_CLOZE : [];
  const allowedLessons = ['L07', 'L08', 'L09', 'R03'];
  let pool = source.filter(q =>
    allowedLessons.includes(q.lesson) &&
    q.passage &&
    q.options &&
    q.correct_answer
  );

  if (currentLessonFilter) {
    const lessonPool = pool.filter(q => q.lesson === currentLessonFilter);
    if (lessonPool.length) pool = lessonPool;
  }

  return pool;
}

function getNextExamClozeQuestion() {
  const pool = getExamClozePool();
  if (!pool.length) return null;

  if (!clozeQuestionQueue.length) {
    clozeQuestionQueue = shuffleArray(pool);
    if (
      clozeQuestionQueue.length > 1 &&
      clozeQuestionKey(clozeQuestionQueue[0]) === clozeLastQuestionKey
    ) {
      clozeQuestionQueue.push(clozeQuestionQueue.shift());
    }
  }

  const question = clozeQuestionQueue.shift();
  clozeLastQuestionKey = clozeQuestionKey(question);
  return question;
}

function normalizeExamClozeQuestion(source) {
  const lesson = source.lesson || '';
  const word = source.word || '';
  const pos = source.pos || '';
  const zh = source.zh || '';
  return {
    word,
    pos,
    zh,
    level: source.level || 3,
    lesson,
    passage: source.passage,
    passage_zh: source.passage_zh || '',
    options: source.options,
    correct_answer: source.correct_answer,
    explanation: source.explanation || {
      chinese_translation: source.passage_zh || '',
      core_concept: `${lesson} 課文克漏字複習`,
      why_correct: `依照句意與課文脈絡，這裡最適合填入 ${word}。`,
      why_others_wrong: '其他選項放入句中時，語意或句型不自然。'
    }
  };
}

function getClozeCorrectOption(q) {
  return q && q.options && q.correct_answer
    ? q.options[q.correct_answer]
    : '';
}

function fillClozeBlanks(passage, answer, wrapPart) {
  if (!passage) return '';
  const blankCount = (passage.match(/\[BLANK\]/g) || []).length;
  if (!blankCount) return passage;

  const answerParts = String(answer || '___')
    .split('/')
    .map(part => part.trim())
    .filter(Boolean);
  const replacements = answerParts.length === blankCount
    ? answerParts
    : Array(blankCount).fill(answer || '___');
  let index = 0;

  return passage.replace(/\[BLANK\]/g, () => {
    const part = replacements[index] || replacements[replacements.length - 1] || '___';
    index += 1;
    return wrapPart ? wrapPart(part) : part;
  });
}

async function generateClozeQuestion() {
  document.getElementById('clozeMain').style.display = 'none';
  document.getElementById('clozeError').style.display = 'none';
  document.getElementById('clozeLoading').style.display = 'block';
  document.getElementById('clozeBtnGenerate').disabled = true;

  try {
    const examQuestion = getNextExamClozeQuestion();

    if (examQuestion) {
      const q = normalizeExamClozeQuestion(examQuestion);
      const target = {
        word: q.word,
        pos: q.pos,
        zh: q.zh,
        level: q.level,
        lesson: q.lesson
      };
      document.getElementById('clozeLoadingWord').textContent =
        `正在準備 ${q.lesson || '英文'} 課文克漏字…`;
      const badge = document.getElementById('clozeSourceBadge');
      if (badge) badge.textContent = `${q.lesson || '英文'} 課文題庫`;
      renderClozeQuestion(q, target);
      return;
    }

    const target = pickTargetWord();
    document.getElementById('clozeLoadingWord').textContent = `正在準備 ${target.word} 的題目…`;
    const q = buildClozeQuestion(target);
    const badge = document.getElementById('clozeSourceBadge');
    if (badge) badge.textContent = `Level ${target.level} 緊急備用`;
    renderClozeQuestion(q, target);
  } catch(e) {
    document.getElementById('clozeLoading').style.display = 'none';
    document.getElementById('clozeError').style.display = 'block';
    document.getElementById('clozeErrorMsg').textContent = e.message || '出題失敗，請重試';
  } finally {
    document.getElementById('clozeBtnGenerate').disabled = false;
  }
}

function renderClozeQuestion(q, target) {
  clozeCurrentAnswer = '';
  clozeCorrectAnswer = q.correct_answer;
  clozeCurrentTarget = target;
  clozeSubmitted = false;
  clozeSessionCount++;
  clozePendingQuestion = q;
  clozePendingExplanation = q.explanation;
  clozePendingPassage = q.passage;

  document.getElementById('clozeLoading').style.display = 'none';
  document.getElementById('clozeExplanation').style.display = 'none';
  document.getElementById('clozeResultBadge').style.display = 'none';
  document.getElementById('clozeMain').style.display = 'block';
  document.getElementById('clozeSessionInfo').textContent =
    `本次：${clozeSessionCount} 題 ｜ 答對 ${clozeCorrectCount} 題`;

  // 單字提示（交卷前隱藏，交卷後才顯示）
  document.getElementById('clozeWordHint').innerHTML = '';

  // 段落（高亮 [BLANK]）
  document.getElementById('clozePassage').innerHTML = fillClozeBlanks(
    q.passage,
    '?',
    () => '<span style="display:inline-block;background:#bee3f8;border-bottom:2px solid #3182ce;padding:0 8px;border-radius:4px;font-weight:700;color:#2b6cb0;min-width:80px;text-align:center;">&nbsp;&nbsp;&nbsp;?&nbsp;&nbsp;&nbsp;</span>'
  );

  // 選項列表
  const letters = ['A','B','C','D'];
  document.getElementById('clozeOptions').innerHTML = letters.map(l =>
    `<div class="option-row" id="optRow${l}">
       <strong>${l}.</strong>&nbsp;&nbsp;${escapeHtml(q.options[l])}
     </div>`
  ).join('');

  // 答題卡氣泡
  document.getElementById('clozeQuestionNo').textContent = `第 ${clozeSessionCount} 題`;
  document.getElementById('clozeBubbles').innerHTML = letters.map(l =>
    `<div>
       <div class="bubble" id="bubble${l}" onclick="selectBubble('${l}')">${l}</div>
     </div>`
  ).join('');

  // 重置交卷鍵
  const btn = document.getElementById('clozeSubmitBtn');
  btn.disabled = true;
  btn.textContent = '交卷';
  btn.style.background = '#e2e8f0';
  btn.style.color = '#a0aec0';
  btn.style.cursor = 'not-allowed';
}

function selectBubble(letter) {
  if (clozeSubmitted) return;
  clozeCurrentAnswer = letter;
  ['A','B','C','D'].forEach(l => {
    document.getElementById('bubble' + l).classList.toggle('selected', l === letter);
  });
  const btn = document.getElementById('clozeSubmitBtn');
  btn.disabled = false;
  btn.style.background = '#3182ce';
  btn.style.color = 'white';
  btn.style.cursor = 'pointer';
}

function submitCloze() {
  if (!clozeCurrentAnswer || clozeSubmitted) return;
  clozeSubmitted = true;

  const isCorrect = clozeCurrentAnswer === clozeCorrectAnswer;
  if (isCorrect) clozeCorrectCount++;

  // 交卷後才顯示目標單字
  const t = clozeCurrentTarget;
  document.getElementById('clozeWordHint').innerHTML =
    `<span>📌 本題目標單字：</span>
     <strong style="font-size:1rem;">${t.word}</strong>
     <span style="color:#a0aec0;">(${t.pos})</span>
     <span style="color:#4a5568;">${t.zh}</span>
     <button onclick="speak('${t.word.replace(/'/g,"\\'")}');" style="background:none;border:1.5px solid #3182ce;color:#3182ce;border-radius:6px;padding:2px 8px;font-size:0.78rem;cursor:pointer;">🔊</button>`;

  // 更新氣泡顏色
  ['A','B','C','D'].forEach(l => {
    const bubble = document.getElementById('bubble' + l);
    bubble.classList.remove('selected');
    if (l === clozeCorrectAnswer) bubble.classList.add('correct-bubble');
    else if (l === clozeCurrentAnswer) bubble.classList.add('wrong-bubble');
    bubble.style.cursor = 'default';
  });

  // 高亮選項列
  ['A','B','C','D'].forEach(l => {
    const row = document.getElementById('optRow' + l);
    if (l === clozeCorrectAnswer) row.classList.add('highlight-correct');
    else if (l === clozeCurrentAnswer && !isCorrect) row.classList.add('highlight-wrong');
  });

  // 結果標記
  const badge = document.getElementById('clozeResultBadge');
  badge.style.display = 'block';
  if (isCorrect) {
    badge.style.background = '#f0fff4';
    badge.style.color = '#276749';
    badge.textContent = '✓ 答對了！';
  } else {
    badge.style.background = '#fff5f5';
    badge.style.color = '#9b2c2c';
    badge.textContent = `✗ 答錯！正解是 ${clozeCorrectAnswer}`;
  }

  // 更新進度（答錯標為困難）
  const q = clozePendingQuestion;
  if (q) {
    setWordStatus(q.word, isCorrect ? 'known' : 'hard');
    recordDailyResult(q.word, isCorrect, 0);
    updateGlobalStats();
  }

  document.getElementById('clozeSessionInfo').textContent =
    `本次：${clozeSessionCount} 題 ｜ 答對 ${clozeCorrectCount} 題`;

  // 展開解析
  showClozeExplanation(clozePendingExplanation);

  // 禁用交卷鍵
  const btn = document.getElementById('clozeSubmitBtn');
  btn.textContent = '已交卷';
  btn.disabled = true;
  btn.style.background = '#e2e8f0';
  btn.style.color = '#718096';
}

let clozePendingQuestion = null;
let clozePendingExplanation = null;
let clozePendingPassage = null;

function showClozeExplanation(expl) {
  if (!expl) return;
  const el = document.getElementById('clozeExplContent');
  const t = clozeCurrentTarget;
  const zhPassage = clozePendingQuestion && clozePendingQuestion.passage_zh
    ? clozePendingQuestion.passage_zh : null;
  const correctOption = getClozeCorrectOption(clozePendingQuestion) || (t ? t.word : '___');
  const fullSentenceEn = clozePendingPassage
    ? fillClozeBlanks(
        clozePendingPassage,
        correctOption,
        part => `<strong style="color:#2b6cb0;border-bottom:2px solid #3182ce;">${escapeHtml(part)}</strong>`
      )
    : '';
  const translatedSentence = expl.chinese_translation || '';
  const fullSentenceZh = translatedSentence || (zhPassage
    ? fillClozeBlanks(
        zhPassage,
        t ? t.zh : '___',
        part => `<strong style="color:#c05621;border-bottom:2px solid #dd6b20;">${escapeHtml(part)}</strong>`
      )
    : '');
  const fullSentence = fullSentenceZh || fullSentenceEn;
  const wordBlock = t ? `
    <div style="background:#fefcbf;border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-size:0.72rem;color:#744210;letter-spacing:1px;margin-bottom:6px;">📌 目標單字解釋</div>
      <div style="font-size:1rem;font-weight:700;color:#2d3748;">${t.word} <span style="font-size:0.82rem;color:#a0aec0;font-weight:400;">${t.pos}</span></div>
      <div style="font-size:0.95rem;color:#744210;margin-top:4px;">${t.zh}</div>
    </div>` : '';
  el.innerHTML = `
    ${fullSentence ? `
    <div style="background:#f7fafc;border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-size:0.72rem;color:#a0aec0;letter-spacing:1px;margin-bottom:6px;">完整句子</div>
      <div style="font-size:0.95rem;color:#2d3748;line-height:1.9;">${fullSentence}</div>
    </div>` : ''}
    ${wordBlock}
    <div style="background:#ebf8ff;border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-size:0.72rem;color:#2b6cb0;letter-spacing:1px;margin-bottom:6px;">核心觀念</div>
      <div style="font-size:0.88rem;color:#2c5282;">${expl.core_concept}</div>
    </div>
    <div style="background:#f0fff4;border-radius:10px;padding:14px;margin-bottom:12px;">
      <div style="font-size:0.72rem;color:#276749;letter-spacing:1px;margin-bottom:6px;">✓ 為什麼正確</div>
      <div style="font-size:0.88rem;color:#22543d;">${expl.why_correct}</div>
    </div>
    <div style="background:#fff5f5;border-radius:10px;padding:14px;">
      <div style="font-size:0.72rem;color:#9b2c2c;letter-spacing:1px;margin-bottom:6px;">✗ 其他選項為何錯誤</div>
      <div style="font-size:0.88rem;color:#742a2a;line-height:1.7;">${expl.why_others_wrong}</div>
    </div>
  `;
  document.getElementById('clozeExplanation').style.display = 'block';
  document.getElementById('clozeExplanation').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 鍵盤 A/B/C/D 快捷鍵（克漏字頁）
document.addEventListener('keydown', e => {
  if (!document.getElementById('page-cloze').classList.contains('active')) return;
  const key = e.key.toUpperCase();
  if (['A','B','C','D'].includes(key) && !clozeSubmitted) selectBubble(key);
  if (e.key === 'Enter' && !clozeSubmitted && clozeCurrentAnswer) submitCloze();
});

// ===== 家長查看進度 =====
function openParentModal() {
  const p = loadProgress();
  const log = loadLog();
  const scores = loadQuizScores();
  const total = VOCAB_ALL.length;
  const known = Object.values(p).filter(v => v === 'known').length;
  const hard = Object.values(p).filter(v => v === 'hard').length;
  const unseen = total - known - hard;
  const pct = Math.round(known / total * 100);

  // 今日活動（台北時間）
  const todayStr = new Date().toLocaleDateString('zh-TW', {timeZone:'Asia/Taipei'});
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayLog = log.filter(l => l.time >= todayStart.getTime());
  const todayKnown = todayLog.filter(l => l.action === 'known').length;
  const todayHard = todayLog.filter(l => l.action === 'hard').length;
  const todayDaily = getTodayWords();
  const todayWords = Object.keys(todayDaily).length;
  const todayViews = Object.values(todayDaily).reduce((sum, w) => sum + (w.seen || 0), 0);
  const todayCorrect = Object.values(todayDaily).reduce((sum, w) => sum + (w.correct || 0), 0);
  const todayWrong = Object.values(todayDaily).reduce((sum, w) => sum + (w.wrong || 0), 0);
  const todayPct = Math.min(100, Math.round(todayWords / DAILY_TARGET * 100));

  // 近期測驗
  const recentScores = scores.slice(-5).reverse();

  // 各級進度
  let levelRows = '';
  [2,3,4].forEach(lv => {
    const lvWords = VOCAB_ALL.filter(v => v.level === lv);
    const lvKnown = lvWords.filter(v => p[v.word] === 'known').length;
    const lvHard = lvWords.filter(v => p[v.word] === 'hard').length;
    const lvPct = Math.round(lvKnown / lvWords.length * 100);
    levelRows += `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;">
          <span>Level ${lv}（共 ${lvWords.length} 字）</span>
          <span style="color:#3182ce;font-weight:700;">${lvKnown} 已學 / ${lvHard} 困難</span>
        </div>
        <div style="height:10px;background:#e2e8f0;border-radius:5px;overflow:hidden;">
          <div style="height:100%;width:${lvPct}%;background:linear-gradient(90deg,#3182ce,#63b3ed);border-radius:5px;"></div>
        </div>
      </div>`;
  });

  // 困難單字
  const hardWords = Object.entries(p).filter(([,s]) => s === 'hard').map(([w]) => w);
  const hardChips = hardWords.length
    ? hardWords.map(w => `<span style="background:#fff5f5;border:1px solid #fed7d7;color:#c53030;padding:3px 8px;border-radius:10px;font-size:0.78rem;margin:2px;display:inline-block;">${w}</span>`).join('')
    : '<span style="color:#a0aec0;font-size:0.85rem;">目前沒有困難單字 👍</span>';

  // 測驗紀錄
  const quizRows = recentScores.length
    ? recentScores.map(s => {
        const d = new Date(s.time).toLocaleString('zh-TW', {timeZone:'Asia/Taipei', month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const p2 = Math.round(s.correct/s.total*100);
        const color = p2 >= 80 ? '#38a169' : p2 >= 60 ? '#d69e2e' : '#e53e3e';
        return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:0.85rem;">
          <span>${d}</span>
          <span style="color:${color};font-weight:700;">${s.correct}/${s.total}（${p2}%）</span>
        </div>`;
      }).join('')
    : '<p style="color:#a0aec0;font-size:0.85rem;">尚無測驗紀錄</p>';

  document.getElementById('parentReportDate').textContent = `報告時間：${todayStr}`;
  document.getElementById('parentModalContent').innerHTML = `
    <div style="background:#ebf8ff;border-radius:12px;padding:16px;margin-bottom:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:center;">
      <div><div style="font-size:1.8rem;font-weight:800;color:#3182ce;">${pct}%</div><div style="font-size:0.75rem;color:#718096;">整體完成度</div></div>
      <div><div style="font-size:1.8rem;font-weight:800;color:#48bb78;">${known}</div><div style="font-size:0.75rem;color:#718096;">已學單字</div></div>
      <div><div style="font-size:1.8rem;font-weight:800;color:#fc8181;">${hard}</div><div style="font-size:0.75rem;color:#718096;">困難單字</div></div>
      <div><div style="font-size:1.8rem;font-weight:800;color:#a0aec0;">${unseen}</div><div style="font-size:0.75rem;color:#718096;">尚未接觸</div></div>
    </div>

    <div style="background:#f0fff4;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h3 style="font-size:0.95rem;margin-bottom:10px;">📅 今日學習（${todayStr}）</h3>
      <div style="height:10px;background:#9ae6b4;border-radius:5px;overflow:hidden;margin-bottom:10px;">
        <div style="height:100%;width:${todayPct}%;background:#38a169;border-radius:5px;"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.88rem;">
        <span>今日接觸：<strong>${todayWords}</strong> / ${DAILY_TARGET} 字</span>
        <span>翻卡次數：<strong>${todayViews}</strong></span>
        <span>今日答對：<strong style="color:#38a169;">${todayCorrect}</strong></span>
        <span>今日答錯：<strong style="color:#e53e3e;">${todayWrong}</strong></span>
        <span>標為已學：<strong style="color:#38a169;">${todayKnown}</strong></span>
        <span>標為困難：<strong style="color:#e53e3e;">${todayHard}</strong></span>
      </div>
      <p style="font-size:0.76rem;color:#718096;margin-top:8px;">這一格只看今天，不使用累積完成度。</p>
    </div>

    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h3 style="font-size:0.95rem;margin-bottom:12px;">📊 各級別進度</h3>
      ${levelRows}
    </div>

    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:16px;">
      <h3 style="font-size:0.95rem;margin-bottom:10px;">📝 近期測驗紀錄</h3>
      ${quizRows}
    </div>

    <div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:16px;">
      <h3 style="font-size:0.95rem;margin-bottom:10px;">🔴 困難單字清單（${hardWords.length} 個）</h3>
      <div>${hardChips}</div>
    </div>
  `;

  document.getElementById('parentModal').style.display = 'block';
}

function closeParentModal() {
  document.getElementById('parentModal').style.display = 'none';
}

// 點 Modal 背景關閉
document.getElementById('parentModal').addEventListener('click', function(e) {
  if (e.target === this) closeParentModal();
});

// ===== 計時器 =====
let quizTimer = null;
let quizTimerStart = null;
const QUIZ_TIME_LIMIT = 30;
let quizTimerEnabled = false;

function toggleQuizTimer() {
  quizTimerEnabled = !quizTimerEnabled;
  const btn = document.getElementById('timerToggleBtn');
  if (btn) {
    btn.textContent = quizTimerEnabled ? '⏱ 計時中' : '⏱ 不計時';
    btn.style.background = quizTimerEnabled ? '#e53e3e20' : 'transparent';
    btn.style.color = quizTimerEnabled ? '#e53e3e' : '#a0aec0';
    btn.style.borderColor = quizTimerEnabled ? '#e53e3e' : '#e2e8f0';
  }
  if (!quizTimerEnabled) clearQuizTimer();
  else startQuizTimer();
}

function startQuizTimer() {
  if (!quizTimerEnabled) { clearQuizTimer(); return; }
  clearQuizTimer();
  quizTimerStart = Date.now();
  const bar = document.getElementById('timerBar');
  const wrap = document.getElementById('timerWrap');
  const lbl = document.getElementById('timerLabel');
  if (!bar) return;
  wrap.style.display = 'block';
  bar.style.transition = 'none';
  bar.style.width = '100%';
  setTimeout(() => {
    bar.style.transition = `width ${QUIZ_TIME_LIMIT}s linear`;
    bar.style.width = '0%';
  }, 30);
  let remain = QUIZ_TIME_LIMIT;
  if (lbl) lbl.textContent = `⏱ 剩餘 ${remain} 秒`;
  quizTimer = setInterval(() => {
    remain--;
    if (lbl) lbl.textContent = remain > 0 ? `⏱ 剩餘 ${remain} 秒` : '⏰ 時間到！';
    if (remain <= 0) {
      clearInterval(quizTimer);
      quizTimer = null;
      if (!quizAnswered) handleTimeout();
    }
  }, 1000);
}

function clearQuizTimer() {
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  const wrap = document.getElementById('timerWrap');
  const lbl = document.getElementById('timerLabel');
  if (wrap) wrap.style.display = 'none';
  if (lbl) lbl.textContent = '';
}

function getResponseTime() {
  return quizTimerStart ? (Date.now() - quizTimerStart) / 1000 : 0;
}

function getMasteryTag(sec) {
  if (sec <= 3)  return '<span class="mastery-tag mastery-fast">快速 ⚡</span>';
  if (sec <= 7)  return '<span class="mastery-tag mastery-mid">普通 👍</span>';
  return '<span class="mastery-tag mastery-slow">需加強 📚</span>';
}

function handleTimeout() {
  if (quizAnswered) return;
  quizAnswered = true;
  quizWrong++;
  const q = quizQuestions[quizIndex];
  setWordStatus(q.word, 'hard');
  recordDailyResult(q.word, false, QUIZ_TIME_LIMIT);
  updateGlobalStats();

  if (quizMode === 'spelling') {
    const input = document.getElementById('spellingInput');
    if (input) {
      input.disabled = true;
      input.classList.add('wrong');
    }
    const fb = document.getElementById('spellingFeedback');
    if (fb) fb.innerHTML = `<span style="color:#e53e3e;font-weight:700;">⏰ 時間到！答案：</span> <strong>${q.word}</strong>`;
  } else {
    document.querySelectorAll('.option-btn').forEach(b => {
      b.disabled = true;
      const txt = b.textContent.trim().substring(3);
      if (txt === q.zh) b.classList.add('correct');
    });
  }
  document.getElementById('quizScore').innerHTML = `正確：<span class="correct">${quizCorrect}</span>　錯誤：<span class="wrong">${quizWrong}</span>`;
  const nb = document.getElementById('quizNextBtn');
  if (nb) nb.style.display = 'block';
}

// ===== 每日目標 =====
const DAILY_KEY = 'vocab_daily';
const DAILY_TARGET = 10;

function getTodayKey() {
  return new Date().toLocaleDateString('zh-TW', {timeZone:'Asia/Taipei'}).replace(/\//g,'-');
}

function getDailyData() {
  try { return JSON.parse(localStorage.getItem(DAILY_KEY)) || {}; } catch(e) { return {}; }
}

function markWordSeen(word) {
  const data = getDailyData();
  const today = getTodayKey();
  if (!data[today]) data[today] = {};
  if (!data[today][word]) data[today][word] = { seen: 1, correct: 0, wrong: 0, bestTime: null };
  else data[today][word].seen = (data[today][word].seen || 0) + 1;
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  updateDailyBar();
}

function recordDailyResult(word, isCorrect, time) {
  const data = getDailyData();
  const today = getTodayKey();
  if (!data[today]) data[today] = {};
  if (!data[today][word]) data[today][word] = { seen: 1, correct: 0, wrong: 0, bestTime: null };
  const w = data[today][word];
  if (isCorrect) {
    w.correct = (w.correct || 0) + 1;
    if (time && (w.bestTime === null || time < w.bestTime)) w.bestTime = time;
  } else {
    w.wrong = (w.wrong || 0) + 1;
  }
  localStorage.setItem(DAILY_KEY, JSON.stringify(data));
  updateDailyBar();
}

function getTodayWords() {
  const data = getDailyData();
  const today = getTodayKey();
  return data[today] || {};
}

function getDailyPlan() {
  const p = loadProgress();
  const seenToday = new Set(Object.keys(getTodayWords()));
  const hardWords = VOCAB_ALL.filter(v => p[v.word] === 'hard' && !seenToday.has(v.word));
  const newWords = VOCAB_ALL.filter(v => !p[v.word] && !seenToday.has(v.word));
  const reviewWords = VOCAB_ALL.filter(v => p[v.word] === 'known' && !seenToday.has(v.word));
  return [...hardWords, ...newWords, ...reviewWords].slice(0, DAILY_TARGET);
}

function updateDailyBar() {
  const todayWords = getTodayWords();
  const studiedToday = Object.keys(todayWords).length;
  const correctToday = Object.values(todayWords).reduce((sum, w) => sum + (w.correct || 0), 0);
  const wrongToday = Object.values(todayWords).reduce((sum, w) => sum + (w.wrong || 0), 0);
  const pct = Math.min(100, Math.round(studiedToday / DAILY_TARGET * 100));
  const el = document.getElementById('dailyBarInner');
  const cnt = document.getElementById('dailyCount');
  if (el) el.style.width = pct + '%';
  if (cnt) cnt.textContent = `${studiedToday} / ${DAILY_TARGET}`;
  const detail = document.getElementById('dailyDetail');
  if (detail) detail.textContent = `答對 ${correctToday} ｜ 答錯 ${wrongToday}`;
  const btn = document.querySelector('.daily-study-btn');
  if (btn) btn.textContent = studiedToday >= DAILY_TARGET ? '繼續複習' : '開始今日學習';
}

function startDailyStudy() {
  const plan = getDailyPlan();
  if (plan.length === 0) {
    alert('今天已經完成一輪 10 個單字。可以繼續自由複習或做測驗。');
    return;
  }
  currentDeck = plan;
  currentCardIndex = 0;
  isFlipped = false;
  currentFilter = 99; // 自定義篩選標記
  currentLessonFilter = '';
  document.querySelectorAll('#subject-english .filter-btn').forEach(b => b.classList.remove('active'));
  const lessonSelect = document.getElementById('lessonSelect');
  if (lessonSelect) lessonSelect.value = '';
  switchPage('flashcard', document.querySelector('nav button'));
  renderCard();
  updateGlobalStats();
}

// ===== 拼字測驗 =====
let quizMode = 'choice';

function setQuizMode(mode, btn) {
  quizMode = mode;
  document.querySelectorAll('.quiz-mode-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  startQuiz();
}

function renderSpellingQuestion() {
  const q = quizQuestions[quizIndex];
  quizAnswered = false;
  document.getElementById('quizContent').innerHTML = `
    <div class="quiz-card">
      <div class="quiz-type-tag">⌨️ 拼字測驗 — 看中文打英文</div>
      <div style="font-size:0.75rem;color:#a0aec0;margin-bottom:10px;">${q.pos} ｜ Level ${q.level}</div>
      <div class="quiz-question" style="font-size:1.8rem;color:#2b6cb0;">${q.zh}</div>
      <div style="font-size:0.82rem;color:#a0aec0;margin:12px 0 20px;">請拼出這個英文單字</div>
      <input id="spellingInput" class="spelling-input" type="text"
        placeholder="輸入英文單字…"
        onkeydown="if(event.key==='Enter')checkSpelling()"
        autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
      <div id="spellingFeedback" style="min-height:28px;margin-top:10px;font-size:0.9rem;text-align:center;"></div>
      <button onclick="checkSpelling()"
        style="width:100%;margin-top:10px;padding:12px;background:#3182ce;color:white;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;">
        確認答案 (Enter)
      </button>
      <button onclick="revealHint()" id="hintBtn"
        style="width:100%;margin-top:8px;padding:8px;background:white;color:#718096;border:1.5px solid #e2e8f0;border-radius:10px;font-size:0.85rem;cursor:pointer;">
        💡 提示（首字母）
      </button>
    </div>
    <button class="quiz-next-btn" id="quizNextBtn" style="display:none" onclick="nextQuizQuestion()">
      ${quizIndex + 1 < quizQuestions.length ? '下一題 →' : '查看結果'}
    </button>
  `;
  setTimeout(() => { const inp = document.getElementById('spellingInput'); if(inp) inp.focus(); }, 100);
  startQuizTimer();
}

function checkSpelling() {
  if (quizAnswered) return;
  const input = document.getElementById('spellingInput');
  const fb = document.getElementById('spellingFeedback');
  if (!input) return;
  const typed = input.value.trim().toLowerCase();
  if (!typed) return;
  const q = quizQuestions[quizIndex];
  const variants = q.word.toLowerCase().split('/').map(s => s.replace(/[()]/g,'').trim());
  const isCorrect = variants.includes(typed);
  const t = getResponseTime();
  clearQuizTimer();
  quizAnswered = true;
  input.disabled = true;

  if (isCorrect) {
    input.classList.add('correct');
    fb.innerHTML = `<span style="color:#38a169;font-weight:700;">✓ 正確！</span> ${getMasteryTag(t)} 用時 ${t.toFixed(1)} 秒`;
    quizCorrect++;
    setWordStatus(q.word, 'known');
    recordDailyResult(q.word, true, t);
  } else {
    input.classList.add('wrong');
    fb.innerHTML = `<span style="color:#e53e3e;font-weight:700;">✗ 正確拼法：</span><strong style="font-size:1.1rem;margin-left:6px;">${q.word}</strong>`;
    quizWrong++;
    setWordStatus(q.word, 'hard');
    recordDailyResult(q.word, false, t);
  }
  document.getElementById('quizScore').innerHTML = `正確：<span class="correct">${quizCorrect}</span>　錯誤：<span class="wrong">${quizWrong}</span>`;
  document.getElementById('quizNextBtn').style.display = 'block';
  updateGlobalStats();
}

function revealHint() {
  const q = quizQuestions[quizIndex];
  const btn = document.getElementById('hintBtn');
  if (btn) {
    btn.textContent = `💡 ${q.word[0]}${'_'.repeat(Math.max(0,q.word.length-1))}（共 ${q.word.length} 個字母）`;
    btn.disabled = true;
  }
}

// ===== 數學測驗 =====

let mathCategory = 'all';
let mathQuestions = [];
let mathIndex = 0;
let mathCorrect = 0;
let mathWrong = 0;
let mathAnswered = false;
let _mathCurrentOpts = [];
let _mathCurrentAnswer = '';

function setMathCategory(cat, btn) {
  mathCategory = cat;
  document.querySelectorAll('.math-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  startMathQuiz();
}

function startMathQuiz() {
  const pool = mathCategory === 'all'
    ? MATH_QUESTIONS
    : MATH_QUESTIONS.filter(q => q.category === mathCategory);
  if (pool.length < 1) {
    document.getElementById('mathContent').innerHTML = '<div class="empty-state"><div class="icon">📭</div>此分類暫無題目</div>';
    document.getElementById('mathProgress').textContent = '';
    document.getElementById('mathScore').textContent = '';
    return;
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  mathQuestions = shuffled.slice(0, Math.min(10, shuffled.length));
  mathIndex = 0;
  mathCorrect = 0;
  mathWrong = 0;
  renderMathQuestion();
}

function renderMathQuestion() {
  document.getElementById('mathProgress').textContent = `第 ${mathIndex + 1} 題 / 共 ${mathQuestions.length} 題`;
  document.getElementById('mathScore').innerHTML = `正確：<span class="correct">${mathCorrect}</span>　錯誤：<span class="wrong">${mathWrong}</span>`;
  mathAnswered = false;
  const q = mathQuestions[mathIndex];
  _mathCurrentOpts = [...q.options].sort(() => Math.random() - 0.5);
  _mathCurrentAnswer = q.answer;
  document.getElementById('mathContent').innerHTML = `
    <div class="quiz-card">
      <div class="quiz-type-tag">${q.category}</div>
      <div class="quiz-question" style="font-size:1.15rem;line-height:1.6;">${q.q}</div>
      <div class="options" style="margin-top:16px;">
        ${_mathCurrentOpts.map((o, i) => `
          <button class="option-btn" onclick="answerMath(this, ${i})">
            ${String.fromCharCode(65+i)}. ${o}
          </button>
        `).join('')}
      </div>
    </div>
    <button class="quiz-next-btn" id="mathNextBtn" style="display:none" onclick="nextMathQuestion()">
      ${mathIndex + 1 < mathQuestions.length ? '下一題 →' : '查看結果'}
    </button>
  `;
}

function answerMath(btn, idx) {
  if (mathAnswered) return;
  mathAnswered = true;
  const chosen = _mathCurrentOpts[idx];
  const correct = _mathCurrentAnswer;
  document.querySelectorAll('#mathContent .option-btn').forEach((b, i) => {
    b.disabled = true;
    if (_mathCurrentOpts[i] === correct) b.classList.add('correct');
  });
  if (chosen === correct) {
    btn.classList.add('correct');
    mathCorrect++;
  } else {
    btn.classList.add('wrong');
    mathWrong++;
  }
  document.getElementById('mathScore').innerHTML = `正確：<span class="correct">${mathCorrect}</span>　錯誤：<span class="wrong">${mathWrong}</span>`;
  document.getElementById('mathNextBtn').style.display = 'block';
}

function nextMathQuestion() {
  mathIndex++;
  if (mathIndex >= mathQuestions.length) {
    showMathResult();
  } else {
    renderMathQuestion();
  }
}

function showMathResult() {
  const total = mathQuestions.length;
  const pct = Math.round(mathCorrect / total * 100);
  let emoji = pct >= 90 ? '🎉' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📚';
  document.getElementById('mathProgress').textContent = '';
  document.getElementById('mathScore').textContent = '';
  document.getElementById('mathContent').innerHTML = `
    <div class="quiz-result">
      <h2>${emoji} 測驗完成！</h2>
      <div class="big-score">${pct}%</div>
      <p>答對 ${mathCorrect} 題，答錯 ${mathWrong} 題，共 ${total} 題</p>
      <button class="quiz-restart" onclick="startMathQuiz()">再測一次</button>
    </div>
  `;
}

// ===== 鍵盤快捷鍵 =====
document.addEventListener('keydown', e => {
  if (document.getElementById('page-flashcard').classList.contains('active')) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextCard(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
    if (e.key === 'ArrowUp' || e.key === 'Enter') { e.preventDefault(); flipCard(); }
    if (e.key === 'k') markCard('known');
    if (e.key === 'h') markCard('hard');
  }
});

// ===== 初始化 =====
populateLessonSelect();
currentDeck = getFilteredDeck();
renderCard();
updateGlobalStats();
updateDailyBar();
showHome(document.querySelector('.subject-btn'));

// ===== 閱讀理解 =====
let readingCurrentPassage = null;
let readingQIndex = 0;
let readingCorrect = 0;
let readingWrong = 0;
let readingAnswered = false;

function renderReadingMenu() {
  document.getElementById('readingContent').innerHTML = `
    <h2 style="font-size:1.1rem;color:#2d3748;margin-bottom:4px;">閱讀理解練習</h2>
    <p style="font-size:0.82rem;color:#a0aec0;margin-bottom:16px;">選擇課次，閱讀文章後回答問題</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${EXAM3_READING.map(r => `
        <div style="background:white;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);cursor:pointer;border:1.5px solid #e2e8f0;"
             onclick="startReading('${r.lesson}')">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:0.75rem;color:#718096;font-weight:700;letter-spacing:1px;">${r.lesson}</div>
              <div style="font-size:0.95rem;font-weight:700;color:#2d3748;margin-top:2px;">${r.title}</div>
            </div>
            <div style="background:#ebf8ff;color:#2b6cb0;border-radius:8px;padding:4px 10px;font-size:0.8rem;font-weight:700;">${r.questions.length} 題</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function startReading(lesson) {
  readingCurrentPassage = EXAM3_READING.find(r => r.lesson === lesson);
  if (!readingCurrentPassage) return;
  readingQIndex = 0; readingCorrect = 0; readingWrong = 0;
  renderReadingQ();
}

function renderReadingQ() {
  const p = readingCurrentPassage;
  if (readingQIndex >= p.questions.length) {
    const pct = Math.round(readingCorrect / p.questions.length * 100);
    const emoji = pct >= 90 ? '🎉' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📚';
    document.getElementById('readingContent').innerHTML = `
      <div class="quiz-result">
        <h2>${emoji} 閱讀完成！</h2>
        <div style="font-size:0.85rem;color:#718096;margin-bottom:12px;">${p.lesson} ${p.title}</div>
        <div class="big-score">${pct}%</div>
        <p>答對 ${readingCorrect} 題，答錯 ${readingWrong} 題，共 ${p.questions.length} 題</p>
        <button class="quiz-restart" onclick="renderReadingMenu()">選其他課次</button>
        <button class="quiz-restart" style="margin-left:8px;" onclick="startReading('${p.lesson}')">再練一次</button>
      </div>`;
    return;
  }
  readingAnswered = false;
  const q = p.questions[readingQIndex];
  const letters = ['A','B','C','D'];
  document.getElementById('readingContent').innerHTML = `
    <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:0.8rem;font-weight:700;color:#718096;">${p.lesson} ｜ 第 ${readingQIndex+1}/${p.questions.length} 題</span>
      <button onclick="renderReadingMenu()" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:0.78rem;cursor:pointer;color:#718096;">← 課次列表</button>
    </div>
    <div style="background:#f7fafc;border-radius:12px;padding:16px;margin-bottom:14px;font-size:0.88rem;color:#2d3748;line-height:1.9;border-left:3px solid #3182ce;">
      <div style="font-size:0.7rem;color:#a0aec0;letter-spacing:1px;margin-bottom:8px;">READING EXCERPT</div>
      ${p.passage_excerpt}
    </div>
    <div style="background:white;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
      <div style="font-size:1rem;font-weight:700;color:#2d3748;margin-bottom:4px;">${q.q}</div>
      <div style="font-size:0.88rem;color:#718096;margin-bottom:14px;padding:6px 10px;background:#fefcbf;border-radius:6px;">${q.q_zh}</div>
      <div style="display:flex;flex-direction:column;gap:8px;" id="readingOptions">
        ${letters.filter(l => q.options[l]).map(l =>
          `<button class="option-btn" onclick="answerReading(this,'${l}','${q.answer}')">
             ${l}. ${escapeHtml(q.options[l])}
           </button>`).join('')}
      </div>
      <div id="readingFeedback" style="display:none;margin-top:14px;padding:14px;border-radius:10px;font-size:0.88rem;line-height:1.8;"></div>
      <button id="readingNextBtn" onclick="nextReadingQ()"
        style="display:none;width:100%;margin-top:14px;padding:12px;background:#3182ce;color:white;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;">
        ${readingQIndex + 1 < p.questions.length ? '下一題 →' : '查看結果'}
      </button>
    </div>`;
}

function answerReading(btn, chosen, correct) {
  if (readingAnswered) return;
  readingAnswered = true;
  const p = readingCurrentPassage;
  const q = p.questions[readingQIndex];
  document.querySelectorAll('#readingOptions .option-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent.trim()[0] === correct) b.classList.add('correct');
  });
  if (chosen === correct) { btn.classList.add('correct'); readingCorrect++; }
  else { btn.classList.add('wrong'); readingWrong++; }
  const fb = document.getElementById('readingFeedback');
  fb.style.display = 'block';
  fb.style.background = 'transparent';
  fb.style.color = 'inherit';
  fb.innerHTML = `
    <div style="padding:12px 14px;border-radius:10px;margin-bottom:12px;background:${chosen === correct ? '#f0fff4' : '#fff5f5'};color:${chosen === correct ? '#276749' : '#9b2c2c'};">
      <strong>${chosen === correct ? '✓ 答對了！' : `✗ 答錯！正解是 ${correct}`}</strong>
      <span style="display:block;margin-top:6px;font-size:0.88rem;color:#4a5568;">${q.explanation}</span>
    </div>
    ${p.passage_zh ? `
    <div style="background:#fefcbf;border-radius:10px;padding:14px;border-left:3px solid #d69e2e;">
      <div style="font-size:0.72rem;color:#744210;letter-spacing:1px;margin-bottom:8px;font-weight:700;">短文中文翻譯</div>
      <div style="font-size:0.9rem;color:#2d3748;line-height:1.9;">${p.passage_zh}</div>
    </div>` : ''}`;
  document.getElementById('readingNextBtn').style.display = 'block';
  fb.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextReadingQ() {
  readingQIndex++;
  renderReadingQ();
}

// ===== 英文課文複習 =====
let erLessonFilter = 'all';
let erTypeFilter = 'all';
let erQueue = [];
let erCurrentQuestion = null;
let erSelectedIndex = null;
let erSubmitted = false;
let erSessionCount = 0;
let erCorrectCount = 0;

function getEnglishReviewBank() {
  return typeof ENGLISH_REVIEW_BANK !== 'undefined' ? ENGLISH_REVIEW_BANK : [];
}

function getEnglishReviewLessons() {
  return [...new Set(getEnglishReviewBank().map(q => q.lesson).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'en', { numeric: true })
  );
}

function getEnglishReviewTypes() {
  const order = ['grammar', 'pattern', 'vocab', 'translation', 'context'];
  return [...new Set(getEnglishReviewBank().map(q => q.type).filter(Boolean))]
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

function getEnglishReviewPool() {
  let pool = getEnglishReviewBank();
  if (erLessonFilter !== 'all') pool = pool.filter(q => q.lesson === erLessonFilter);
  if (erTypeFilter !== 'all') pool = pool.filter(q => q.type === erTypeFilter);
  return pool;
}

function renderEnglishReview() {
  const el = document.getElementById('englishReviewContent');
  if (!el) return;
  const bank = getEnglishReviewBank();

  if (!bank.length) {
    el.innerHTML = `
      <div style="padding:32px 16px;text-align:center;color:#718096;">
        <div style="font-size:2rem;margin-bottom:10px;">📘</div>
        <div style="font-weight:700;color:#2d3748;">課文複習題庫尚未載入</div>
      </div>`;
    return;
  }

  const lessons = getEnglishReviewLessons();
  const types = getEnglishReviewTypes();
  const pool = getEnglishReviewPool();
  const typeNames = {
    grammar: '文法句型',
    pattern: '課文句型',
    vocab: '單字用法',
    translation: '翻譯理解',
    context: '課文脈絡'
  };

  el.innerHTML = `
    <div style="padding:14px 16px;background:white;border-bottom:1px solid #e2e8f0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <div>
          <h2 style="font-size:1.05rem;color:#2d3748;margin-bottom:4px;">📘 英文課文複習模式</h2>
          <p style="font-size:0.8rem;color:#718096;">課文句型、文法、單字、翻譯並行，題目會隨機出現。</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <select id="erLessonSelect" onchange="setEnglishReviewLesson(this.value)" style="border:1.5px solid #cbd5e0;border-radius:8px;padding:7px 10px;font-size:0.86rem;background:white;">
            <option value="all">全部課次</option>
            ${lessons.map(lesson => `<option value="${lesson}" ${erLessonFilter === lesson ? 'selected' : ''}>${lesson}</option>`).join('')}
          </select>
          <select id="erTypeSelect" onchange="setEnglishReviewType(this.value)" style="border:1.5px solid #cbd5e0;border-radius:8px;padding:7px 10px;font-size:0.86rem;background:white;">
            <option value="all">全部題型</option>
            ${types.map(type => `<option value="${type}" ${erTypeFilter === type ? 'selected' : ''}>${typeNames[type] || type}</option>`).join('')}
          </select>
          <button onclick="startEnglishReview()" style="padding:8px 18px;background:#3182ce;color:white;border:none;border-radius:8px;font-size:0.88rem;font-weight:700;cursor:pointer;">開始練習</button>
        </div>
      </div>
    </div>
    <div id="erMain" style="padding:16px;max-width:880px;margin:0 auto;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px;">
        <div style="background:white;border-radius:10px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:0.72rem;color:#a0aec0;margin-bottom:4px;">目前題庫</div>
          <div style="font-size:1.1rem;font-weight:800;color:#2d3748;">${pool.length} 題</div>
        </div>
        <div style="background:white;border-radius:10px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:0.72rem;color:#a0aec0;margin-bottom:4px;">本次練習</div>
          <div style="font-size:1.1rem;font-weight:800;color:#2d3748;">${erSessionCount} 題</div>
        </div>
        <div style="background:white;border-radius:10px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:0.72rem;color:#a0aec0;margin-bottom:4px;">答對</div>
          <div style="font-size:1.1rem;font-weight:800;color:#38a169;">${erCorrectCount} 題</div>
        </div>
      </div>
      <div id="erQuestionWrap">
        ${erCurrentQuestion ? renderEnglishReviewQuestionHtml() : renderEnglishReviewIntroHtml(pool.length)}
      </div>
    </div>`;
}

function renderEnglishReviewIntroHtml(count) {
  return `
    <div style="background:white;border-radius:14px;padding:26px 22px;box-shadow:0 2px 12px rgba(0,0,0,0.07);text-align:center;">
      <div style="font-size:2.2rem;margin-bottom:10px;">📚</div>
      <h3 style="font-size:1.05rem;color:#2d3748;margin-bottom:8px;">準備開始課文複習</h3>
      <p style="font-size:0.86rem;color:#718096;line-height:1.8;margin-bottom:18px;">
        目前篩選共有 ${count} 題。點「開始練習」後會隨機出題，答完會顯示翻譯與解析。
      </p>
      <button onclick="startEnglishReview()" style="padding:10px 22px;background:#3182ce;color:white;border:none;border-radius:10px;font-size:0.95rem;font-weight:700;cursor:pointer;">開始練習</button>
    </div>`;
}

function setEnglishReviewLesson(value) {
  erLessonFilter = value || 'all';
  erQueue = [];
  erCurrentQuestion = null;
  renderEnglishReview();
}

function setEnglishReviewType(value) {
  erTypeFilter = value || 'all';
  erQueue = [];
  erCurrentQuestion = null;
  renderEnglishReview();
}

function prepareEnglishReviewQuestion(source) {
  const options = shuffleArray(source.options).map((text, index) => ({
    text,
    index,
    isCorrect: text === source.answer
  }));
  return { ...source, shuffledOptions: options };
}

function startEnglishReview() {
  const pool = getEnglishReviewPool();
  if (!pool.length) {
    alert('目前篩選沒有題目，請換課次或題型。');
    return;
  }
  erQueue = shuffleArray(pool);
  erSessionCount = 0;
  erCorrectCount = 0;
  nextEnglishReviewQuestion();
}

function nextEnglishReviewQuestion() {
  if (!erQueue.length) {
    erQueue = shuffleArray(getEnglishReviewPool());
  }
  const next = erQueue.shift();
  erCurrentQuestion = prepareEnglishReviewQuestion(next);
  erSelectedIndex = null;
  erSubmitted = false;
  erSessionCount++;
  renderEnglishReview();
}

function renderEnglishReviewQuestionHtml() {
  const q = erCurrentQuestion;
  const selectedOption = erSelectedIndex === null ? null : q.shuffledOptions[erSelectedIndex];
  const isCorrect = erSubmitted && selectedOption && selectedOption.isCorrect;

  return `
    <div style="background:white;border-radius:14px;padding:22px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <span style="background:#ebf8ff;color:#2b6cb0;border-radius:999px;padding:4px 10px;font-size:0.76rem;font-weight:800;">${q.lesson}</span>
          <span style="background:#faf5ff;color:#6b46c1;border-radius:999px;padding:4px 10px;font-size:0.76rem;font-weight:800;">${q.typeLabel}</span>
          <span style="font-size:0.78rem;color:#718096;">${q.focus}</span>
        </div>
        <div style="font-size:0.78rem;color:#718096;">第 ${erSessionCount} 題</div>
      </div>

      <div style="font-size:1.02rem;line-height:1.8;color:#2d3748;font-weight:700;margin-bottom:16px;">${escapeHtml(q.prompt)}</div>

      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
        ${q.shuffledOptions.map((option, index) => {
          const selected = erSelectedIndex === index;
          let border = selected ? '#3182ce' : '#e2e8f0';
          let bg = selected ? '#ebf8ff' : 'white';
          let color = '#2d3748';
          if (erSubmitted && option.isCorrect) {
            border = '#38a169'; bg = '#f0fff4'; color = '#22543d';
          } else if (erSubmitted && selected && !option.isCorrect) {
            border = '#e53e3e'; bg = '#fff5f5'; color = '#742a2a';
          }
          return `
            <button onclick="selectEnglishReviewOption(${index})"
              style="text-align:left;padding:12px 14px;border:1.8px solid ${border};background:${bg};color:${color};border-radius:10px;font-size:0.92rem;font-weight:700;cursor:${erSubmitted ? 'default' : 'pointer'};">
              ${String.fromCharCode(65 + index)}. ${escapeHtml(option.text)}
            </button>`;
        }).join('')}
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button onclick="submitEnglishReview()" id="erSubmitBtn"
          style="flex:1;min-width:140px;padding:11px;background:${erSelectedIndex === null || erSubmitted ? '#e2e8f0' : '#3182ce'};color:${erSelectedIndex === null || erSubmitted ? '#718096' : 'white'};border:none;border-radius:10px;font-size:0.95rem;font-weight:800;cursor:${erSelectedIndex === null || erSubmitted ? 'not-allowed' : 'pointer'};">
          ${erSubmitted ? '已交卷' : '交卷'}
        </button>
        <button onclick="nextEnglishReviewQuestion()"
          style="flex:1;min-width:140px;padding:11px;background:#2d3748;color:white;border:none;border-radius:10px;font-size:0.95rem;font-weight:800;cursor:pointer;">
          下一題 →
        </button>
      </div>

      ${erSubmitted ? `
        <div style="margin-top:16px;border-radius:12px;padding:16px;background:${isCorrect ? '#f0fff4' : '#fff5f5'};">
          <div style="font-size:1rem;font-weight:800;color:${isCorrect ? '#276749' : '#9b2c2c'};margin-bottom:8px;">
            ${isCorrect ? '✓ 答對了' : `✗ 答錯了，正解是：${escapeHtml(q.answer)}`}
          </div>
          <div style="background:white;border-radius:10px;padding:12px;margin-bottom:10px;">
            <div style="font-size:0.72rem;color:#a0aec0;letter-spacing:1px;margin-bottom:5px;">中文翻譯</div>
            <div style="font-size:0.92rem;color:#2d3748;line-height:1.7;">${escapeHtml(q.translation)}</div>
          </div>
          <div style="background:white;border-radius:10px;padding:12px;">
            <div style="font-size:0.72rem;color:#a0aec0;letter-spacing:1px;margin-bottom:5px;">考點解析</div>
            <div style="font-size:0.88rem;color:#4a5568;line-height:1.7;">${escapeHtml(q.explanation)}</div>
          </div>
        </div>` : ''}
    </div>`;
}

function selectEnglishReviewOption(index) {
  if (erSubmitted) return;
  erSelectedIndex = index;
  renderEnglishReview();
}

function submitEnglishReview() {
  if (!erCurrentQuestion || erSelectedIndex === null || erSubmitted) return;
  erSubmitted = true;
  const selectedOption = erCurrentQuestion.shuffledOptions[erSelectedIndex];
  const isCorrect = !!selectedOption && selectedOption.isCorrect;
  if (isCorrect) erCorrectCount++;
  recordDailyResult(`課文複習-${erCurrentQuestion.id}`, isCorrect, 0);
  renderEnglishReview();
}

// ===== 文意選填 =====
// 只收錄「文意選填」格式（頂層有 options 陣列）；U10 是選擇題克漏字，格式不同，暫不列入
const WENCIANZE_DATA = [
  { unit: 'L07課', label: 'L07 📖 課文篇', data: typeof clozeL07Text !== 'undefined' ? clozeL07Text : null },
  { unit: 'L08課', label: 'L08 📖 課文篇', data: typeof clozeL08Text !== 'undefined' ? clozeL08Text : null },
  { unit: 'U09課', label: 'U09 📖 課文篇', data: typeof clozeU9Text !== 'undefined' ? clozeU9Text : null },
  { unit: 'U09',   label: 'U09 ✏️ 練習篇', data: typeof clozeU9 !== 'undefined' ? clozeU9 : null },
  { unit: 'U10課', label: 'U10 📖 課文篇', data: typeof clozeU10Text !== 'undefined' ? clozeU10Text : null },
  { unit: 'U10',   label: 'U10 ✏️ 練習篇', data: typeof clozeU10Wen !== 'undefined' ? clozeU10Wen : null },
  { unit: 'U11課', label: 'U11 📖 課文篇', data: typeof clozeU11Text !== 'undefined' ? clozeU11Text : null },
  { unit: 'U11',   label: 'U11 ✏️ 練習篇', data: typeof clozeU11 !== 'undefined' ? clozeU11 : null },
  { unit: 'U12課', label: 'U12 📖 課文篇', data: typeof clozeU12Text !== 'undefined' ? clozeU12Text : null },
  { unit: 'U12',   label: 'U12 ✏️ 練習篇', data: typeof clozeU12 !== 'undefined' ? clozeU12 : null },
].filter(u => u.data && Array.isArray(u.data.options));

let wcCurrentData = null;
let wcCurrentUnit = '';
let wcUserAnswers = {};
let wcSubmitted = false;

function renderWenCianzeMenu() {
  const el = document.getElementById('wencianzeContent');
  el.innerHTML = `
    <h2 style="font-size:1.1rem;color:#2d3748;margin-bottom:4px;">✏️ 文意選填練習</h2>
    <p style="font-size:0.82rem;color:#a0aec0;margin-bottom:16px;">選擇課次，閱讀文章並從選項中填入正確單字</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${WENCIANZE_DATA.map(u => `
        <div style="background:white;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.07);cursor:pointer;border:1.5px solid #e2e8f0;"
             onclick="startWenCianze('${u.unit}')">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-size:0.75rem;color:#718096;font-weight:700;letter-spacing:1px;">${u.label}</div>
              <div style="font-size:0.95rem;font-weight:700;color:#2d3748;margin-top:2px;">${u.data.title}</div>
            </div>
            <div style="background:#faf5ff;color:#6b46c1;border-radius:8px;padding:4px 10px;font-size:0.8rem;font-weight:700;">${u.data.blanks.length} 空格</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function startWenCianze(unit) {
  const found = WENCIANZE_DATA.find(u => u.unit === unit);
  if (!found) return;
  wcCurrentUnit = found.unit;
  wcCurrentData = prepareWenCianzeData(found.data);
  wcUserAnswers = {};
  wcSubmitted = false;
  renderWenCianzeQuestion();
}

function prepareWenCianzeData(data) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shuffledOptions = shuffleArray(data.options).map((option, index) => ({
    ...option,
    letter: letters[index]
  }));
  const letterByWord = {};
  shuffledOptions.forEach(option => {
    letterByWord[option.word] = option.letter;
  });

  return {
    ...data,
    options: shuffledOptions,
    blanks: data.blanks.map(blank => ({
      ...blank,
      answer: letterByWord[blank.word] || blank.answer
    }))
  };
}

function renderWenCianzeQuestion() {
  const d = wcCurrentData;
  const el = document.getElementById('wencianzeContent');

  // passage：空格顯示已選單字（純顯示，不可點）
  let passageHtml = escapeHtml(d.passage).replace(/\((\d+)\)________/g, (_, n) => {
    const ans = wcUserAnswers[n];
    const style = ans
      ? 'background:#3182ce;color:white;padding:1px 8px;border-radius:5px;font-weight:700;'
      : 'background:#e2e8f0;color:#a0aec0;padding:1px 8px;border-radius:5px;';
    return `<span style="${style}">(${n}) ${ans || '___'}</span>`;
  });

  // 選項參考列
  const optRef = d.options.map(o =>
    `<span style="font-size:0.82rem;white-space:nowrap;"><b>${o.letter}.</b> ${o.word}</span>`
  ).join('　');

  // 答題卡：每題一行，直接點字母
  const sheetRows = d.blanks.map(b => {
    const rowBtns = d.options.map(o => {
      const sel = wcUserAnswers[b.number] === o.word;
      return `<button id="wc-opt-${b.number}-${o.letter}" onclick="wcPickAnswer(${b.number},'${o.letter}','${o.word}')"
        style="min-width:34px;padding:5px 3px;border-radius:7px;font-size:0.82rem;font-weight:700;cursor:pointer;transition:all 0.15s;
               border:1.5px solid ${sel ? '#3182ce' : '#e2e8f0'};background:${sel ? '#3182ce' : 'white'};color:${sel ? 'white' : '#2d3748'};">
        ${o.letter}
      </button>`;
    }).join('');
    const ansWord = wcUserAnswers[b.number] || '';
    return `<div style="display:flex;align-items:center;gap:6px;padding:7px 0;border-bottom:1px solid #f0f0f0;">
      <span style="min-width:26px;font-size:0.85rem;font-weight:700;color:#4a5568;">(${b.number})</span>
      <div style="display:flex;gap:4px;">${rowBtns}</div>
      <span style="font-size:0.82rem;min-width:90px;color:${ansWord ? '#3182ce' : '#a0aec0'};">${ansWord || '未選擇'}</span>
    </div>`;
  }).join('');

  const answered = Object.keys(wcUserAnswers).length;
  const total = d.blanks.length;

  el.innerHTML = `
    <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:0.8rem;font-weight:700;color:#718096;">${d.unit} ｜ ${d.title}</span>
      <button onclick="renderWenCianzeMenu()" style="background:none;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:0.78rem;cursor:pointer;color:#718096;">← 課次列表</button>
    </div>
    <div style="background:white;border-radius:12px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.07);margin-bottom:12px;">
      <div style="font-size:0.7rem;color:#a0aec0;letter-spacing:1px;margin-bottom:8px;">PASSAGE</div>
      <p style="font-size:0.92rem;line-height:2.1;color:#2d3748;">${passageHtml}</p>
    </div>
    <div style="background:white;border-radius:12px;padding:12px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.07);margin-bottom:12px;">
      <div style="font-size:0.7rem;color:#a0aec0;letter-spacing:1px;margin-bottom:6px;">選項參考（每次練習隨機排列）</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px 14px;line-height:1.9;">${optRef}</div>
    </div>
    <div style="background:white;border-radius:12px;padding:14px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.07);margin-bottom:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <div style="font-size:0.7rem;color:#a0aec0;letter-spacing:1px;">答題卡　<span style="color:#cbd5e0;">點字母直接填入</span></div>
        <div style="font-size:0.78rem;color:${answered===total?'#38a169':'#718096'};">${answered} / ${total} 已填</div>
      </div>
      ${sheetRows}
    </div>
    <button onclick="submitWenCianze()" id="wcSubmitBtn"
      style="width:100%;padding:12px;background:#3182ce;color:white;border:none;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;">
      交卷
    </button>
    <div id="wcResult" style="display:none;margin-top:16px;"></div>`;
}

function wcPickAnswer(blankNum, letter, word) {
  if (wcSubmitted) return;
  // 同一單字已用在其他空格時，先移除
  Object.keys(wcUserAnswers).forEach(k => {
    if (wcUserAnswers[k] === word && k !== String(blankNum)) delete wcUserAnswers[k];
  });
  // 再次點同一選項 → 取消
  if (wcUserAnswers[blankNum] === word) {
    delete wcUserAnswers[blankNum];
  } else {
    wcUserAnswers[blankNum] = word;
  }
  renderWenCianzeQuestion();
}

function submitWenCianze() {
  const d = wcCurrentData;
  const answered = Object.keys(wcUserAnswers).length;
  if (answered < d.blanks.length) {
    alert(`還有 ${d.blanks.length - answered} 個空格未填！`);
    return;
  }
  wcSubmitted = true;
  let correct = 0;
  const resultRows = d.blanks.map(b => {
    const userAns = wcUserAnswers[b.number] || '';
    const isCorrect = userAns === b.word;
    if (isCorrect) correct++;
    return `<tr>
      <td style="padding:6px 10px;text-align:center;font-weight:700;">(${b.number})</td>
      <td style="padding:6px 10px;text-align:center;">${userAns}</td>
      <td style="padding:6px 10px;text-align:center;font-weight:700;color:${isCorrect ? '#276749' : '#e53e3e'};">${isCorrect ? '✓' : '✗'} ${b.word}</td>
    </tr>`;
  }).join('');

  const pct = Math.round(correct / d.blanks.length * 100);
  const emoji = pct >= 90 ? '🎉' : pct >= 70 ? '👍' : pct >= 50 ? '💪' : '📚';

  document.getElementById('wcSubmitBtn').style.display = 'none';
  const resultEl = document.getElementById('wcResult');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <div class="quiz-result">
      <h2>${emoji} 文意選填完成！</h2>
      <div class="big-score">${pct}%</div>
      <p>答對 ${correct} 題，共 ${d.blanks.length} 題</p>
    </div>
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);margin-top:14px;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#ebf8ff;">
          <th style="padding:8px 10px;font-size:0.78rem;color:#2b6cb0;">空格</th>
          <th style="padding:8px 10px;font-size:0.78rem;color:#2b6cb0;">你的答案</th>
          <th style="padding:8px 10px;font-size:0.78rem;color:#2b6cb0;">正確答案</th>
        </tr></thead>
        <tbody>${resultRows}</tbody>
      </table>
    </div>
    <button onclick="startWenCianze('${wcCurrentUnit}')" class="quiz-restart" style="margin-top:14px;">再練一次</button>
    <button onclick="renderWenCianzeMenu()" class="quiz-restart" style="margin-top:8px;margin-left:8px;">選其他課次</button>`;
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
