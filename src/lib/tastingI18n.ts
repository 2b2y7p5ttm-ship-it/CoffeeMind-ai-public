import { useLanguage } from '@/contexts/LanguageContext';

const ru = {
  wizard: {
    steps: [
      { title: 'Кофе', eyebrow: 'Паспорт зерна', hint: 'Сохрани происхождение, обработку и обжарщика.' },
      { title: 'Рецепт', eyebrow: 'Переменные', hint: 'Запиши рецепт так, чтобы его можно было повторить.' },
      { title: 'Сенсорика', eyebrow: 'Оценка чашки', hint: 'Сначала ощущения, потом цифры. Так запись получается точнее.' },
      { title: 'Вкус', eyebrow: 'Дескрипторы', hint: 'Выбери три главных вкуса. Это ядро твоей вкусовой памяти.' },
      { title: 'Заметки', eyebrow: 'Контекст', hint: 'Добавь мысль, рецепт на будущее или фото карточки.' },
      { title: 'Итог', eyebrow: 'Проверка', hint: 'После сохранения CoffeeMind откроет AI Coach.' },
    ],
    coffeeTipTitle: 'Совет CoffeeMind',
    coffeeTip: 'Название кофе обязательно, остальное можно заполнить позже. Но страна, обработка и обжарщик сделают аналитику намного полезнее.',
    coffeeName: 'Название кофе *', roaster: 'Обжарщик', country: 'Страна', region: 'Регион', farm: 'Ферма', variety: 'Разновидность',
    extendedBean: 'Расширенный паспорт зерна', producer: 'Производитель', washingStation: 'Станция обработки', elevation: 'Высота, м', harvest: 'Урожай', lot: 'Лот', processing: 'Обработка', roastDate: 'Дата обжарки',
    recipeTipTitle: 'Рецепт для повторения', recipeTip: 'Записывай рецепт как лабораторную заметку: доза, выход, время и температура помогут понять, почему чашка получилась именно такой.',
    brewMethod: 'Метод приготовления *', dose: 'Доза (г)', yield: 'Выход напитка (г)', time: 'Время (сек)', temperature: 'Температура воды (°C)', equipment: 'Оборудование и вода', grinder: 'Кофемолка', grindSetting: 'Настройка помола', water: 'Вода', bloom: 'Блуминг, сек', brewRatio: 'Брю-рейшио',
    sensoryTipTitle: 'Порядок дегустации', sensoryTip: 'Сначала зафиксируй сухой аромат, затем аромат после заваривания, и только потом ставь оценки. Так меньше риска подогнать вкус под цифры.',
    dryAroma: 'Сухой аромат', wetAroma: 'Влажный аромат', firstImpression: 'Первое впечатление',
    cupProfile: 'Профиль чашки', cupProfileHint: 'Диаграмма обновляется сразу при изменении оценок.', finalScore: 'Итоговый балл', finalScoreHint: 'Можно выставить вручную или рассчитать из сенсорного профиля.', calculate: 'Рассчитать', overallScore: 'Общая оценка',
    flavorTipTitle: 'Правило трёх дескрипторов', flavorTip: 'Выбери три доминирующие ноты: одну для аромата, одну для основного вкуса и одну для послевкусия. Частые вкусы CoffeeMind запомнит и поднимет выше.', mainNotes: 'Главные ноты чашки', mainNotesHint: 'Ищи по названию или двигайся от группы к конкретному вкусу.', customDescriptors: 'Свои и дополнительные дескрипторы', descriptorPlaceholder: 'Введи вкус и нажми Enter…', descriptorHint: 'Здесь можно сохранить необычные или очень конкретные ассоциации без ограничения.', addMore: '+ добавить',
    notesTipTitle: 'Что писать в заметках', notesTip: 'Контекст часто важнее длинного описания: что удивило, что хочется проверить в рецепте, как чашка менялась после остывания.', tastingNotes: 'Заметки дегустации', notesPlaceholder: 'Опиши контекст, что удивило, что хочется изменить в рецепте в следующий раз…', cardPhoto: 'Фото карточки', removePhoto: 'Убрать фото',
    summaryTipTitle: 'Следующий шаг', summaryTip: 'Проверь запись. После сохранения CoffeeMind откроет AI Coach и задаст вопросы, которые помогут точнее описать эту чашку.', untitled: 'Без названия', saving: 'Сохраняем…', saveTasting: 'Сохранить дегустацию', saveChanges: 'Сохранить изменения', localSave: 'Сохраняется локально на этом устройстве', saveError: 'Не удалось сохранить дегустацию. Обнови страницу и попробуй ещё раз.',
    editing: 'Редактирование', newTasting: 'Новая дегустация', review: 'Проверить', continue: 'Продолжить',
  },
  metrics: { aroma: 'Аромат', flavor: 'Вкус', acidity: 'Кислотность', sweetness: 'Сладость', body: 'Тело', bitterness: 'Горечь', balance: 'Баланс', cleanCup: 'Чистота чашки', clean: 'Чистота', aftertaste: 'Послевкусие' },
  wheel: { search: 'Найти вкус: бергамот, клубника…', selected: 'Выбрано', suggested: 'Избранное и частые', groups: 'Вкусовые группы', results: 'Результаты поиска', back: 'Все категории', addFavorite: 'Добавить в избранное', removeFavorite: 'Убрать из избранного', empty: 'Ничего не найдено. Добавь свой дескриптор ниже.', chooseUpTo: 'Выбери до {count} главных нот', descriptorCount: '{count} дескрипторов' },
  detail: {
    notFound: 'Дегустация не найдена', notFoundText: 'Возможно, запись была удалена.', backHome: 'В журнал', score: 'Оценка', secUnit: 'сек', deleteConfirm: 'Удалить эту дегустацию? Это действие нельзя отменить.', edit: 'Редактировать дегустацию', delete: 'Удалить дегустацию',
    originBean: 'Происхождение и зерно', brewDetails: 'Рецепт', sensory: 'Сенсорика', cupProfile: 'Профиль чашки', attributeScores: 'Оценки', flavorProfile: 'Вкусовой профиль', tastingNotes: 'Заметки дегустации',
    roaster: 'Обжарщик', country: 'Страна', region: 'Регион', farm: 'Ферма', producer: 'Производитель', washingStation: 'Станция обработки', elevation: 'Высота', harvest: 'Урожай', lot: 'Лот', variety: 'Разновидность', processing: 'Обработка', roastDate: 'Дата обжарки', method: 'Метод', dose: 'Доза', yield: 'Выход', time: 'Время', temp: 'Темп.', ratio: 'Брю-рейшио', grinder: 'Кофемолка', grindSetting: 'Настройка помола', water: 'Вода', waterTds: 'TDS воды', bloom: 'Блуминг', dryAroma: 'Сухой аромат', wetAroma: 'Влажный аромат', firstImpression: 'Первое впечатление', brightest: 'Самая яркая грань', character: 'Характер', topDescriptors: 'Главные дескрипторы', additional: 'Дополнительные',
    characterBright: 'Яркий и сочный', characterSweet: 'Сладкий и округлый', characterDense: 'Плотный и насыщенный', characterBalanced: 'Сбалансированный',
  },
  coach: {
    notFound: 'Дегустация не найдена', notFoundText: 'Возможно, запись была удалена.', backHome: 'На главный экран', title: 'Разбор чашки', intro: 'CoffeeMind помогает превратить запись в тренировку вкуса. Это не финальный AI-анализ, а первая версия коуча на основе твоих данных.', saved: 'Сохранено', mainThought: 'Главная мысль', nextTime: 'Что заметить в следующий раз', questions: 'Вопросы для точности', miniTask: 'Мини-задание', miniTaskText: 'Сделай ещё один глоток на остывании и ответь себе: вкус стал слаще, суше или ярче? Это простое наблюдение сильно прокачивает сенсорную память.', openRecord: 'Открыть запись', journal: 'В журнал',
    noDescriptor: 'Ты пока не выбрал дескрипторы. На следующей дегустации попробуй зафиксировать три главных: один аромат, один вкус и одно послевкусие.', descriptor: 'Главный дескриптор: {name}. Попробуй уточнить его форму: свежий, джемовый, сушёный, конфетный или ферментированный?',
    acidityHigh: 'Кислотность высокая. В следующий раз попробуй уточнить: цитрусовая, ягодная, винная или яблочная?', acidityMedium: 'Кислотность заметная, но не резкая. Хороший момент сравнить её со сладостью и телом.', acidityLow: 'Кислотность мягкая. Обрати внимание, не уходит ли чашка в шоколад, орехи или карамель.',
    sweetnessHigh: 'Сладость выраженная. Попробуй назвать её точнее: мёд, карамель, джем, спелый фрукт или сахар.', sweetnessMedium: 'Сладость есть, но её можно раскрыть рецептом: помол, температура и время могут заметно изменить баланс.', sweetnessLow: 'Сладость низкая. Проверь, не мешают ли ей горечь, недоэкстракция или слишком короткое время.',
    balanceGood: 'Баланс чашки выглядит уверенно.', balanceImprove: 'Баланс можно ещё докрутить рецептом.', cleanGood: 'Чистота вкуса хорошая, запись пригодна для сравнения.', cleanImprove: 'Стоит отдельно проверить чистоту чашки при остывании.', aftertasteGood: 'Послевкусие достаточно длинное, его стоит описывать подробнее.', aftertasteImprove: 'Послевкусие пока выглядит коротким или неярким.',
    q1: 'Если описывать «{name}» точнее, это аромат, вкус или послевкусие?', q2: 'Кислотность {value}/10: она больше похожа на лимон, яблоко, ягоду или вино?', q3: 'Что изменится после остывания: сладость, тело, чистота или послевкусие?', mainFlavor: 'главный вкус',
  },
} as const;

type DeepWiden<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly DeepWiden<U>[]
    : T extends object
      ? { [K in keyof T]: DeepWiden<T[K]> }
      : T;

export type TastingCopy = DeepWiden<typeof ru>;

const en: TastingCopy = {
  wizard: {
    steps: [
      { title: 'Coffee', eyebrow: 'Bean passport', hint: 'Save the origin, process, and roaster.' },
      { title: 'Recipe', eyebrow: 'Variables', hint: 'Record a recipe you can repeat.' },
      { title: 'Sensory', eyebrow: 'Cup assessment', hint: 'Capture impressions first, then score them.' },
      { title: 'Flavor', eyebrow: 'Descriptors', hint: 'Choose the three flavors that define this cup.' },
      { title: 'Notes', eyebrow: 'Context', hint: 'Add an observation, a future recipe idea, or a card photo.' },
      { title: 'Summary', eyebrow: 'Review', hint: 'CoffeeMind will open AI Coach after saving.' },
    ],
    coffeeTipTitle: 'CoffeeMind tip', coffeeTip: 'The coffee name is required; everything else can be added later. Country, process, and roaster make your analytics much more useful.',
    coffeeName: 'Coffee name *', roaster: 'Roaster', country: 'Country', region: 'Region', farm: 'Farm', variety: 'Variety', extendedBean: 'Extended bean passport', producer: 'Producer', washingStation: 'Washing station', elevation: 'Elevation, m', harvest: 'Harvest', lot: 'Lot', processing: 'Process', roastDate: 'Roast date',
    recipeTipTitle: 'Repeatable recipe', recipeTip: 'Treat the recipe like a lab note: dose, yield, time, and temperature explain why the cup tasted this way.', brewMethod: 'Brewing method *', dose: 'Dose (g)', yield: 'Beverage yield (g)', time: 'Time (sec)', temperature: 'Water temperature (°C)', equipment: 'Equipment and water', grinder: 'Grinder', grindSetting: 'Grind setting', water: 'Water', bloom: 'Bloom, sec', brewRatio: 'Brew ratio',
    sensoryTipTitle: 'Tasting order', sensoryTip: 'Capture the dry aroma, then the brewed aroma, and only then score the cup. This reduces the risk of fitting the flavor to the numbers.', dryAroma: 'Dry aroma', wetAroma: 'Wet aroma', firstImpression: 'First impression', cupProfile: 'Cup profile', cupProfileHint: 'The chart updates immediately as scores change.', finalScore: 'Final score', finalScoreHint: 'Set it manually or calculate it from the sensory profile.', calculate: 'Calculate', overallScore: 'Overall score',
    flavorTipTitle: 'The three-descriptor rule', flavorTip: 'Choose three dominant notes: one for aroma, one for the main flavor, and one for the finish. CoffeeMind remembers frequently used flavors.', mainNotes: 'Main cup notes', mainNotesHint: 'Search by name or move from a group to a specific flavor.', customDescriptors: 'Custom and additional descriptors', descriptorPlaceholder: 'Type a flavor and press Enter…', descriptorHint: 'Save unusual or highly specific associations here without a limit.', addMore: '+ add more',
    notesTipTitle: 'What to write in notes', notesTip: 'Context often matters more than a long description: what surprised you, what to test in the recipe, and how the cup changed while cooling.', tastingNotes: 'Tasting notes', notesPlaceholder: 'Describe the context, what surprised you, and what you would change next time…', cardPhoto: 'Card photo', removePhoto: 'Remove photo',
    summaryTipTitle: 'Next step', summaryTip: 'Review the record. After saving, CoffeeMind will open AI Coach and ask questions that help describe the cup more precisely.', untitled: 'Untitled', saving: 'Saving…', saveTasting: 'Save tasting', saveChanges: 'Save changes', localSave: 'Saved locally on this device', saveError: 'Could not save the tasting. Refresh the page and try again.', editing: 'Editing', newTasting: 'New tasting', review: 'Review', continue: 'Continue',
  },
  metrics: { aroma: 'Aroma', flavor: 'Flavor', acidity: 'Acidity', sweetness: 'Sweetness', body: 'Body', bitterness: 'Bitterness', balance: 'Balance', cleanCup: 'Clean cup', clean: 'Cleanliness', aftertaste: 'Aftertaste' },
  wheel: { search: 'Find a flavor: bergamot, strawberry…', selected: 'Selected', suggested: 'Favorites and frequent', groups: 'Flavor groups', results: 'Search results', back: 'All categories', addFavorite: 'Add to favorites', removeFavorite: 'Remove from favorites', empty: 'Nothing found. Add a custom descriptor below.', chooseUpTo: 'Choose up to {count} main notes', descriptorCount: '{count} descriptors' },
  detail: {
    notFound: 'Tasting not found', notFoundText: 'This record may have been deleted.', backHome: 'Back to journal', score: 'Score', secUnit: 'sec', deleteConfirm: 'Delete this tasting? This cannot be undone.', edit: 'Edit tasting', delete: 'Delete tasting', originBean: 'Origin & bean', brewDetails: 'Brew details', sensory: 'Sensory', cupProfile: 'Cup profile', attributeScores: 'Attribute scores', flavorProfile: 'Flavor profile', tastingNotes: 'Tasting notes',
    roaster: 'Roaster', country: 'Country', region: 'Region', farm: 'Farm', producer: 'Producer', washingStation: 'Washing station', elevation: 'Elevation', harvest: 'Harvest', lot: 'Lot', variety: 'Variety', processing: 'Process', roastDate: 'Roast date', method: 'Method', dose: 'Dose', yield: 'Yield', time: 'Time', temp: 'Temp', ratio: 'Brew ratio', grinder: 'Grinder', grindSetting: 'Grind setting', water: 'Water', waterTds: 'Water TDS', bloom: 'Bloom', dryAroma: 'Dry aroma', wetAroma: 'Wet aroma', firstImpression: 'First impression', brightest: 'Brightest attribute', character: 'Character', topDescriptors: 'Top descriptors', additional: 'Additional',
    characterBright: 'Bright and juicy', characterSweet: 'Sweet and rounded', characterDense: 'Dense and rich', characterBalanced: 'Balanced',
  },
  coach: {
    notFound: 'Tasting not found', notFoundText: 'This record may have been deleted.', backHome: 'Back home', title: 'Cup review', intro: 'CoffeeMind turns a record into flavor training. This is not the final AI analysis yet; it is the first coach version based on your data.', saved: 'Saved', mainThought: 'Main insight', nextTime: 'What to notice next time', questions: 'Questions for precision', miniTask: 'Mini task', miniTaskText: 'Take another sip as the cup cools and ask yourself: did it become sweeter, drier, or brighter? This simple observation builds sensory memory.', openRecord: 'Open record', journal: 'Journal',
    noDescriptor: 'You have not selected descriptors yet. Next time, capture three: one aroma, one main flavor, and one finish.', descriptor: 'Main descriptor: {name}. Can you make it more precise: fresh, jammy, dried, candy-like, or fermented?', acidityHigh: 'Acidity is high. Next time, identify whether it feels citrusy, berry-like, winey, or malic.', acidityMedium: 'Acidity is noticeable but not sharp. Compare it with sweetness and body.', acidityLow: 'Acidity is soft. Notice whether the cup leans toward chocolate, nuts, or caramel.', sweetnessHigh: 'Sweetness is pronounced. Name it more precisely: honey, caramel, jam, ripe fruit, or sugar.', sweetnessMedium: 'Sweetness is present, but the recipe may reveal more through grind, temperature, and time.', sweetnessLow: 'Sweetness is low. Check whether bitterness, under-extraction, or a short brew time is masking it.', balanceGood: 'The cup feels confidently balanced.', balanceImprove: 'The recipe can still improve the balance.', cleanGood: 'Flavor clarity is good and useful for comparison.', cleanImprove: 'Check the cup clarity again as it cools.', aftertasteGood: 'The finish is long enough to describe in more detail.', aftertasteImprove: 'The finish currently feels short or muted.', q1: 'If you describe “{name}” more precisely, is it aroma, flavor, or aftertaste?', q2: 'Acidity {value}/10: does it resemble lemon, apple, berries, or wine?', q3: 'What changes as the cup cools: sweetness, body, clarity, or aftertaste?', mainFlavor: 'main flavor',
  },
};

export function useTastingCopy() {
  const { language, locale } = useLanguage();
  const copy: TastingCopy = language === 'ru' ? ru : en;
  return { copy, language, locale };
}

const flavorEnglish: Record<string, string> = {
  'Цветочные': 'Floral', 'Белые цветы': 'White flowers', 'Садовые цветы': 'Garden flowers', 'Чайные': 'Tea-like',
  'Жасмин': 'Jasmine', 'Цветок апельсина': 'Orange blossom', 'Жимолость': 'Honeysuckle', 'Бузина': 'Elderflower',
  'Роза': 'Rose', 'Лаванда': 'Lavender', 'Ромашка': 'Chamomile', 'Фиалка': 'Violet',
  'Бергамот': 'Bergamot', 'Чёрный чай': 'Black tea', 'Зелёный чай': 'Green tea', 'Улун': 'Oolong',
  'Ягоды': 'Berries', 'Красные ягоды': 'Red berries', 'Тёмные ягоды': 'Dark berries', 'Косточковые': 'Stone fruit',
  'Клубника': 'Strawberry', 'Малина': 'Raspberry', 'Красная смородина': 'Red currant', 'Клюква': 'Cranberry',
  'Черника': 'Blueberry', 'Ежевика': 'Blackberry', 'Чёрная смородина': 'Black currant', 'Виноград': 'Grape',
  'Вишня': 'Sour cherry', 'Черешня': 'Sweet cherry', 'Слива': 'Plum', 'Абрикос': 'Apricot',
  'Фрукты': 'Fruit', 'Тропические': 'Tropical', 'Садовые': 'Orchard fruit', 'Сухофрукты': 'Dried fruit',
  'Манго': 'Mango', 'Ананас': 'Pineapple', 'Маракуйя': 'Passion fruit', 'Папайя': 'Papaya', 'Личи': 'Lychee',
  'Персик': 'Peach', 'Нектарин': 'Nectarine', 'Яблоко': 'Apple', 'Груша': 'Pear', 'Айва': 'Quince',
  'Изюм': 'Raisin', 'Финик': 'Date', 'Инжир': 'Fig', 'Чернослив': 'Prune',
  'Цитрусы': 'Citrus', 'Сладкие цитрусы': 'Sweet citrus', 'Яркие цитрусы': 'Bright citrus', 'Кислые и винные': 'Tart and winey',
  'Апельсин': 'Orange', 'Мандарин': 'Mandarin', 'Клементин': 'Clementine', 'Помело': 'Pomelo',
  'Лимон': 'Lemon', 'Лайм': 'Lime', 'Грейпфрут': 'Grapefruit', 'Юдзу': 'Yuzu',
  'Гибискус': 'Hibiscus', 'Тамаринд': 'Tamarind', 'Красное вино': 'Red wine', 'Яблочная кислота': 'Malic acidity',
  'Сладкие': 'Sweet', 'Сахара': 'Sugars', 'Кондитерские': 'Confectionery', 'Ферментированные': 'Fermented',
  'Мёд': 'Honey', 'Тростниковый сахар': 'Cane sugar', 'Коричневый сахар': 'Brown sugar', 'Патока': 'Molasses', 'Кленовый сироп': 'Maple syrup',
  'Карамель': 'Caramel', 'Ириска': 'Toffee', 'Ваниль': 'Vanilla', 'Зефир': 'Marshmallow', 'Печенье': 'Cookie',
  'Ром': 'Rum', 'Коньяк': 'Cognac', 'Сидр': 'Cider',
  'Орехи и какао': 'Nuts and cocoa', 'Орехи': 'Nuts', 'Какао': 'Cocoa', 'Выпечка': 'Baked goods',
  'Фундук': 'Hazelnut', 'Миндаль': 'Almond', 'Грецкий орех': 'Walnut', 'Арахис': 'Peanut', 'Макадамия': 'Macadamia',
  'Молочный шоколад': 'Milk chocolate', 'Тёмный шоколад': 'Dark chocolate', 'Какао-нибсы': 'Cacao nibs',
  'Бриошь': 'Brioche', 'Тост': 'Toast', 'Солод': 'Malt',
  'Специи': 'Spices', 'Тёплые специи': 'Warm spices', 'Пряные': 'Pungent spices',
  'Корица': 'Cinnamon', 'Гвоздика': 'Clove', 'Кардамон': 'Cardamom', 'Мускатный орех': 'Nutmeg', 'Бадьян': 'Star anise',
  'Чёрный перец': 'Black pepper', 'Имбирь': 'Ginger', 'Анис': 'Anise', 'Шафран': 'Saffron',
  'Зелёные и травяные': 'Green and herbal', 'Свежие': 'Fresh', 'Растительные': 'Vegetal', 'Древесные': 'Woody',
  'Мята': 'Mint', 'Базилик': 'Basil', 'Лемонграсс': 'Lemongrass', 'Эвкалипт': 'Eucalyptus',
  'Томат': 'Tomato', 'Горох': 'Pea', 'Свежая трава': 'Fresh grass', 'Оливка': 'Olive',
  'Кедр': 'Cedar', 'Сандал': 'Sandalwood', 'Табак': 'Tobacco', 'Кожа': 'Leather',
};

export function localizeFlavor(value: string, language: 'ru' | 'en') {
  return language === 'en' ? (flavorEnglish[value] ?? value) : value;
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
