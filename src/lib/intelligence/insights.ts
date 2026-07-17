import type { Tasting } from '@/hooks/useTastings';
import type { TasteProfile } from './tasteProfile';
import { localizeProcessing } from '@/lib/processingI18n';

export type TasteInsight = { title: string; body: string; tone: 'gold' | 'berry' | 'blue' | 'green' };
type AppLanguage = 'ru' | 'en';

function averageScoreFor(tastings: Tasting[], predicate: (tasting: Tasting) => boolean): number {
  const values = tastings.filter(predicate).map((t) => Number(t.overallScore)).filter(Number.isFinite);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

export function generateTasteInsights(tastings: Tasting[], profile: TasteProfile, language: AppLanguage = 'ru'): TasteInsight[] {
  if (!tastings.length) return [];
  const insights: TasteInsight[] = [];

  if (profile.topProcesses[0]) {
    const top = profile.topProcesses[0];
    insights.push({
      title: language === 'ru' ? 'Любимая обработка' : 'Favorite process',
      body: language === 'ru'
        ? `${localizeProcessing(top.name, language)} встречается в ${top.share}% твоих дегустаций и получает в среднем ${top.averageScore.toFixed(1)} балла.`
        : `${localizeProcessing(top.name, language)} appears in ${top.share}% of your tastings and averages ${top.averageScore.toFixed(1)} points.`,
      tone: 'gold',
    });
  }

  if (profile.topDescriptors.length >= 2) {
    insights.push({
      title: language === 'ru' ? 'Твой вкусовой почерк' : 'Your flavor signature',
      body: language === 'ru'
        ? `Чаще всего ты отмечаешь ${profile.topDescriptors.slice(0, 3).map((item) => item.name).join(', ')}.`
        : `You most often note ${profile.topDescriptors.slice(0, 3).map((item) => item.name).join(', ')}.`,
      tone: 'berry',
    });
  }

  if (profile.averages.acidity >= 7) {
    insights.push({
      title: language === 'ru' ? 'Высокая кислотность' : 'High acidity',
      body: language === 'ru'
        ? `Средняя кислотность твоих чашек — ${profile.averages.acidity}. Ты уверенно выбираешь яркие профили.`
        : `Your average acidity is ${profile.averages.acidity}. You consistently choose bright profiles.`,
      tone: 'blue',
    });
  } else if (profile.averages.sweetness >= 7) {
    insights.push({
      title: language === 'ru' ? 'Ставка на сладость' : 'Sweetness first',
      body: language === 'ru'
        ? `Средняя сладость — ${profile.averages.sweetness}. Сладкие чашки формируют основу твоего профиля.`
        : `Your average sweetness is ${profile.averages.sweetness}. Sweet cups form the core of your profile.`,
      tone: 'gold',
    });
  }

  const naturalScore = averageScoreFor(tastings, (t) => /натурал|natural/i.test(t.processing || t.process || ''));
  const washedScore = averageScoreFor(tastings, (t) => /мыт|washed/i.test(t.processing || t.process || ''));
  if (naturalScore && washedScore && Math.abs(naturalScore - washedScore) >= 0.7) {
    const winner = naturalScore > washedScore
      ? language === 'ru' ? 'натуральные' : 'natural'
      : language === 'ru' ? 'мытые' : 'washed';
    const delta = Math.abs(naturalScore - washedScore).toFixed(1);
    insights.push({
      title: language === 'ru' ? 'Стабильное предпочтение' : 'Consistent preference',
      body: language === 'ru'
        ? `Ты оцениваешь ${winner} обработки в среднем на ${delta} балла выше.`
        : `You rate ${winner} coffees an average of ${delta} points higher.`,
      tone: 'green',
    });
  }

  if (profile.diversityIndex >= 65) {
    insights.push({
      title: language === 'ru' ? 'Высокая исследовательская активность' : 'High exploration activity',
      body: language === 'ru'
        ? `Индекс разнообразия — ${profile.diversityIndex}%. Ты регулярно выходишь за пределы привычного профиля.`
        : `Your diversity index is ${profile.diversityIndex}%. You regularly explore beyond your usual profile.`,
      tone: 'green',
    });
  }

  return insights.slice(0, 4);
}
