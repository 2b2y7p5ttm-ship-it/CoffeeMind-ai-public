import type { AppLanguage } from '@/contexts/LanguageContext';

export const PROCESSING_VALUES = [
  'Washed',
  'Natural',
  'Honey',
  'Anaerobic',
  'Infused',
  'Wet-Hulled',
  'Other',
] as const;

export type ProcessingValue = (typeof PROCESSING_VALUES)[number];

const labels: Record<AppLanguage, Record<string, string>> = {
  ru: {
    Washed: 'Мытая',
    Natural: 'Натуральная',
    Honey: 'Хани',
    Anaerobic: 'Анаэробная',
    Infused: 'Инфьюз',
    'Wet-Hulled': 'Вет-халл',
    Other: 'Другая',
    'Anaerobic Natural': 'Анаэробная натуральная',
    'Anaerobic Washed': 'Анаэробная мытая',
    'Carbonic Maceration': 'Карбоническая мацерация',
    'Pulped Natural': 'Палпд-нэчурал',
    'Semi-Washed': 'Полумытая',
    Experimental: 'Экспериментальная',
  },
  en: {
    Washed: 'Washed',
    Natural: 'Natural',
    Honey: 'Honey',
    Anaerobic: 'Anaerobic',
    Infused: 'Infused',
    'Wet-Hulled': 'Wet-Hulled',
    Other: 'Other',
    'Anaerobic Natural': 'Anaerobic Natural',
    'Anaerobic Washed': 'Anaerobic Washed',
    'Carbonic Maceration': 'Carbonic Maceration',
    'Pulped Natural': 'Pulped Natural',
    'Semi-Washed': 'Semi-Washed',
    Experimental: 'Experimental',
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
  washed: 'Washed',
  'washed process': 'Washed',
  'мытая': 'Washed',
  'мытый': 'Washed',
  natural: 'Natural',
  'natural process': 'Natural',
  'натуральная': 'Natural',
  'натуральный': 'Natural',
  honey: 'Honey',
  'хани': 'Honey',
  'медовая': 'Honey',
  anaerobic: 'Anaerobic',
  'анаэробная': 'Anaerobic',
  'анаэробный': 'Anaerobic',
  infused: 'Infused',
  infusion: 'Infused',
  'инфьюз': 'Infused',
  'инфьюзная': 'Infused',
  'wet-hulled': 'Wet-Hulled',
  'wet hulled': 'Wet-Hulled',
  'вет-халл': 'Wet-Hulled',
  'вет халл': 'Wet-Hulled',
  other: 'Other',
  'другая': 'Other',
  'другой': 'Other',
  'anaerobic natural': 'Anaerobic Natural',
  'анаэробная натуральная': 'Anaerobic Natural',
  'anaerobic washed': 'Anaerobic Washed',
  'анаэробная мытая': 'Anaerobic Washed',
  'carbonic maceration': 'Carbonic Maceration',
  'карбоническая мацерация': 'Carbonic Maceration',
  'углекислотная мацерация': 'Carbonic Maceration',
  'pulped natural': 'Pulped Natural',
  'палпд-нэчурал': 'Pulped Natural',
  'semi-washed': 'Semi-Washed',
  'semi washed': 'Semi-Washed',
  'полумытая': 'Semi-Washed',
  experimental: 'Experimental',
  'экспериментальная': 'Experimental',
};

export function canonicalizeProcessing(value: string): string {
  if (!value) return '';
  return aliases[normalize(value)] ?? value.trim();
}

export function localizeProcessing(value: string | undefined | null, language: AppLanguage): string {
  if (!value) return '';
  const canonical = canonicalizeProcessing(value);
  return labels[language][canonical] ?? value.trim();
}
