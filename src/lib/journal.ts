import { Tasting } from '@/hooks/useTastings';

export type TasteTone = 'berry' | 'citrus' | 'floral' | 'chocolate' | 'nut' | 'tropical' | 'herbal' | 'neutral';

const toneWords: Record<TasteTone, string[]> = {
  berry: ['ягод', 'клубник', 'малин', 'черник', 'смород', 'вишн', 'ежевик', 'земляник'],
  citrus: ['цитрус', 'лимон', 'апельсин', 'бергамот', 'грейпфрут', 'мандарин', 'лайм'],
  floral: ['цвет', 'жасмин', 'роза', 'лаванд', 'липа', 'чай'],
  chocolate: ['шоколад', 'какао', 'карамел', 'ирис', 'меласс'],
  nut: ['орех', 'миндал', 'фундук', 'арахис'],
  tropical: ['манго', 'ананас', 'маракуй', 'папай', 'банан', 'тропич'],
  herbal: ['трав', 'зелён', 'мят', 'эвкалипт', 'табак', 'древес'],
  neutral: [],
};

export function getTastingDescriptors(tasting: Tasting): string[] {
  return [...(tasting.topThreeDescriptors || []), ...(tasting.additionalDescriptors || []), ...(tasting.flavorDescriptors || [])]
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index);
}

export function getTasteTone(tasting: Tasting): TasteTone {
  const text = getTastingDescriptors(tasting).join(' ').toLowerCase();
  const ordered: TasteTone[] = ['berry', 'citrus', 'floral', 'tropical', 'chocolate', 'nut', 'herbal'];
  let best: TasteTone = 'neutral';
  let score = 0;
  ordered.forEach((tone) => {
    const matches = toneWords[tone].reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
    if (matches > score) { best = tone; score = matches; }
  });
  return best;
}

export function tastingSearchText(tasting: Tasting): string {
  return [
    tasting.coffeeName, tasting.country, tasting.region, tasting.roaster,
    tasting.processing, tasting.process, tasting.brewMethod, tasting.brewingMethod,
    tasting.variety, tasting.producer, ...getTastingDescriptors(tasting), tasting.notes,
  ].filter(Boolean).join(' ').toLowerCase();
}
