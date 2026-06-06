// Unit 11 克漏字 - 文意選填
// 主題：Snow Leopards（雪豹）

const clozeU11 = {
  unit: "U11",
  title: "Snow Leopards and Their Guardians",
  passage: `Snow leopards are one of the most interesting and beautiful big cats on Earth. They have big, wide feet that make it easy for them to walk in the snow and on rocks. They also scratch the rocks as a way of communicating with each other. Their tails are just as long as their bodies, and they use them for (1)________ and to cover themselves for warmth. They are (2)________ to Central Asia, but there are fewer and fewer of them every year. Their (3)________ today is under 10,000, mainly because of hunters who value their fur and bones. This puts snow leopards on the list of (4)________ species.

Luckily for the snow leopards, there are some people looking out for them. Monks have become the (5)________ of these lovely animals. Monks believe that we must have love and respect for all living creatures, and they take this way of thinking (6)________. The monks also teach others about snow leopards to (7)________ awareness and concern for them. With the positive image they are spreading about snow leopards, it is very possible that the monks will (8)________ their goal.`,
  options: [
    { letter: "A", word: "guardians" },
    { letter: "B", word: "increase" },
    { letter: "C", word: "balance" },
    { letter: "D", word: "native" },
    { letter: "E", word: "achieve" },
    { letter: "F", word: "seriously" },
    { letter: "G", word: "endangered" },
    { letter: "H", word: "population" }
  ],
  blanks: [
    { number: 1, answer: "C", word: "balance" },
    { number: 2, answer: "D", word: "native" },
    { number: 3, answer: "H", word: "population" },
    { number: 4, answer: "G", word: "endangered" },
    { number: 5, answer: "A", word: "guardians" },
    { number: 6, answer: "F", word: "seriously" },
    { number: 7, answer: "B", word: "increase" },
    { number: 8, answer: "E", word: "achieve" }
  ]
};

// 字彙測驗（選擇題）
const vocabQuizU11 = [
  {
    id: "u11-quiz-01",
    question: "The first ________ built a small town and started to grow crops.",
    options: [
      { letter: "A", text: "cattle" },
      { letter: "B", text: "settlers" },
      { letter: "C", text: "natives" },
      { letter: "D", text: "projects" }
    ],
    answer: "B"
  },
  {
    id: "u11-quiz-02",
    question: "It's best to stay away from that place ________.",
    options: [
      { letter: "A", text: "efficiently" },
      { letter: "B", text: "seriously" },
      { letter: "C", text: "nevertheless" },
      { letter: "D", text: "altogether" }
    ],
    answer: "D"
  },
  {
    id: "u11-quiz-03",
    question: "A new style of music was ________ in the early twentieth century.",
    options: [
      { letter: "A", text: "introduced" },
      { letter: "B", text: "increased" },
      { letter: "C", text: "weakened" },
      { letter: "D", text: "balanced" }
    ],
    answer: "A"
  },
  {
    id: "u11-quiz-04",
    question: "Jasmine's teacher helped her to ________ a large vocabulary.",
    options: [
      { letter: "A", text: "populate" },
      { letter: "B", text: "attack" },
      { letter: "C", text: "eliminate" },
      { letter: "D", text: "acquire" }
    ],
    answer: "D"
  },
  {
    id: "u11-quiz-05",
    question: "The people in the refugee camp were ________ for food.",
    options: [
      { letter: "A", text: "desperate" },
      { letter: "B", text: "current" },
      { letter: "C", text: "domestic" },
      { letter: "D", text: "positive" }
    ],
    answer: "A"
  }
];

// 歷屆試題
const pastExamU11 = [
  {
    id: "u11-past-01",
    question: "If student enrollment continues to drop, some programs at the university may be ________ to reduce the operation costs.",
    options: [
      { letter: "A", text: "relieved" },
      { letter: "B", text: "eliminated" },
      { letter: "C", text: "projected" },
      { letter: "D", text: "accounted" }
    ],
    answer: "B",
    year: "103"
  },
  {
    id: "u11-past-02",
    question: "Many people try to save a lot of money before ________, since having enough money would give them a sense of security for their future.",
    options: [
      { letter: "A", text: "isolation" },
      { letter: "B", text: "promotion" },
      { letter: "C", text: "retirement" },
      { letter: "D", text: "announcement" }
    ],
    answer: "C",
    year: "105"
  },
  {
    id: "u11-past-03",
    question: "If you fly from Taipei to Tokyo, you'll be taking an international, rather than a ________ flight.",
    options: [
      { letter: "A", text: "liberal" },
      { letter: "B", text: "domestic" },
      { letter: "C", text: "connected" },
      { letter: "D", text: "universal" }
    ],
    answer: "B",
    year: "101"
  }
];

// 單字填空
const vocabFillU11 = [
  {
    id: "u11-fill-01",
    sentence: "The new law will help p________n the rare species from becoming extinct.",
    answer: "population",
    hint: "保護稀有物種不致滅絕"
  },
  {
    id: "u11-fill-02",
    sentence: "Many people try to save a lot of money before r________t, so they can enjoy their later years.",
    answer: "retirement"
  },
  {
    id: "u11-fill-03",
    sentence: "We need to g________d our personal information online to prevent identity theft.",
    answer: "guard"
  },
  {
    id: "u11-fill-04",
    sentence: "After living abroad for years, she has a________d a new way of thinking.",
    answer: "acquired"
  },
  {
    id: "u11-fill-05",
    sentence: "Scientists warn that many species of animals may become e________d if we don't take action.",
    answer: "endangered"
  }
];

if (typeof module !== 'undefined') module.exports = { clozeU11, vocabQuizU11, pastExamU11, vocabFillU11 };
