import type { AppLanguage } from '@/contexts/LanguageContext';

interface ReferenceEntry {
  value: string;
  ru: string;
  aliases?: string[];
}

function normalize(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('ru-RU')
    .replace(/[–—_]/g, '-')
    .replace(/[ё]/g, 'е')
    .replace(/\s+/g, ' ');
}

function createAliasMap(entries: readonly ReferenceEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) {
    const variants = [entry.value, entry.ru, ...(entry.aliases || [])];
    for (const variant of variants) map.set(normalize(variant), entry.value);
  }
  return map;
}

function localizeReference(value: string | undefined | null, language: AppLanguage, entries: readonly ReferenceEntry[], aliases: Map<string, string>): string {
  if (!value) return '';
  const canonical = aliases.get(normalize(value)) ?? value.trim();
  const entry = entries.find((item) => item.value === canonical);
  if (!entry) return value.trim();
  return language === 'ru' ? entry.ru : entry.value;
}

function canonicalizeReference(value: string, aliases: Map<string, string>): string {
  if (!value) return '';
  return aliases.get(normalize(value)) ?? value.trim();
}

const COUNTRY_ENTRIES = [
  { value: 'Ethiopia', ru: 'Эфиопия', aliases: ['Эфиопии'] },
  { value: 'Colombia', ru: 'Колумбия' },
  { value: 'Brazil', ru: 'Бразилия' },
  { value: 'Kenya', ru: 'Кения' },
  { value: 'Guatemala', ru: 'Гватемала' },
  { value: 'Costa Rica', ru: 'Коста-Рика', aliases: ['Коста Рика'] },
  { value: 'Panama', ru: 'Панама' },
  { value: 'Yemen', ru: 'Йемен' },
  { value: 'Peru', ru: 'Перу' },
  { value: 'Indonesia', ru: 'Индонезия' },
  { value: 'Rwanda', ru: 'Руанда' },
  { value: 'Burundi', ru: 'Бурунди' },
  { value: 'Honduras', ru: 'Гондурас' },
  { value: 'El Salvador', ru: 'Сальвадор', aliases: ['Эль-Сальвадор', 'Эль Сальвадор'] },
  { value: 'Mexico', ru: 'Мексика' },
  { value: 'Nicaragua', ru: 'Никарагуа' },
  { value: 'Bolivia', ru: 'Боливия' },
  { value: 'Tanzania', ru: 'Танзания' },
  { value: 'Uganda', ru: 'Уганда' },
  { value: 'Vietnam', ru: 'Вьетнам' },
  { value: 'Myanmar', ru: 'Мьянма', aliases: ['Бирма'] },
  { value: 'India', ru: 'Индия' },
  { value: 'China', ru: 'Китай' },
  { value: 'Japan', ru: 'Япония' },
  { value: 'Jamaica', ru: 'Ямайка' },
  { value: 'United States', ru: 'США', aliases: ['USA', 'US', 'Соединённые Штаты', 'Соединенные Штаты'] },
  { value: 'Hawaii', ru: 'Гавайи' },
  { value: 'Ecuador', ru: 'Эквадор' },
  { value: 'Thailand', ru: 'Таиланд' },
  { value: 'Laos', ru: 'Лаос' },
  { value: 'Cambodia', ru: 'Камбоджа' },
  { value: 'Timor-Leste', ru: 'Восточный Тимор', aliases: ['East Timor', 'Тимор-Лешти', 'Тимор Лешти'] },
  { value: 'DR Congo', ru: 'ДР Конго', aliases: ['Democratic Republic of the Congo', 'Congo', 'Демократическая Республика Конго', 'Конго'] },
  { value: 'Cameroon', ru: 'Камерун' },
  { value: 'Zimbabwe', ru: 'Зимбабве' },
  { value: 'Malawi', ru: 'Малави' },
  { value: 'Zambia', ru: 'Замбия' },
  { value: 'Papua New Guinea', ru: 'Папуа — Новая Гвинея', aliases: ['Папуа-Новая Гвинея', 'Папуа Новая Гвинея'] },
  { value: 'Dominican Republic', ru: 'Доминиканская Республика' },
  { value: 'Puerto Rico', ru: 'Пуэрто-Рико', aliases: ['Пуэрто Рико'] },
  { value: 'Philippines', ru: 'Филиппины' },
] as const satisfies readonly ReferenceEntry[];

export const COUNTRY_VALUES = COUNTRY_ENTRIES.map((entry) => entry.value);
const COUNTRY_ALIASES = createAliasMap(COUNTRY_ENTRIES);

export function canonicalizeCountry(value: string): string {
  return canonicalizeReference(value, COUNTRY_ALIASES);
}

export function localizeCountry(value: string | undefined | null, language: AppLanguage): string {
  return localizeReference(value, language, COUNTRY_ENTRIES, COUNTRY_ALIASES);
}

const VARIETY_ENTRIES = [
  { value: 'Heirloom', ru: 'Хейрлум', aliases: ['Ethiopian Heirloom', 'Эфиопский хейрлум'] },
  { value: 'Landrace', ru: 'Лэндрейс' },
  { value: 'Ethiopian Landrace', ru: 'Эфиопский лэндрейс' },
  { value: 'Bourbon', ru: 'Бурбон' },
  { value: 'Red Bourbon', ru: 'Красный Бурбон' },
  { value: 'Yellow Bourbon', ru: 'Жёлтый Бурбон', aliases: ['Желтый Бурбон'] },
  { value: 'Pink Bourbon', ru: 'Розовый Бурбон' },
  { value: 'Typica', ru: 'Типика' },
  { value: 'Caturra', ru: 'Катурра' },
  { value: 'Catuai', ru: 'Катуаи', aliases: ['Catuaí'] },
  { value: 'Castillo', ru: 'Кастильо' },
  { value: 'Gesha', ru: 'Геша', aliases: ['Geisha', 'Гейша'] },
  { value: 'Pacamara', ru: 'Пакамара' },
  { value: 'Maragogipe', ru: 'Марагоджип', aliases: ['Maragogype'] },
  { value: 'Maracaturra', ru: 'Маракатурра' },
  { value: 'Catimor', ru: 'Катимор' },
  { value: 'Sarchimor', ru: 'Сарчимор' },
  { value: 'Villa Sarchi', ru: 'Вилла Сарчи' },
  { value: 'Mundo Novo', ru: 'Мундо-Ново', aliases: ['Мундо Ново'] },
  { value: 'Java', ru: 'Ява' },
  { value: 'Sidra', ru: 'Сидра' },
  { value: 'Wush Wush', ru: 'Вуш-Вуш', aliases: ['Wushwush', 'Вуш Вуш'] },
  { value: 'Batian', ru: 'Батиан' },
  { value: 'Ruiru 11', ru: 'Руиру 11' },
  { value: 'SL28', ru: 'SL28', aliases: ['SL-28'] },
  { value: 'SL34', ru: 'SL34', aliases: ['SL-34'] },
  { value: '74110', ru: '74110' },
  { value: '74112', ru: '74112' },
] as const satisfies readonly ReferenceEntry[];

export const VARIETY_VALUES = VARIETY_ENTRIES.map((entry) => entry.value);
const VARIETY_ALIASES = createAliasMap(VARIETY_ENTRIES);

function transformCompoundReference(value: string, transform: (part: string) => string): string {
  const direct = transform(value);
  if (direct !== value.trim()) return direct;

  return value
    .split(/(\s*[,/+&]\s*|\s+and\s+|\s+и\s+)/i)
    .map((part) => (/[,/+&]|^\s*(and|и)\s*$/i.test(part) ? part : transform(part)))
    .join('');
}

export function canonicalizeVariety(value: string): string {
  if (!value) return '';
  return transformCompoundReference(value, (part) => canonicalizeReference(part, VARIETY_ALIASES));
}

export function localizeVariety(value: string | undefined | null, language: AppLanguage): string {
  if (!value) return '';
  return transformCompoundReference(value, (part) => localizeReference(part, language, VARIETY_ENTRIES, VARIETY_ALIASES));
}

// These dictionaries are ready for the dedicated roast/fermentation fields planned for a later schema update.
const ROAST_LEVEL_ENTRIES = [
  { value: 'Light', ru: 'Светлая' },
  { value: 'Medium-Light', ru: 'Средне-светлая', aliases: ['Medium Light'] },
  { value: 'Medium', ru: 'Средняя' },
  { value: 'Medium-Dark', ru: 'Средне-тёмная', aliases: ['Medium Dark', 'Средне-темная'] },
  { value: 'Dark', ru: 'Тёмная', aliases: ['Темная'] },
] as const satisfies readonly ReferenceEntry[];

const ROAST_LEVEL_ALIASES = createAliasMap(ROAST_LEVEL_ENTRIES);
export const ROAST_LEVEL_VALUES = ROAST_LEVEL_ENTRIES.map((entry) => entry.value);
export const canonicalizeRoastLevel = (value: string) => canonicalizeReference(value, ROAST_LEVEL_ALIASES);
export const localizeRoastLevel = (value: string | undefined | null, language: AppLanguage) => localizeReference(value, language, ROAST_LEVEL_ENTRIES, ROAST_LEVEL_ALIASES);

const FERMENTATION_ENTRIES = [
  { value: 'Aerobic', ru: 'Аэробная' },
  { value: 'Anaerobic', ru: 'Анаэробная' },
  { value: 'Carbonic Maceration', ru: 'Карбоническая мацерация' },
  { value: 'Lactic', ru: 'Молочнокислая', aliases: ['Lactic Fermentation'] },
  { value: 'Yeast Inoculated', ru: 'С внесением дрожжей', aliases: ['Yeast', 'Inoculated'] },
  { value: 'Thermal Shock', ru: 'Термический шок' },
  { value: 'Extended Fermentation', ru: 'Продлённая ферментация', aliases: ['Продленная ферментация'] },
] as const satisfies readonly ReferenceEntry[];

const FERMENTATION_ALIASES = createAliasMap(FERMENTATION_ENTRIES);
export const FERMENTATION_VALUES = FERMENTATION_ENTRIES.map((entry) => entry.value);
export const canonicalizeFermentation = (value: string) => canonicalizeReference(value, FERMENTATION_ALIASES);
export const localizeFermentation = (value: string | undefined | null, language: AppLanguage) => localizeReference(value, language, FERMENTATION_ENTRIES, FERMENTATION_ALIASES);
