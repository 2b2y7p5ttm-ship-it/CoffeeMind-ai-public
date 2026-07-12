import type { Tasting } from '@/hooks/useTastings';
import type { TasteProfile } from './tasteProfile';

export type TasteInsight = { title: string; body: string; tone: 'gold' | 'berry' | 'blue' | 'green' };

function averageScoreFor(tastings: Tasting[], predicate: (tasting: Tasting) => boolean): number {
  const values = tastings.filter(predicate).map((t) => Number(t.overallScore)).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function generateTasteInsights(tastings: Tasting[], profile: TasteProfile): TasteInsight[] {
  if (!tastings.length) return [];
  const insights: TasteInsight[] = [];

  if (profile.topProcesses[0]) {
    const top = profile.topProcesses[0];
    insights.push({
      title: 'Любимая обработка',
      body: `${top.name} встречается в ${top.share}% твоих дегустаций и получает в среднем ${top.averageScore.toFixed(1)} балла.`,
      tone: 'gold',
    });
  }

  if (profile.topDescriptors.length >= 2) {
    insights.push({
      title: 'Твой вкусовой почерк',
      body: `Чаще всего ты отмечаешь ${profile.topDescriptors.slice(0, 3).map((item) => item.name).join(', ')}.`,
      tone: 'berry',
    });
  }

  if (profile.averages.acidity >= 7) {
    insights.push({ title: 'Высокая кислотность', body: `Средняя кислотность твоих чашек — ${profile.averages.acidity}. Ты уверенно выбираешь яркие профили.`, tone: 'blue' });
  } else if (profile.averages.sweetness >= 7) {
    insights.push({ title: 'Ставка на сладость', body: `Средняя сладость — ${profile.averages.sweetness}. Сладкие чашки формируют основу твоего профиля.`, tone: 'gold' });
  }

  const naturalScore = averageScoreFor(tastings, (t) => /натурал|natural/i.test(t.processing || t.process || ''));
  const washedScore = averageScoreFor(tastings, (t) => /мыт|washed/i.test(t.processing || t.process || ''));
  if (naturalScore && washedScore && Math.abs(naturalScore - washedScore) >= 0.7) {
    const winner = naturalScore > washedScore ? 'натуральные' : 'мытые';
    const delta = Math.abs(naturalScore - washedScore).toFixed(1);
    insights.push({ title: 'Стабильное предпочтение', body: `Ты оцениваешь ${winner} обработки в среднем на ${delta} балла выше.`, tone: 'green' });
  }

  if (profile.diversityIndex >= 65) {
    insights.push({ title: 'Высокая исследовательская активность', body: `Индекс разнообразия — ${profile.diversityIndex}%. Ты регулярно выходишь за пределы привычного профиля.`, tone: 'green' });
  }

  return insights.slice(0, 4);
}
