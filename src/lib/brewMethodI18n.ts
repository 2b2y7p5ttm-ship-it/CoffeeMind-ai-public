import type { AppLanguage } from '@/contexts/LanguageContext';

export const BREW_METHOD_VALUES = [
  'V60',
  'Espresso',
  'AeroPress',
  'Chemex',
  'French Press',
  'Kalita Wave',
  'Moka Pot',
  'Cold Brew',
  'Clever Dripper',
] as const;

export type BrewMethodValue = (typeof BREW_METHOD_VALUES)[number];

const labels: Record<AppLanguage, Record<string, string>> = {
  ru: {
    V60: 'V60',
    Espresso: 'Эспрессо',
    AeroPress: 'Аэропресс',
    Chemex: 'Кемекс',
    'French Press': 'Френч-пресс',
    'Kalita Wave': 'Калита Вейв',
    'Moka Pot': 'Гейзерная кофеварка',
    'Cold Brew': 'Колд-брю',
    'Clever Dripper': 'Клевер',
    'Pour Over': 'Пуровер',
    'Batch Brew': 'Батч-брю',
    Siphon: 'Сифон',
    Cezve: 'Джезва',
    Turkish: 'Кофе по-турецки',
    Ristretto: 'Ристретто',
    Lungo: 'Лунго',
    Phin: 'Фин',
  },
  en: {
    V60: 'V60',
    Espresso: 'Espresso',
    AeroPress: 'AeroPress',
    Chemex: 'Chemex',
    'French Press': 'French Press',
    'Kalita Wave': 'Kalita Wave',
    'Moka Pot': 'Moka Pot',
    'Cold Brew': 'Cold Brew',
    'Clever Dripper': 'Clever Dripper',
    'Pour Over': 'Pour Over',
    'Batch Brew': 'Batch Brew',
    Siphon: 'Siphon',
    Cezve: 'Cezve',
    Turkish: 'Turkish coffee',
    Ristretto: 'Ristretto',
    Lungo: 'Lungo',
    Phin: 'Phin',
  },
};

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('ru-RU')
    .replace(/[–—_]/g, '-')
    .replace(/\s+/g, ' ');
}

const aliases: Record<string, string> = {
  v60: 'V60',
  'v-60': 'V60',
  espresso: 'Espresso',
  'эспрессо': 'Espresso',
  aeropress: 'AeroPress',
  'aero press': 'AeroPress',
  'аэропресс': 'AeroPress',
  chemex: 'Chemex',
  'кемекс': 'Chemex',
  'french press': 'French Press',
  frenchpress: 'French Press',
  'френч-пресс': 'French Press',
  'френч пресс': 'French Press',
  'kalita wave': 'Kalita Wave',
  kalita: 'Kalita Wave',
  'калита вейв': 'Kalita Wave',
  'калита': 'Kalita Wave',
  'moka pot': 'Moka Pot',
  moka: 'Moka Pot',
  'гейзерная кофеварка': 'Moka Pot',
  'мока': 'Moka Pot',
  'cold brew': 'Cold Brew',
  coldbrew: 'Cold Brew',
  'колд-брю': 'Cold Brew',
  'колд брю': 'Cold Brew',
  'clever dripper': 'Clever Dripper',
  clever: 'Clever Dripper',
  'клевер': 'Clever Dripper',
  'пуровер': 'Pour Over',
  'pour over': 'Pour Over',
  pourover: 'Pour Over',
  'batch brew': 'Batch Brew',
  'батч-брю': 'Batch Brew',
  'батч брю': 'Batch Brew',
  siphon: 'Siphon',
  syphon: 'Siphon',
  'сифон': 'Siphon',
  cezve: 'Cezve',
  ibrik: 'Cezve',
  'джезва': 'Cezve',
  'турка': 'Cezve',
  turkish: 'Turkish',
  'turkish coffee': 'Turkish',
  'кофе по-турецки': 'Turkish',
  ristretto: 'Ristretto',
  'ристретто': 'Ristretto',
  lungo: 'Lungo',
  'лунго': 'Lungo',
  phin: 'Phin',
  'фин': 'Phin',
};

export function canonicalizeBrewMethod(value: string): string {
  if (!value) return '';
  return aliases[normalize(value)] ?? value.trim();
}

export function localizeBrewMethod(value: string | undefined | null, language: AppLanguage): string {
  if (!value) return '';
  const canonical = canonicalizeBrewMethod(value);
  return labels[language][canonical] ?? value.trim();
}
