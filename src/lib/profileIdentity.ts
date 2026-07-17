export type IdentityLanguage = 'ru' | 'en';

function cleanName(value?: string | null): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function comparable(value?: string | null): string {
  return cleanName(value).toLocaleLowerCase('ru-RU');
}

const GENERIC_NAMES = new Set([
  'coffeemind user',
  'пользователь coffeemind',
  'guest',
  'гость',
  'user',
  'пользователь',
]);

export function emailNickname(email?: string | null): string {
  const localPart = cleanName(email).split('@')[0]?.replace(/[._-]+/g, ' ').trim() || '';
  if (!localPart) return '';
  return localPart
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase() + part.slice(1))
    .join(' ');
}

export function isGenericProfileName(value?: string | null): boolean {
  return GENERIC_NAMES.has(comparable(value));
}

export function resolveDisplayName({
  profileName,
  metadataName,
  email,
  language,
  authenticated = false,
}: {
  profileName?: string | null;
  metadataName?: string | null;
  email?: string | null;
  language: IdentityLanguage;
  authenticated?: boolean;
}): string {
  const profile = cleanName(profileName);
  const metadata = cleanName(metadataName);

  // Older CoffeeMind builds created every profile as “Роман”. When an
  // authenticated account has another registration name, prefer that name.
  const legacyRomanMismatch = authenticated
    && comparable(profile) === 'роман'
    && metadata
    && comparable(metadata) !== comparable(profile);

  if (profile && !isGenericProfileName(profile) && !legacyRomanMismatch) return profile;
  if (metadata && !isGenericProfileName(metadata)) return metadata;

  const fromEmail = emailNickname(email);
  if (fromEmail) return fromEmail;
  if (profile) return profile;
  if (metadata) return metadata;
  return language === 'ru' ? 'Гость' : 'Guest';
}

export function resolveSyncedProfileName({
  localName,
  remoteName,
  metadataName,
  email,
}: {
  localName?: string | null;
  remoteName?: string | null;
  metadataName?: string | null;
  email?: string | null;
}): string {
  const local = cleanName(localName);
  const remote = cleanName(remoteName);
  const metadata = cleanName(metadataName);

  const remoteIsLegacyRoman = comparable(remote) === 'роман'
    && metadata
    && comparable(metadata) !== comparable(remote);
  const localIsLegacyRoman = comparable(local) === 'роман'
    && metadata
    && comparable(metadata) !== comparable(local);

  if (remote && !isGenericProfileName(remote) && !remoteIsLegacyRoman) return remote;
  if (metadata && !isGenericProfileName(metadata)) return metadata;
  if (local && !isGenericProfileName(local) && !localIsLegacyRoman) return local;

  return emailNickname(email) || remote || local || metadata || '';
}

function declineRussianWord(word: string, index: number, total: number): string {
  if (!/[А-Яа-яЁё]/.test(word)) return word;

  const lower = word.toLocaleLowerCase('ru-RU');
  const irregular: Record<string, string> = {
    павел: 'Павла',
    лев: 'Льва',
    пётр: 'Петра',
    петр: 'Петра',
    илья: 'Ильи',
    лука: 'Луки',
    никита: 'Никиты',
  };
  if (irregular[lower]) return irregular[lower];

  const preserveCase = (replacement: string) => {
    if (word === word.toLocaleUpperCase('ru-RU')) return replacement.toLocaleUpperCase('ru-RU');
    return replacement;
  };

  // Surnames and adjectives, usually the second word in a full name.
  if (index > 0 || total > 1) {
    if (/(ский|цкий)$/i.test(word)) return preserveCase(word.replace(/(ский|цкий)$/i, (ending) => ending.toLocaleLowerCase('ru-RU') === 'ский' ? 'ского' : 'цкого'));
    if (/ий$/i.test(word)) return preserveCase(word.replace(/ий$/i, 'его'));
    if (/(ый|ой)$/i.test(word)) return preserveCase(word.replace(/(ый|ой)$/i, 'ого'));
    if (/(ская|цкая)$/i.test(word)) return preserveCase(word.replace(/(ская|цкая)$/i, 'ской'));
    if (/(ова|ева|ина)$/i.test(word)) return preserveCase(`${word.slice(0, -1)}ой`);
    if (/(ов|ев|ин)$/i.test(word)) return preserveCase(`${word}а`);
  }

  const last = word.slice(-1);
  const stem = word.slice(0, -1);
  if (last === 'а' || last === 'А') {
    const ending = /[гкхжчшщ]$/i.test(stem) ? 'и' : 'ы';
    return preserveCase(`${stem}${ending}`);
  }
  if (last === 'я' || last === 'Я') return preserveCase(`${stem}и`);
  if (last === 'й' || last === 'Й') return preserveCase(`${stem}я`);
  if (last === 'ь' || last === 'Ь') return preserveCase(`${stem}я`);
  if (/[бвгджзклмнпрстфхцчшщ]$/i.test(word)) return preserveCase(`${word}а`);
  return word;
}

export function toRussianGenitiveName(value?: string | null): string {
  const name = cleanName(value);
  if (!name) return '';
  const words = name.split(' ');
  return words.map((word, index) => declineRussianWord(word, index, words.length)).join(' ');
}
