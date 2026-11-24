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
  inviteSectionTitle: string;
  inviteLinkLabel: string;
  copyFullInvite: string;
  inviteCopied: string;
  shareTelegram: string;
  shareInstagram: string;
  instagramCopiedHint: string;
  shareMore: string;
  duelReadyCount: string;
  playersCountLabel: string;
  player1Label: string;
  player2Label: string;
  teamALabel: string;
  teamBLabel: string;
  joinThisTeam: string;
  inThisTeam: string;
  waitingOpponent: string;
  youBadge: string;
  hostBadge: string;
  botBadge: string;
  playerDefault: string;
  refereeLabel: string;
  oddCountTitle: string;
  oddCountDesc: string;
  balancedTeamsReady: string;
  addBotBtn: string;
  shuffleTeamsBtn: string;
  switchSide: string;
  kickOpponent: string;
  chooseGameTitle: string;
  activeSubjectLabel: string;
  changeSubject: string;
  addCustomQuestion: string;
  customQuestionsCountLabel: string;
  needOpponentHint: string;
  needBothTeamsHint: string;
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
  resultsTeamAWon: string;
  resultsTeamBWon: string;
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
  buildInviteText: (code: string, subjectName: string, url: string) => string;
}

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  uz: {
    appName: 'BilimJang',
    tagline: "Real vaqtdagi ta'limiy bellashuv",
    welcomeBadge: "1v1, Jamoaviy yoki Bot bilan bellashuv",
    heroTitle: "Bilimingni sinab ko'r — do'stlaring yoki bot bilan bellash!",
    heroSubtitle:
      "Xona yaratib havolani Telegram yoki Instagram orqali ulash — 2 kishi yoki xohlagancha o'yinchi bilan 9 ta fanda 4 xil mini-o'yinda musobaqalash. Raqib topilmasa, BilimBot bilan bellash!",
    createRoom: 'Xona yaratish',
    joinRoom: 'Xonaga kirish',
    quickSummary: "Cheksiz o'yinchi · Bot rejimi · 9 ta fan · 4 xil mini-o'yin",
    howItWorksTitle: 'Qanday ishlaydi?',
    step1Title: '1. Profil va fan tanla',
    step1Desc: "Ism, avatar va o'zing xohlagan fanni belgilab bellashuvga tayyorlan.",
    step2Title: '2. Havola yoki kod ulash',
    step2Desc: "Telegram, Instagram orqali kod + ilova havolasini tashla yoki BilimBot qo'sh!",
    step3Title: '3. Real vaqtda g‘olib bo‘l',
    step3Desc: "Bir vaqtda boshlanadigan savollarga tez va aniq javob berib g'alaba qozon.",
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
    createRoomTitle: 'Xona sozlamalari',
    createRoomSubtitle: "Siz xona egasi sifatida o'yinni boshqarasiz va o'zingiz ham qatnashasiz.",
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
    joinRoomSubtitle: "Yuborilgan 6 belgili xona kodini kiriting.",
    enterRoomCode: 'Xona kodi',
    joinNow: 'Bellashuvga qo‘shilish',
    roomNotFound: 'Bunday kodli xona topilmadi. Kodni tekshiring.',
    roomFull: "Xona to'lgan.",
    roomAlreadyStarted: "Bu xonada o'yin allaqachon boshlangan.",
    lobbyTitle: 'Bellashuv kutish zali',
    roomCodeLabel: 'Xona kodi',
    copyCode: 'Kodni nusxalash',
    copied: 'Nusxalandi',
    shareLink: 'Havolani nusxalash',
    linkCopied: 'Havola nusxalandi',
    inviteSectionTitle: 'Do‘stlarni taklif qilish (Kod + Ilova havolasi)',
    inviteLinkLabel: 'Ilova silkasi',
    copyFullInvite: 'Kod + Havolani nusxalash',
    inviteCopied: 'Kod va havola nusxalandi!',
    shareTelegram: 'Telegramga tashlash',
    shareInstagram: 'Instagramga tashlash',
    instagramCopiedHint: 'Kod va ilova havolasi nusxalandi! Endi Instagram Direct yoki Stories ga tashlang.',
    shareMore: 'Boshqa ilovalar',
    duelReadyCount: "o'yinchi",
    playersCountLabel: "Xonadagi o'yinchilar",
    player1Label: 'KO‘K JAMOA (A)',
    player2Label: 'OLOV JAMOA (B)',
    teamALabel: 'Ko‘k jamoa',
    teamBLabel: 'Olov jamoa',
    joinThisTeam: "Shu jamoaga o'tish",
    inThisTeam: 'Siz shu jamoadasiz',
    waitingOpponent: "Raqib kutilmoqda — havolani ulashing yoki Bot qo'shing!",
    youBadge: 'Siz',
    hostBadge: 'Xona egasi',
    botBadge: 'Bot',
    playerDefault: "O'yinchi",
    refereeLabel: 'Hakam',
    oddCountTitle: "Jamoalar soni toq! Yana 1 kishi qo'shish havolasi",
    oddCountDesc: "Hozir toq sonli ishtirokchi bor. Teng jamoalar bo'lishi uchun yana 1 kishini havola orqali chaqiring yoki Bot qo'shing!",
    balancedTeamsReady: "Jamoalar teng bo'lindi — bellashuvga tayyor!",
    addBotBtn: "Bot qo'shish 🤖",
    shuffleTeamsBtn: 'Tasodifiy taqsimlash',
    switchSide: "Tomonni almashtirish",
    kickOpponent: 'Chiqarish',
    chooseGameTitle: "O'yin turini tanlang",
    activeSubjectLabel: 'Tanlangan fan',
    changeSubject: 'Fanni almashtirish',
    addCustomQuestion: "Savol qo'shish",
    customQuestionsCountLabel: "Qo'shilgan savollar",
    needOpponentHint: "Boshlash uchun kamida 2 ta ishtirokchi kerak (do'stingizni chaqiring yoki Bot qo'shing).",
    needBothTeamsHint: "Ikkala jamoada ham kamida 1 tadan o'yinchi bo'lishi kerak.",
    readyToStartHint: 'Ishtirokchilar tayyor! Bellashuvni boshlash uchun bosing.',
    startDuel: 'Bellashuvni boshlash',
    waitingHostStart: "Xona egasi o'yinni boshlashini kuting...",
    leaveRoom: 'Xonadan chiqish',
    countdownGo: 'BOSHLANDI!',
    pausedTitle: "O'yin to'xtatildi",
    pausedDesc: "Xona egasi bellashuvni vaqtincha pauza qildi.",
    resumeGame: 'Davom ettirish',
    endGameNow: 'Tugatish',
    pauseGame: 'Pauza',
    reconnecting: 'Aloqa tiklanmoqda...',
    opponentDisconnected: "Ishtirokchilardan biri uzildi (30 soniya kutilmoqda)...",
    opponentReconnected: "O'yinchi qayta ulandi!",
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
    lockedThisRound: 'Bu raundda xato qildingiz — boshqalar javobi kutilmoqda.',
    finishLine: 'Marra',
    stepsLabel: 'qadam',
    ropeCenter: 'Markaz',
    resultsWinnerPrefix: 'G‘olib:',
    resultsTeamAWon: 'KO‘K JAMOA YUTDI!',
    resultsTeamBWon: 'OLOV JAMOA YUTDI!',
    resultsDraw: 'Durrang!',
    winReasonScore: "Ko'proq ball to'pladi",
    winReasonRope: "Arqonni marra chizig'idan o'tkazdi",
    winReasonRace: 'Marraga birinchi yetib keldi',
    winReasonRounds: "10 raund yakuni bo'yicha g'alaba",
    winReasonAccuracy: "Ballar teng, ko'proq to'g'ri javob bilan g'alaba",
    winReasonHostEnded: "Xona egasi o'yinni yakunladi",
    playerCol: "O'yinchi",
    correctCol: "To'g'ri",
    wrongCol: 'Xato',
    accuracyCol: 'Aniqlik',
    streakCol: 'Seriya',
    scoreCol: 'Ball',
    mvpLabel: 'Eng yaxshi',
    playAgain: 'Qayta bellashish',
    changeGameReturnLobby: "Boshqa o'yin tanlash",
    backHome: 'Bosh sahifa',
    customModalTitle: "Yangi savol qo'shish",
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
        desc: "To'g'ri javoblar va 3x seriya bonusi bilan ball yig'ish jangi.",
      },
      tug_of_war: {
        name: 'Arqon tortish',
        emoji: '🪢',
        desc: "Har bir to'g'ri javob arqonni jamoangiz tomonga tortadi.",
      },
      race: {
        name: 'Tezkor poyga',
        emoji: '🏎️',
        desc: "To'g'ri javob jamoa mashinasini marraga yaqinlashtiradi.",
      },
      quick_answer: {
        name: 'Tezkor javob',
        emoji: '⚡',
        desc: 'Hammaga bir xil savol: kim birinchi topsa, ball uniki!',
      },
    },
    subjectBattleName: (subjectName) => `${subjectName} jangi`,
    buildInviteText: (code, subjectName, url) =>
      `BilimJang bellashuviga qo'shiling!\nFan: ${subjectName}\nXona kodi: ${code}\nIlova havolasi: ${url}`,
  },
  ru: {
    appName: 'БитваЗнаний',
    tagline: 'Учебная битва в реальном времени',
    welcomeBadge: '1v1, команды или дуэль с ботом',
    heroTitle: 'Проверь знания — сразись с друзьями или с ботом!',
    heroSubtitle:
      'Создай комнату, отправь ссылку в Telegram или Instagram и соревнуйся в 4 мини-играх. Нет соперника рядом? Вызови на дуэль БилимБота!',
    createRoom: 'Создать комнату',
    joinRoom: 'Войти в комнату',
    quickSummary: 'Сколько угодно игроков · Режим с ботом · 9 предметов · 4 игры',
    howItWorksTitle: 'Как это работает?',
    step1Title: '1. Выбери профиль и предмет',
    step1Desc: 'Укажи имя, аватар и обязательный предмет для поединка.',
    step2Title: '2. Поделись ссылкой или кодом',
    step2Desc: 'Отправь код и ссылку в Telegram / Instagram или добавь БилимБота.',
    step3Title: '3. Побеждай в реальном времени',
    step3Desc: 'Отвечай быстрее и точнее соперников, чтобы забрать победу.',
    soundOn: 'Звук включён',
    soundOff: 'Звук выключен',
    back: 'Назад',
    continueBtn: 'Продолжить',
    profileTitle: 'Профиль и выбор предмета',
    profileSubtitle: 'Настройте имя, аватар и обязательный предмет.',
    yourName: 'Ваше имя',
    namePlaceholder: 'Например: Тимур',
    nameError: 'Имя должно содержать от 2 до 15 символов.',
    chooseAvatar: 'Выберите аватар',
    chooseSubject: 'Выберите предмет (обязательно)',
    subjectRequiredHint: 'Вопросы игры зависят от выбранного предмета.',
    mathAutoNote: 'Задачи по математике генерируются автоматически.',
    subjectCustomNote: '20 готовых вопросов + возможность добавить свои.',
    createRoomTitle: 'Настройки комнаты',
    createRoomSubtitle: 'Вы создаёте комнату, управляете настройками и участвуете в игре.',
    durationLabel: 'Длительность игры',
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
    joinRoomSubtitle: 'Введите 6-значный код комнаты.',
    enterRoomCode: 'Код комнаты',
    joinNow: 'Войти в игру',
    roomNotFound: 'Комната не найдена. Проверьте код.',
    roomFull: 'Комната заполнена.',
    roomAlreadyStarted: 'Игра в этой комнате уже началась.',
    lobbyTitle: 'Зал ожидания',
    roomCodeLabel: 'Код комнаты',
    copyCode: 'Копировать код',
    copied: 'Скопировано',
    shareLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована',
    inviteSectionTitle: 'Пригласить друзей (Код + Ссылка на приложение)',
    inviteLinkLabel: 'Ссылка',
    copyFullInvite: 'Копировать код + ссылку',
    inviteCopied: 'Код и ссылка скопированы!',
    shareTelegram: 'Отправить в Telegram',
    shareInstagram: 'Поделиться в Instagram',
    instagramCopiedHint: 'Код и ссылка скопированы! Вставьте их в Instagram Direct или Stories.',
    shareMore: 'Ещё',
    duelReadyCount: 'игроков',
    playersCountLabel: 'Игроки в комнате',
    player1Label: 'СИНЯЯ КОМАНДА (A)',
    player2Label: 'ОГНЕННАЯ КОМАНДА (B)',
    teamALabel: 'Синяя команда',
    teamBLabel: 'Огненная команда',
    joinThisTeam: 'Перейти в команду',
    inThisTeam: 'Вы в этой команде',
    waitingOpponent: 'Ждём игроков — отправьте ссылку или добавьте Бота!',
    youBadge: 'Вы',
    hostBadge: 'Создатель',
    botBadge: 'Бот',
    playerDefault: 'Игрок',
    refereeLabel: 'Судья',
    oddCountTitle: 'Нечётное число игроков! Ссылка для приглашения',
    oddCountDesc: 'Сейчас команды не равны. Отправьте ссылку ещё 1 участнику или добавьте Бота для равных команд!',
    balancedTeamsReady: 'Команды разделены поровну — готовы к битве!',
    addBotBtn: 'Добавить Бота 🤖',
    shuffleTeamsBtn: 'Случайные команды',
    switchSide: 'Сменить команду',
    kickOpponent: 'Удалить',
    chooseGameTitle: 'Выберите режим игры',
    activeSubjectLabel: 'Выбранный предмет',
    changeSubject: 'Сменить предмет',
    addCustomQuestion: 'Добавить вопрос',
    customQuestionsCountLabel: 'Своих вопросов',
    needOpponentHint: 'Нужно минимум 2 участника (позовите друга или добавьте Бота).',
    needBothTeamsHint: 'В каждой команде должен быть хотя бы 1 игрок.',
    readyToStartHint: 'Все готовы! Нажмите для старта.',
    startDuel: 'Начать битву',
    waitingHostStart: 'Ожидайте, пока создатель запустит игру...',
    leaveRoom: 'Покинуть комнату',
    countdownGo: 'СТАРТ!',
    pausedTitle: 'Игра на паузе',
    pausedDesc: 'Создатель комнаты временно приостановил игру.',
    resumeGame: 'Продолжить',
    endGameNow: 'Завершить',
    pauseGame: 'Пауза',
    reconnecting: 'Восстановление связи...',
    opponentDisconnected: 'Один из игроков отключился (ожидание 30с)...',
    opponentReconnected: 'Игрок вернулся в игру!',
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
    lockedThisRound: 'Вы ошиблись в этом раунде — ждём остальных.',
    finishLine: 'Финиш',
    stepsLabel: 'шагов',
    ropeCenter: 'Центр',
    resultsWinnerPrefix: 'Победитель:',
    resultsTeamAWon: 'СИНЯЯ КОМАНДА ПОБЕДИЛА!',
    resultsTeamBWon: 'ОГНЕННАЯ КОМАНДА ПОБЕДИЛА!',
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
        desc: 'Каждый верный ответ тянет канат в сторону вашей команды.',
      },
      race: {
        name: 'Гонка',
        emoji: '🏎️',
        desc: 'Верные ответы приближают болид вашей команды к финишу.',
      },
      quick_answer: {
        name: 'Быстрый ответ',
        emoji: '⚡',
        desc: 'Один вопрос всем игрокам: кто быстрее, тот приносит очки!',
      },
    },
    subjectBattleName: (subjectName) => `Битва: ${subjectName}`,
    buildInviteText: (code, subjectName, url) =>
      `Присоединяйся к БитваЗнаний!\nПредмет: ${subjectName}\nКод комнаты: ${code}\nСсылка: ${url}`,
  },
  en: {
    appName: 'BrainBattle',
    tagline: 'Real-Time Educational Arena',
    welcomeBadge: '1v1, Group Teams, or Battle vs Bot',
    heroTitle: 'Test your knowledge — compete with friends or BrainBot!',
    heroSubtitle:
      'Create a room, share the invite link on Telegram or Instagram, and compete with any number of players across 9 subjects and 4 mini-games. No rival around? Challenge BrainBot!',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    quickSummary: 'Unlimited players · Bot mode · 9 subjects · 4 mini-games',
    howItWorksTitle: 'How it works',
    step1Title: '1. Pick profile & subject',
    step1Desc: 'Set your name, avatar, and required academic subject.',
    step2Title: '2. Share code & app link',
    step2Desc: 'Send the room code + app link via Telegram or Instagram, or add BrainBot.',
    step3Title: '3. Win in real time',
    step3Desc: 'Answer faster and more accurately than rivals to claim victory.',
    soundOn: 'Sound On',
    soundOff: 'Sound Off',
    back: 'Back',
    continueBtn: 'Continue',
    profileTitle: 'Profile & Subject',
    profileSubtitle: 'Choose your display name, avatar, and required subject.',
    yourName: 'Your Name',
    namePlaceholder: 'e.g. Alex',
    nameError: 'Name must be between 2 and 15 characters.',
    chooseAvatar: 'Choose Avatar',
    chooseSubject: 'Choose Subject (Required)',
    subjectRequiredHint: 'Match questions are driven by your chosen subject.',
    mathAutoNote: 'Math problems are automatically generated by difficulty.',
    subjectCustomNote: '20 curated questions + add your own custom questions.',
    createRoomTitle: 'Room Settings',
    createRoomSubtitle: 'You manage the room settings and compete alongside your team.',
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
    joinRoomTitle: 'Join a Room',
    joinRoomSubtitle: 'Enter the 6-character room code shared with you.',
    enterRoomCode: 'Room Code',
    joinNow: 'Join Match',
    roomNotFound: 'Room not found. Please check the code.',
    roomFull: 'Room is full.',
    roomAlreadyStarted: 'The match in this room has already started.',
    lobbyTitle: 'Match Waiting Lobby',
    roomCodeLabel: 'Room Code',
    copyCode: 'Copy Code',
    copied: 'Copied',
    shareLink: 'Copy Link',
    linkCopied: 'Link Copied',
    inviteSectionTitle: 'Invite Players (Room Code + App Link)',
    inviteLinkLabel: 'App Link',
    copyFullInvite: 'Copy Code + Link',
    inviteCopied: 'Code and link copied!',
    shareTelegram: 'Share on Telegram',
    shareInstagram: 'Share on Instagram',
    instagramCopiedHint: 'Code & link copied! Paste into Instagram Direct or Stories.',
    shareMore: 'More Apps',
    duelReadyCount: 'players',
    playersCountLabel: 'Players in room',
    player1Label: 'BLUE TEAM (A)',
    player2Label: 'FLAME TEAM (B)',
    teamALabel: 'Blue Team',
    teamBLabel: 'Flame Team',
    joinThisTeam: 'Join Team',
    inThisTeam: 'Your Team',
    waitingOpponent: 'Waiting for players — share the link or add a Bot!',
    youBadge: 'You',
    hostBadge: 'Host',
    botBadge: 'Bot',
    playerDefault: 'Player',
    refereeLabel: 'Referee',
    oddCountTitle: 'Odd number of players! Invite link to add 1 more',
    oddCountDesc: 'Teams are currently uneven. Share the link to add 1 more player or add BrainBot for balanced teams!',
    balancedTeamsReady: 'Teams are evenly balanced — ready to pull!',
    addBotBtn: 'Add Bot 🤖',
    shuffleTeamsBtn: 'Shuffle Teams',
    switchSide: 'Switch Team',
    kickOpponent: 'Remove',
    chooseGameTitle: 'Select Mini-Game',
    activeSubjectLabel: 'Active Subject',
    changeSubject: 'Change Subject',
    addCustomQuestion: 'Add Question',
    customQuestionsCountLabel: 'Custom questions',
    needOpponentHint: 'At least 2 participants needed (invite friends or add BrainBot).',
    needBothTeamsHint: 'Both teams need at least 1 player to start.',
    readyToStartHint: 'Players ready! Click to start the match.',
    startDuel: 'Start Match',
    waitingHostStart: 'Waiting for the host to start the match...',
    leaveRoom: 'Leave Room',
    countdownGo: 'GO!',
    pausedTitle: 'Match Paused',
    pausedDesc: 'The host temporarily paused the match.',
    resumeGame: 'Resume',
    endGameNow: 'End Match',
    pauseGame: 'Pause',
    reconnecting: 'Reconnecting...',
    opponentDisconnected: 'A player disconnected (30s grace window)...',
    opponentReconnected: 'Player reconnected!',
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
    lockedThisRound: 'Wrong answer — waiting for other players.',
    finishLine: 'Finish',
    stepsLabel: 'steps',
    ropeCenter: 'Center',
    resultsWinnerPrefix: 'Winner:',
    resultsTeamAWon: 'BLUE TEAM WINS!',
    resultsTeamBWon: 'FLAME TEAM WINS!',
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
        desc: 'Each correct answer pulls the rope toward your team.',
      },
      race: {
        name: 'Speed Race',
        emoji: '🏎️',
        desc: 'Correct answers boost your team racer toward the finish line.',
      },
      quick_answer: {
        name: 'Quick Answer',
        emoji: '⚡',
        desc: 'Same question for all: first right answer wins the round!',
      },
    },
    subjectBattleName: (subjectName) => `${subjectName} Battle`,
    buildInviteText: (code, subjectName, url) =>
      `Join my BrainBattle match!\nSubject: ${subjectName}\nRoom Code: ${code}\nApp Link: ${url}`,
  },
};
