// Unit 12 克漏字 - 文意選填
// 主題：Wellness Festivals（健康節）／Finding Fortune（課文）

// ── 課文篇：Finding Fortune with New Year's Traditions（直接取自課文，8個課文單字） ──
const clozeU12Text = {
  unit: "U12",
  title: "Finding Fortune with New Year's Traditions",
  passage: `All around the world, New Year's Day is celebrated with great (1)________, and many countries have their own New Year's (2)________. Let's have a look at a few (3)________ ways of celebrating the new year!

Danish people (4)________ their friends by breaking dishes in front of their houses. Finding a big pile of broken dishes at your door on January 1 means that you have many friends and will have good (5)________ in the new year.

The Greeks bake a special bread in which they hide a single coin to (6)________ luck and wealth. On New Year's Day, whoever gets the lucky slice is also sure to get the reward of a successful year.

Scottish people believe the promise of good fortune depends on who first steps foot in their door. The owners are (7)________ as this "first-foot" approaches with gifts of salt, silver, and coal as (8)________ of plentiful food and heat in the coming year.`,
  options: [
    { letter: "A", word: "enthusiasm" },
    { letter: "B", word: "traditions" },
    { letter: "C", word: "unique" },
    { letter: "D", word: "honor" },
    { letter: "E", word: "fortune" },
    { letter: "F", word: "represent" },
    { letter: "G", word: "delighted" },
    { letter: "H", word: "symbols" }
  ],
  blanks: [
    { number: 1, answer: "A", word: "enthusiasm" },
    { number: 2, answer: "B", word: "traditions" },
    { number: 3, answer: "C", word: "unique" },
    { number: 4, answer: "D", word: "honor" },
    { number: 5, answer: "E", word: "fortune" },
    { number: 6, answer: "F", word: "represent" },
    { number: 7, answer: "G", word: "delighted" },
    { number: 8, answer: "H", word: "symbols" }
  ]
};

const clozeU12 = {
  unit: "U12",
  title: "Wellness Festivals",
  passage: `A(n) (1)________ kind of festival is getting more popular in many countries. Called wellness festivals, they are in some ways (2)________ to music festivals. Both can last for several days, and both have people come together to (3)________ a fun, lively experience. While both may have music shows, the (4)________ is that wellness festivals put an emphasis on healthy living. The most popular event at wellness festivals is yoga. At one festival in Malibu, California, called Wanderlust, there were 2,000 people doing yoga together on the beach. It's also common to see people (5)________ themselves by getting a massage. Other activities may include surfing, hiking, or bike tours. Besides improving your body, there are many kinds of classes to learn from, and presentations from musicians, business owners, and health experts.

Women have shown the most (6)________ for wellness festivals. Men are usually allowed to attend, but most people there are (7)________. No matter who attends, wellness festivals keep a(n) (8)________ to provide a healthy and safe environment. With signs of wellness festivals becoming more and more successful, it looks like they are here to stay.`,
  options: [
    { letter: "A", word: "difference" },
    { letter: "B", word: "similar" },
    { letter: "C", word: "enthusiasm" },
    { letter: "D", word: "promise" },
    { letter: "E", word: "unique" },
    { letter: "F", word: "refreshing" },
    { letter: "G", word: "female" },
    { letter: "H", word: "share" }
  ],
  blanks: [
    { number: 1, answer: "E", word: "unique" },
    { number: 2, answer: "B", word: "similar" },
    { number: 3, answer: "H", word: "share" },
    { number: 4, answer: "A", word: "difference" },
    { number: 5, answer: "F", word: "refreshing" },
    { number: 6, answer: "C", word: "enthusiasm" },
    { number: 7, answer: "G", word: "female" },
    { number: 8, answer: "D", word: "promise" }
  ]
};

// 字彙測驗（選擇題）
const vocabQuizU12 = [
  {
    id: "u12-quiz-01",
    question: "After the rainy season, food was ________ in the village, and no one went hungry.",
    options: [
      { letter: "A", text: "historical" },
      { letter: "B", text: "freezing" },
      { letter: "C", text: "plentiful" },
      { letter: "D", text: "unique" }
    ],
    answer: "C"
  },
  {
    id: "u12-quiz-02",
    question: "The dove is widely known to ________ peace in many cultures around the world.",
    options: [
      { letter: "A", text: "depend" },
      { letter: "B", text: "represent" },
      { letter: "C", text: "approach" },
      { letter: "D", text: "honor" }
    ],
    answer: "B"
  },
  {
    id: "u12-quiz-03",
    question: "________ arrives first at the meeting should start setting up the room.",
    options: [
      { letter: "A", text: "However" },
      { letter: "B", text: "Whatever" },
      { letter: "C", text: "Wherever" },
      { letter: "D", text: "Whoever" }
    ],
    answer: "D"
  },
  {
    id: "u12-quiz-04",
    question: "Whether we can have the picnic will ________ on the weather tomorrow.",
    options: [
      { letter: "A", text: "promise" },
      { letter: "B", text: "approach" },
      { letter: "C", text: "depend" },
      { letter: "D", text: "reward" }
    ],
    answer: "C"
  },
  {
    id: "u12-quiz-05",
    question: "The professor wrote a book about the ________ events that led to World War I.",
    options: [
      { letter: "A", text: "freezing" },
      { letter: "B", text: "plentiful" },
      { letter: "C", text: "delighted" },
      { letter: "D", text: "historical" }
    ],
    answer: "D"
  }
];

// 歷屆試題
const pastExamU12 = [
  {
    id: "u12-past-01",
    question: "To teach children right from wrong, some parents will ________ their children when they behave well and punish them when they misbehave.",
    options: [
      { letter: "A", text: "settle" },
      { letter: "B", text: "declare" },
      { letter: "C", text: "reward" },
      { letter: "D", text: "neglect" }
    ],
    answer: "C",
    year: "104"
  },
  {
    id: "u12-past-02",
    question: "The children were so ________ to see the clown appear on stage that they laughed, screamed, and clapped their hands happily.",
    options: [
      { letter: "A", text: "admirable" },
      { letter: "B", text: "fearful" },
      { letter: "C", text: "delighted" },
      { letter: "D", text: "intense" }
    ],
    answer: "C",
    year: "100"
  },
  {
    id: "u12-past-03",
    question: "For ancient Egyptians, the onion was not just food or medicine; it held significant spiritual meaning. Onions were considered to be ________ of eternal life.",
    options: [
      { letter: "A", text: "symbols" },
      { letter: "B", text: "difference" },
      { letter: "C", text: "fortune" },
      { letter: "D", text: "enthusiasm" }
    ],
    answer: "A",
    year: "106"
  },
  {
    id: "u12-past-04",
    question: "At the very beginning, only ________ names were used because at that time typhoons were named after girlfriends or wives of the experts on the committee.",
    options: [
      { letter: "A", text: "unique" },
      { letter: "B", text: "female" },
      { letter: "C", text: "composed" },
      { letter: "D", text: "various" }
    ],
    answer: "B",
    year: "101"
  },
  {
    id: "u12-past-05",
    question: "The bluebird is considered a very lucky sign in most cultures, particularly when seen in the spring. ________, a woodpecker, when seen near the home, is regarded as a good sign.",
    options: [
      { letter: "A", text: "Therefore" },
      { letter: "B", text: "Nevertheless" },
      { letter: "C", text: "Roughly" },
      { letter: "D", text: "Similarly" }
    ],
    answer: "D",
    year: "104"
  }
];

// 單字填空
const vocabFillU12 = [
  {
    id: "u12-fill-01",
    sentence: "Can you tell me about the d________es between these two kinds of soap?",
    answer: "differences",
    hint: "差異；分歧"
  },
  {
    id: "u12-fill-02",
    sentence: "It's a t________n to give children red envelopes at Chinese New Year.",
    answer: "tradition",
    hint: "傳統"
  },
  {
    id: "u12-fill-03",
    sentence: "I learned Portuguese many years ago, but now I can't remember a s________e word of it.",
    answer: "single",
    hint: "單一的"
  },
  {
    id: "u12-fill-04",
    sentence: "All of the firefighters were h________red in a parade through the city.",
    answer: "honored",
    hint: "表揚；致敬"
  },
  {
    id: "u12-fill-05",
    sentence: "As Brittney a________hed her school, she realized she had forgotten to bring her schoolbag.",
    answer: "approached",
    hint: "靠近；接近"
  }
];

if (typeof module !== 'undefined') module.exports = { clozeU12, vocabQuizU12, pastExamU12, vocabFillU12 };
