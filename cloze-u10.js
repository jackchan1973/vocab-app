// Unit 10 克漏字測驗 - 主題：Quarantine / 1918 flu

// ── 課文篇：Quarantine's Dark History（直接取自課文，8個課文單字） ──
const clozeU10Text = {
  unit: "U10",
  title: "Quarantine's Dark History",
  passage: `Before 2020, the word "quarantine" was one that people usually only heard in Hollywood movies about out-of-control viruses. COVID-19 changed all that, and it has since become a part of our everyday (1)________. Let's take a look at how quarantine became a familiar (2)________ when it comes to prevention of virus circulation.

The Bible describes several situations involving lepers—people suffering from a terrible skin disease that seemed to (3)________ through contact—being separated from healthy people. When the Black Death hit Europe in 1346, the sick were taken into special zones outside the city, and left to either recover or die. Two years later, the Italian city of Venice (4)________ a quarantine system for arriving ships. The goal of the (5)________ was to prevent (6)________ from bringing the disease into the country, and it was (7)________ that ships should stay away for 40 days.

In 1907, Irish cook Mary Mallon was discovered to carry the bacteria that causes typhoid (8)________. She was charged and put in quarantine so that she could not mix with others. Love it or hate it, we must conclude that quarantine serves an important purpose: it saves lives.`,
  options: [
    { letter: "A", word: "vocabulary" },
    { letter: "B", word: "theme" },
    { letter: "C", word: "spread" },
    { letter: "D", word: "devised" },
    { letter: "E", word: "strategy" },
    { letter: "F", word: "passengers" },
    { letter: "G", word: "calculated" },
    { letter: "H", word: "fever" }
  ],
  blanks: [
    { number: 1, answer: "A", word: "vocabulary" },
    { number: 2, answer: "B", word: "theme" },
    { number: 3, answer: "C", word: "spread" },
    { number: 4, answer: "D", word: "devised" },
    { number: 5, answer: "E", word: "strategy" },
    { number: 6, answer: "F", word: "passengers" },
    { number: 7, answer: "G", word: "calculated" },
    { number: 8, answer: "H", word: "fever" }
  ]
};

// 文意選填格式（A-H，供 文意選填 tab 使用）
const clozeU10Wen = {
  unit: "U10",
  title: "The 1918 Flu Pandemic",
  passage: `COVID may have killed over 6 million people, but in 1918 there was a flu (1)________ which was much more deadly. There is no certainty about where the virus (2)________. It was first reported in Spain, which led to many wrongly calling it "The Spanish Flu", but the first cases were (3)________ in the U.S. at the end of World War I. The flu quickly (4)________ to Europe because Americans were still traveling there to clean up the mess of the war. At first, patients only suffered familiar flu-like issues such as a sore throat and a (5)________. But a few months later people's faces started turning blue, then black, before soon they were dead. Government (6)________ to reduce the death count included mask wearing, vaccines, the banning of mass (7)________, and quarantines. While it was found that these methods did help, experts (8)________ that by the end of the pandemic 25 to 50 million people had been killed.`,
  options: [
    { letter: "A", word: "outbreak" },
    { letter: "B", word: "originated" },
    { letter: "C", word: "discovered" },
    { letter: "D", word: "spread" },
    { letter: "E", word: "fever" },
    { letter: "F", word: "strategies" },
    { letter: "G", word: "gatherings" },
    { letter: "H", word: "calculated" }
  ],
  blanks: [
    { number: 1, answer: "A", word: "outbreak" },
    { number: 2, answer: "B", word: "originated" },
    { number: 3, answer: "C", word: "discovered" },
    { number: 4, answer: "D", word: "spread" },
    { number: 5, answer: "E", word: "fever" },
    { number: 6, answer: "F", word: "strategies" },
    { number: 7, answer: "G", word: "gatherings" },
    { number: 8, answer: "H", word: "calculated" }
  ]
};

const clozeU10 = {
  unit: "U10",
  title: "The 1918 Flu Pandemic",
  passage: `COVID may have killed over 6 million people, but in 1918 there was a flu outbreak which was much more deadly. There is no certainty about where the virus originated. It was first reported in Spain, which led to many wrongly calling it "The Spanish Flu", but the first cases were (1)________ in the U.S. at the end of World War I. The flu quickly (2)________ to Europe because Americans were still traveling there to clean up the mess of the war. At first, patients only suffered familiar flu-like issues such as a sore throat and a (3)________. But a few months later people's faces started turning blue, then black, before soon they were dead. Government (4)________ to reduce the death count included mask wearing, vaccines, the banning of mass gatherings, and quarantines. While it was found that these methods did help, experts (5)________ that by the end of the pandemic 25 to 50 million people had been killed.`,
  blanks: [
    {
      number: 1,
      options: [
        { letter: "A", word: "strategized" },
        { letter: "B", word: "recovered" },
        { letter: "C", word: "figured" },
        { letter: "D", word: "discovered" }
      ],
      answer: "D",
      word: "discovered"
    },
    {
      number: 2,
      options: [
        { letter: "A", word: "spread" },
        { letter: "B", word: "devised" },
        { letter: "C", word: "computed" },
        { letter: "D", word: "quarantined" }
      ],
      answer: "A",
      word: "spread"
    },
    {
      number: 3,
      options: [
        { letter: "A", word: "contact" },
        { letter: "B", word: "theme" },
        { letter: "C", word: "fever" },
        { letter: "D", word: "zone" }
      ],
      answer: "C",
      word: "fever"
    },
    {
      number: 4,
      options: [
        { letter: "A", word: "discoveries" },
        { letter: "B", word: "strategies" },
        { letter: "C", word: "vocabularies" },
        { letter: "D", word: "themes" }
      ],
      answer: "B",
      word: "strategies"
    },
    {
      number: 5,
      options: [
        { letter: "A", word: "situated" },
        { letter: "B", word: "separated" },
        { letter: "C", word: "calculated" },
        { letter: "D", word: "circulated" }
      ],
      answer: "C",
      word: "calculated"
    }
  ]
};

// 歷屆試題
const pastExamU10 = [
  {
    id: "u10-past-01",
    question: "It is essential for us to maintain constant ________ with our friends to ensure that we have someone to talk to in times of need.",
    options: [
      { letter: "A", text: "benefit" },
      { letter: "B", text: "contact" },
      { letter: "C", text: "gesture" },
      { letter: "D", text: "favor" }
    ],
    answer: "B",
    year: "108"
  },
  {
    id: "u10-past-02",
    question: "Onions are depicted in many paintings ________ inside pyramids and tombs that span the history of ancient Egypt.",
    options: [
      { letter: "A", text: "reflected" },
      { letter: "B", text: "admired" },
      { letter: "C", text: "discovered" },
      { letter: "D", text: "separated" }
    ],
    answer: "C",
    year: "106"
  }
];

// 單字填空
const vocabFillU10 = [
  {
    id: "u10-fill-01",
    sentence: "To help protect the environment, we should use public transport w________r it's possible.",
    answer: "whenever"
  },
  {
    id: "u10-fill-02",
    sentence: "Following the terrorist attack, p________rs on planes had to go through strict security checks.",
    answer: "passengers"
  },
  {
    id: "u10-fill-03",
    sentence: "In the end, the judge c________ed that the actions of the man had not been illegal.",
    answer: "concluded"
  },
  {
    id: "u10-fill-04",
    sentence: "If the actor's reputation is p________y damaged by the financial scandal, he may never work in Hollywood again.",
    answer: "permanently"
  },
  {
    id: "u10-fill-05",
    sentence: "Whether the suspect will be c________ed for the crime or not is yet to be determined.",
    answer: "charged"
  }
];

if (typeof module !== 'undefined') module.exports = { clozeU10, pastExamU10, vocabFillU10 };
