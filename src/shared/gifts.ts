import { GiftReward, Language } from './types';

export interface GiftDefinition {
  id: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpBonus: number;
  name: Record<Language, string>;
  desc: Record<Language, string>;
}

export const GIFT_CATALOG: GiftDefinition[] = [
  {
    id: 'golden_crown',
    icon: '👑',
    rarity: 'legendary',
    xpBonus: 80,
    name: {
      uz: "Oltin G'olib Toji",
      ru: 'Золотая Корона Победителя',
      en: 'Golden Victory Crown',
    },
    desc: {
      uz: "Bellashuvda g'olib bo'lganingiz uchun maxsus toj sovg'asi.",
      ru: 'Особая корона за победу в учебном поединке.',
      en: 'Special crown awarded for winning an arena match.',
    },
  },
  {
    id: 'crystal_trophy',
    icon: '🏆',
    rarity: 'epic',
    xpBonus: 70,
    name: {
      uz: 'Kristall Kubok',
      ru: 'Хрустальный Кубок',
      en: 'Crystal Trophy',
    },
    desc: {
      uz: 'Yuqori natija va jamoaviy g‘alaba ramzi.',
      ru: 'Символ высокого результата и командной победы.',
      en: 'Symbol of high accuracy and team victory.',
    },
  },
  {
    id: 'rocket_boost',
    icon: '🚀',
    rarity: 'rare',
    xpBonus: 60,
    name: {
      uz: 'Tezkor Bilim Raketasi',
      ru: 'Ракета Знаний',
      en: 'Knowledge Rocket',
    },
    desc: {
      uz: "Tezkor javoblar va g'alaba shijoati uchun sovg'a.",
      ru: 'Награда за быстрые ответы и стремление к победе.',
      en: 'Gift for lightning-fast answers and winning drive.',
    },
  },
  {
    id: 'diamond_shield',
    icon: '💎',
    rarity: 'legendary',
    xpBonus: 90,
    name: {
      uz: 'Olmos Qalqon',
      ru: 'Алмазный Щит',
      en: 'Diamond Shield',
    },
    desc: {
      uz: "Mustahkam bilim va benuqson himoya sovg'asi.",
      ru: 'Награда за крепкие знания и блестящую игру.',
      en: 'Reward for rock-solid knowledge and mastery.',
    },
  },
  {
    id: 'wizard_owl',
    icon: '🦉',
    rarity: 'epic',
    xpBonus: 65,
    name: {
      uz: "Donishmand Boyo'g'li",
      ru: 'Мудрая Сова',
      en: 'Sage Owl',
    },
    desc: {
      uz: "Chuqur tafakkur va mantiqiy g'alaba nishoni.",
      ru: 'Знак глубокого мышления и логической победы.',
      en: 'Badge of sharp logic and deep insight.',
    },
  },
  {
    id: 'lightning_quill',
    icon: '⚡',
    rarity: 'rare',
    xpBonus: 55,
    name: {
      uz: 'Chaqmoq Zehn',
      ru: 'Молниеносный Ум',
      en: 'Lightning Spark',
    },
    desc: {
      uz: "Raqiblardan bir qadam oldinda bo'lgan g'olibga.",
      ru: 'Победителю, опередившему соперников на шаг.',
      en: 'Awarded to champions one step ahead of rivals.',
    },
  },
  {
    id: 'genius_compass',
    icon: '🧭',
    rarity: 'rare',
    xpBonus: 50,
    name: {
      uz: 'Daho Kompasi',
      ru: 'Компас Гения',
      en: 'Genius Compass',
    },
    desc: {
      uz: "Har doim to'g'ri yo'lni topuvchi bilimdon sovg'asi.",
      ru: 'Подарок знатоку, всегда находящему верный путь.',
      en: 'Gift for scholars who always find the right solution.',
    },
  },
  {
    id: 'cosmic_book',
    icon: '📚',
    rarity: 'epic',
    xpBonus: 75,
    name: {
      uz: 'Oltin Ensiklopediya',
      ru: 'Золотая Энциклопедия',
      en: 'Golden Encyclopedia',
    },
    desc: {
      uz: "Fanlar bo'yicha bilim xazinasi sovg'asi.",
      ru: 'Сокровищница знаний по учебным предметам.',
      en: 'Treasure trove of subject mastery.',
    },
  },
];

export interface AchievementDefinition {
  id: string;
  icon: string;
  title: Record<Language, string>;
  desc: Record<Language, string>;
  checkUnlocked: (stats: {
    wins: number;
    matchesPlayed: number;
    totalCorrect: number;
    xp: number;
    giftsCount: number;
    level: number;
  }) => boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first_step',
    icon: '🌟',
    title: { uz: 'Ilk Qadam', ru: 'Первый шаг', en: 'First Step' },
    desc: { uz: "Ilk o'yinni yakunlang", ru: 'Завершите 1-ю игру', en: 'Complete 1st match' },
    checkUnlocked: (s) => s.matchesPlayed >= 1,
  },
  {
    id: 'first_victory',
    icon: '🏆',
    title: { uz: "Birinchi G'alaba", ru: 'Первая победа', en: 'First Victory' },
    desc: { uz: "1 marta g'olib bo'ling", ru: 'Выиграйте 1 матч', en: 'Win 1 match' },
    checkUnlocked: (s) => s.wins >= 1,
  },
  {
    id: 'triple_win',
    icon: '🔥',
    title: { uz: '3x Chempion', ru: '3x Чемпион', en: '3x Champion' },
    desc: { uz: "3 ta bellashuvda g'alaba qozoning", ru: 'Выиграйте 3 матча', en: 'Win 3 matches' },
    checkUnlocked: (s) => s.wins >= 3,
  },
  {
    id: 'sharp_mind',
    icon: '🎯',
    title: { uz: "O'tkir Zehn", ru: 'Острый ум', en: 'Sharp Mind' },
    desc: { uz: "15 ta to'g'ri javob bering", ru: 'Дайте 15 верных ответов', en: 'Score 15 right answers' },
    checkUnlocked: (s) => s.totalCorrect >= 15,
  },
  {
    id: 'scholar_50',
    icon: '📘',
    title: { uz: 'Bilim Ustasi', ru: 'Мастер знаний', en: 'Knowledge Master' },
    desc: { uz: "50 ta to'g'ri javob to'plang", ru: 'Дайте 50 верных ответов', en: 'Score 50 right answers' },
    checkUnlocked: (s) => s.totalCorrect >= 50,
  },
  {
    id: 'gift_collector',
    icon: '🎁',
    title: { uz: "Sovg'alar Kolleksiyasi", ru: 'Коллекционер', en: 'Gift Collector' },
    desc: { uz: "3 ta sovg'a yutib oling", ru: 'Получите 3 подарка', en: 'Unlock 3 winner gifts' },
    checkUnlocked: (s) => s.giftsCount >= 3,
  },
  {
    id: 'level_3',
    icon: '🚀',
    title: { uz: '3-Daraja', ru: '3-й уровень', en: 'Level 3' },
    desc: { uz: '3-darajaga chiqing', ru: 'Достигните 3-го уровня', en: 'Reach Level 3' },
    checkUnlocked: (s) => s.level >= 3,
  },
  {
    id: 'level_5',
    icon: '👑',
    title: { uz: 'Grand Ustoz', ru: 'Гранд-мастер', en: 'Grand Scholar' },
    desc: { uz: '5-darajaga chiqing', ru: 'Достигните 5-го уровня', en: 'Reach Level 5' },
    checkUnlocked: (s) => s.level >= 5,
  },
  {
    id: 'marathon_10',
    icon: '⚡',
    title: { uz: 'Faol Ishtirokchi', ru: 'Марафонец', en: 'Arena Regular' },
    desc: { uz: "10 ta o'yin o'ynang", ru: 'Сыграйте 10 матчей', en: 'Play 10 matches' },
    checkUnlocked: (s) => s.matchesPlayed >= 10,
  },
  {
    id: 'xp_500',
    icon: '💎',
    title: { uz: '500 XP Elitasi', ru: 'Элита 500 XP', en: '500 XP Elite' },
    desc: { uz: "500 XP to'plang", ru: 'Наберите 500 XP', en: 'Earn 500 total XP' },
    checkUnlocked: (s) => s.xp >= 500,
  },
  {
    id: 'xp_1200',
    icon: '🛸',
    title: { uz: 'Afsonaviy Bilim', ru: 'Легенда арены', en: 'Arena Legend' },
    desc: { uz: "1200 XP to'plang", ru: 'Наберите 1200 XP', en: 'Earn 1200 total XP' },
    checkUnlocked: (s) => s.xp >= 1200,
  },
  {
    id: 'six_gifts',
    icon: '🏅',
    title: { uz: 'Oltin Xazina', ru: 'Золотой фонд', en: 'Treasure Vault' },
    desc: { uz: "6 ta sovg'ani qo'lga kiriting", ru: 'Соберите 6 подарков', en: 'Collect 6 gifts' },
    checkUnlocked: (s) => s.giftsCount >= 6,
  },
];

export function pickRandomWinnerGift(seedIndex?: number): GiftReward {
  const idx =
    typeof seedIndex === 'number'
      ? Math.abs(seedIndex) % GIFT_CATALOG.length
      : Math.floor(Math.random() * GIFT_CATALOG.length);
  const def = GIFT_CATALOG[idx];
  return {
    id: def.id,
    icon: def.icon,
    rarity: def.rarity,
    xpBonus: def.xpBonus,
    name: def.name,
    desc: def.desc,
    unlockedAt: Date.now(),
  };
}

/**
 * Progressive XP curve matching Levels track:
 * Lv1: 0, Lv2: 120, Lv3: 280, Lv4: 480, Lv5: 720, Lv6: 1000, ...
 */
export function getXpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += 100 + (l - 2) * 50;
  }
  return total;
}

export function getLevelFromXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  let level = 1;
  while (xp >= getXpThresholdForLevel(level + 1) && level < 50) {
    level++;
  }
  const currentLevelXp = getXpThresholdForLevel(level);
  const nextLevelXp = getXpThresholdForLevel(level + 1);
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const gainedInLevel = Math.max(0, xp - currentLevelXp);
  const xpNeededForNext = Math.max(0, nextLevelXp - xp);
  const progressPercent = Math.min(100, Math.round((gainedInLevel / span) * 100));

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpNeededForNext,
    progressPercent,
  };
}
