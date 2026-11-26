import { Difficulty, Language } from './types';

export interface MapCountryTarget {
  id: string; // Exact ISO 3166-1 numeric string ID matching world-atlas/countries-110m.json
  difficulty: Difficulty;
  name: Record<Language, string>;
}

export const MAP_COUNTRY_TARGETS: MapCountryTarget[] = [
  { id: '860', difficulty: 'easy', name: { uz: "O'zbekiston", ru: 'Узбекистан', en: 'Uzbekistan' } },
  { id: '040', difficulty: 'easy', name: { uz: 'Avstriya', ru: 'Австрия', en: 'Austria' } },
  { id: '840', difficulty: 'easy', name: { uz: 'AQSH', ru: 'США', en: 'United States' } },
  { id: '124', difficulty: 'easy', name: { uz: 'Kanada', ru: 'Канада', en: 'Canada' } },
  { id: '076', difficulty: 'easy', name: { uz: 'Braziliya', ru: 'Бразилия', en: 'Brazil' } },
  { id: '036', difficulty: 'easy', name: { uz: 'Avstraliya', ru: 'Австралия', en: 'Australia' } },
  { id: '643', difficulty: 'easy', name: { uz: 'Rossiya', ru: 'Россия', en: 'Russia' } },
  { id: '156', difficulty: 'easy', name: { uz: 'Xitoy', ru: 'Китай', en: 'China' } },
  { id: '356', difficulty: 'easy', name: { uz: 'Hindiston', ru: 'Индия', en: 'India' } },
  { id: '392', difficulty: 'easy', name: { uz: 'Yaponiya', ru: 'Япония', en: 'Japan' } },
  { id: '792', difficulty: 'easy', name: { uz: 'Turkiya', ru: 'Турция', en: 'Turkey' } },
  { id: '818', difficulty: 'easy', name: { uz: 'Misr', ru: 'Египет', en: 'Egypt' } },
  { id: '250', difficulty: 'medium', name: { uz: 'Fransiya', ru: 'Франция', en: 'France' } },
  { id: '276', difficulty: 'medium', name: { uz: 'Germaniya', ru: 'Германия', en: 'Germany' } },
  { id: '380', difficulty: 'medium', name: { uz: 'Italiya', ru: 'Италия', en: 'Italy' } },
  { id: '724', difficulty: 'medium', name: { uz: 'Ispaniya', ru: 'Испания', en: 'Spain' } },
  { id: '826', difficulty: 'medium', name: { uz: 'Buyuk Britaniya', ru: 'Великобритания', en: 'United Kingdom' } },
  { id: '398', difficulty: 'medium', name: { uz: "Qozog'iston", ru: 'Казахстан', en: 'Kazakhstan' } },
  { id: '484', difficulty: 'medium', name: { uz: 'Meksika', ru: 'Мексика', en: 'Mexico' } },
  { id: '032', difficulty: 'medium', name: { uz: 'Argentina', ru: 'Аргентина', en: 'Argentina' } },
  { id: '682', difficulty: 'medium', name: { uz: 'Saudiya Arabistoni', ru: 'Саудовская Аравия', en: 'Saudi Arabia' } },
  { id: '710', difficulty: 'medium', name: { uz: 'Janubiy Afrika', ru: 'Южная Африка', en: 'South Africa' } },
  { id: '410', difficulty: 'hard', name: { uz: 'Janubiy Koreya', ru: 'Южная Корея', en: 'South Korea' } },
  { id: '578', difficulty: 'hard', name: { uz: 'Norvegiya', ru: 'Норвегия', en: 'Norway' } },
  { id: '752', difficulty: 'hard', name: { uz: 'Shvetsiya', ru: 'Швеция', en: 'Sweden' } },
  { id: '300', difficulty: 'hard', name: { uz: 'Gretsiya', ru: 'Греция', en: 'Greece' } },
  { id: '360', difficulty: 'hard', name: { uz: 'Indoneziya', ru: 'Индонезия', en: 'Indonesia' } },
  { id: '364', difficulty: 'hard', name: { uz: 'Eron', ru: 'Иран', en: 'Iran' } },
  { id: '804', difficulty: 'hard', name: { uz: 'Ukraina', ru: 'Украина', en: 'Ukraine' } },
  { id: '616', difficulty: 'hard', name: { uz: 'Polsha', ru: 'Польша', en: 'Poland' } },
];

const COUNTRY_NAME_BY_ID = new Map(MAP_COUNTRY_TARGETS.map((c) => [c.id, c.name]));

export function getCountryNameById(id: string | undefined, lang: Language): string {
  if (!id) return '';
  return COUNTRY_NAME_BY_ID.get(id)?.[lang] ?? id;
}
