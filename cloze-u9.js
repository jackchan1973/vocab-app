// Unit 9 克漏字 - Part 2 Advanced（文意選填）
// 主題：英國皇室婚禮與遊民議題（Windsor Castle）

const clozeU9 = {
  unit: "U9",
  title: "The British Royal Wedding and the Homeless in Windsor",
  passage: `The British royal wedding is set to take place in May. It will be (1)________ at Windsor Castle in England, but politician Simon Dudley thinks there is one problem to fix first. He says that the town of Windsor has too many (2)________ on the streets. He has requested that the (3)________ clear the streets of homeless people before the date of the royal wedding.

Dudley says that Windsor is a prosperous town that receives a lot of tourists every year. Windsor, he says, has enough wealth and such caring people that it shouldn't have people living on the streets. In fact, Dudley points to the several services available in Windsor, including (4)________ shelters to sleep in overnight. Since there are services available to the (5)________, Dudley claims that people living on the street are doing so by choice. Therefore, there is no reason for them to be there.

Murphy James, who runs a project to help homeless people in Windsor, disagrees. James points out that asking people for money is not (6)________, and that nobody would do that by choice. He also says that the shelters are not as helpful as Dudley claims. Community member Wisdom Da Costa agrees with James. Da Costa believes that several organizations need to work in (7)________ to address the problem.

Nobody likes being told they need to leave, especially when they have nowhere else to go. Whatever the (8)________ to the problem is, it should involve showing love and care for each other.`,
  options: [
    { letter: "A", word: "solution" },
    { letter: "B", word: "dignified" },
    { letter: "C", word: "hosted" },
    { letter: "D", word: "beggars" },
    { letter: "E", word: "suitable" },
    { letter: "F", word: "collaboration" },
    { letter: "G", word: "authorities" },
    { letter: "H", word: "needy" }
  ],
  blanks: [
    { number: 1, answer: "C", word: "hosted" },
    { number: 2, answer: "D", word: "beggars" },
    { number: 3, answer: "G", word: "authorities" },
    { number: 4, answer: "E", word: "suitable" },
    { number: 5, answer: "H", word: "needy" },
    { number: 6, answer: "B", word: "dignified" },
    { number: 7, answer: "F", word: "collaboration" },
    { number: 8, answer: "A", word: "solution" }
  ]
};

// 歷屆試題（選擇題）
const pastExamU9 = [
  {
    id: "u9-past-01",
    question: "The profits of Prince Charles's organic farm go to ________ to help the poor and the sick.",
    options: [
      { letter: "A", text: "charities" },
      { letter: "B", text: "bulletins" },
      { letter: "C", text: "harvests" },
      { letter: "D", text: "rebels" }
    ],
    answer: "A",
    year: "97"
  }
];

// 單字填空
const vocabFillU9 = [
  {
    id: "u9-fill-01",
    sentence: "The summer program will be a great o________y to learn more about animals.",
    answer: "opportunity"
  },
  {
    id: "u9-fill-02",
    sentence: "The hallway was crowded as the students a________ed there before class began.",
    answer: "assembled"
  },
  {
    id: "u9-fill-03",
    sentence: "William wore a suit and black l________r shoes to work.",
    answer: "leather"
  },
  {
    id: "u9-fill-04",
    sentence: "You should ask Dan's p________n before you borrow his bicycle.",
    answer: "permission"
  },
  {
    id: "u9-fill-05",
    sentence: "The company was f________ded by a woman who liked making clothes for her dog.",
    answer: "founded"
  }
];

if (typeof module !== 'undefined') module.exports = { clozeU9, pastExamU9, vocabFillU9 };
