# 高中學習複習

John 的高中平時學習與月考前練習工具，從英文單字學習 App 開始，逐步擴充成英文、國文、數學、社會、自然的練習平台。

## 專案現況

- 線上網址：https://jackchan1973.github.io/vocab-app/
- GitHub repository：https://github.com/jackchan1973/vocab-app
- 主要使用者：John，高一，就讀上海台商子女學校
- 開發目標：高中平時複習、月考前練習、段考重點加強
- 技術形式：純網頁，使用 HTML、CSS、JavaScript，不需要後端伺服器
- 資料儲存：瀏覽器 LocalStorage

## 目前功能

### 英文

- 單字卡：翻面、發音、已學與困難標記
- 測驗：選擇題、拼字測驗、計時與熟練度判斷
- 文意選填與克漏字：答題卡模式、交卷後解析
- 課文複習：依課次與題型篩選，交卷後顯示翻譯與考點
- 家長查看：今日學習、整體進度、測驗紀錄、困難單字

### 數學

- 已有選擇題練習雛形
- 支援分類篩選、隨機抽題、答對答錯統計

### 國文、社會、自然

- 目前保留五科入口與開發中頁面
- 後續擴充時應保持各科功能互相隔離

## 主要檔案

```text
~/開發項目/高中學習程式/
├── index.html                    # 頁面骨架
├── style.css                     # 畫面樣式
├── app.js                        # 主要互動功能
├── vocab-data.js                 # 英文單字資料
├── cloze-data.js                 # 克漏字題庫
├── vocab-exam3.js                # 第三次月考單字題
├── cloze-exam3.js                # 第三次月考克漏字
├── reading-exam3.js              # 第三次月考閱讀
├── english-review-data.js        # 英文課文複習題庫
├── wencianze-translations.js     # 文意選填中文翻譯
├── math-data.js                  # 數學題庫
├── english-course-structure.json # 英文課程結構
├── auth.js                       # 舊登入模組，目前未載入
├── DEVLOG.md                     # 歷史開發紀錄
└── PROJECT_NOTES.md              # 早期專案規劃歸檔
```

## 開發原則

- 本機資料夾中文名（高中學習程式）可改，不影響網址；**不可更改的是 GitHub repository 名稱 `vocab-app`**，它與 GitHub Pages 線上網址相關。
- 首頁五科入口用來隔離各科開發，新增或修改某一科時，不應影響其他科。
- 程式功能與題庫資料盡量分離，新增題庫時優先修改資料檔。
- 登入與雲端同步暫緩，先保持 John 使用方便。

## 本機測試

在專案根目錄執行：

```bash
python3 -m http.server 8888
```

瀏覽器開啟：

```text
http://localhost:8888/index.html
```

修改 JavaScript 後，至少執行：

```bash
node --check app.js
```

如果修改了其他 `.js` 檔，也要一併做語法檢查。

## 文件分工

- `README.md`：目前最新狀態與開發入口，只放現在仍有效的資訊。
- `DEVLOG.md`：歷史開發流水帳，保留做過什麼、遇到什麼問題、怎麼解決。
- `PROJECT_NOTES.md`：早期規劃歸檔，避免和 README 重複維護。
