// ===== 狀態管理 =====
let currentFilter = 0;
let currentDeck = [];
let currentCardIndex = 0;
let isFlipped = false;

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
  if (currentFilter === -1) {
    return VOCAB_ALL.filter(v => p[v.word] === 'hard');
  }
  if (currentFilter === 0) return [...VOCAB_ALL];
  return VOCAB_ALL.filter(v => v.level === currentFilter);
}

function setFilter(level) {
  currentFilter = level;
  document.querySelectorAll('.filter-btn').forEach((b, i) => {
    const vals = [0, 2, 3, 4, -1];
    b.classList.toggle('active', vals[i] === level);
  });
  currentDeck = getFilteredDeck();
  currentCardIndex = 0;
  isFlipped = false;
  renderCard();
  updateGlobalStats();

  // 如果在測驗頁就重新開始
  if (document.getElementById('page-quiz').classList.contains('active')) {
    startQuiz();
  }
  if (document.getElementById('page-progress').classList.contains('active')) {
    renderProgress();
  }
}

// ===== 頁面切換 =====
function switchSubject(subject, btn) {
  const subjects = ['english','chinese','math','social','science'];
  const subtitles = {
    english: '英文 ｜ LIVE ABC 核心字彙 ｜ 2-4 級',
    chinese: '國文 ｜ 開發中',
    math:    '數學 ｜ 學測選擇題練習',
    social:  '社會 ｜ 開發中',
    science: '自然 ｜ 開發中',
  };
  subjects.forEach(s => {
    document.getElementById('subject-' + s).style.display = s === subject ? '' : 'none';
  });
  document.querySelectorAll('.subject-btn').forEach(b => {
    b.style.background = 'transparent';
    b.style.color = 'white';
    b.style.border = '1.5px solid rgba(255,255,255,0.5)';
  });
  btn.style.background = 'white';
  btn.style.color = '#2b6cb0';
  btn.style.border = 'none';
  document.getElementById('headerSubtitle').textContent = subtitles[subject];
  if (subject === 'math') startMathQuiz();
}

function switchPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (btn) btn.classList.add('active');

  if (page === 'quiz') startQuiz();
  if (page === 'progress') renderProgress();
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
    <div class="card-level">Level ${v.level}</div>
    <div class="card-word-back">${v.word} <span style="color:#a0aec0;font-style:italic">(${v.pos})</span></div>
    <div class="card-zh">${v.zh}</div>
    <button class="speak-btn" onclick="event.stopPropagation();speak('${v.word.replace(/'/g,"\\'")}')">🔊</button>
  `;

  if (isFlipped) {
    scene.classList.add('flipped');
  } else {
    scene.classList.remove('flipped');
  }

  // 記錄今日已看過這個字
  markWordSeen(v.word);
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
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
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
      <div class="quiz-type-tag">選出正確的中文翻譯</div>
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

  // 各級進度
  let barsHTML = '';
  [2, 3, 4].forEach(lv => {
    const lvWords = VOCAB_ALL.filter(v => v.level === lv);
    const lvKnown = lvWords.filter(v => p[v.word] === 'known').length;
    const pct = Math.round(lvKnown / lvWords.length * 100);
    barsHTML += `
      <div class="level-row">
        <div class="level-label">Level ${lv}</div>
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

// 預存題庫（由 Python 腳本生成後填入）

function pickTargetWord() {
  const p = loadProgress();
  const hardWords = VOCAB_ALL.filter(v => p[v.word] === 'hard');
  const pool = hardWords.length > 0 && Math.random() < 0.4 ? hardWords : VOCAB_ALL;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function tryOllama(target) {
  const prompt = `You are a Taiwan high school English teacher. Generate ONE cloze test question for the word: ${target.word} (${target.pos}, Chinese: ${target.zh})\n\nReturn ONLY valid JSON (no markdown):\n{"passage":"40-60 word English passage with [BLANK] where ${target.word} goes","options":{"A":"option","B":"option","C":"option","D":"option"},"correct_answer":"letter A/B/C/D","explanation":{"chinese_translation":"中文翻譯","core_concept":"核心觀念","why_correct":"為何正確","why_others_wrong":"其他選項分析"}}`;

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma4:latest',
      prompt,
      stream: false,
      options: { temperature: 0.7, num_predict: 2000 }
    })
  });
  if (!res.ok) throw new Error('Ollama 無回應');
  const data = await res.json();
  const raw = data.response || '';
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('格式錯誤');
  const q = JSON.parse(m[0]);
  if (!q.passage?.includes('[BLANK]')) throw new Error('缺少 [BLANK]');
  if (!['A','B','C','D'].includes(q.correct_answer)) throw new Error('答案格式錯誤');
  return q;
}

function getBankQuestion(target) {
  if (CLOZE_BANK.length === 0) return null;
  // 先找對應單字
  const match = CLOZE_BANK.find(q => q.word === target.word);
  if (match) return match;
  // 找相同 level
  const levelMatch = CLOZE_BANK.filter(q => q.level === target.level);
  if (levelMatch.length > 0) return levelMatch[Math.floor(Math.random() * levelMatch.length)];
  // 隨機
  return CLOZE_BANK[clozeBankIndex++ % CLOZE_BANK.length];
}

async function generateClozeQuestion() {
  const target = pickTargetWord();

  document.getElementById('clozeMain').style.display = 'none';
  document.getElementById('clozeError').style.display = 'none';
  document.getElementById('clozeLoading').style.display = 'block';
  document.getElementById('clozeLoadingWord').textContent = `正在讀取題庫…`;
  document.getElementById('clozeBtnGenerate').disabled = true;

  try {
    // 線上版本優先使用內建題庫，避免等待本機 Ollama 造成出題卡住。
    let q = getBankQuestion(target);
    if (!q) throw new Error('題庫尚未載入，請稍後再試（題庫產生中…）');
    const source = '📚 題庫';
    // 用題庫的 target 覆蓋
    target.word = q.word;
    target.pos = q.pos;
    target.zh = q.zh;
    target.level = q.level;

    const badge = document.getElementById('clozeSourceBadge');
    if (badge) badge.textContent = source;
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

  document.getElementById('clozeLoading').style.display = 'none';
  document.getElementById('clozeExplanation').style.display = 'none';
  document.getElementById('clozeResultBadge').style.display = 'none';
  document.getElementById('clozeMain').style.display = 'block';
  document.getElementById('clozeSessionInfo').textContent =
    `本次：${clozeSessionCount} 題 ｜ 答對 ${clozeCorrectCount} 題`;

  // 單字提示（交卷前隱藏，交卷後才顯示）
  document.getElementById('clozeWordHint').innerHTML = '';

  // 段落（高亮 [BLANK]）
  document.getElementById('clozePassage').innerHTML =
    q.passage.replace('[BLANK]',
      '<span style="display:inline-block;background:#bee3f8;border-bottom:2px solid #3182ce;padding:0 8px;border-radius:4px;font-weight:700;color:#2b6cb0;min-width:80px;text-align:center;">&nbsp;&nbsp;&nbsp;?&nbsp;&nbsp;&nbsp;</span>');

  // 選項列表
  const letters = ['A','B','C','D'];
  document.getElementById('clozeOptions').innerHTML = letters.map(l =>
    `<div class="option-row" id="optRow${l}">
       <strong>${l}.</strong>&nbsp;&nbsp;${q.options[l]}
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

// 重寫 renderClozeQuestion 來儲存 pending 資料
const _origRender = renderClozeQuestion;
// (已在函數內直接存取)

function showClozeExplanation(expl) {
  if (!expl) return;
  const el = document.getElementById('clozeExplContent');
  const t = clozeCurrentTarget;
  const zhPassage = clozePendingQuestion && clozePendingQuestion.passage_zh
    ? clozePendingQuestion.passage_zh : null;
  const fullSentenceEn = clozePendingPassage
    ? clozePendingPassage.replace('[BLANK]',
        `<strong style="color:#2b6cb0;border-bottom:2px solid #3182ce;">${t ? t.word : '___'}</strong>`)
    : '';
  const fullSentenceZh = zhPassage
    ? zhPassage.replace('[BLANK]',
        `<strong style="color:#c05621;border-bottom:2px solid #dd6b20;">${t ? t.zh : '___'}</strong>`)
    : '';
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

// 修正：在 renderClozeQuestion 加入儲存 pending 資料
const origRenderCloze = renderClozeQuestion;
window.renderClozeQuestion = function(q, target) {
  clozePendingQuestion = q;
  clozePendingExplanation = q.explanation;
  clozePendingPassage = q.passage;
  origRenderCloze(q, target);
};

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
  const todayWords = new Set(todayLog.map(l => l.word)).size;

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
      <div style="display:flex;gap:16px;font-size:0.88rem;">
        <span>接觸單字：<strong>${todayWords}</strong> 個</span>
        <span>標為已學：<strong style="color:#38a169;">${todayKnown}</strong></span>
        <span>標為困難：<strong style="color:#e53e3e;">${todayHard}</strong></span>
      </div>
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
const QUIZ_TIME_LIMIT = 12;

function startQuizTimer() {
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
  const hardWords = VOCAB_ALL.filter(v => p[v.word] === 'hard');
  const newWords = VOCAB_ALL.filter(v => !p[v.word] && !seenToday.has(v.word));
  const plan = [...hardWords];
  const needed = Math.max(DAILY_TARGET - plan.length, 5);
  plan.push(...newWords.slice(0, needed));
  return plan.slice(0, Math.max(DAILY_TARGET + hardWords.length, DAILY_TARGET));
}

function updateDailyBar() {
  const todayWords = getTodayWords();
  const p = loadProgress();
  const learnedToday = Object.keys(todayWords).filter(w => p[w] === 'known').length;
  const pct = Math.min(100, Math.round(learnedToday / DAILY_TARGET * 100));
  const el = document.getElementById('dailyBarInner');
  const cnt = document.getElementById('dailyCount');
  if (el) el.style.width = pct + '%';
  if (cnt) cnt.textContent = `${learnedToday} / ${DAILY_TARGET}`;
}

function startDailyStudy() {
  const plan = getDailyPlan();
  if (plan.length === 0) {
    alert('今日目標已完成！繼續保持 💪');
    return;
  }
  currentDeck = plan;
  currentCardIndex = 0;
  isFlipped = false;
  currentFilter = 99; // 自定義篩選標記
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
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
currentDeck = getFilteredDeck();
renderCard();
updateGlobalStats();
updateDailyBar();
