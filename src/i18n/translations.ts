import { GameType, Language, SubjectId } from '../shared/types';

export interface TranslationDict {
  appName: string;
  tagline: string;
  welcomeBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  createRoom: string;
  joinRoom: string;
  quickSummary: string;
  howItWorksTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  soundOn: string;
  soundOff: string;
  back: string;
  continueBtn: string;
  profileTitle: string;
  profileSubtitle: string;
  yourName: string;
  namePlaceholder: string;
  nameError: string;
  chooseAvatar: string;
  chooseSubject: string;
  subjectRequiredHint: string;
  mathAutoNote: string;
  subjectCustomNote: string;
  createRoomTitle: string;
  createRoomSubtitle: string;
  durationLabel: string;
  minutes: string;
  difficultyLabel: string;
  easy: string;
  medium: string;
  hard: string;
  questionSourceLabel: string;
  autoQuestions: string;
  customQuestions: string;
  mathInputLabel: string;
  choiceMode: string;
  numericMode: string;
  wrongPenaltyLabel: string;
  penaltyOff: string;
  penaltyOn: string;
  shuffleLabel: string;
  openLobby: string;
  joinRoomTitle: string;
  joinRoomSubtitle: string;
  enterRoomCode: string;
  joinNow: string;
  roomNotFound: string;
  roomFull: string;
  roomAlreadyStarted: string;
  lobbyTitle: string;
  roomCodeLabel: string;
  copyCode: string;
  copied: string;
  shareLink: string;
  linkCopied: string;
  duelReadyCount: string;
  player1Label: string;
  player2Label: string;
  waitingOpponent: string;
  youBadge: string;
  hostBadge: string;
  switchSide: string;
  kickOpponent: string;
  chooseGameTitle: string;
  activeSubjectLabel: string;
  changeSubject: string;
  addCustomQuestion: string;
  customQuestionsCountLabel: string;
  needOpponentHint: string;
  readyToStartHint: string;
  startDuel: string;
  waitingHostStart: string;
  leaveRoom: string;
  countdownGo: string;
  pausedTitle: string;
  pausedDesc: string;
  resumeGame: string;
  endGameNow: string;
  pauseGame: string;
  reconnecting: string;
  opponentDisconnected: string;
  opponentReconnected: string;
  hostLeftClosed: string;
  kickedMessage: string;
  correctFeedback: string;
  wrongFeedback: string;
  streakBonus: string;
  submitAnswer: string;
  typeNumberPlaceholder: string;
  roundLabel: string;
  firstAnswered: string;
  waitingNextRound: string;
  lockedThisRound: string;
  finishLine: string;
  stepsLabel: string;
  ropeCenter: string;
  resultsWinnerPrefix: string;
  resultsDraw: string;
  winReasonScore: string;
  winReasonRope: string;
  winReasonRace: string;
  winReasonRounds: string;
  winReasonAccuracy: string;
  winReasonHostEnded: string;
  playerCol: string;
  correctCol: string;
  wrongCol: string;
  accuracyCol: string;
  streakCol: string;
  scoreCol: string;
  mvpLabel: string;
  playAgain: string;
  changeGameReturnLobby: string;
  backHome: string;
  customModalTitle: string;
  questionTextLabel: string;
  questionTextPlaceholder: string;
  optionLabel: string;
  correctOptionHint: string;
  saveQuestion: string;
  close: string;
  savedQuestionsList: string;
  noCustomQuestionsYet: string;
  subjects: Record<SubjectId, { name: string; desc: string }>;
  games: Record<GameType, { name: string; emoji: string; desc: string }>;
  subjectBattleName: (subjectName: string) => string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  uz: {
    appName: 'BilimJang',
    tagline: "1v1 Ta'limiy Bellashuv",
    welcomeBadge: 'Jonli 1v1 intellektual duel',
    heroTitle: "Bilimingni sinab ko'r — yuzma-yuz bellash!",
    heroSubtitle:
      "Do'sting yoki sinfdoshing bilan bitta xonada yig'il, fanni tanla va 4 xil interaktiv mini-o'yinda real vaqtda musobaqalash.",
    createRoom: 'Xona yaratish',
    joinRoom: 'Xonaga kirish',
    quickSummary: '2 o‘yinchi (1v1) · 9 ta fan · 4 xil mini-o‘yin',
    howItWorksTitle: 'Qanday ishlaydi?',
    step1Title: '1. Profil va fan tanla',
    step1Desc: "Ism, avatar va o'zing yoqtirgan fanni belgilab duelga tayyorlan.",
    step2Title: '2. Xona kodi bilan ulan',
    step2Desc: "Xona yaratib 6 belgili kodni raqibingga yubor — ikki kishi yetarli!",
    step3Title: '3. Real vaqtda g‘olib bo‘l',
    step3Desc: "Bir vaqtda boshlanadigan savollarga tez va aniq javob berib raqibingni yut.",
    soundOn: 'Ovoz yoqilgan',
    soundOff: "Ovoz o'chirilgan",
    back: 'Orqaga',
    continueBtn: 'Davom etish',
    profileTitle: 'Profil va fan tanlash',
    profileSubtitle: "Bellashuvda ko'rinadigan isming, avataring va fanni tanla.",
    yourName: 'Ismingiz',
    namePlaceholder: 'Masalan: Jasur',
    nameError: "Ism kamida 2 ta, ko'pi bilan 15 ta belgidan iborat bo'lishi kerak.",
    chooseAvatar: 'Avatar tanlang',
    chooseSubject: 'Fanni tanlang (majburiy)',
    subjectRequiredHint: "O'yin savollari tanlangan fanga qarab beriladi.",
    mathAutoNote: 'Matematika savollari qiyinlikka qarab avtomatik yaratiladi.',
    subjectCustomNote: "20 ta tayyor savol + o'z savollaringizni qo'shish imkoniyati.",
    createRoomTitle: '1v1 Xona sozlamalari',
    createRoomSubtitle: "Siz 1-o'yinchi sifatida xonani boshqarasiz va raqib bilan bellashasiz.",
    durationLabel: 'Bellashuv vaqti',
    minutes: 'daqiqa',
    difficultyLabel: 'Qiyinlik darajasi',
    easy: 'Oson',
    medium: "O'rta",
    hard: 'Qiyin',
    questionSourceLabel: 'Savollar manbai',
    autoQuestions: 'Avtomatik / Tayyor baza',
    customQuestions: "Faqat o'z savollarim",
    mathInputLabel: 'Matematika javob usuli',
    choiceMode: 'A/B/C/D variantlar',
    numericMode: 'Raqam kiritish',
    wrongPenaltyLabel: 'Xato javob jarimasi',
    penaltyOff: '0 ball (jarimasiz)',
    penaltyOn: '-2 ball jarima',
    shuffleLabel: 'Savollarni aralashtirish',
    openLobby: 'Kutish zalini ochish',
    joinRoomTitle: 'Xonaga kirish',
    joinRoomSubtitle: "Raqibingiz yuborgan 6 belgili xona kodini kiriting.",
    enterRoomCode: 'Xona kodi',
    joinNow: 'Duelga qo‘shilish',
    roomNotFound: 'Bunday kodli xona topilmadi. Kodni tekshiring.',
    roomFull: "Xona to'lgan (2/2 o'yinchi allaqachon xonada).",
    roomAlreadyStarted: "Bu xonada o'yin allaqachon boshlangan.",
    lobbyTitle: 'Bellashuv kutish zali',
    roomCodeLabel: 'Xona kodi',
    copyCode: 'Nusxalash',
    copied: 'Nusxalandi',
    shareLink: 'Havolani ulashish',
    linkCopied: 'Havola nusxalandi',
    duelReadyCount: "O'yinchilar",
    player1Label: '1-O‘YINCHI (KO‘K)',
    player2Label: '2-O‘YINCHI (OLOV)',
    waitingOpponent: 'Raqib kutilmoqda...',
    youBadge: 'Siz',
    hostBadge: 'Xona egasi',
    switchSide: "Tomonni almashtirish",
    kickOpponent: 'Chiqarib yuborish',
    chooseGameTitle: "O'yin turini tanlang",
    activeSubjectLabel: 'Tanlangan fan',
    changeSubject: 'Fanni almashtirish',
    addCustomQuestion: "Savol qo'shish",
    customQuestionsCountLabel: "Qo'shilgan savollar",
    needOpponentHint: "Bellashuvni boshlash uchun 2-o'yinchi (raqib) qo'shilishi kerak.",
    readyToStartHint: 'Ikkala raqib ham tayyor! Boshlash uchun bosing.',
    startDuel: "Bellashuvni boshlash",
    waitingHostStart: "Xona egasi o'yinni boshlashini kuting...",
    leaveRoom: 'Xonadan chiqish',
    countdownGo: 'BOSHLANDI!',
    pausedTitle: "O'yin to'xtatildi",
    pausedDesc: "Xona egasi bellashuvni vaqtincha pauza qildi.",
    resumeGame: 'Davom ettirish',
    endGameNow: 'Tugatish',
    pauseGame: 'Pauza',
    reconnecting: 'Aloqa tiklanmoqda...',
    opponentDisconnected: 'Raqib internetdan uzildi (30 soniya kutilmoqda)...',
    opponentReconnected: 'Raqib qayta ulandi!',
    hostLeftClosed: 'Xona egasi chiqib ketgani uchun xona yopildi.',
    kickedMessage: 'Siz xona egasi tomonidan chiqarildingiz.',
    correctFeedback: "To'g'ri! +10",
    wrongFeedback: 'Xato!',
    streakBonus: 'SERIYA! +5',
    submitAnswer: 'Yuborish',
    typeNumberPlaceholder: 'Javobni yozing...',
    roundLabel: 'Raund',
    firstAnswered: 'birinchi topdi!',
    waitingNextRound: 'Keyingi savol chiqmoqda...',
    lockedThisRound: 'Bu raundda xato qildingiz — raqib javobi kutilmoqda.',
    finishLine: 'Marra',
    stepsLabel: 'qadam',
    ropeCenter: 'Markaz',
    resultsWinnerPrefix: 'G‘olib:',
    resultsDraw: 'Durrang!',
    winReasonScore: "Ko'proq ball to'pladi",
    winReasonRope: 'Arqonni marra chizig‘idan o‘tkazdi',
    winReasonRace: 'Marraga birinchi yetib keldi',
    winReasonRounds: '10 raund yakuni bo‘yicha g‘alaba',
    winReasonAccuracy: "Ballar teng, ko'proq to'g'ri javob bilan g'alaba",
    winReasonHostEnded: 'Xona egasi o‘yinni yakunladi',
    playerCol: "O'yinchi",
    correctCol: "To'g'ri",
    wrongCol: 'Xato',
    accuracyCol: 'Aniqlik',
    streakCol: 'Seriya',
    scoreCol: 'Ball',
    mvpLabel: 'Eng yaxshi',
    playAgain: 'Qayta bellashish',
    changeGameReturnLobby: 'Boshqa o‘yin tanlash',
    backHome: 'Bosh sahifa',
    customModalTitle: 'Yangi savol qo‘shish',
    questionTextLabel: 'Savol matni',
    questionTextPlaceholder: 'Savolni kiriting...',
    optionLabel: 'Variant',
    correctOptionHint: "To'g'ri javobni belgilang",
    saveQuestion: 'Saqlash',
    close: 'Yopish',
    savedQuestionsList: "Qo'shilgan savollar ro'yxati",
    noCustomQuestionsYet: "Hozircha shaxsiy savol qo'shilmagan.",
    subjects: {
      math: { name: 'Matematika', desc: 'Avtomatik misollar va tenglamalar' },
      physics: { name: 'Fizika', desc: 'Qonunlar, kuch va energiya' },
      chemistry: { name: 'Kimyo', desc: 'Elementlar, formulalar va reaksiyalar' },
      biology: { name: 'Biologiya', desc: 'Hujayra, tabiat va anatomiya' },
      english: { name: 'Ingliz tili', desc: 'Grammatika, lug‘at va idiomalar' },
      literature: { name: 'Ona tili', desc: 'Adabiyot, imlo va tilshunoslik' },
      history: { name: 'Tarix', desc: 'Buyuk sanalar va allomalar' },
      geography: { name: 'Geografiya', desc: 'Okeanlar, tog‘lar va qit’alar' },
      informatics: { name: 'Informatika', desc: 'Algoritmlar, kod va tarmoqlar' },
    },
    games: {
      subject_battle: {
        name: 'Fan jangi',
        emoji: '⚔️',
        desc: 'To‘g‘ri javoblar va 3x seriya bonusi bilan ball yig‘ish dueli.',
      },
      tug_of_war: {
        name: 'Arqon tortish',
        emoji: '🪢',
        desc: 'Har bir to‘g‘ri javob arqonni o‘zingiz tomonga tortadi.',
      },
      race: {
        name: 'Tezkor poyga',
        emoji: '🏎️',
        desc: 'To‘g‘ri javob mashinangizni marraga yaqinlashtiradi.',
      },
      quick_answer: {
        name: 'Tezkor javob',
        emoji: '⚡',
        desc: 'Ikkala raqibga bir xil savol: kim birinchi topsa, ball uniki!',
      },
    },
    subjectBattleName: (subjectName) => `${subjectName} jangi`,
  },
  ru: {
    appName: 'BilimJang',
    tagline: 'Учебная дуэль 1 на 1',
    welcomeBadge: 'Интеллектуальная дуэль 1v1',
    heroTitle: 'Проверь знания — сразись один на один!',
    heroSubtitle:
      'Соберитесь вдвоём в одной комнате, выберите предмет и соревнуйтесь в реальном времени в 4 интерактивных мини-играх.',
    createRoom: 'Создать комнату',
    joinRoom: 'Войти в комнату',
    quickSummary: '2 игрока (1v1) · 9 предметов · 4 мини-игры',
    howItWorksTitle: 'Как это работает?',
    step1Title: '1. Выбери профиль и предмет',
    step1Desc: 'Укажи имя, аватар и предмет, по которому пройдёт поединок.',
    step2Title: '2. Подключись по коду',
    step2Desc: 'Отправь 6-значный код сопернику — для старта нужны только двое.',
    step3Title: '3. Побеждай в реальном времени',
    step3Desc: 'Отвечай быстрее и точнее соперника, чтобы забрать победу.',
    soundOn: 'Звук включён',
    soundOff: 'Звук выключен',
    back: 'Назад',
    continueBtn: 'Продолжить',
    profileTitle: 'Профиль и выбор предмета',
    profileSubtitle: 'Настройте имя, аватар и обязательный предмет для дуэли.',
    yourName: 'Ваше имя',
    namePlaceholder: 'Например: Тимур',
    nameError: 'Имя должно содержать от 2 до 15 символов.',
    chooseAvatar: 'Выберите аватар',
    chooseSubject: 'Выберите предмет (обязательно)',
    subjectRequiredHint: 'Вопросы игры зависят от выбранного предмета.',
    mathAutoNote: 'Задачи по математике генерируются автоматически.',
    subjectCustomNote: '20 готовых вопросов + возможность добавить свои.',
    createRoomTitle: 'Настройки комнаты 1v1',
    createRoomSubtitle: 'Вы выступаете как Игрок 1 и управляете настройками дуэли.',
    durationLabel: 'Длительность дуэли',
    minutes: 'мин',
    difficultyLabel: 'Сложность',
    easy: 'Лёгкая',
    medium: 'Средняя',
    hard: 'Сложная',
    questionSourceLabel: 'Источник вопросов',
    autoQuestions: 'Авто / Готовая база',
    customQuestions: 'Только свои вопросы',
    mathInputLabel: 'Формат ответа по математике',
    choiceMode: 'Варианты A/B/C/D',
    numericMode: 'Ввод числа',
    wrongPenaltyLabel: 'Штраф за ошибку',
    penaltyOff: '0 очков (без штрафа)',
    penaltyOn: '-2 очка штрафа',
    shuffleLabel: 'Перемешивать вопросы',
    openLobby: 'Открыть лобби',
    joinRoomTitle: 'Вход в комнату',
    joinRoomSubtitle: 'Введите 6-значный код комнаты от вашего соперника.',
    enterRoomCode: 'Код комнаты',
    joinNow: 'Войти в дуэль',
    roomNotFound: 'Комната не найдена. Проверьте код.',
    roomFull: 'Комната заполнена (2/2 игрока уже внутри).',
    roomAlreadyStarted: 'Игра в этой комнате уже началась.',
    lobbyTitle: 'Зал ожидания дуэли',
    roomCodeLabel: 'Код комнаты',
    copyCode: 'Копировать',
    copied: 'Скопировано',
    shareLink: 'Поделиться ссылкой',
    linkCopied: 'Ссылка скопирована',
    duelReadyCount: 'Игроки',
    player1Label: 'ИГРОК 1 (СИНИЙ)',
    player2Label: 'ИГРОК 2 (ОГОНЬ)',
    waitingOpponent: 'Ожидание соперника...',
    youBadge: 'Вы',
    hostBadge: 'Создатель',
    switchSide: 'Сменить сторону',
    kickOpponent: 'Исключить',
    chooseGameTitle: 'Выберите режим игры',
    activeSubjectLabel: 'Выбранный предмет',
    changeSubject: 'Сменить предмет',
    addCustomQuestion: 'Добавить вопрос',
    customQuestionsCountLabel: 'Своих вопросов',
    needOpponentHint: 'Для старта нужен второй игрок (соперник).',
    readyToStartHint: 'Оба игрока готовы! Нажмите для старта.',
    startDuel: 'Начать дуэль',
    waitingHostStart: 'Ожидайте, пока создатель запустит игру...',
    leaveRoom: 'Покинуть комнату',
    countdownGo: 'СТАРТ!',
    pausedTitle: 'Игра на паузе',
    pausedDesc: 'Создатель комнаты временно приостановил дуэль.',
    resumeGame: 'Продолжить',
    endGameNow: 'Завершить',
    pauseGame: 'Пауза',
    reconnecting: 'Восстановление связи...',
    opponentDisconnected: 'Соперник отключился (ожидание 30с)...',
    opponentReconnected: 'Соперник вернулся в игру!',
    hostLeftClosed: 'Комната закрыта, так как создатель вышел.',
    kickedMessage: 'Вы были исключены создателем комнаты.',
    correctFeedback: 'Верно! +10',
    wrongFeedback: 'Ошибка!',
    streakBonus: 'СЕРИЯ! +5',
    submitAnswer: 'Ответить',
    typeNumberPlaceholder: 'Введите число...',
    roundLabel: 'Раунд',
    firstAnswered: 'ответил первым!',
    waitingNextRound: 'Следующий вопрос...',
    lockedThisRound: 'Вы ошиблись в этом раунде — ход у соперника.',
    finishLine: 'Финиш',
    stepsLabel: 'шагов',
    ropeCenter: 'Центр',
    resultsWinnerPrefix: 'Победитель:',
    resultsDraw: 'Ничья!',
    winReasonScore: 'Победа по очкам',
    winReasonRope: 'Канат перетянут за линию победы',
    winReasonRace: 'Финиш пересечён первым',
    winReasonRounds: 'Победа по итогам 10 раундов',
    winReasonAccuracy: 'Ничья по очкам — победа по числу верных ответов',
    winReasonHostEnded: 'Игра завершена создателем',
    playerCol: 'Игрок',
    correctCol: 'Верно',
    wrongCol: 'Ошибки',
    accuracyCol: 'Точность',
    streakCol: 'Серия',
    scoreCol: 'Очки',
    mvpLabel: 'Лучший',
    playAgain: 'Сыграть ещё раз',
    changeGameReturnLobby: 'Выбрать другую игру',
    backHome: 'На главную',
    customModalTitle: 'Добавить свой вопрос',
    questionTextLabel: 'Текст вопроса',
    questionTextPlaceholder: 'Введите вопрос...',
    optionLabel: 'Вариант',
    correctOptionHint: 'Отметьте правильный ответ',
    saveQuestion: 'Сохранить',
    close: 'Закрыть',
    savedQuestionsList: 'Добавленные вопросы',
    noCustomQuestionsYet: 'Своих вопросов пока нет.',
    subjects: {
      math: { name: 'Математика', desc: 'Автогенерация примеров и уравнений' },
      physics: { name: 'Физика', desc: 'Законы, сила и энергия' },
      chemistry: { name: 'Химия', desc: 'Элементы, формулы и реакции' },
      biology: { name: 'Биология', desc: 'Клетка, природа и анатомия' },
      english: { name: 'Английский язык', desc: 'Грамматика, лексика и идиомы' },
      literature: { name: 'Родной язык', desc: 'Литература и языкознание' },
      history: { name: 'История', desc: 'Великие даты и мыслители' },
      geography: { name: 'География', desc: 'Океаны, горы и континенты' },
      informatics: { name: 'Информатика', desc: 'Алгоритмы, код и сети' },
    },
    games: {
      subject_battle: {
        name: 'Битва по предмету',
        emoji: '⚔️',
        desc: 'Набирайте очки и бонусы +5 за серию из 3 верных ответов.',
      },
      tug_of_war: {
        name: 'Перетягивание каната',
        emoji: '🪢',
        desc: 'Каждый верный ответ тянет канат в вашу сторону.',
      },
      race: {
        name: 'Гонка',
        emoji: '🏎️',
        desc: 'Верные ответы приближают ваш болид к финишу.',
      },
      quick_answer: {
        name: 'Быстрый ответ',
        emoji: '⚡',
        desc: 'Один вопрос обоим игрокам: кто быстрее, тот получает очки!',
      },
    },
    subjectBattleName: (subjectName) => `Битва: ${subjectName}`,
  },
  en: {
    appName: 'BilimJang',
    tagline: '1v1 Knowledge Duel',
    welcomeBadge: 'Live 1v1 Educational Battle',
    heroTitle: 'Test your knowledge — duel head-to-head!',
    heroSubtitle:
      'Meet in a live room with a rival, pick a subject, and compete 1-on-1 across 4 interactive real-time mini-games.',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    quickSummary: '2 players (1v1) · 9 subjects · 4 mini-games',
    howItWorksTitle: 'How it works',
    step1Title: '1. Pick profile & subject',
    step1Desc: 'Set your name, avatar, and the academic subject for the match.',
    step2Title: '2. Connect via room code',
    step2Desc: 'Share the 6-character code with your opponent — only 2 players needed.',
    step3Title: '3. Win in real time',
    step3Desc: 'Answer faster and more accurately than your rival to claim victory.',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    back: 'Back',
    continueBtn: 'Continue',
    profileTitle: 'Profile & Subject',
    profileSubtitle: 'Choose your display name, avatar, and required duel subject.',
    yourName: 'Your Name',
    namePlaceholder: 'e.g. Alex',
    nameError: 'Name must be between 2 and 15 characters.',
    chooseAvatar: 'Choose Avatar',
    chooseSubject: 'Choose Subject (Required)',
    subjectRequiredHint: 'Match questions are driven by your chosen subject.',
    mathAutoNote: 'Math problems are automatically generated by difficulty.',
    subjectCustomNote: '20 curated questions + add your own custom questions.',
    createRoomTitle: '1v1 Room Settings',
    createRoomSubtitle: 'You play as Player 1 and manage the duel configuration.',
    durationLabel: 'Match Duration',
    minutes: 'min',
    difficultyLabel: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    questionSourceLabel: 'Question Source',
    autoQuestions: 'Auto / Curated Bank',
    customQuestions: 'Custom Questions Only',
    mathInputLabel: 'Math Answer Input',
    choiceMode: 'A/B/C/D Choices',
    numericMode: 'Numeric Input',
    wrongPenaltyLabel: 'Wrong Answer Penalty',
    penaltyOff: '0 pts (No penalty)',
    penaltyOn: '-2 pts penalty',
    shuffleLabel: 'Shuffle Questions',
    openLobby: 'Open Lobby',
    joinRoomTitle: 'Join a Duel Room',
    joinRoomSubtitle: 'Enter the 6-character room code shared by your opponent.',
    enterRoomCode: 'Room Code',
    joinNow: 'Join Duel',
    roomNotFound: 'Room not found. Please check the code.',
    roomFull: 'Room is full (2/2 players already inside).',
    roomAlreadyStarted: 'The match in this room has already started.',
    lobbyTitle: 'Duel Waiting Lobby',
    roomCodeLabel: 'Room Code',
    copyCode: 'Copy',
    copied: 'Copied',
    shareLink: 'Share Link',
    linkCopied: 'Link Copied',
    duelReadyCount: 'Players',
    player1Label: 'PLAYER 1 (BLUE)',
    player2Label: 'PLAYER 2 (FLAME)',
    waitingOpponent: 'Waiting for opponent...',
    youBadge: 'You',
    hostBadge: 'Host',
    switchSide: 'Switch Side',
    kickOpponent: 'Remove',
    chooseGameTitle: 'Select Mini-Game',
    activeSubjectLabel: 'Active Subject',
    changeSubject: 'Change Subject',
    addCustomQuestion: 'Add Question',
    customQuestionsCountLabel: 'Custom questions',
    needOpponentHint: 'Waiting for Player 2 to join before starting.',
    readyToStartHint: 'Both duelists ready! Click to begin.',
    startDuel: 'Start Duel',
    waitingHostStart: 'Waiting for the host to start the duel...',
    leaveRoom: 'Leave Room',
    countdownGo: 'GO!',
    pausedTitle: 'Duel Paused',
    pausedDesc: 'The host temporarily paused the match.',
    resumeGame: 'Resume',
    endGameNow: 'End Match',
    pauseGame: 'Pause',
    reconnecting: 'Reconnecting...',
    opponentDisconnected: 'Opponent disconnected (30s grace window)...',
    opponentReconnected: 'Opponent reconnected!',
    hostLeftClosed: 'Room closed because the host left.',
    kickedMessage: 'You were removed by the room host.',
    correctFeedback: 'Correct! +10',
    wrongFeedback: 'Wrong!',
    streakBonus: 'STREAK! +5',
    submitAnswer: 'Submit',
    typeNumberPlaceholder: 'Type number...',
    roundLabel: 'Round',
    firstAnswered: 'scored first!',
    waitingNextRound: 'Loading next question...',
    lockedThisRound: 'Wrong answer — opponent can steal this round.',
    finishLine: 'Finish',
    stepsLabel: 'steps',
    ropeCenter: 'Center',
    resultsWinnerPrefix: 'Winner:',
    resultsDraw: 'Draw!',
    winReasonScore: 'Won by higher score',
    winReasonRope: 'Pulled the rope past the victory mark',
    winReasonRace: 'Crossed the finish line first',
    winReasonRounds: 'Won after 10 quick-answer rounds',
    winReasonAccuracy: 'Tied score — won by more correct answers',
    winReasonHostEnded: 'Match ended by host',
    playerCol: 'Player',
    correctCol: 'Correct',
    wrongCol: 'Wrong',
    accuracyCol: 'Accuracy',
    streakCol: 'Streak',
    scoreCol: 'Score',
    mvpLabel: 'MVP',
    playAgain: 'Play Again',
    changeGameReturnLobby: 'Choose Another Game',
    backHome: 'Home',
    customModalTitle: 'Add Custom Question',
    questionTextLabel: 'Question Text',
    questionTextPlaceholder: 'Enter your question...',
    optionLabel: 'Option',
    correctOptionHint: 'Mark the correct answer',
    saveQuestion: 'Save Question',
    close: 'Close',
    savedQuestionsList: 'Saved Questions',
    noCustomQuestionsYet: 'No custom questions added yet.',
    subjects: {
      math: { name: 'Mathematics', desc: 'Auto-generated equations & drills' },
      physics: { name: 'Physics', desc: 'Laws, forces, and energy' },
      chemistry: { name: 'Chemistry', desc: 'Elements, formulas, and reactions' },
      biology: { name: 'Biology', desc: 'Cells, nature, and anatomy' },
      english: { name: 'English', desc: 'Grammar, vocabulary, and idioms' },
      literature: { name: 'Native Literature', desc: 'Literature and linguistics' },
      history: { name: 'History', desc: 'Key dates and great scholars' },
      geography: { name: 'Geography', desc: 'Oceans, peaks, and continents' },
      informatics: { name: 'Computer Science', desc: 'Algorithms, code, and networks' },
    },
    games: {
      subject_battle: {
        name: 'Subject Battle',
        emoji: '⚔️',
        desc: 'Score +10 per correct answer and +5 streak bonuses.',
      },
      tug_of_war: {
        name: 'Tug of War',
        emoji: '🪢',
        desc: 'Each correct answer pulls the rope toward your side.',
      },
      race: {
        name: 'Speed Race',
        emoji: '🏎️',
        desc: 'Correct answers boost your racer toward the finish line.',
      },
      quick_answer: {
        name: 'Quick Answer',
        emoji: '⚡',
        desc: 'Same question for both: first right answer wins the round!',
      },
    },
    subjectBattleName: (subjectName) => `${subjectName} Battle`,
  },
};
