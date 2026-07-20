# 高中學習程式 — 專案工作規則

> Claude 讀 `CLAUDE.md`、Codex 讀 `AGENTS.md`，**兩份內容完全相同**。改規則時兩份一起改。
> 共同開發：Claude 與 Codex 都對這個資料夾開發，靠 git 記錄誰改了什麼——動工前先 `git pull`，做完先 `git push`，避免兩邊各改各的。

## 專案是什麼

- 高中平時複習／月考前練習工具。
- 從英文單字 App 起家，逐步擴充成英文、國文、數學、社會、自然的練習平台。

## 位置與網址

- 本機資料夾：`~/開發項目/高中學習程式/`（2026-07-20 從 `~/vocab-app` 移入統一開發夾並改中文名）
- 線上網址：https://jackchan1973.github.io/vocab-app/
- GitHub repo：`jackchan1973/vocab-app` — **repo 英文名不可改**（改了線上網址會壞）；本機中文資料夾名不影響網址。
- 技術：純網頁 HTML / CSS / JS，無後端；學習進度存瀏覽器 LocalStorage。

## 檔案結構

```text
index.html                    # 頁面骨架（含 <title>、<h1> 標題「高中學習程式」）
style.css                     # 樣式（改後注意 ?v= 版本參數，避免快取）
app.js                        # 主要互動功能（核心，非必要少動）
vocab-data.js / cloze-data.js # 英文單字、克漏字題庫
vocab-exam3.js / cloze-exam3.js / reading-exam3.js  # 第三次月考題庫
english-review-data.js / wencianze-translations.js  # 課文複習、文意選填翻譯
math-data.js                  # 數學題庫
english-course-structure.json # 英文課程結構
auth.js                       # 舊登入模組，目前未載入
README.md / DEVLOG.md / PROJECT_NOTES.md  # 說明、歷史紀錄、早期規劃
```

## 開發鐵則

1. **各科隔離**：首頁五科入口是用來隔離各科開發，改某一科**不可影響其他科**（尤其已完成的英文）。
2. **程式與資料分離**：新增題庫優先改資料檔（`*-data.js`／`*-exam3.js`），不要輕動 `app.js` 核心。
3. **改完必檢查**：動過任何 `.js` 至少 `node --check <檔名>`；改 CSS/JS 記得更新 `style.css?v=` 版本字串處理快取（手機測試要強制重新整理）。
4. **登入／雲端同步暫緩**：Supabase／Firebase 在中國（上海）連不上，先保持 學生 單機好用。
5. ⚠️ **版權**：本機有官方考題 PDF（如 `115-cap-exam-pdfs/`），**絕不用 `git add -A`**；push 時只加這次真的改到的檔，官方 PDF 不進公開 repo。

## 本機測試

```bash
cd ~/開發項目/高中學習程式 && python3 -m http.server 8888
# 瀏覽器開 http://localhost:8888/index.html
```

## 發佈

本機測試 OK → 只 `git add` 改到的檔 → `git commit` → `git push`，GitHub Pages 約 1–2 分鐘生效，開發者線上檢查。

## 文件分工

- `CLAUDE.md` / `AGENTS.md`：工作規則（本檔），兩份相同。
- `README.md`：最新狀態與功能清單。
- `DEVLOG.md`：歷史開發流水帳。
- `PROJECT_NOTES.md`：早期規劃歸檔。
