// L07 / L08 文意選填資料
// 格式與 U09-U12 相同，供「文意選填」答題卡模式使用。

const clozeL07Text = {
  unit: "L07",
  title: "TED Talks: Ideas Worth Spreading",
  passage: `TED began as a small (1)________ in 1984, but it later became a worldwide platform for sharing ideas. As a (2)________ foundation, TED does not focus on making money. Instead, it invites speakers from (3)________ fields to present ideas that can help people learn and think differently. Each speaker is usually given a limited amount of time, so the message must be clear and (4)________.

After TED.com was (5)________ in 2007, many talks became available online for free. Viewers around the world could watch experts discuss science, education, business, art, and global issues. For many students, watching TED Talks is a way to (6)________ knowledge outside the classroom. It can also (7)________ them to care about the world and (8)________ their horizons.`,
  options: [
    { letter: "A", word: "conference" },
    { letter: "B", word: "nonprofit" },
    { letter: "C", word: "numerous" },
    { letter: "D", word: "worthwhile" },
    { letter: "E", word: "launched" },
    { letter: "F", word: "seek" },
    { letter: "G", word: "inspire" },
    { letter: "H", word: "broaden" }
  ],
  blanks: [
    { number: 1, answer: "A", word: "conference" },
    { number: 2, answer: "B", word: "nonprofit" },
    { number: 3, answer: "C", word: "numerous" },
    { number: 4, answer: "D", word: "worthwhile" },
    { number: 5, answer: "E", word: "launched" },
    { number: 6, answer: "F", word: "seek" },
    { number: 7, answer: "G", word: "inspire" },
    { number: 8, answer: "H", word: "broaden" }
  ]
};

const clozeL08Text = {
  unit: "L08",
  title: "Ban-Doh: A Taste of Togetherness",
  passage: `Ban-doh is one of Taiwan's most authentic eating experiences. This custom (1)________ in the countryside, where neighbors helped one another prepare large meals for weddings, birthdays, and other special events. Because the banquet was often held outdoors, people put up a (2)________ tent and arranged tables, chairs, and eating (3)________ along the street.

In the old days, everyone in the neighborhood would (4)________ to make the event successful. Some people cooked, while others served dishes or cleaned up afterward. Although many (5)________ of ban-doh have changed in modern times, the spirit of (6)________ remains important. For visitors, taking part in a ban-doh can be an (7)________ cultural experience because it shows how food can bring a whole (8)________ together.`,
  options: [
    { letter: "A", word: "originated" },
    { letter: "B", word: "temporary" },
    { letter: "C", word: "utensils" },
    { letter: "D", word: "cooperate" },
    { letter: "E", word: "aspects" },
    { letter: "F", word: "togetherness" },
    { letter: "G", word: "authentic" },
    { letter: "H", word: "community" }
  ],
  blanks: [
    { number: 1, answer: "A", word: "originated" },
    { number: 2, answer: "B", word: "temporary" },
    { number: 3, answer: "C", word: "utensils" },
    { number: 4, answer: "D", word: "cooperate" },
    { number: 5, answer: "E", word: "aspects" },
    { number: 6, answer: "F", word: "togetherness" },
    { number: 7, answer: "G", word: "authentic" },
    { number: 8, answer: "H", word: "community" }
  ]
};

if (typeof module !== 'undefined') module.exports = { clozeL07Text, clozeL08Text };
