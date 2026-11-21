import { Difficulty, PublicQuestion, ServerQuestion, SubjectId } from './types';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildNumericOptions(correct: number, spread = 8): { options: [string, string, string, string]; correctIndex: number } {
  const distractors = new Set<number>();
  const offsets = [-3, -2, -1, 1, 2, 3, -5, 5, -10, 10];
  let safety = 0;

  while (distractors.size < 3 && safety < 100) {
    safety++;
    let candidate: number;
    if (safety < 15) {
      const off = offsets[randInt(0, offsets.length - 1)];
      candidate = correct + off;
    } else {
      candidate = correct + randInt(-spread, spread);
    }
    if (candidate !== correct && (correct >= 0 ? candidate >= 0 : true)) {
      distractors.add(candidate);
    }
  }

  while (distractors.size < 3) {
    distractors.add(correct + distractors.size + 1);
  }

  const all = shuffleArray([correct, ...Array.from(distractors)]);
  const correctIndex = all.indexOf(correct);
  return {
    options: all.map(String) as [string, string, string, string],
    correctIndex,
  };
}

/**
 * Matematika fani uchun qiyinlik darajasiga mos takrorlanmas savollar generatori.
 */
export function generateMathQuestions(difficulty: Difficulty, count: number): ServerQuestion[] {
  const questions: ServerQuestion[] = [];
  const usedTexts = new Set<string>();
  let attempts = 0;

  while (questions.length < count && attempts < count * 20) {
    attempts++;
    let text = '';
    let answer = 0;

    if (difficulty === 'easy') {
      const op = Math.random() < 0.55 ? '+' : '-';
      if (op === '+') {
        const a = randInt(2, 45);
        const b = randInt(2, 35);
        text = `${a} + ${b} = ?`;
        answer = a + b;
      } else {
        const a = randInt(12, 60);
        const b = randInt(2, a - 1);
        text = `${a} - ${b} = ?`;
        answer = a - b;
      }
    } else if (difficulty === 'medium') {
      const kind = randInt(1, 3);
      if (kind === 1) {
        const a = randInt(4, 18);
        const b = randInt(3, 12);
        text = `${a} × ${b} = ?`;
        answer = a * b;
      } else if (kind === 2) {
        const b = randInt(3, 12);
        const ans = randInt(4, 16);
        const a = b * ans;
        text = `${a} ÷ ${b} = ?`;
        answer = ans;
      } else {
        const a = randInt(25, 95);
        const b = randInt(15, 75);
        if (Math.random() < 0.5) {
          text = `${a} + ${b} = ?`;
          answer = a + b;
        } else {
          const big = Math.max(a, b) + 10;
          const small = Math.min(a, b);
          text = `${big} - ${small} = ?`;
          answer = big - small;
        }
      }
    } else {
      const kind = randInt(1, 4);
      if (kind === 1) {
        // Oddiy tenglama: ax + b = c
        const a = randInt(2, 7);
        const x = randInt(2, 12);
        const b = randInt(3, 18);
        const c = a * x + b;
        text = `${a}x + ${b} = ${c},  x = ?`;
        answer = x;
      } else if (kind === 2) {
        // Ko'p amalli ifoda
        const a = randInt(3, 9);
        const b = randInt(4, 11);
        const c = randInt(5, 25);
        text = `${a} × ${b} + ${c} = ?`;
        answer = a * b + c;
      } else if (kind === 3) {
        // Foiz masalasi
        const percents = [10, 20, 25, 50];
        const p = percents[randInt(0, percents.length - 1)];
        const base = randInt(2, 16) * 20;
        text = `${base} ning ${p}% i nechaga teng?`;
        answer = (base * p) / 100;
      } else {
        // Kvadratlar ayirmasi yoki daraja
        const a = randInt(4, 13);
        const b = randInt(2, 9);
        text = `${a}² - ${b} = ?`;
        answer = a * a - b;
      }
    }

    if (usedTexts.has(text)) continue;
    usedTexts.add(text);

    const { options, correctIndex } = buildNumericOptions(answer, difficulty === 'easy' ? 6 : 12);
    questions.push({
      id: `math_${Date.now()}_${questions.length}_${randInt(100, 999)}`,
      subject: 'math',
      text,
      options,
      correctIndex,
      numericAnswer: answer,
      difficulty,
    });
  }

  return questions;
}

type RawQ = [string, [string, string, string, string], number, Difficulty];

const SUBJECT_BANKS: Record<Exclude<SubjectId, 'math'>, RawQ[]> = {
  physics: [
    ["Xalqaro birliklar tizimida (SI) kuchning o'lchov birligi nima?", ['Joul', 'Nyuton', 'Vatt', 'Paskal'], 1, 'easy'],
    ["Yorug'likning vakuumdagi tezligi taxminan nechaga teng?", ['300 000 km/s', '150 000 km/s', '3 000 km/s', '30 000 m/s'], 0, 'easy'],
    ["Suv normal atmosfera bosimida necha gradus Selsiyda qaynaydi?", ['90 °C', '100 °C', '80 °C', '120 °C'], 1, 'easy'],
    ["Elektr tokining kuchi qaysi birlikda o'lchanadi?", ['Volt', 'Om', 'Amper', 'Kulon'], 2, 'easy'],
    ["Nyutonning ikkinchi qonuni formulasi qaysi?", ['F = m · a', 'E = m · c²', 'P = F / S', 'A = F · s'], 0, 'easy'],
    ["Bosimning o'lchov birligi nima?", ['Nyuton', 'Paskal', 'Vatt', 'Gers'], 1, 'easy'],
    ["Yerda erkin tushish tezlanishi taxminan nechaga teng?", ['9.8 m/s²', '6.67 m/s²', '3.14 m/s²', '12.5 m/s²'], 0, 'medium'],
    ["Om qonuni zanjirning bir qismi uchun qanday yoziladi?", ['I = U / R', 'U = I / R', 'R = I · U', 'I = R · U'], 0, 'medium'],
    ["Quvvatning SI tizimidagi o'lchov birligi qaysi?", ['Joul', 'Vatt', 'Volt', 'Tesla'], 1, 'medium'],
    ["Tovush to'lqinlari qaysi muhitda tarqala olmaydi?", ['Suvda', 'Havoda', 'Po‘latda', 'Vakuumda'], 3, 'medium'],
    ["Elektr qarshilik qaysi asbob bilan o'lchanadi?", ['Ampermetr', 'Voltmetr', 'Ommetr', 'Barometr'], 2, 'medium'],
    ["Arximed kuchi nimaga bog'liq?", ['Suyuqlik zichligi va botgan hajmga', 'Faqat jism rangiga', 'Jism haroratiga', 'Faqat jism sirtiga'], 0, 'medium'],
    ["Tebranish chastotasi birligi nima?", ['Sekund', 'Gers', 'Metr', 'Radian'], 1, 'medium'],
    ["Issiqlik miqdori qaysi birlikda o'lchanadi?", ['Kelvin', 'Joul', 'Vatt', 'Paskal'], 1, 'easy'],
    ["Foton qanday zarracha hisoblanadi?", ['Musbat zaryadli', 'Manfiy zaryadli', 'Yorug‘lik kvanti (zaryadsiz)', 'Magnit qutbi'], 2, 'hard'],
    ["Kinetik energiya formulasini toping:", ['Ek = m·v² / 2', 'Ek = m·g·h', 'Ek = k·x² / 2', 'Ek = U·I·t'], 0, 'hard'],
    ["Elektr zaryadning saqlanish qonunida eng kichik elementar zaryad qaysi?", ['Proton va elektron zaryadi', 'Neytron zaryadi', 'Foton zaryadi', 'Atom yadrosi'], 0, 'hard'],
    ["Magnit maydon induksiyasi birligi nima?", ['Veber', 'Tesla', 'Genri', 'Farad'], 1, 'hard'],
    ["Mutlaq nol harorat Selsiy shkalasida nechaga teng?", ['0 °C', '-100 °C', '-273.15 °C', '-459 °C'], 2, 'hard'],
    ["Kondensatorning elektr sig'imi birligi nima?", ['Farad', 'Om', 'Genri', 'Kulon'], 0, 'hard'],
  ],
  chemistry: [
    ["Suv molekulasining kimyoviy formulasi qaysi?", ['H₂O₂', 'H₂O', 'CO₂', 'NaCl'], 1, 'easy'],
    ["Davriy jadvalda kislorodning kimyoviy belgisi nima?", ['K', 'O', 'Os', 'Ox'], 1, 'easy'],
    ["Osh tuzining kimyoviy nomi va formulasi nima?", ['Natriy xlorid (NaCl)', 'Kaliy nitrat (KNO₃)', 'Kalsiy karbonat (CaCO₃)', 'Natriy sulfat (Na₂SO₄)'], 0, 'easy'],
    ["Davriy qonunni kim kashf etgan?", ['D. I. Mendeleyev', 'A. Eynshteyn', 'M. Faradey', 'L. Paster'], 0, 'easy'],
    ["Olmos va grafit qaysi kimyoviy elementning allotropik shakl o'zgarishlaridir?", ['Kremniy', 'Uglerod', 'Azot', 'Fosfor'], 1, 'easy'],
    ["Havoning eng katta qismini (taxminan 78%) qaysi gaz tashkil qiladi?", ['Kislorod', 'Karbonat angidrid', 'Azot', 'Argon'], 2, 'medium'],
    ["Oltinning kimyoviy belgisi qaysi?", ['Ag', 'Au', 'Fe', 'Cu'], 1, 'easy'],
    ["Neytral muhitda eritmaning pH ko'rsatkichi nechaga teng?", ['0', '7', '14', '5'], 1, 'medium'],
    ["Temirning kimyoviy belgisi nima?", ['Ti', 'Te', 'Fe', 'Fr'], 2, 'easy'],
    ["Sulfat kislotaning formulasi qaysi?", ['HCl', 'HNO₃', 'H₂SO₄', 'H₃PO₄'], 2, 'medium'],
    ["Eng yengil kimyoviy element qaysi?", ['Geliy', 'Vodorod', 'Litiy', 'Bor'], 1, 'easy'],
    ["Atom yadrosi tarkibida qaysi zarralar bo'ladi?", ['Faqat elektronlar', 'Proton va neytronlar', 'Elektron va protonlar', 'Faqat neytronlar'], 1, 'medium'],
    ["Xona haroratida suyuq holatda bo'ladigan yagona metall qaysi?", ['Simob', 'Galliy', 'Natriy', 'Qalay'], 0, 'medium'],
    ["Metan gazining kimyoviy formulasi qaysi?", ['C₂H₆', 'CH₄', 'C₂H₄', 'CO'], 1, 'medium'],
    ["Kumushning kimyoviy belgisi qaysi?", ['Si', 'Au', 'Ag', 'Sr'], 2, 'easy'],
    ["Avogadro doimiysi taxminan nechaga teng?", ['6.02 × 10²³ mol⁻¹', '3.14 × 10⁸', '9.8 × 10²', '1.6 × 10⁻¹⁹'], 0, 'hard'],
    ["Kovalent bog'lanish qanday hosil bo'ladi?", ['Elektron juftlari umumlashishi orqali', 'Ionlar tortishishi orqali', 'Yadro bo‘linishi orqali', 'Issiqlik yutilishi orqali'], 0, 'hard'],
    ["Qaysi gaz 'kuldiruvchi gaz' deb ham ataladi?", ['N₂O', 'NO₂', 'NH₃', 'SO₂'], 0, 'hard'],
    ["Oshqozon shirasida ovqat hazm qilishda qaysi kislota qatnashadi?", ['Sirka kislota', 'Xlorid kislota (HCl)', 'Sulfat kislota', 'Limon kislota'], 1, 'hard'],
    ["Mis (Cu) qaysi rangdagi metall hisoblanadi?", ['Kumushrang-oq', 'Qizg‘ish-pushti', 'Zangori', 'Qora'], 1, 'medium'],
  ],
  biology: [
    ["Tirik organizmlarning eng kichik tuzilish va funksional birligi nima?", ['To‘qima', 'Hujayra', 'Organ', 'Molekula'], 1, 'easy'],
    ["O'simliklarda fotosintez jarayoni qaysi organoidda kechadi?", ['Mitoxondriya', 'Xloroplast', 'Ribosoma', 'Golji majmuasi'], 1, 'easy'],
    ["Katta yoshli inson tanasida nechta suyak mavjud?", ['180 ta', '206 ta', '250 ta', '310 ta'], 1, 'easy'],
    ["Qon aylanish tizimining markaziy organi qaysi?", ['O‘pka', 'Jigar', 'Yurak', 'Buyrak'], 2, 'easy'],
    ["Irsiy axborotni saqlovchi molekula qaysi?", ['DNK', 'Kraxmal', 'Glyukoza', 'Lipid'], 0, 'easy'],
    ["Inson qonida kislorodni tashuvchi oqsil nima deb ataladi?", ['Insulin', 'Gemoglobin', 'Kollagen', 'Keratin'], 1, 'medium'],
    ["Hujayraning 'energiya stansiyasi' deb ataladigan organoid qaysi?", ['Yadro', 'Mitoxondriya', 'Lizosoma', 'Vakuola'], 1, 'medium'],
    ["O'simliklar fotosintez jarayonida qaysi gazni yutadi?", ['Azot', 'Kislorod', 'Karbonat angidrid (CO₂)', 'Metan'], 2, 'easy'],
    ["Dunyodagi eng katta sutemizuvchi hayvon qaysi?", ['Afrika fili', 'Ko‘k kit', 'Jirafa', 'Oq ayiq'], 1, 'easy'],
    ["Inson organizmidagi eng katta ichki bez qaysi?", ['Oshqozon osti bezi', 'Jigar', 'Qalqonsimon bez', 'Taloq'], 1, 'medium'],
    ["Qaysi vitamin quyosh nuri ta'sirida terida sintezlanadi?", ['A vitamini', 'C vitamini', 'D vitamini', 'K vitamini'], 2, 'medium'],
    ["Nafas olishda o'pkadan qaysi gaz tashqariga chiqariladi?", ['Kislorod', 'Karbonat angidrid', 'Vodorod', 'Geliy'], 1, 'easy'],
    ["Qon guruhlari kim tomonidan kashf etilgan?", ['Karl Landshteyner', 'Charlz Darvin', 'Gregor Mendel', 'Ivan Pavlov'], 0, 'hard'],
    ["Irsiyat qonunlarini no'xat o'simligida kim o'rgangan?", ['G. Mendel', 'J. Lamark', 'L. Paster', 'R. Guk'], 0, 'medium'],
    ["Odamda nechta juft xromosoma bor?", ['21 juft', '23 juft', '24 juft', '46 juft'], 1, 'medium'],
    ["Asab tizimining asosiy hujayrasi nima deb ataladi?", ['Neyron', 'Eritrotsit', 'Leykotsit', 'Trombosit'], 0, 'medium'],
    ["Qon ivishida qaysi qon shaklli elementlari muhim rol o'ynaydi?", ['Eritrotsitlar', 'Trombositlar', 'Leykotsitlar', 'Limfotsitlar'], 1, 'hard'],
    ["Bakteriyalarni o'rganuvchi fan bo'limi qaysi?", ['Mikologiya', 'Mikrobiologiya', 'Botanika', 'Zoologiya'], 1, 'easy'],
    ["Inson ko'zining rangini qaysi qism belgilaydi?", ['Shox parda', 'Kamalak parda', 'Gavhar', 'To‘r parda'], 1, 'hard'],
    ["Mitoxondriya qaysi jarayon orqali energiya (ATF) hosil qiladi?", ['Fotosintez', 'Hujayra nafas olishi', 'Osmoz', 'Transpiratsiya'], 1, 'hard'],
  ],
  english: [
    ["'Knowledge' so'zining o'zbekcha tarjimasi nima?", ['Kitob', 'Bilim', 'Maktab', 'Tezlik'], 1, 'easy'],
    ["Qaysi gap to'g'ri tuzilgan (Present Simple)?", ['She go to school every day.', 'She goes to school every day.', 'She going to school.', 'She is go to school.'], 1, 'easy'],
    ["'Big' sifatining qiyosiy darajasi (comparative) qaysi?", ['More big', 'Biger', 'Bigger', 'Biggest'], 2, 'easy'],
    ["'Child' so'zining ko'plik (plural) shakli qaysi?", ['Childs', 'Children', 'Childrens', 'Childes'], 1, 'easy'],
    ["Bo'sh joyni to'ldiring: 'I ___ a student.'", ['is', 'are', 'am', 'be'], 2, 'easy'],
    ["'Yesterday' so'zi qaysi zamon bilan ishlatiladi?", ['Future Simple', 'Past Simple', 'Present Continuous', 'Present Perfect'], 1, 'easy'],
    ["'Go' fe'lining o'tgan zamon (Past Simple) shakli nima?", ['Goed', 'Gone', 'Went', 'Going'], 2, 'easy'],
    ["'Apple' so'zi bilan qaysi noaniq artikl ishlatiladi?", ['a', 'an', 'the', 'artikl ishlatilmaydi'], 1, 'easy'],
    ["'Success' so'zining ma'nosi nima?", ['Muvaffaqiyat', 'Xato', 'Savol', 'Do‘stlik'], 0, 'medium'],
    ["To'g'ri predlogni tanlang: 'We have a test ___ Monday.'", ['in', 'at', 'on', 'to'], 2, 'medium'],
    ["'Write' fe'lining uchinchi shakli (V3) qaysi?", ['Wrote', 'Written', 'Writed', 'Writing'], 1, 'medium'],
    ["'Brave' so'zining sinonimini toping:", ['Courageous', 'Afraid', 'Quiet', 'Slow'], 0, 'medium'],
    ["'How ___ water do you drink?' bo'sh joyni to'ldiring:", ['many', 'much', 'few', 'a lot'], 1, 'medium'],
    ["'Library' so'zi nimani anglatadi?", ['Kitob do‘koni', 'Kutubxona', 'Laboratoriya', 'Sinfxona'], 1, 'easy'],
    ["Qaysi gap Present Perfect zamonida?", ['I finished my homework.', 'I have finished my homework.', 'I am finishing my homework.', 'I will finish my homework.'], 1, 'medium'],
    ["'Although' bog'lovchisi nimani bildiradi?", ['Chunki', 'Garchi / ...ga qaramay', 'Shuning uchun', 'Agar'], 1, 'hard'],
    ["Passive Voice (majhul nisbat) gapni toping:", ['He wrote the letter.', 'The letter was written by him.', 'He is writing a letter.', 'She has a letter.'], 1, 'hard'],
    ["'Piece of cake' idiomasi nimani anglatadi?", ['Juda shirin', 'Juda oson ish', 'Qiyin vazifa', 'Tug‘ilgan kun'], 1, 'hard'],
    ["'If it rains, we ___ at home.' (First Conditional)", ['stayed', 'will stay', 'would stay', 'staying'], 1, 'hard'],
    ["'Accurate' so'zining ma'nosi qaysi?", ['Aniq / to‘g‘ri', 'Shoshilinch', 'Qadimiy', 'Oddiy'], 0, 'hard'],
  ],
  literature: [
    ["'Xamsa' asarining o'zbek tilidagi birinchi muallifi kim?", ['Alisher Navoiy', 'Zahiriddin Muhammad Bobur', 'Lutfiy', 'G‘afur G‘ulom'], 0, 'easy'],
    ["O'zbek alifbosida nechta harf va harf birikmasi bor (lotin yozuvida)?", ['26 ta', '29 ta', '33 ta', '35 ta'], 1, 'easy'],
    ["'O'tkan kunlar' romanining muallifi kim?", ['Cho‘lpon', 'Abdulla Qodiriy', 'Oybek', 'Said Ahmad'], 1, 'easy'],
    ["O'zbek tilida nechta unli tovush mavjud?", ['5 ta', '6 ta', '8 ta', '10 ta'], 1, 'easy'],
    ["'Boburnoma' asari qaysi janrda yozilgan?", ['Doston', 'Memuar (esdalik) nasr', 'Komediya', 'Ertak'], 1, 'medium'],
    ["So'zlarning lug'aviy ma'nosini o'rganadigan tilshunoslik bo'limi nima?", ['Fonetika', 'Leksikologiya', 'Sintaksis', 'Morfologiya'], 1, 'medium'],
    ["'Shum bola' qissasining muallifi kim?", ['G‘afur G‘ulom', 'Xudoyberdi To‘xtaboyev', 'O‘tkir Hoshimov', 'Erkin Vohidov'], 0, 'easy'],
    ["Bir xil yozilib, har xil ma'no bildiruvchi so'zlar nima deyiladi?", ['Sinonim', 'Antonim', 'Omonim', 'Paronim'], 2, 'medium'],
    ["'Sariq devni minib' asarining muallifi kim?", ['Xudoyberdi To‘xtaboyev', 'Tohir Malik', 'Oybek', 'Abdulla Qahhor'], 0, 'easy'],
    ["O'zbek tiliga davlat tili maqomi qachon berilgan?", ['1989-yil 21-oktyabr', '1991-yil 1-sentyabr', '1992-yil 8-dekabr', '1993-yil 2-sentyabr'], 0, 'medium'],
    ["'Yaxshi' va 'Yomon' so'zlari o'zaro qanday munosabatda?", ['Sinonim', 'Antonim', 'Omonim', 'Ibora'], 1, 'easy'],
    ["Alisher Navoiyning 'Xamsa'si nechta dostondan iborat?", ['3 ta', '4 ta', '5 ta', '7 ta'], 2, 'easy'],
    ["'Kim?' va 'Nima?' so'roqlariga javob bo'luvchi so'z turkumi qaysi?", ['Sifat', 'Ot', 'Fe’l', 'Ravish'], 1, 'easy'],
    ["'Dunyoning ishlari' asari muallifi kim?", ['O‘tkir Hoshimov', 'Pirimqul Qodirov', 'Odil Yoqubov', 'Chingiz Aytmatov'], 0, 'medium'],
    ["Gap bo'laklarining o'zaro bog'lanishini qaysi bo'lim o'rganadi?", ['Fonetika', 'Sintaksis', 'Orfografiya', 'Punktuatsiya'], 1, 'medium'],
    ["'Kecha va kunduz' romanini kim yozgan?", ['Abdulhamid Cho‘lpon', 'Abdulla Qodiriy', 'Fitrat', 'Hamza'], 0, 'hard'],
    ["'Yulduzli tunlar' romani qaysi tarixiy shaxs hayoti haqida?", ['Amir Temur', 'Mirzo Ulug‘bek', 'Zahiriddin Muhammad Bobur', 'Jaloliddin Manguberdi'], 2, 'medium'],
    ["'Qutadg'u bilig' asarining muallifi kim?", ['Mahmud Koshg‘ariy', 'Yusuf Xos Hojib', 'Ahmad Yugnakiy', 'Ahmad Yassaviy'], 1, 'hard'],
    ["Aruz vaznida qisqa va cho'ziq hijolar almashinuvi nima deb ataladi?", ['Qofiya', 'Radif', 'Bahr', 'Turoq'], 2, 'hard'],
    ["'Devonu lug'otit turk' asarining muallifi kim?", ['Yusuf Xos Hojib', 'Mahmud Koshg‘ariy', 'Alisher Navoiy', 'Beruniy'], 1, 'hard'],
  ],
  history: [
    ["O'zbekiston Respublikasi Mustaqilligi qachon e'lon qilingan?", ['1990-yil 20-iyun', '1991-yil 31-avgust', '1992-yil 8-dekabr', '1991-yil 18-noyabr'], 1, 'easy'],
    ["Buyuk Sohibqiron Amir Temur qaysi yilda tug'ilgan?", ['1336-yil', '1370-yil', '1405-yil', '1342-yil'], 0, 'easy'],
    ["Samarqanddagi mashhur rasadxonani kim qurdirgan?", ['Amir Temur', 'Mirzo Ulug‘bek', 'Alisher Navoiy', 'Bobur'], 1, 'easy'],
    ["Qadimgi Misr fir'avnlari uchun qurilgan ulkan maqbaralar nima deb ataladi?", ['Zikkurat', 'Piramida', 'Kolizey', 'Akropol'], 1, 'easy'],
    ["O'zbekiston Konstitutsiyasi qachon qabul qilingan?", ['1991-yil 1-sentyabr', '1992-yil 8-dekabr', '1993-yil 2-iyul', '1991-yil 29-dekabr'], 1, 'easy'],
    ["Buyuk Ipak yo'li qaysi ikki yirik mintaqani bog'lagan?", ['Sharqiy Osiyo (Xitoy) va O‘rta yer dengizini', 'Avstraliya va Amerikani', 'Shimoliy qutb va Afrikani', 'Faqat Hindiston va Rusni'], 0, 'medium'],
    ["'Tib qonunlari' asari muallifi bo'lgan buyuk alloma kim?", ['Abu Rayhon Beruniy', 'Abu Ali ibn Sino', 'Al-Xorazmiy', 'Al-Farg‘oniy'], 1, 'easy'],
    ["Xorazmshohlar davlatining so'nggi jasur sarkardasi kim edi?", ['Jaloliddin Manguberdi', 'Spitamen', 'Muqanna', 'Temur Malik'], 0, 'medium'],
    ["Algebra faniga asos solgan buyuk vatandoshimiz kim?", ['Al-Xorazmiy', 'Mirzo Ulug‘bek', 'Ahmad Farg‘oniy', 'Imom Buxoriy'], 0, 'easy'],
    ["Ikkinchi jahon urushi qaysi yillarda bo'lib o'tgan?", ['1914–1918', '1939–1945', '1941–1945', '1935–1942'], 1, 'medium'],
    ["Amir Temur davlatining poytaxti qaysi shahar edi?", ['Buxoro', 'Samarqand', 'Toshkent', 'Xiva'], 1, 'easy'],
    ["Registon maydonidagi eng qadimgi madrasa qaysi?", ['Sherdor madrasasi', 'Tillakori madrasasi', 'Ulug‘bek madrasasi', 'Ko‘kaldosh madrasasi'], 2, 'medium'],
    ["Birinchi marta Yer kurrasining globusini O'rta Osiyoda kim yaratgan?", ['Abu Rayhon Beruniy', 'Mirzo Ulug‘bek', 'Ibn Sino', 'Al-Farg‘oniy'], 0, 'medium'],
    ["Amerika qit'asini 1492-yilda yevropaliklar uchun kim kashf etgan?", ['Vasko da Gama', 'Xristofor Kolumb', 'Fernan Magellan', 'Jeyms Kuk'], 1, 'easy'],
    ["O'zbekiston Birlashgan Millatlar Tashkilotiga (BMT) qachon a'zo bo'lgan?", ['1991-yil 1-sentyabr', '1992-yil 2-mart', '1993-yil 15-may', '1995-yil 10-oktyabr'], 1, 'hard'],
    ["'Ziji jadidi Ko'ragoniy' astronomik jadvali muallifi kim?", ['Al-Xorazmiy', 'Mirzo Ulug‘bek', 'Ali Qushchi', 'Qozizoda Rumiy'], 1, 'medium'],
    ["Yunon-Baqtriya podsholigi qaysi tarixiy davrda mavjud bo'lgan?", ['Mil. avv. III–II asrlar', 'Milodiy X–XI asrlar', 'XV–XVI asrlar', 'Mil. avv. X asr'], 0, 'hard'],
    ["Dunyo bo'ylab birinchi dengiz sayohatini qaysi ekspeditsiya amalga oshirgan?", ['Kolumb ekspeditsiyasi', 'Magellan ekspeditsiyasi', 'Marko Polo sayohati', 'Vasko da Gama'], 1, 'hard'],
    ["Qadimgi Xorazmda milodiy III asrga oid mashhur saroy xarobasi qaysi?", ['Afrosiyob', 'Tuproqqal’a', 'Varaxsha', 'Kampirtepa'], 1, 'hard'],
    ["1991-yil 18-noyabrda O'zbekistonning qaysi davlat ramzi qabul qilingan?", ['Davlat madhiyasi', 'Davlat bayrog‘i', 'Davlat gerbi', 'Konstitutsiya'], 1, 'hard'],
  ],
  geography: [
    ["Yer yuzasidagi eng katta okean qaysi?", ['Atlantika okeani', 'Hind okeani', 'Tinch okeani', 'Shimoliy Muz okeani'], 2, 'easy'],
    ["Dunyodagi eng baland tog' cho'qqisi qaysi?", ['Elbrus', 'Everest (Jomolungma)', 'Kilimanjaro', 'Monblan'], 1, 'easy'],
    ["O'zbekistonning poytaxti qaysi shahar?", ['Samarqand', 'Toshkent', 'Buxoro', 'Navoiy'], 1, 'easy'],
    ["Yer sayyorasida nechta materik (qit'a) bor?", ['4 ta', '5 ta', '6 ta', '7 ta'], 2, 'easy'],
    ["Dunyodagi eng uzun daryolardan biri bo'lgan Nil qaysi materikda joylashgan?", ['Osiyo', 'Afrika', 'Janubiy Amerika', 'Yevropa'], 1, 'easy'],
    ["O'zbekiston hududi asosan qaysi ikki yirik daryo oralig'ida joylashgan?", ['Volga va Don', 'Amudaryo va Sirdaryo', 'Nil va Kongo', 'Dajla va Furot'], 1, 'easy'],
    ["Qaysi davlat maydoni jihatidan dunyoda birinchi o'rinda turadi?", ['Kanada', 'Xitoy', 'AQSH', 'Rossiya'], 3, 'easy'],
    ["Ekvator chizig'i Yerni qanday qismlarga ajratadi?", ['Sharqiy va G‘arbiy yarimsharlar', 'Shimoliy va Janubiy yarimsharlar', 'Quruqlik va okean', 'Tropik va Arktika'], 1, 'easy'],
    ["Dunyodagi eng chuqur ko'l qaysi?", ['Kaspiy dengizi', 'Baykal ko‘li', 'Viktoriya ko‘li', 'Balxash ko‘li'], 1, 'medium'],
    ["O'zbekiston nechta davlat bilan chegaradosh?", ['3 ta', '4 ta', '5 ta', '6 ta'], 2, 'medium'],
    ["Qaysi cho'l O'zbekiston hududining katta qismini egallaydi?", ['Sahroi Kabir', 'Qizilqum', 'Gobi', 'Atakama'], 1, 'easy'],
    ["Avstraliya materigi qaysi yarimsharda joylashgan?", ['Shimoliy yarimsharda', 'Janubiy yarimsharda', 'Faqat G‘arbiy yarimsharda', 'Qutb doirasida'], 1, 'medium'],
    ["Yer atmosferasini quyoshning zararli ultrabinafsha nurlaridan qaysi qatlam himoya qiladi?", ['Ozon qatlami', 'Suv bug‘i', 'Karbonat angidrid', 'Metan qatlami'], 0, 'medium'],
    ["Dunyodagi eng katta orol qaysi?", ['Madagaskar', 'Grenlandiya', 'Sumatra', 'Buyuk Britaniya'], 1, 'medium'],
    ["Markaziy Osiyodagi eng baland cho'qqi qaysi tog' tizimida joylashgan?", ['Pomir va Tyanshan', 'Alp', 'And', 'Ural'], 0, 'medium'],
    ["Mariana botig'i qaysi okeanda joylashgan?", ['Hind okeanida', 'Atlantika okeanida', 'Tinch okeanida', 'Shimoliy Muz okeanida'], 2, 'hard'],
    ["O'zbekistonning eng g'arbiy qismida qaysi avtonom respublika joylashgan?", ['Qoraqalpog‘iston Respublikasi', 'Xorazm viloyati', 'Buxoro viloyati', 'Surxondaryo viloyati'], 0, 'easy'],
    ["Qaysi daryo Amazonka nomi bilan mashhur va qaysi materikdan oqib o'tadi?", ['Afrika', 'Janubiy Amerika', 'Shimoliy Amerika', 'Osiyo'], 1, 'easy'],
    ["Shamol tezligini o'lchaydigan asbob nima deb ataladi?", ['Barometr', 'Termometr', 'Anemometr', 'Gigrometr'], 2, 'hard'],
    ["Jahon okeanining o'rtacha sho'rligi taxminan necha promille (‰)?", ['10 ‰', '35 ‰', '70 ‰', '100 ‰'], 1, 'hard'],
  ],
  informatics: [
    ["Kompyuter xotirasining eng kichik o'lchov birligi nima?", ['Bayt', 'Bit', 'Kilobayt', 'Megabayt'], 1, 'easy'],
    ["1 bayt necha bitga teng?", ['4 bit', '8 bit', '16 bit', '1024 bit'], 1, 'easy'],
    ["Ikkilik sanoq tizimida qaysi raqamlar ishlatiladi?", ['0 dan 9 gacha', 'Faqat 0 va 1', '1 va 2', '0, 1 va 2'], 1, 'easy'],
    ["HTML qisqartmasi nima uchun ishlatiladi?", ['Veb-sahifalar tuzilmasini yaratish uchun', 'Rasm chizish uchun', 'Audio yozish uchun', 'Ma’lumotlar bazasini o‘chirish uchun'], 0, 'easy'],
    ["CPU (Central Processing Unit) kompyuterning qaysi qismi?", ['Tezkor xotira', 'Markaziy protsessor', 'Qattiq disk', 'Monitor'], 1, 'easy'],
    ["1 Kilobayt (KB) kompyuter tizimida necha baytga teng?", ['100 bayt', '512 bayt', '1000 bayt', '1024 bayt'], 3, 'medium'],
    ["Qaysi dasturlash tili veb-brauzerda interaktiv funksiyalar yaratishda asosiy hisoblanadi?", ['JavaScript', 'SQL', 'HTML', 'CSS'], 0, 'medium'],
    ["RAM xotirasining asosiy xususiyati nima?", ['Kompyuter o‘chganda ma’lumot saqlanib qoladi', 'Vaqtinchalik tezkor xotira (elektr o‘chsa o‘chadi)', 'Faqat o‘qish uchun mo‘ljallangan', 'Tashqi fleshka xotirasi'], 1, 'medium'],
    ["Algoritm nima?", ['Kompyuter ekrani', 'Vazifani bajarish uchun aniq ketma-ket buyruqlar rejasi', 'Virus dasturi', 'Internet kabeli'], 1, 'easy'],
    ["Veb-saytlarning tashqi ko'rinishi va dizaynini bezash uchun qaysi texnologiya ishlatiladi?", ['Python', 'CSS', 'C++', 'TCP/IP'], 1, 'easy'],
    ["'Ctrl + C' klavishlar birikmasi nima vazifa bajaradi?", ['Kesib olish', 'Nusxa olish', 'Joylashtirish', 'Bekor qilish'], 1, 'easy'],
    ["HTTP va HTTPS o'rtasidagi asosiy farq nima?", ['HTTPS xavfsiz (shifrlangan) aloqa protokoliga ega', 'HTTP tezroq va rangliroq', 'HTTPS faqat rasmlar uchun', 'Farqi yo‘q'], 0, 'medium'],
    ["SQL tili nima uchun ishlatiladi?", ['3D o‘yinlar chizish uchun', 'Ma’lumotlar bazalari bilan ishlash uchun', 'Operatsion tizim o‘rnatish uchun', 'Ovoz montaji uchun'], 1, 'medium'],
    ["O'nlik sanoq tizimidagi 10 soni ikkilik tizimda qanday yoziladi?", ['1001', '1010', '1100', '1011'], 1, 'medium'],
    ["'Bug' (bag) atamasi dasturlashda nimani anglatadi?", ['Yangi funksiya', 'Dasturdagi xato / nosozlik', 'Tezkor xotira', 'Server nomi'], 1, 'easy'],
    ["Qaysi ma'lumotlar tuzilmasi 'LIFO' (Oxirgi kirgan — birinchi chiqadi) tamoyili asosida ishlaydi?", ['Navbat (Queue)', 'Stek (Stack)', 'Massiv (Array)', 'Graf (Graph)'], 1, 'hard'],
    ["IPv4 manzili necha bitdan iborat bo'ladi?", ['16 bit', '32 bit', '64 bit', '128 bit'], 1, 'hard'],
    ["Rekursiya nima?", ['Funksiyaning o‘zini-o‘zi chaqirishi', 'Cheksiz xotira to‘lishi', 'Ma’lumotlarni arxivlash', 'Tarmoq kabelini ulash'], 0, 'hard'],
    ["O(log n) vaqt murakkabligi qaysi qidiruv algoritmiga xos?", ['Chiziqli qidiruv (Linear Search)', 'Ikkilik qidiruv (Binary Search)', 'Pufakchali saralash (Bubble Sort)', 'Tasodifiy qidiruv'], 1, 'hard'],
    ["Git versiyalarni boshqarish tizimida o'zgarishlarni mahalliy repozitoriyga saqlash buyrug'i qaysi?", ['git push', 'git commit', 'git clone', 'git fetch'], 1, 'medium'],
  ],
};

export function getSubjectQuestions(
  subject: SubjectId,
  difficulty: Difficulty,
  customQuestions: ServerQuestion[],
  questionMode: 'auto' | 'custom',
  shuffle: boolean,
  count = 40
): ServerQuestion[] {
  if (questionMode === 'custom' && customQuestions.length > 0) {
    const list = customQuestions.map((q, idx) => ({ ...q, id: q.id || `custom_${idx}` }));
    return shuffle ? shuffleArray(list) : list;
  }

  if (subject === 'math') {
    return generateMathQuestions(difficulty, count);
  }

  const rawList = SUBJECT_BANKS[subject] ?? SUBJECT_BANKS.physics;
  const converted: ServerQuestion[] = rawList.map(([text, options, correctIndex, qDiff], index) => ({
    id: `${subject}_${index}_${qDiff}`,
    subject,
    text,
    options: [...options] as [string, string, string, string],
    correctIndex,
    difficulty: qDiff,
  }));

  // Prioritize questions matching selected difficulty while keeping all 20 available
  const matching = converted.filter((q) => q.difficulty === difficulty);
  const rest = converted.filter((q) => q.difficulty !== difficulty);
  const ordered = shuffle
    ? [...shuffleArray(matching), ...shuffleArray(rest)]
    : [...matching, ...rest];

  // Append custom questions if host added any even in auto mode
  if (customQuestions.length > 0) {
    return [...customQuestions, ...ordered];
  }

  return ordered;
}

export function toPublicQuestion(q: ServerQuestion): PublicQuestion {
  return {
    id: q.id,
    subject: q.subject,
    text: q.text,
    options: q.options,
    difficulty: q.difficulty,
    supportsNumeric: q.subject === 'math' && typeof q.numericAnswer === 'number',
  };
}
