// 英文課文複習題庫
// 方向：課文句型、文法、單字、翻譯理解並行，題目為原創複習題，貼近課文主題與考法。

const ENGLISH_REVIEW_BANK = [
  {
    id: "l07-grammar-01",
    lesson: "L07",
    type: "grammar",
    typeLabel: "文法句型",
    focus: "by + V-ing 表示方法",
    prompt: "Some students broaden their horizons ______ TED Talks online.",
    options: ["by watching", "to watch", "watch", "watched"],
    answer: "by watching",
    translation: "有些學生藉由線上觀看 TED 演講來拓展視野。",
    explanation: "表示「藉由某方式」時，用 by + V-ing。句中要表達方法，所以選 by watching。"
  },
  {
    id: "l07-vocab-01",
    lesson: "L07",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "seek 的用法",
    prompt: "The speaker encouraged young people to ______ knowledge, not just good grades.",
    options: ["seek", "reject", "avoid", "ignore"],
    answer: "seek",
    translation: "講者鼓勵年輕人追求知識，而不只是好成績。",
    explanation: "seek 表示「尋求、追求」，後面可接 knowledge、help、truth 等抽象名詞。"
  },
  {
    id: "l07-translation-01",
    lesson: "L07",
    type: "translation",
    typeLabel: "翻譯理解",
    focus: "worthwhile 的語意",
    prompt: "Which translation best fits: “The talk was short, but it was worthwhile.”",
    options: [
      "這場演講很短，但很值得。",
      "這場演講很短，所以很無聊。",
      "這場演講很短，而且沒有重點。",
      "這場演講很短，但很昂貴。"
    ],
    answer: "這場演講很短，但很值得。",
    translation: "這場演講很短，但很值得。",
    explanation: "worthwhile 表示「值得的」，不是 expensive，也不是 boring。"
  },
  {
    id: "l07-pattern-01",
    lesson: "L07",
    type: "pattern",
    typeLabel: "課文句型",
    focus: "inspire + 人 + to V",
    prompt: "TED Talks can inspire viewers ______ differently about the world.",
    options: ["to think", "thinking", "thought", "think"],
    answer: "to think",
    translation: "TED 演講能激勵觀眾用不同方式思考世界。",
    explanation: "inspire + 人 + to V 表示「激勵某人去做某事」。"
  },
  {
    id: "l07-context-01",
    lesson: "L07",
    type: "context",
    typeLabel: "課文脈絡",
    focus: "TED 主旨",
    prompt: "According to the TED lesson, why are TED Talks useful for students?",
    options: [
      "They help students learn ideas from many fields.",
      "They teach students to memorize every speaker's name.",
      "They are mainly for making money.",
      "They are only about entertainment news."
    ],
    answer: "They help students learn ideas from many fields.",
    translation: "TED 演講能幫助學生從許多領域學習不同想法。",
    explanation: "L07 的核心是 ideas worth spreading，以及透過不同領域的演講拓展視野。"
  },
  {
    id: "l07-grammar-02",
    lesson: "L07",
    type: "grammar",
    typeLabel: "文法句型",
    focus: "被動語態",
    prompt: "Many TED Talks ______ online for free after TED.com was launched.",
    options: ["were uploaded", "uploaded", "uploading", "were uploading"],
    answer: "were uploaded",
    translation: "TED.com 上線後，許多 TED 演講被免費上傳到網路上。",
    explanation: "talks 是被上傳，所以要用被動語態 were uploaded。"
  },

  {
    id: "l08-grammar-01",
    lesson: "L08",
    type: "grammar",
    typeLabel: "文法句型",
    focus: "where 引導地點關係子句",
    prompt: "Ban-doh originated in the countryside, ______ neighbors helped each other prepare banquets.",
    options: ["where", "which", "when", "what"],
    answer: "where",
    translation: "辦桌起源於鄉村，在那裡鄰居會互相幫忙準備宴席。",
    explanation: "先行詞是 the countryside，後面補充地點中的情況，要用 where。"
  },
  {
    id: "l08-vocab-01",
    lesson: "L08",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "temporary",
    prompt: "The family put up a ______ tent for the outdoor banquet.",
    options: ["temporary", "permanent", "personal", "historical"],
    answer: "temporary",
    translation: "這家人為戶外宴席搭起了一頂臨時帳篷。",
    explanation: "辦桌帳篷通常為活動臨時搭設，因此 temporary 最合適。"
  },
  {
    id: "l08-translation-01",
    lesson: "L08",
    type: "translation",
    typeLabel: "翻譯理解",
    focus: "togetherness",
    prompt: "Which translation best fits: “The spirit of togetherness remains important.”",
    options: [
      "團結互助的精神仍然重要。",
      "臨時搭建的帳篷仍然重要。",
      "個人選擇的精神仍然重要。",
      "正式會議的精神仍然重要。"
    ],
    answer: "團結互助的精神仍然重要。",
    translation: "團結互助的精神仍然重要。",
    explanation: "togetherness 在辦桌課文中指人們聚在一起、互相幫忙的精神。"
  },
  {
    id: "l08-pattern-01",
    lesson: "L08",
    type: "pattern",
    typeLabel: "課文句型",
    focus: "Although 對比句",
    prompt: "______ some aspects of ban-doh have changed, its spirit still remains.",
    options: ["Although", "Because", "If", "Before"],
    answer: "Although",
    translation: "雖然辦桌的某些面向已經改變，但它的精神仍然存在。",
    explanation: "前後句有轉折對比：面向改變，但精神仍在，所以用 Although。"
  },
  {
    id: "l08-context-01",
    lesson: "L08",
    type: "context",
    typeLabel: "課文脈絡",
    focus: "辦桌文化",
    prompt: "What does ban-doh mainly show about Taiwanese culture in this lesson?",
    options: [
      "People value cooperation and sharing.",
      "People avoid eating outdoors.",
      "People dislike helping neighbors.",
      "People only care about expensive restaurants."
    ],
    answer: "People value cooperation and sharing.",
    translation: "辦桌展現出台灣文化中重視合作與分享的一面。",
    explanation: "L08 重點不是食物本身，而是鄰里互助與團結的文化精神。"
  },
  {
    id: "l08-vocab-02",
    lesson: "L08",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "take part in",
    prompt: "Visitors can ______ a ban-doh to experience local culture.",
    options: ["take part in", "take care of", "take place of", "take advantage of"],
    answer: "take part in",
    translation: "訪客可以參加辦桌，體驗當地文化。",
    explanation: "take part in 表示「參加、參與」活動。"
  },

  {
    id: "l09-vocab-01",
    lesson: "L09",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "reveal",
    prompt: "The article tried to ______ how new words enter everyday language.",
    options: ["reveal", "conceal", "reject", "erase"],
    answer: "reveal",
    translation: "這篇文章試著揭示新詞如何進入日常語言。",
    explanation: "reveal 表示揭露、揭示，使原本不明顯的事情被看見。"
  },
  {
    id: "l09-grammar-01",
    lesson: "L09",
    type: "grammar",
    typeLabel: "文法句型",
    focus: "with + 名詞片語",
    prompt: "Language is constantly changing ______ new words and new uses of old words.",
    options: ["with", "from", "below", "against"],
    answer: "with",
    translation: "語言會隨著新詞彙和舊詞新用法而不斷改變。",
    explanation: "with 在這裡表示伴隨變化的因素：隨著新詞與新用法出現。"
  },
  {
    id: "l09-pattern-01",
    lesson: "L09",
    type: "pattern",
    typeLabel: "課文句型",
    focus: "play an important role in",
    prompt: "Eponyms play an important role ______ creating new words.",
    options: ["in", "on", "at", "for"],
    answer: "in",
    translation: "源自人名的詞彙在創造新詞的過程中扮演重要角色。",
    explanation: "固定搭配是 play a role in + N/V-ing。"
  },
  {
    id: "l09-translation-01",
    lesson: "L09",
    type: "translation",
    typeLabel: "翻譯理解",
    focus: "widespread",
    prompt: "Which translation best fits: “The usage became widespread.”",
    options: [
      "這種用法變得廣泛流傳。",
      "這種用法變得十分古老。",
      "這種用法變得完全錯誤。",
      "這種用法變得非常短暫。"
    ],
    answer: "這種用法變得廣泛流傳。",
    translation: "這種用法變得廣泛流傳。",
    explanation: "widespread 表示普遍的、廣泛流傳的。"
  },
  {
    id: "l09-context-01",
    lesson: "L09",
    type: "context",
    typeLabel: "課文脈絡",
    focus: "語言變化",
    prompt: "What is the main idea of the lesson about eponyms and new words?",
    options: [
      "Language changes as society creates and uses new words.",
      "Language never changes once a dictionary is printed.",
      "Company names can never become common verbs.",
      "Only ancient words can be used in daily life."
    ],
    answer: "Language changes as society creates and uses new words.",
    translation: "這課的重點是：社會創造並使用新詞時，語言也會跟著改變。",
    explanation: "L09 的主軸是新詞、商標或人名如何進入日常語言，反映語言不斷變化。"
  },
  {
    id: "l09-vocab-02",
    lesson: "L09",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "constantly",
    prompt: "Because people keep inventing new expressions, language is ______ changing.",
    options: ["constantly", "rarely", "briefly", "silently"],
    answer: "constantly",
    translation: "因為人們不斷創造新表達方式，語言也持續改變。",
    explanation: "constantly 表示持續地、不斷地。"
  },

  {
    id: "r03-vocab-01",
    lesson: "R03",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "maintain",
    prompt: "Astronauts exercise to ______ muscle strength in space.",
    options: ["maintain", "complain", "contain", "obtain"],
    answer: "maintain",
    translation: "太空人運動是為了在太空中維持肌肉強度。",
    explanation: "maintain 表示維持某種狀態，符合 muscle strength 的語意。"
  },
  {
    id: "r03-grammar-01",
    lesson: "R03",
    type: "grammar",
    typeLabel: "文法句型",
    focus: "to V 表目的",
    prompt: "Astronauts work out regularly ______ their circulation.",
    options: ["to improve", "improving", "improved", "improve"],
    answer: "to improve",
    translation: "太空人會定期運動，以促進血液循環。",
    explanation: "to + 原形動詞可表示目的：為了促進血液循環。"
  },
  {
    id: "r03-pattern-01",
    lesson: "R03",
    type: "pattern",
    typeLabel: "課文句型",
    focus: "otherwise 的邏輯",
    prompt: "Sleeping bags must be fixed to the wall. ______, astronauts may float around.",
    options: ["Otherwise", "Therefore", "However", "Furthermore"],
    answer: "Otherwise",
    translation: "睡袋必須固定在牆上。否則，太空人可能會四處漂浮。",
    explanation: "otherwise 表示「否則」，用來說明如果不這麼做會發生的結果。"
  },
  {
    id: "r03-translation-01",
    lesson: "R03",
    type: "translation",
    typeLabel: "翻譯理解",
    focus: "float around",
    prompt: "Which translation best fits: “Astronauts might float around bumping into one another.”",
    options: [
      "太空人可能會四處漂浮，彼此碰撞。",
      "太空人可能會安靜坐著，彼此聊天。",
      "太空人可能會向下墜落，彼此遠離。",
      "太空人可能會固定在地板上，彼此等待。"
    ],
    answer: "太空人可能會四處漂浮，彼此碰撞。",
    translation: "太空人可能會四處漂浮，彼此碰撞。",
    explanation: "float around 是四處漂浮，bump into one another 是彼此碰撞。"
  },
  {
    id: "r03-context-01",
    lesson: "R03",
    type: "context",
    typeLabel: "課文脈絡",
    focus: "太空生活",
    prompt: "Why do astronauts need special habits in space?",
    options: [
      "Because low gravity changes how they move, sleep, and stay healthy.",
      "Because space stations have no walls or equipment.",
      "Because they do not need to exercise in space.",
      "Because sleeping bags are only for decoration."
    ],
    answer: "Because low gravity changes how they move, sleep, and stay healthy.",
    translation: "太空人需要特殊生活習慣，因為低重力會改變他們移動、睡眠和保持健康的方式。",
    explanation: "R03 的重點是太空生活因低重力而不同，因此需要固定睡袋、規律運動等做法。"
  },
  {
    id: "r03-vocab-02",
    lesson: "R03",
    type: "vocab",
    typeLabel: "單字用法",
    focus: "regularly",
    prompt: "To stay healthy, astronauts must exercise ______.",
    options: ["regularly", "carelessly", "rarely", "secretly"],
    answer: "regularly",
    translation: "為了保持健康，太空人必須定期運動。",
    explanation: "regularly 表示定期地、規律地，符合健康維持的語境。"
  }
];

if (typeof module !== "undefined") module.exports = { ENGLISH_REVIEW_BANK };
