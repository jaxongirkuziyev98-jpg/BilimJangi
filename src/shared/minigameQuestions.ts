import { MAP_COUNTRY_TARGETS } from './mapCountries';
import { Difficulty, Language, QuestionVisualId, ServerQuestion } from './types';

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildMapHuntQuestions(difficulty: Difficulty): ServerQuestion[] {
  const ordered = shuffleArray(MAP_COUNTRY_TARGETS);
  const matching = ordered.filter((c) => c.difficulty === difficulty);
  const rest = ordered.filter((c) => c.difficulty !== difficulty);
  const targets = [...matching, ...rest];

  return targets.map((c, idx) => {
    const distractors = shuffleArray(
      MAP_COUNTRY_TARGETS.filter((other) => other.id !== c.id)
    ).slice(0, 3);
    const pool = shuffleArray([c, ...distractors]);
    const correctIndex = pool.findIndex((item) => item.id === c.id);

    return {
      id: `map_${c.id}_${idx}`,
      subject: 'geography',
      text: `${c.name.uz} qayerda joylashgan?`,
      options: pool.map((p) => p.name.uz) as [string, string, string, string],
      correctIndex,
      difficulty: c.difficulty,
      mapCountryId: c.id,
      localized: {
        uz: {
          text: `${c.name.uz} qayerda joylashgan?`,
          options: pool.map((p) => p.name.uz) as [string, string, string, string],
        },
        ru: {
          text: `Где находится ${c.name.ru}?`,
          options: pool.map((p) => p.name.ru) as [string, string, string, string],
        },
        en: {
          text: `Where is ${c.name.en}?`,
          options: pool.map((p) => p.name.en) as [string, string, string, string],
        },
      },
    };
  });
}

interface ZoomSeed {
  visualId: QuestionVisualId;
  difficulty: Difficulty;
  word: Record<Language, string>;
  hint: Record<Language, string>;
}

const ZOOM_SEEDS: ZoomSeed[] = [
  {
    visualId: 'zoom_cat',
    difficulty: 'easy',
    word: { uz: 'MUSHUK', ru: 'КОТ', en: 'CAT' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_sun',
    difficulty: 'easy',
    word: { uz: 'QUYOSH', ru: 'СОЛНЦЕ', en: 'SUN' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_moon',
    difficulty: 'easy',
    word: { uz: 'OY', ru: 'ЛУНА', en: 'MOON' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_leaf',
    difficulty: 'easy',
    word: { uz: 'BARG', ru: 'ЛИСТ', en: 'LEAF' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_key',
    difficulty: 'easy',
    word: { uz: 'KALIT', ru: 'КЛЮЧ', en: 'KEY' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_apple',
    difficulty: 'easy',
    word: { uz: 'OLMA', ru: 'ЯБЛОКО', en: 'APPLE' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_eye',
    difficulty: 'medium',
    word: { uz: 'KOZ', ru: 'ГЛАЗ', en: 'EYE' },
    hint: { uz: "Bu nima? (O' o'rniga O)", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_globe',
    difficulty: 'medium',
    word: { uz: 'GLOBUS', ru: 'ГЛОБУС', en: 'GLOBE' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_rocket',
    difficulty: 'medium',
    word: { uz: 'RAKETA', ru: 'РАКЕТА', en: 'ROCKET' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_crown',
    difficulty: 'medium',
    word: { uz: 'TOJ', ru: 'КОРОНА', en: 'CROWN' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_flask',
    difficulty: 'medium',
    word: { uz: 'KOLBA', ru: 'КОЛБА', en: 'FLASK' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_clock',
    difficulty: 'medium',
    word: { uz: 'SOAT', ru: 'ЧАСЫ', en: 'CLOCK' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_magnet',
    difficulty: 'hard',
    word: { uz: 'MAGNIT', ru: 'МАГНИТ', en: 'MAGNET' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'atom_bohr',
    difficulty: 'hard',
    word: { uz: 'ATOM', ru: 'АТОМ', en: 'ATOM' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'dna_helix',
    difficulty: 'hard',
    word: { uz: 'DNK', ru: 'ДНК', en: 'DNA' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
  {
    visualId: 'zoom_diamond',
    difficulty: 'hard',
    word: { uz: 'OLMOS', ru: 'АЛМАЗ', en: 'GEM' },
    hint: { uz: "Bu nima?", ru: 'Что это?', en: 'What is this?' },
  },
];

const EXTRA_LETTERS: Record<Language, string> = {
  uz: 'ABDEFGHIKLMNOPQRSTUVXYZ',
  ru: 'АБВГДЕЗИКЛМНОПРСТУХЯ',
  en: 'ABCDEFGHIKLMNOPRSTUWYZ',
};

function makeScrambledTiles(word: string, lang: Language): string[] {
  const letters = Array.from(word.toUpperCase());
  const alphabet = EXTRA_LETTERS[lang];
  const targetTotal = Math.max(8, letters.length + 3);
  while (letters.length < targetTotal) {
    letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  return shuffleArray(letters);
}

export function buildZoomGuessQuestions(difficulty: Difficulty): ServerQuestion[] {
  const ordered = shuffleArray(ZOOM_SEEDS);
  const matching = ordered.filter((z) => z.difficulty === difficulty);
  const rest = ordered.filter((z) => z.difficulty !== difficulty);
  const seeds = [...matching, ...rest];

  return seeds.map((z, idx) => {
    const scrambledLetters: Record<Language, string[]> = {
      uz: makeScrambledTiles(z.word.uz, 'uz'),
      ru: makeScrambledTiles(z.word.ru, 'ru'),
      en: makeScrambledTiles(z.word.en, 'en'),
    };
    return {
      id: `zoom_${z.visualId}_${idx}`,
      subject: 'biology',
      text: z.hint.uz,
      options: [z.word.uz, z.word.ru, z.word.en, ''],
      correctIndex: 0,
      difficulty: z.difficulty,
      visualId: z.visualId,
      zoomWord: z.word,
      scrambledLetters,
      localized: {
        uz: { text: z.hint.uz, options: [z.word.uz, '', '', ''] },
        ru: { text: z.hint.ru, options: [z.word.ru, '', '', ''] },
        en: { text: z.hint.en, options: [z.word.en, '', '', ''] },
      },
    };
  });
}

interface TrueFalseSeed {
  difficulty: Difficulty;
  answer: boolean;
  text: Record<Language, string>;
}

const TRUE_FALSE_SEEDS: TrueFalseSeed[] = [
  {
    difficulty: 'easy',
    answer: false,
    text: {
      uz: "Banan daraxtda o'sadi.",
      ru: 'Бананы растут на деревьях.',
      en: 'Bananas grow on trees.',
    },
  },
  {
    difficulty: 'easy',
    answer: true,
    text: {
      uz: 'Suv normal bosimda 100 °C da qaynaydi.',
      ru: 'Вода кипит при 100 °C при нормальном давлении.',
      en: 'Water boils at 100 °C at normal atmospheric pressure.',
    },
  },
  {
    difficulty: 'easy',
    answer: true,
    text: {
      uz: 'Yer Quyosh atrofida aylanadi.',
      ru: 'Земля вращается вокруг Солнца.',
      en: 'The Earth orbits around the Sun.',
    },
  },
  {
    difficulty: 'easy',
    answer: false,
    text: {
      uz: "O'zbekiston poytaxti — Samarqand shahri.",
      ru: 'Столица Узбекистана — город Самарканд.',
      en: 'Samarkand is the capital of Uzbekistan.',
    },
  },
  {
    difficulty: 'easy',
    answer: true,
    text: {
      uz: "Katta yoshli inson tanasida 206 ta suyak bor.",
      ru: 'В теле взрослого человека 206 костей.',
      en: 'An adult human body has 206 bones.',
    },
  },
  {
    difficulty: 'easy',
    answer: false,
    text: {
      uz: "Ko'k kit baliqlar sinfiga kiradi.",
      ru: 'Синий кит относится к рыбам.',
      en: 'The blue whale is classified as a fish.',
    },
  },
  {
    difficulty: 'easy',
    answer: true,
    text: {
      uz: '1 bayt 8 bitga teng.',
      ru: '1 байт равен 8 битам.',
      en: '1 byte equals 8 bits.',
    },
  },
  {
    difficulty: 'easy',
    answer: false,
    text: {
      uz: 'Oltinning kimyoviy belgisi — Ag.',
      ru: 'Химический символ золота — Ag.',
      en: 'The chemical symbol for gold is Ag.',
    },
  },
  {
    difficulty: 'medium',
    answer: true,
    text: {
      uz: "Tovush vakuumda tarqala olmaydi.",
      ru: 'Звук не может распространяться в вакууме.',
      en: 'Sound cannot travel through a vacuum.',
    },
  },
  {
    difficulty: 'medium',
    answer: false,
    text: {
      uz: "Afrika dunyodagi eng katta qit'a hisoblanadi.",
      ru: 'Африка — самый большой континент на Земле.',
      en: 'Africa is the largest continent on Earth.',
    },
  },
  {
    difficulty: 'medium',
    answer: true,
    text: {
      uz: "Olmos ham, grafit ham uglerod elementidan tuzilgan.",
      ru: 'И алмаз, и графит состоят из углерода.',
      en: 'Both diamond and graphite are made of carbon.',
    },
  },
  {
    difficulty: 'medium',
    answer: false,
    text: {
      uz: "O'simliklar fotosintezda kislorodni yutib, CO₂ chiqaradi.",
      ru: 'При фотосинтезе растения поглощают кислород и выделяют CO₂.',
      en: 'Plants absorb oxygen and release CO₂ during photosynthesis.',
    },
  },
  {
    difficulty: 'medium',
    answer: true,
    text: {
      uz: "Xona haroratida suyuq bo'ladigan metall — simobdir.",
      ru: 'Ртуть — металл, жидкий при комнатной температуре.',
      en: 'Mercury is a metal that is liquid at room temperature.',
    },
  },
  {
    difficulty: 'medium',
    answer: true,
    text: {
      uz: "Tinch okeani Yer yuzidagi eng katta okeandir.",
      ru: 'Тихий океан — самый большой океан на Земле.',
      en: 'The Pacific Ocean is the largest ocean on Earth.',
    },
  },
  {
    difficulty: 'medium',
    answer: false,
    text: {
      uz: 'Odam hujayrasida 46 juft xromosoma mavjud.',
      ru: 'В клетке человека 46 пар хромосом.',
      en: 'Human cells contain 46 pairs of chromosomes.',
    },
  },
  {
    difficulty: 'hard',
    answer: true,
    text: {
      uz: "Venera sayyorasi Quyosh tizimida o'z o'qi atrofida teskari tomonga aylanadi.",
      ru: 'Венера вращается вокруг своей оси в обратную сторону.',
      en: 'Venus rotates clockwise (retrograde) on its axis.',
    },
  },
  {
    difficulty: 'hard',
    answer: false,
    text: {
      uz: "Mutlaq nol harorat 0 °C ga teng.",
      ru: 'Абсолютный ноль равен 0 °C.',
      en: 'Absolute zero is equal to 0 °C.',
    },
  },
  {
    difficulty: 'hard',
    answer: true,
    text: {
      uz: "HTTPS protokoli HTTP ga nisbatan ma'lumotlarni shifrlab uzatadi.",
      ru: 'Протокол HTTPS шифрует передаваемые данные в отличие от HTTP.',
      en: 'HTTPS encrypts transmitted data, unlike plain HTTP.',
    },
  },
  {
    difficulty: 'hard',
    answer: true,
    text: {
      uz: "Ikkilik qidiruv algoritmining vaqt murakkabligi O(log n) ga teng.",
      ru: 'Временная сложность бинарного поиска равна O(log n).',
      en: 'The time complexity of binary search is O(log n).',
    },
  },
  {
    difficulty: 'hard',
    answer: false,
    text: {
      uz: 'Avogadro doimiysi taxminan 9.8 × 10⁸ ga teng.',
      ru: 'Постоянная Авогадро примерно равна 9.8 × 10⁸.',
      en: 'Avogadro’s constant is approximately 9.8 × 10⁸.',
    },
  },
];

export function buildTrueFalseQuestions(difficulty: Difficulty): ServerQuestion[] {
  const ordered = shuffleArray(TRUE_FALSE_SEEDS);
  const matching = ordered.filter((q) => q.difficulty === difficulty);
  const rest = ordered.filter((q) => q.difficulty !== difficulty);
  const list = [...matching, ...rest];

  return list.map((item, idx) => ({
    id: `tf_${idx}_${item.difficulty}`,
    subject: 'physics',
    text: item.text.uz,
    options: ["To'g'ri", 'Xato', '', ''],
    correctIndex: item.answer ? 0 : 1,
    difficulty: item.difficulty,
    isTrueFalse: true,
    localized: {
      uz: { text: item.text.uz, options: ["To'g'ri", 'Xato', '', ''] },
      ru: { text: item.text.ru, options: ['Верно', 'Неверно', '', ''] },
      en: { text: item.text.en, options: ['True', 'False', '', ''] },
    },
  }));
}
