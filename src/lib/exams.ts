import { getWeekPeriod } from '@/lib/weeklyChallenges';

export type ExamDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExamTopic = 'origins' | 'processing' | 'brewing' | 'sensory';
export type ExamLanguage = 'ru' | 'en';

export interface LocalizedExamText {
  ru: string;
  en: string;
}

export interface ExamOption {
  id: string;
  text: LocalizedExamText;
}

export interface ExamQuestion {
  id: string;
  difficulty: ExamDifficulty;
  topic: ExamTopic;
  question: LocalizedExamText;
  options: ExamOption[];
  correctOptionId: string;
  explanation: LocalizedExamText;
}

export interface ExamQuestionView extends ExamQuestion {
  shuffledOptions: ExamOption[];
}

export interface ExamDifficultyDefinition {
  id: ExamDifficulty;
  passPercent: number;
  rewardPoints: number;
  icon: string;
}

export const EXAM_DIFFICULTIES: readonly ExamDifficultyDefinition[] = [
  { id: 'beginner', passPercent: 70, rewardPoints: 50, icon: '🌱' },
  { id: 'intermediate', passPercent: 75, rewardPoints: 80, icon: '⚗️' },
  { id: 'advanced', passPercent: 80, rewardPoints: 120, icon: '🎓' },
] as const;

const text = (ru: string, en: string): LocalizedExamText => ({ ru, en });
const option = (id: string, ru: string, en: string): ExamOption => ({ id, text: text(ru, en) });

export const EXAM_QUESTIONS: readonly ExamQuestion[] = [
  // Beginner · origins
  {
    id: 'beg-origin-arabica', difficulty: 'beginner', topic: 'origins',
    question: text('Какую страну чаще всего называют родиной арабики?', 'Which country is most often described as the birthplace of Arabica coffee?'),
    options: [option('ethiopia', 'Эфиопия', 'Ethiopia'), option('brazil', 'Бразилия', 'Brazil'), option('colombia', 'Колумбия', 'Colombia'), option('indonesia', 'Индонезия', 'Indonesia')],
    correctOptionId: 'ethiopia',
    explanation: text('Дикорастущая Coffea arabica происходит из Эфиопии, а её раннее культурное распространение тесно связано с Йеменом.', 'Wild Coffea arabica originates in Ethiopia, while its early cultivation history is closely linked to Yemen.'),
  },
  {
    id: 'beg-origin-largest', difficulty: 'beginner', topic: 'origins',
    question: text('Какая страна является крупнейшим производителем кофе в мире?', 'Which country is the world’s largest coffee producer?'),
    options: [option('brazil', 'Бразилия', 'Brazil'), option('kenya', 'Кения', 'Kenya'), option('panama', 'Панама', 'Panama'), option('rwanda', 'Руанда', 'Rwanda')],
    correctOptionId: 'brazil',
    explanation: text('Бразилия много лет остаётся крупнейшим производителем кофе по общему объёму.', 'Brazil has long remained the largest coffee producer by total volume.'),
  },
  {
    id: 'beg-origin-altitude', difficulty: 'beginner', topic: 'origins',
    question: text('Что обычно происходит с кофейной ягодой на большой высоте при прохладном климате?', 'What usually happens to coffee cherries at higher elevations in a cooler climate?'),
    options: [option('slow', 'Созревание замедляется', 'They ripen more slowly'), option('instant', 'Созревают почти мгновенно', 'They ripen almost instantly'), option('no-sugar', 'Полностью перестают накапливать сахара', 'They stop developing sugars entirely'), option('boil', 'Начинают ферментироваться на дереве', 'They begin fermenting on the tree')],
    correctOptionId: 'slow',
    explanation: text('Более медленное созревание часто способствует формированию плотного зерна и сложного вкусового профиля.', 'Slower ripening often supports denser beans and a more complex flavor profile.'),
  },

  // Beginner · processing
  {
    id: 'beg-process-washed', difficulty: 'beginner', topic: 'processing',
    question: text('Что отличает мытую обработку?', 'What defines washed processing?'),
    options: [option('removed', 'Мякоть удаляют до основной сушки зерна', 'The fruit is removed before the main drying stage'), option('whole', 'Ягоду всегда сушат целиком', 'The whole cherry is always dried intact'), option('roasted', 'Зерно обжаривают сразу после сбора', 'The bean is roasted immediately after harvest'), option('frozen', 'Ягоды обязательно замораживают', 'The cherries must be frozen')],
    correctOptionId: 'removed',
    explanation: text('При мытой обработке мякоть и клейковину удаляют до сушки, обычно с помощью депульпации, ферментации и промывки.', 'In washed processing, fruit and mucilage are removed before drying, typically through depulping, fermentation, and washing.'),
  },
  {
    id: 'beg-process-natural', difficulty: 'beginner', topic: 'processing',
    question: text('Как сушат кофе при натуральной обработке?', 'How is coffee dried in natural processing?'),
    options: [option('whole-cherry', 'Внутри целой ягоды', 'Inside the whole cherry'), option('parchment-only', 'Только без пергамента', 'Only without parchment'), option('in-water', 'Полностью под водой', 'Fully underwater'), option('after-roast', 'После обжарки', 'After roasting')],
    correctOptionId: 'whole-cherry',
    explanation: text('Натуральный кофе сушится вместе с мякотью и кожицей ягоды, что часто усиливает фруктовый характер.', 'Natural coffee dries with the fruit and skin intact, which often intensifies fruity character.'),
  },
  {
    id: 'beg-process-honey', difficulty: 'beginner', topic: 'processing',
    question: text('Что обычно оставляют на зерне при хани-обработке перед сушкой?', 'What is typically left on the bean before drying in honey processing?'),
    options: [option('mucilage', 'Часть клейковины', 'Some mucilage'), option('metal', 'Металлическую оболочку', 'A metal coating'), option('roast-oil', 'Масла после обжарки', 'Roasting oils'), option('nothing', 'Ничего: зерно полностью очищают и полируют', 'Nothing: the bean is fully cleaned and polished')],
    correctOptionId: 'mucilage',
    explanation: text('Хани-обработка сохраняет часть сладкой клейковины на пергаменте во время сушки.', 'Honey processing keeps part of the sweet mucilage on the parchment during drying.'),
  },

  // Beginner · brewing
  {
    id: 'beg-brew-v60', difficulty: 'beginner', topic: 'brewing',
    question: text('К какому типу заваривания относится V60?', 'Which brewing family does the V60 belong to?'),
    options: [option('pour-over', 'Пуровер / пролив', 'Pour-over'), option('espresso', 'Эспрессо под давлением', 'Pressure espresso'), option('immersion', 'Полное погружение без фильтрации', 'Full immersion without filtration'), option('boiling', 'Кипячение в турке', 'Boiling in an cezve')],
    correctOptionId: 'pour-over',
    explanation: text('V60 — конический пуровер, где вода проходит через слой кофе и бумажный фильтр.', 'The V60 is a conical pour-over brewer where water passes through the coffee bed and a paper filter.'),
  },
  {
    id: 'beg-brew-french', difficulty: 'beginner', topic: 'brewing',
    question: text('Какой принцип используется во френч-прессе?', 'Which principle is used in a French press?'),
    options: [option('immersion', 'Погружение кофе в воду', 'Immersion of coffee in water'), option('high-pressure', 'Высокое давление 9 бар', 'High pressure at 9 bar'), option('vacuum-only', 'Только вакуум', 'Vacuum only'), option('steam', 'Только пар', 'Steam only')],
    correctOptionId: 'immersion',
    explanation: text('Во френч-прессе кофе контактирует со всем объёмом воды, после чего гущу отделяет металлический фильтр.', 'In a French press, coffee contacts the full volume of water before a metal filter separates the grounds.'),
  },
  {
    id: 'beg-brew-espresso', difficulty: 'beginner', topic: 'brewing',
    question: text('Что является ключевой особенностью эспрессо?', 'What is a defining feature of espresso?'),
    options: [option('pressure', 'Заваривание под давлением', 'Brewing under pressure'), option('cold-day', 'Сутки холодной экстракции', 'A full day of cold extraction'), option('no-grind', 'Использование цельных зёрен', 'Using whole beans'), option('paper-only', 'Обязательный бумажный фильтр', 'A mandatory paper filter')],
    correctOptionId: 'pressure',
    explanation: text('Эспрессо получают, пропуская горячую воду через мелко смолотый кофе под давлением.', 'Espresso is made by forcing hot water through finely ground coffee under pressure.'),
  },

  // Beginner · sensory
  {
    id: 'beg-sensory-body', difficulty: 'beginner', topic: 'sensory',
    question: text('Что означает «тело» кофе?', 'What does coffee “body” describe?'),
    options: [option('texture', 'Ощущение плотности и текстуры во рту', 'The sensation of weight and texture in the mouth'), option('color', 'Только цвет напитка', 'Only the color of the drink'), option('caffeine', 'Точное количество кофеина', 'The exact caffeine amount'), option('temperature', 'Температуру подачи', 'Serving temperature')],
    correctOptionId: 'texture',
    explanation: text('Тело — это тактильное ощущение напитка: лёгкое, чайное, сливочное, плотное и так далее.', 'Body is the tactile feel of the beverage: light, tea-like, creamy, heavy, and so on.'),
  },
  {
    id: 'beg-sensory-acidity', difficulty: 'beginner', topic: 'sensory',
    question: text('Что обычно подразумевают под приятной кислотностью в кофе?', 'What does pleasant acidity in coffee usually mean?'),
    options: [option('brightness', 'Живую фруктовую яркость', 'Lively fruity brightness'), option('spoiled', 'Обязательный признак испорченного кофе', 'A certain sign of spoiled coffee'), option('salt', 'Солёность', 'Saltiness'), option('heat', 'Высокую температуру', 'High temperature')],
    correctOptionId: 'brightness',
    explanation: text('Качественная кислотность напоминает цитрусы, ягоды или косточковые фрукты и отличается от резкой незрелой кислоты.', 'Quality acidity can resemble citrus, berries, or stone fruit and differs from harsh, underdeveloped sourness.'),
  },
  {
    id: 'beg-sensory-aroma', difficulty: 'beginner', topic: 'sensory',
    question: text('Когда мы оцениваем аромат кофе?', 'When do we evaluate coffee aroma?'),
    options: [option('dry-wet', 'И у сухого кофе, и после контакта с водой', 'Both dry and after contact with water'), option('after-cold', 'Только после полного охлаждения', 'Only after complete cooling'), option('never', 'Аромат не относится к дегустации', 'Aroma is not part of tasting'), option('package', 'Только по упаковке', 'Only from the package')],
    correctOptionId: 'dry-wet',
    explanation: text('Сухой аромат молотого кофе и влажный аромат после заваривания дают разные части сенсорной картины.', 'Dry fragrance and wet aroma after brewing reveal different parts of the sensory picture.'),
  },

  // Intermediate · origins
  {
    id: 'mid-origin-kenya', difficulty: 'intermediate', topic: 'origins',
    question: text('Какие разновидности особенно ассоциируются с классическим профилем Кении?', 'Which varieties are especially associated with classic Kenyan coffee profiles?'),
    options: [option('sl', 'SL28 и SL34', 'SL28 and SL34'), option('robusta', 'Только робуста', 'Robusta only'), option('maragogype', 'Только Марагоджип', 'Maragogype only'), option('liberica', 'Только либерика', 'Liberica only')],
    correctOptionId: 'sl',
    explanation: text('SL28 и SL34 широко выращиваются в Кении и известны яркой кислотностью и насыщенным фруктовым профилем.', 'SL28 and SL34 are widely grown in Kenya and are known for vivid acidity and intense fruit character.'),
  },
  {
    id: 'mid-origin-colombia', difficulty: 'intermediate', topic: 'origins',
    question: text('Почему в Колумбии возможно несколько периодов сбора урожая?', 'Why can Colombia have more than one harvest period?'),
    options: [option('geography', 'Из-за разнообразного рельефа и близости к экватору', 'Because of varied topography and proximity to the equator'), option('snow', 'Из-за продолжительной снежной зимы', 'Because of a long snowy winter'), option('indoor', 'Потому что весь кофе выращивают в помещениях', 'Because all coffee is grown indoors'), option('single-farm', 'Потому что в стране только одна ферма', 'Because the country has only one farm')],
    correctOptionId: 'geography',
    explanation: text('Разные высоты, микроклиматы и положение у экватора создают основные и промежуточные урожаи в разных регионах.', 'Different elevations, microclimates, and equatorial geography create main and secondary harvests across regions.'),
  },
  {
    id: 'mid-origin-brazil', difficulty: 'intermediate', topic: 'origins',
    question: text('Какие способы обработки особенно распространены в Бразилии?', 'Which processing styles are especially common in Brazil?'),
    options: [option('natural-pulped', 'Натуральная и палпед-натурал', 'Natural and pulped natural'), option('wet-hulled', 'Только вет-халл', 'Wet-hulled only'), option('monsoon', 'Только муссонная', 'Monsooned only'), option('freeze', 'Только криогенная', 'Cryogenic only')],
    correctOptionId: 'natural-pulped',
    explanation: text('Климат и масштаб производства сделали натуральную и палпед-натурал обработку важной частью бразильской кофейной индустрии.', 'Climate and production scale have made natural and pulped natural processing central to Brazil’s coffee industry.'),
  },

  // Intermediate · processing
  {
    id: 'mid-process-anaerobic', difficulty: 'intermediate', topic: 'processing',
    question: text('Что означает анаэробная ферментация в контексте обработки кофе?', 'What does anaerobic fermentation mean in coffee processing?'),
    options: [option('low-oxygen', 'Ферментация в герметичной среде с ограниченным кислородом', 'Fermentation in a sealed, oxygen-limited environment'), option('sun-only', 'Сушка только на солнце без ферментации', 'Sun drying only, without fermentation'), option('roast', 'Ферментация уже обжаренного зерна', 'Fermenting already roasted beans'), option('oxygen', 'Постоянная интенсивная подача кислорода', 'Constant intensive oxygen supply')],
    correctOptionId: 'low-oxygen',
    explanation: text('Герметичная среда меняет активность микроорганизмов и ход ферментации, но результат зависит от сырья и контроля процесса.', 'A sealed environment changes microbial activity and fermentation dynamics, though results still depend on raw material and process control.'),
  },
  {
    id: 'mid-process-wethulled', difficulty: 'intermediate', topic: 'processing',
    question: text('С какой страной особенно связан метод вет-халл (giling basah)?', 'Which country is especially associated with wet-hulled processing (giling basah)?'),
    options: [option('indonesia', 'Индонезия', 'Indonesia'), option('finland', 'Финляндия', 'Finland'), option('canada', 'Канада', 'Canada'), option('morocco', 'Марокко', 'Morocco')],
    correctOptionId: 'indonesia',
    explanation: text('Вет-халл широко применяется в Индонезии: пергамент снимают при более высокой влажности зерна, чем в большинстве других методов.', 'Wet-hulling is widely used in Indonesia, where parchment is removed at a higher bean moisture level than in most other methods.'),
  },
  {
    id: 'mid-process-carbonic', difficulty: 'intermediate', topic: 'processing',
    question: text('Что характерно для карбонической мацерации кофе?', 'What characterizes carbonic maceration in coffee?'),
    options: [option('co2', 'Целые ягоды ферментируются в среде, насыщенной CO₂', 'Whole cherries ferment in a CO₂-rich environment'), option('boil', 'Зёрна варят перед сушкой', 'Beans are boiled before drying'), option('salt', 'Ягоды выдерживают только в солёной воде', 'Cherries are held only in salt water'), option('roast-first', 'Сначала кофе обжаривают, затем ферментируют', 'Coffee is roasted before fermentation')],
    correctOptionId: 'co2',
    explanation: text('Метод вдохновлён виноделием: углекислый газ и целые ягоды создают особые условия внутри плодов и резервуара.', 'Inspired by winemaking, carbon dioxide and whole cherries create distinctive conditions inside the fruit and tank.'),
  },

  // Intermediate · brewing
  {
    id: 'mid-brew-finer', difficulty: 'intermediate', topic: 'brewing',
    question: text('При прочих равных, как более мелкий помол обычно влияет на экстракцию?', 'All else equal, how does a finer grind usually affect extraction?'),
    options: [option('increase', 'Увеличивает экстракцию', 'It increases extraction'), option('decrease', 'Всегда уменьшает экстракцию', 'It always decreases extraction'), option('none', 'Никак не влияет', 'It has no effect'), option('freeze', 'Останавливает растворение веществ', 'It stops compounds from dissolving')],
    correctOptionId: 'increase',
    explanation: text('Мелкий помол увеличивает площадь поверхности и сопротивление потоку, поэтому обычно повышает извлечение растворимых веществ.', 'A finer grind increases surface area and flow resistance, usually raising the extraction of soluble compounds.'),
  },
  {
    id: 'mid-brew-channeling', difficulty: 'intermediate', topic: 'brewing',
    question: text('Что такое ченнелинг в эспрессо?', 'What is channeling in espresso?'),
    options: [option('paths', 'Неравномерные пути, по которым вода проходит через таблетку', 'Uneven paths where water flows through the puck'), option('cooling', 'Охлаждение чашки перед подачей', 'Cooling the cup before serving'), option('grinder', 'Очистка канала кофемолки', 'Cleaning the grinder chute'), option('milk', 'Создание рисунка молоком', 'Creating latte art')],
    correctOptionId: 'paths',
    explanation: text('Ченнелинг приводит к одновременной недо- и переэкстракции разных зон кофейной таблетки.', 'Channeling causes different areas of the coffee puck to be under- and over-extracted at the same time.'),
  },
  {
    id: 'mid-brew-bloom', difficulty: 'intermediate', topic: 'brewing',
    question: text('Главная задача блуминга в пуровере —', 'The main purpose of blooming in pour-over is to—'),
    options: [option('gas', 'Дать углекислому газу выйти из свежего кофе', 'Allow carbon dioxide to escape from fresh coffee'), option('cool', 'Полностью охладить кофе', 'Cool the coffee completely'), option('filter', 'Растворить бумажный фильтр', 'Dissolve the paper filter'), option('stop', 'Остановить экстракцию', 'Stop extraction')],
    correctOptionId: 'gas',
    explanation: text('Предсмачивание помогает выпустить CO₂, чтобы последующий пролив проходил равномернее.', 'Pre-wetting helps release CO₂ so the following pours can wet and extract the bed more evenly.'),
  },

  // Intermediate · sensory
  {
    id: 'mid-sensory-under', difficulty: 'intermediate', topic: 'sensory',
    question: text('Какой набор признаков чаще указывает на недоэкстракцию?', 'Which set of traits most often suggests under-extraction?'),
    options: [option('sour-thin', 'Резкая кислотность, слабая сладость и тонкое тело', 'Sharp sourness, low sweetness, and thin body'), option('dry-bitter', 'Сухость, тяжёлая горечь и пустое послевкусие', 'Dryness, heavy bitterness, and a hollow finish'), option('balanced', 'Сладость, прозрачность и баланс', 'Sweetness, clarity, and balance'), option('salty-only', 'Только солёный аромат', 'Only a salty aroma')],
    correctOptionId: 'sour-thin',
    explanation: text('Недоэкстрагированный кофе часто ощущается резко кислым, пустым или солоноватым, с недостатком сладости.', 'Under-extracted coffee often tastes sharply sour, hollow, or somewhat salty, with insufficient sweetness.'),
  },
  {
    id: 'mid-sensory-over', difficulty: 'intermediate', topic: 'sensory',
    question: text('Какой признак чаще связан с переэкстракцией?', 'Which trait is more often associated with over-extraction?'),
    options: [option('dry', 'Сухое вяжущее послевкусие', 'A dry, astringent finish'), option('juicy', 'Чистая сочная кислотность', 'Clean, juicy acidity'), option('floral', 'Только цветочный аромат', 'A floral aroma alone'), option('sweet', 'Рост сладости без ограничений', 'Unlimited increase in sweetness')],
    correctOptionId: 'dry',
    explanation: text('Чрезмерная экстракция может приносить горечь, сухость и вяжущее ощущение, хотя причина всегда оценивается в контексте рецепта.', 'Excessive extraction can bring bitterness, dryness, and astringency, though the cause should always be judged in recipe context.'),
  },
  {
    id: 'mid-sensory-cupping', difficulty: 'intermediate', topic: 'sensory',
    question: text('Зачем в индустрии используют стандартизированный каппинг?', 'Why does the coffee industry use standardized cupping?'),
    options: [option('compare', 'Чтобы сравнивать кофе в максимально одинаковых условиях', 'To compare coffees under as consistent conditions as possible'), option('latte', 'Чтобы оценивать латте-арт', 'To evaluate latte art'), option('sell-only', 'Только для расчёта розничной цены', 'Only to calculate retail price'), option('caffeine', 'Чтобы удалить кофеин', 'To remove caffeine')],
    correctOptionId: 'compare',
    explanation: text('Единый протокол снижает влияние разных рецептов и позволяет сосредоточиться на качестве и характере самого кофе.', 'A shared protocol reduces recipe variability and helps tasters focus on the coffee’s own quality and character.'),
  },

  // Advanced · origins
  {
    id: 'adv-origin-terroir', difficulty: 'advanced', topic: 'origins',
    question: text('Что точнее всего описывает «терруар» в кофе?', 'Which statement best describes “terroir” in coffee?'),
    options: [option('system', 'Совокупность климата, почвы, высоты, экологии и практик места', 'The combined influence of climate, soil, elevation, ecology, and local practices'), option('country-only', 'Только название страны', 'Only the country name'), option('roast', 'Исключительно профиль обжарки', 'Only the roast profile'), option('package', 'Дизайн упаковки', 'Package design')],
    correctOptionId: 'system',
    explanation: text('Терруар — не один фактор, а система природных и человеческих условий, влияющих на развитие кофейного растения и ягоды.', 'Terroir is not one variable but a system of natural and human conditions shaping the plant and cherry.'),
  },
  {
    id: 'adv-origin-gesha', difficulty: 'advanced', topic: 'origins',
    question: text('С какой страной особенно связан мировой рост известности разновидности Геша?', 'Which country is especially linked to the global rise of the Gesha variety?'),
    options: [option('panama', 'Панама', 'Panama'), option('norway', 'Норвегия', 'Norway'), option('india', 'Индия', 'India'), option('australia', 'Австралия', 'Australia')],
    correctOptionId: 'panama',
    explanation: text('Хотя происхождение разновидности связано с Эфиопией, именно панамские лоты сделали Гешу мировой сенсацией в specialty coffee.', 'Although the variety traces back to Ethiopia, Panamanian lots made Gesha a global specialty-coffee phenomenon.'),
  },
  {
    id: 'adv-origin-station', difficulty: 'advanced', topic: 'origins',
    question: text('Какую роль часто играет washing station в Восточной Африке?', 'What role does a washing station often play in East African coffee production?'),
    options: [option('central', 'Централизованно принимает и обрабатывает ягоды множества мелких фермеров', 'It centrally receives and processes cherries from many smallholders'), option('roaster', 'Только обжаривает кофе для кафе', 'It only roasts coffee for cafés'), option('export-office', 'Только печатает экспортные документы', 'It only prints export documents'), option('storage', 'Хранит готовый напиток', 'It stores brewed coffee')],
    correctOptionId: 'central',
    explanation: text('Станции обработки позволяют объединять ягоды мелких производителей и контролировать сортировку, ферментацию, промывку и сушку.', 'Washing stations aggregate cherries from smallholders and manage sorting, fermentation, washing, and drying.'),
  },

  // Advanced · processing
  {
    id: 'adv-process-inoculation', difficulty: 'advanced', topic: 'processing',
    question: text('Зачем производитель может использовать инокуляцию выбранной культурой дрожжей?', 'Why might a producer inoculate coffee with a selected yeast culture?'),
    options: [option('control', 'Чтобы сделать ферментацию более управляемой и повторяемой', 'To make fermentation more controlled and repeatable'), option('caffeine', 'Чтобы гарантированно удвоить кофеин', 'To guarantee twice the caffeine'), option('roast', 'Чтобы заменить обжарку', 'To replace roasting'), option('water', 'Чтобы полностью исключить сушку', 'To eliminate drying entirely')],
    correctOptionId: 'control',
    explanation: text('Выбранные культуры могут направлять микробиологический процесс, но не отменяют значение сырья, гигиены, температуры и времени.', 'Selected cultures can steer microbial activity, but they do not replace the importance of raw material, hygiene, temperature, and time.'),
  },
  {
    id: 'adv-process-drying', difficulty: 'advanced', topic: 'processing',
    question: text('Почему равномерная сушка критична для зелёного кофе?', 'Why is even drying critical for green coffee?'),
    options: [option('stability', 'Она снижает риск плесени, дефектов и нестабильного хранения', 'It reduces the risk of mold, defects, and unstable storage'), option('color-only', 'Она влияет только на цвет мешка', 'It affects only the bag color'), option('caffeine', 'Она полностью удаляет кофеин', 'It removes all caffeine'), option('size', 'Она делает все зёрна одинакового размера', 'It makes every bean the same size')],
    correctOptionId: 'stability',
    explanation: text('Слишком быстрая, медленная или неравномерная сушка может создать градиенты влаги, микробиологические риски и потерю качества.', 'Drying that is too fast, too slow, or uneven can create moisture gradients, microbial risk, and quality loss.'),
  },
  {
    id: 'adv-process-thermal', difficulty: 'advanced', topic: 'processing',
    question: text('Что обычно подразумевают под thermal shock в экспериментальной обработке?', 'What does “thermal shock” usually refer to in experimental processing?'),
    options: [option('temperature-change', 'Контролируемое быстрое изменение температуры сырья или среды', 'A controlled rapid change in the temperature of the material or environment'), option('roast-burn', 'Случайное сгорание кофе при обжарке', 'Accidentally burning coffee during roasting'), option('freeze-cup', 'Подачу готового кофе со льдом', 'Serving brewed coffee over ice'), option('sun', 'Обычную сушку на солнце без других шагов', 'Ordinary sun drying with no other steps')],
    correctOptionId: 'temperature-change',
    explanation: text('Термин используют для температурных переходов, которые могут влиять на проницаемость тканей и ход ферментации; конкретные протоколы различаются.', 'The term describes temperature transitions that may affect tissue permeability and fermentation; exact protocols vary.'),
  },

  // Advanced · brewing
  {
    id: 'adv-brew-tds', difficulty: 'advanced', topic: 'brewing',
    question: text('Что показывает TDS в заваренном кофе?', 'What does TDS measure in brewed coffee?'),
    options: [option('concentration', 'Концентрацию растворённых веществ в напитке', 'The concentration of dissolved solids in the beverage'), option('yield', 'Только процент экстракции из сухого кофе', 'Only the percentage extracted from dry coffee'), option('temperature', 'Температуру воды', 'Water temperature'), option('grind', 'Размер частиц помола', 'Grind particle size')],
    correctOptionId: 'concentration',
    explanation: text('TDS описывает крепость напитка. Extraction yield рассчитывает, какая доля массы сухого кофе перешла в чашку, используя TDS и соотношение масс.', 'TDS describes beverage strength. Extraction yield estimates how much of the dry coffee mass entered the cup using TDS and brew mass relationships.'),
  },
  {
    id: 'adv-brew-bypass', difficulty: 'advanced', topic: 'brewing',
    question: text('Что такое bypass в заваривании?', 'What is bypass in brewing?'),
    options: [option('add-water', 'Добавление воды, которая не проходила через кофейный слой', 'Adding water that did not pass through the coffee bed'), option('channel', 'Любой случайный канал в таблетке эспрессо', 'Any random channel in an espresso puck'), option('regrind', 'Повторный помол заваренного кофе', 'Regrinding brewed coffee'), option('roast', 'Обход этапа обжарки', 'Skipping roasting')],
    correctOptionId: 'add-water',
    explanation: text('Байпас позволяет изменить крепость и объём напитка без дополнительной экстракции из кофейного слоя.', 'Bypass changes beverage strength and volume without extracting more from the coffee bed.'),
  },
  {
    id: 'adv-brew-agitation', difficulty: 'advanced', topic: 'brewing',
    question: text('Как усиление агитации обычно влияет на заваривание при прочих равных?', 'All else equal, how does greater agitation usually affect brewing?'),
    options: [option('mass-transfer', 'Усиливает массообмен и может повысить экстракцию', 'It increases mass transfer and can raise extraction'), option('zero', 'Всегда обнуляет экстракцию', 'It always reduces extraction to zero'), option('caffeine-only', 'Извлекает только кофеин', 'It extracts caffeine only'), option('no-effect', 'Никогда не влияет на поток и экстракцию', 'It never affects flow or extraction')],
    correctOptionId: 'mass-transfer',
    explanation: text('Перемешивание обновляет контакт воды с частицами, но чрезмерная агитация также может ускорить миграцию мелких частиц и замедлить пролив.', 'Agitation refreshes water-particle contact, but too much can also move fines and slow drawdown.'),
  },

  // Advanced · sensory
  {
    id: 'adv-sensory-triangle', difficulty: 'advanced', topic: 'sensory',
    question: text('Для чего используется триангуляционный тест?', 'What is a triangle test used for?'),
    options: [option('difference', 'Определить, различает ли дегустатор один отличающийся образец среди трёх', 'To determine whether a taster can identify one different sample among three'), option('score', 'Автоматически присвоить кофе 100 баллов', 'To automatically assign a 100-point score'), option('roast', 'Измерить цвет обжарки без прибора', 'To measure roast color without an instrument'), option('caffeine', 'Определить кофеин по аромату', 'To determine caffeine by aroma')],
    correctOptionId: 'difference',
    explanation: text('В тесте два образца одинаковы, один отличается; задача — найти отличающийся и проверить сенсорную различимость.', 'Two samples are the same and one differs; the task is to identify the odd sample and test perceptible difference.'),
  },
  {
    id: 'adv-sensory-specialty', difficulty: 'advanced', topic: 'sensory',
    question: text('Какой порог оценки традиционно связывают со specialty coffee в 100-балльной системе?', 'Which score threshold is traditionally associated with specialty coffee on a 100-point scale?'),
    options: [option('80', '80 баллов и выше', '80 points and above'), option('50', '50 баллов и выше', '50 points and above'), option('99', 'Только ровно 99 баллов', 'Exactly 99 points only'), option('no-score', 'Оценка никогда не используется', 'Scoring is never used')],
    correctOptionId: '80',
    explanation: text('В профессиональной практике кофе без первичных дефектов с итоговой оценкой 80+ традиционно относят к specialty-категории.', 'In professional practice, coffee free of primary defects and scoring 80+ has traditionally been classified as specialty.'),
  },
  {
    id: 'adv-sensory-astringency', difficulty: 'advanced', topic: 'sensory',
    question: text('Чем вяжущее ощущение отличается от горечи?', 'How does astringency differ from bitterness?'),
    options: [option('tactile', 'Вяжущее ощущение прежде всего тактильное: сухость и стягивание', 'Astringency is primarily tactile: drying and puckering'), option('same', 'Это полностью одинаковые ощущения', 'They are exactly the same sensation'), option('aroma', 'Вяжущее ощущение существует только как аромат', 'Astringency exists only as an aroma'), option('temperature', 'Вяжущее ощущение означает только низкую температуру', 'Astringency means only low temperature')],
    correctOptionId: 'tactile',
    explanation: text('Горечь — вкусовое ощущение, а вяжущесть воспринимается как сухость, шероховатость или стягивание тканей во рту.', 'Bitterness is a taste; astringency is perceived as drying, roughness, or puckering in the mouth.'),
  },
] as const;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seedValue: string): () => number {
  let seed = hashString(seedValue) || 1;
  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function shuffled<T>(items: readonly T[], seed: string): T[] {
  const result = [...items];
  const random = createRandom(seed);
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function getExamDifficulty(id: ExamDifficulty): ExamDifficultyDefinition {
  return EXAM_DIFFICULTIES.find((item) => item.id === id) ?? EXAM_DIFFICULTIES[0];
}

export function getCurrentExamWeekKey(reference = new Date()): string {
  return getWeekPeriod(reference).weekKey;
}

export function createExamSession(
  difficulty: ExamDifficulty,
  sessionSeed: string,
  count = 10,
): ExamQuestionView[] {
  const pool = EXAM_QUESTIONS.filter((question) => question.difficulty === difficulty);
  return shuffled(pool, `${difficulty}:${sessionSeed}`)
    .slice(0, Math.min(count, pool.length))
    .map((question) => ({
      ...question,
      shuffledOptions: shuffled(question.options, `${sessionSeed}:${question.id}:options`),
    }));
}

export function getExamQuestion(questionId: string): ExamQuestion | undefined {
  return EXAM_QUESTIONS.find((question) => question.id === questionId);
}

export function localizeExamText(value: LocalizedExamText, language: ExamLanguage): string {
  return value[language];
}
