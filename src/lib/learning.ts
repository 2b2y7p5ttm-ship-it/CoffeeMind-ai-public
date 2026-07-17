import type { ExamTopic, LocalizedExamText } from '@/lib/exams';

export type LearningLevel = 'foundation' | 'developing' | 'confident' | 'advanced';
export type LearningStage = 1 | 2 | 3;

export interface LearningSection {
  title: LocalizedExamText;
  body: LocalizedExamText;
  bullets?: LocalizedExamText[];
}

export interface LearningCheckpointOption {
  id: string;
  text: LocalizedExamText;
}

export interface LearningCheckpoint {
  question: LocalizedExamText;
  options: LearningCheckpointOption[];
  correctOptionId: string;
  explanation: LocalizedExamText;
}

export interface LearningLesson {
  id: string;
  topic: ExamTopic;
  order: number;
  stage: LearningStage;
  durationMinutes: number;
  icon: string;
  title: LocalizedExamText;
  summary: LocalizedExamText;
  sections: LearningSection[];
  takeaways: LocalizedExamText[];
  checkpoint: LearningCheckpoint;
}

const text = (ru: string, en: string): LocalizedExamText => ({ ru, en });
const option = (id: string, ru: string, en: string): LearningCheckpointOption => ({ id, text: text(ru, en) });

export const LEARNING_TOPICS: readonly ExamTopic[] = ['origins', 'processing', 'brewing', 'sensory'];

export const LEARNING_LESSONS: readonly LearningLesson[] = [
  {
    id: 'origins-arabica-journey',
    topic: 'origins',
    order: 1,
    stage: 1,
    durationMinutes: 5,
    icon: '🌍',
    title: text('Путь арабики', 'The journey of Arabica'),
    summary: text('От генетического центра в Эфиопии до мировых кофейных регионов.', 'From its genetic center in Ethiopia to coffee regions around the world.'),
    sections: [
      {
        title: text('Где начинается история', 'Where the story begins'),
        body: text('Coffea arabica происходит из Эфиопии, где сосредоточено основное генетическое разнообразие вида. Раннее выращивание и распространение культуры тесно связаны с Йеменом.', 'Coffea arabica is native to Ethiopia, where the species holds its greatest genetic diversity. Its early cultivation and wider spread are closely linked to Yemen.'),
      },
      {
        title: text('Почему происхождение важно', 'Why origin matters'),
        body: text('Страна на упаковке — только начало. Вкус формируют микроклимат, высота, почва, разновидность, зрелость ягоды, обработка и решения производителя.', 'The country on a bag is only the beginning. Flavor is shaped by microclimate, elevation, soil, variety, cherry ripeness, processing, and producer decisions.'),
        bullets: [
          text('Высота часто замедляет созревание и может повышать плотность зерна.', 'Elevation often slows ripening and can increase bean density.'),
          text('Регион не гарантирует конкретный вкус, но задаёт контекст.', 'A region does not guarantee a flavor, but it provides context.'),
        ],
      },
      {
        title: text('Как читать этикетку', 'How to read a label'),
        body: text('Сначала отделяй факт от ожидания: страна и регион описывают место, разновидность — генетику, обработка — путь после сбора, а дескрипторы — сенсорное описание конкретной партии.', 'Separate facts from expectations: country and region describe place, variety describes genetics, processing describes the post-harvest path, and descriptors describe the sensory character of a specific lot.'),
      },
    ],
    takeaways: [
      text('Эфиопия — родина арабики, а Йемен сыграл ключевую роль в её раннем выращивании.', 'Ethiopia is Arabica’s native home, while Yemen played a key role in its early cultivation.'),
      text('Происхождение — это система факторов, а не готовый вкусовой шаблон.', 'Origin is a system of factors, not a fixed flavor template.'),
    ],
    checkpoint: {
      question: text('Что точнее всего описывает происхождение кофе?', 'Which statement best describes coffee origin?'),
      options: [
        option('system', 'Сочетание места, климата, генетики и решений производителя', 'A combination of place, climate, genetics, and producer decisions'),
        option('country-only', 'Только название страны', 'Only the country name'),
        option('roast-only', 'Только степень обжарки', 'Only the roast level'),
      ],
      correctOptionId: 'system',
      explanation: text('Страна важна, но реальный профиль формируется множеством связанных факторов.', 'Country matters, but the final profile is shaped by many connected factors.'),
    },
  },
  {
    id: 'origins-species-varieties',
    topic: 'origins',
    order: 2,
    stage: 1,
    durationMinutes: 6,
    icon: '🌱',
    title: text('Виды и разновидности', 'Species and varieties'),
    summary: text('Арабика, канефора и то, почему разновидность не равна вкусовой гарантии.', 'Arabica, canephora, and why variety is not a flavor guarantee.'),
    sections: [
      {
        title: text('Вид и разновидность — не одно и то же', 'Species and variety are not the same'),
        body: text('Coffea arabica и Coffea canephora — разные виды. Внутри вида арабика существуют разновидности и культивары: Бурбон, Типика, Геша, Катурра и многие другие.', 'Coffea arabica and Coffea canephora are different species. Within Arabica there are varieties and cultivars such as Bourbon, Typica, Gesha, Caturra, and many others.'),
      },
      {
        title: text('Что меняет генетика', 'What genetics can influence'),
        body: text('Разновидность влияет на строение растения, урожайность, устойчивость к болезням, адаптацию к высоте и потенциальное качество чашки. Но итог зависит и от среды, агрономии, обработки и обжарки.', 'Variety can influence plant shape, yield, disease resistance, elevation adaptation, and cup-quality potential. The final result also depends on environment, agronomy, processing, and roasting.'),
      },
      {
        title: text('Как сравнивать разновидности', 'How to compare varieties'),
        body: text('Сравнивай не громкие названия, а партии с известным происхождением и условиями. Одна и та же разновидность в разных регионах может проявляться по-разному.', 'Compare lots with known origin and conditions rather than relying on famous names. The same variety can express differently across regions.'),
      },
    ],
    takeaways: [
      text('Вид — более широкая биологическая категория, разновидность — более узкая.', 'Species is a broader biological category; variety is narrower.'),
      text('Разновидность задаёт потенциал, но не определяет вкус в одиночку.', 'Variety sets potential but does not determine flavor on its own.'),
    ],
    checkpoint: {
      question: text('Почему нельзя обещать конкретный вкус только по названию разновидности?', 'Why can a variety name alone not promise a specific flavor?'),
      options: [
        option('many-factors', 'На вкус также влияют среда, обработка, обжарка и заваривание', 'Environment, processing, roasting, and brewing also affect flavor'),
        option('no-genetics', 'Генетика вообще не влияет на кофе', 'Genetics has no influence on coffee'),
        option('same-worldwide', 'Все разновидности одинаковы во всём мире', 'All varieties are identical worldwide'),
      ],
      correctOptionId: 'many-factors',
      explanation: text('Генетика важна, но она работает вместе со средой и всей цепочкой производства.', 'Genetics matters, but it works together with environment and the full production chain.'),
    },
  },
  {
    id: 'origins-terroir-altitude',
    topic: 'origins',
    order: 3,
    stage: 2,
    durationMinutes: 6,
    icon: '⛰️',
    title: text('Высота и микроклимат', 'Elevation and microclimate'),
    summary: text('Как температура, рельеф и скорость созревания меняют потенциал зерна.', 'How temperature, terrain, and ripening speed shape a bean’s potential.'),
    sections: [
      {
        title: text('Высота — косвенный показатель', 'Elevation is an indirect indicator'),
        body: text('Высота влияет на температуру и скорость созревания, но одинаковая отметка над уровнем моря означает разный климат в разных широтах. Поэтому высоту нужно читать вместе с регионом.', 'Elevation affects temperature and ripening speed, but the same elevation can mean different climates at different latitudes. Read elevation together with region.'),
      },
      {
        title: text('Медленное созревание', 'Slower ripening'),
        body: text('При более прохладных условиях ягода часто созревает дольше. Это может способствовать накоплению сахаров и формированию плотного зерна, если растение здорово и питание сбалансировано.', 'In cooler conditions, cherries often ripen more slowly. This can support sugar development and denser beans when the plant is healthy and well nourished.'),
      },
      {
        title: text('Терруар без мифов', 'Terroir without myths'),
        body: text('Терруар — не магическое слово, а взаимодействие климата, почвы, рельефа, биологии растения и хозяйственных практик. Он создаёт условия, а не гарантированный набор дескрипторов.', 'Terroir is not magic; it is the interaction of climate, soil, terrain, plant biology, and farming practices. It creates conditions, not a guaranteed list of descriptors.'),
      },
    ],
    takeaways: [
      text('Высоту нельзя оценивать без широты и климата региона.', 'Elevation should not be judged without latitude and regional climate.'),
      text('Более медленное созревание может повысить потенциал, но не заменяет хорошую агрономию.', 'Slower ripening can raise potential but does not replace good agronomy.'),
    ],
    checkpoint: {
      question: text('Почему 1800 метров в двух странах не обязательно означают одинаковые условия?', 'Why do 1,800 meters in two countries not necessarily mean the same conditions?'),
      options: [
        option('latitude', 'Из-за различий широты, температуры и микроклимата', 'Because latitude, temperature, and microclimate differ'),
        option('meters-change', 'Потому что метр имеет разную длину', 'Because a meter has a different length'),
        option('roast', 'Из-за цвета обжарки', 'Because of roast color'),
      ],
      correctOptionId: 'latitude',
      explanation: text('Высота влияет через климат, а климат зависит не только от высоты.', 'Elevation acts through climate, and climate depends on more than elevation alone.'),
    },
  },
  {
    id: 'processing-core-methods',
    topic: 'processing',
    order: 1,
    stage: 1,
    durationMinutes: 6,
    icon: '🫐',
    title: text('Мытая, натуральная и хани', 'Washed, natural, and honey'),
    summary: text('Три базовых маршрута от ягоды к сухому зерну.', 'Three core routes from cherry to dried seed.'),
    sections: [
      {
        title: text('Мытая обработка', 'Washed processing'),
        body: text('Мякоть удаляют до основной сушки, а клейковину снимают механически или после контролируемой ферментации и промывки. Такой маршрут часто помогает яснее увидеть кислотность и структуру, но не создаёт их автоматически.', 'Fruit is removed before the main drying stage, and mucilage is removed mechanically or after controlled fermentation and washing. This route can reveal acidity and structure clearly, but does not create them automatically.'),
      },
      {
        title: text('Натуральная обработка', 'Natural processing'),
        body: text('Ягода сушится целиком. Продолжительный контакт семени с мякотью может усиливать фруктовый характер, сладость и плотность, но требует очень аккуратной сушки.', 'The cherry dries whole. Extended contact between seed and fruit can intensify fruit character, sweetness, and weight, but demands careful drying.'),
      },
      {
        title: text('Хани-обработка', 'Honey processing'),
        body: text('Кожицу и часть мякоти удаляют, но некоторое количество клейковины оставляют на пергаменте во время сушки. Название связано не с добавлением мёда, а с липкой текстурой клейковины.', 'Skin and some fruit are removed, while a portion of mucilage remains on the parchment during drying. The name refers to sticky mucilage, not added honey.'),
      },
    ],
    takeaways: [
      text('Метод обработки описывает последовательность операций, а не гарантированный вкус.', 'A processing method describes a sequence of operations, not a guaranteed flavor.'),
      text('Стабильность сушки и сортировка важны при любом методе.', 'Drying consistency and sorting matter in every method.'),
    ],
    checkpoint: {
      question: text('Добавляют ли мёд при хани-обработке?', 'Is honey added during honey processing?'),
      options: [
        option('no', 'Нет, название связано с оставшейся клейковиной', 'No, the name refers to remaining mucilage'),
        option('yes', 'Да, всегда', 'Yes, always'),
        option('roast', 'Только во время обжарки', 'Only during roasting'),
      ],
      correctOptionId: 'no',
      explanation: text('Хани — это способ удаления мякоти и сушки, а не ароматизация мёдом.', 'Honey is a depulping and drying approach, not honey flavoring.'),
    },
  },
  {
    id: 'processing-fermentation',
    topic: 'processing',
    order: 2,
    stage: 1,
    durationMinutes: 7,
    icon: '⚗️',
    title: text('Ферментация без мифов', 'Fermentation without myths'),
    summary: text('Что действительно происходит и почему «анаэробная» не является одним вкусом.', 'What actually happens and why “anaerobic” is not a single flavor.'),
    sections: [
      {
        title: text('Ферментация уже рядом', 'Fermentation is already present'),
        body: text('Микроорганизмы преобразуют соединения в ягоде и клейковине. Ферментация может происходить на разных этапах и при разных уровнях доступа кислорода.', 'Microorganisms transform compounds in the cherry and mucilage. Fermentation can occur at different stages and under different levels of oxygen exposure.'),
      },
      {
        title: text('Что означает «анаэробная»', 'What “anaerobic” means'),
        body: text('В кофейной практике термин обычно указывает на ферментацию в герметичной или ограниченной по кислороду среде. Он не сообщает автоматически длительность, температуру, давление, состояние ягоды или состав микрофлоры.', 'In coffee practice, the term usually points to fermentation in a sealed or oxygen-limited environment. It does not automatically tell you duration, temperature, pressure, cherry state, or microbial composition.'),
      },
      {
        title: text('Контроль важнее ярлыка', 'Control matters more than the label'),
        body: text('Одинаковое название процесса может скрывать очень разные протоколы. Для оценки партии важнее чистота, повторяемость, зрелость сырья и прозрачное описание этапов.', 'The same process label can hide very different protocols. Cleanliness, repeatability, cherry ripeness, and transparent process details matter more when evaluating a lot.'),
      },
    ],
    takeaways: [
      text('«Анаэробная» описывает среду, а не единый рецепт.', '“Anaerobic” describes an environment, not one universal recipe.'),
      text('Яркий ферментированный аромат не всегда означает высокое качество.', 'An intense fermented aroma does not automatically mean high quality.'),
    ],
    checkpoint: {
      question: text('Что можно уверенно понять из слова «анаэробная» на упаковке?', 'What can you confidently infer from “anaerobic” on a coffee label?'),
      options: [
        option('oxygen', 'Процесс проходил в среде с ограниченным доступом кислорода', 'The process used an oxygen-limited environment'),
        option('strawberry', 'Кофе обязательно будет клубничным', 'The coffee must taste like strawberry'),
        option('days', 'Ферментация длилась ровно 72 часа', 'Fermentation lasted exactly 72 hours'),
      ],
      correctOptionId: 'oxygen',
      explanation: text('Для остальных деталей нужен конкретный протокол производителя.', 'You need the producer’s specific protocol for the remaining details.'),
    },
  },
  {
    id: 'processing-drying-quality',
    topic: 'processing',
    order: 3,
    stage: 2,
    durationMinutes: 6,
    icon: '☀️',
    title: text('Сушка и стабильность', 'Drying and stability'),
    summary: text('Почему качество обработки решается не только в ферментационном танке.', 'Why processing quality is not decided only in a fermentation tank.'),
    sections: [
      {
        title: text('Цель сушки', 'The goal of drying'),
        body: text('Сушка снижает влажность до уровня, при котором зерно можно безопасно хранить и перевозить. Важны не только финальные цифры, но и равномерность и скорость процесса.', 'Drying reduces moisture to a level suitable for safe storage and transport. The final number matters, but so do consistency and drying rate.'),
      },
      {
        title: text('Риски', 'Risks'),
        body: text('Слишком быстрая, медленная или неравномерная сушка может повышать риск плесени, нежелательной ферментации, растрескивания и нестабильности вкуса при хранении.', 'Drying that is too fast, too slow, or uneven can raise the risk of mold, unwanted fermentation, cracking, and flavor instability during storage.'),
      },
      {
        title: text('После сушки', 'After drying'),
        body: text('Отдых в защитной оболочке, сухое и прохладное хранение, барьерная упаковка и бережная логистика помогают сохранить потенциал партии.', 'Resting in protective layers, cool and dry storage, barrier packaging, and careful logistics help preserve a lot’s potential.'),
      },
    ],
    takeaways: [
      text('Сушка — ключевой этап стабилизации, а не просто ожидание.', 'Drying is a key stabilization stage, not passive waiting.'),
      text('Чистая ферментация не компенсирует плохое хранение.', 'Clean fermentation cannot compensate for poor storage.'),
    ],
    checkpoint: {
      question: text('Что особенно важно при сушке кофе?', 'What is especially important during coffee drying?'),
      options: [
        option('even', 'Равномерность и контролируемая скорость', 'Consistency and a controlled rate'),
        option('fastest', 'Всегда максимально быстро', 'Always as fast as possible'),
        option('dark', 'Сделать зерно темнее', 'Make the bean darker'),
      ],
      correctOptionId: 'even',
      explanation: text('Цель — стабильное зерно без нежелательных микробиологических и физических повреждений.', 'The goal is stable coffee without unwanted microbial or physical damage.'),
    },
  },
  {
    id: 'brewing-extraction-basics',
    topic: 'brewing',
    order: 1,
    stage: 1,
    durationMinutes: 7,
    icon: '⚖️',
    title: text('Основы экстракции', 'Extraction fundamentals'),
    summary: text('Как помол, время, вода и соотношение управляют чашкой.', 'How grind, time, water, and ratio shape the cup.'),
    sections: [
      {
        title: text('Что мы контролируем', 'What we control'),
        body: text('При заваривании вода растворяет и переносит вещества из кофе. На результат влияют доза, количество напитка или воды, помол, время, температура, перемешивание и равномерность контакта.', 'During brewing, water dissolves and carries compounds from coffee. Dose, beverage or water amount, grind, time, temperature, agitation, and contact uniformity all affect the result.'),
      },
      {
        title: text('Крепость и экстракция', 'Strength and extraction'),
        body: text('Крепость описывает концентрацию напитка, а экстракция — долю растворённых веществ, извлечённых из сухого кофе. Крепкий кофе может быть недоэкстрагированным, а более лёгкий — хорошо экстрагированным.', 'Strength describes beverage concentration, while extraction describes the share of soluble material removed from dry coffee. A strong brew can be under-extracted, and a lighter brew can be well extracted.'),
      },
      {
        title: text('Меняй один параметр', 'Change one variable'),
        body: text('Для осмысленной настройки держи рецепт стабильным и меняй один параметр за раз. Это помогает связать ощущение в чашке с конкретным решением.', 'For meaningful dialing in, keep the recipe stable and change one variable at a time. This links sensory changes to a specific decision.'),
      },
    ],
    takeaways: [
      text('Крепость и экстракция связаны, но не являются одним и тем же.', 'Strength and extraction are related but not identical.'),
      text('Весы и запись рецепта превращают случайность в повторяемость.', 'A scale and a recorded recipe turn chance into repeatability.'),
    ],
    checkpoint: {
      question: text('Как лучше искать причину изменения вкуса?', 'What is the best way to find the cause of a flavor change?'),
      options: [
        option('one-variable', 'Менять один параметр за раз', 'Change one variable at a time'),
        option('all', 'Одновременно менять всё', 'Change everything at once'),
        option('guess', 'Не записывать рецепт и угадывать', 'Avoid recording the recipe and guess'),
      ],
      correctOptionId: 'one-variable',
      explanation: text('Контролируемый эксперимент помогает понять причинно-следственную связь.', 'A controlled experiment helps reveal cause and effect.'),
    },
  },
  {
    id: 'brewing-method-families',
    topic: 'brewing',
    order: 2,
    stage: 1,
    durationMinutes: 6,
    icon: '☕',
    title: text('Погружение, пролив и давление', 'Immersion, percolation, and pressure'),
    summary: text('Чем отличаются основные семейства методов заваривания.', 'How the main brewing families differ.'),
    sections: [
      {
        title: text('Погружение', 'Immersion'),
        body: text('Кофе контактирует со всем объёмом воды: френч-пресс, каппинг, часть рецептов аэропресса. Время контакта и разделение напитка с гущей становятся ключевыми.', 'Coffee contacts the full volume of water: French press, cupping, and many AeroPress recipes. Contact time and separation from grounds become central.'),
      },
      {
        title: text('Пролив', 'Percolation'),
        body: text('Свежая вода проходит через слой кофе: V60, Кемекс, Калита. Большую роль играют равномерность потока, геометрия воронки и сопротивление кофейного слоя.', 'Fresh water passes through the coffee bed: V60, Chemex, and Kalita. Flow uniformity, brewer geometry, and bed resistance play major roles.'),
      },
      {
        title: text('Давление', 'Pressure'),
        body: text('В эспрессо вода проходит через компактную таблетку кофе под давлением. Небольшие изменения помола, распределения и выхода напитка заметно меняют результат.', 'In espresso, water passes through a compact coffee puck under pressure. Small changes in grind, distribution, and beverage yield can significantly change the result.'),
      },
    ],
    takeaways: [
      text('Метод задаёт физику контакта воды с кофе.', 'A method defines the physics of water–coffee contact.'),
      text('Хороший рецепт учитывает особенности конкретного семейства методов.', 'A good recipe respects the characteristics of its brewing family.'),
    ],
    checkpoint: {
      question: text('К какому семейству относится V60?', 'Which family does the V60 belong to?'),
      options: [
        option('percolation', 'Пролив', 'Percolation'),
        option('immersion', 'Полное погружение', 'Full immersion'),
        option('pressure', 'Эспрессо под давлением', 'Pressure espresso'),
      ],
      correctOptionId: 'percolation',
      explanation: text('Вода проходит через кофейный слой и фильтр под действием гравитации.', 'Water passes through the coffee bed and filter under gravity.'),
    },
  },
  {
    id: 'brewing-water-repeatability',
    topic: 'brewing',
    order: 3,
    stage: 2,
    durationMinutes: 6,
    icon: '💧',
    title: text('Вода и повторяемость', 'Water and repeatability'),
    summary: text('Почему вода — активный ингредиент, а стабильность важнее магического рецепта.', 'Why water is an active ingredient and consistency matters more than a magic recipe.'),
    sections: [
      {
        title: text('Вода растворяет вкус', 'Water dissolves flavor'),
        body: text('Минеральный состав и буферная способность воды влияют на экстракцию и восприятие кислотности. Очень мягкая, жёсткая или сильно щелочная вода может заметно менять чашку.', 'Mineral content and buffering influence extraction and perceived acidity. Very soft, hard, or highly alkaline water can noticeably change the cup.'),
      },
      {
        title: text('Стабильность важнее догмы', 'Consistency matters more than dogma'),
        body: text('Для обучения сначала используй одну и ту же безопасную питьевую воду и стабильную температуру. Тогда изменения рецепта будут легче заметить.', 'For learning, begin with the same safe drinking water and a stable temperature. Recipe changes will then be easier to perceive.'),
      },
      {
        title: text('Записывай контекст', 'Record the context'),
        body: text('Фиксируй воду, температуру, кофемолку, помол, дозу, выход и время. Даже короткая запись помогает повторить удачную чашку.', 'Record water, temperature, grinder, grind setting, dose, yield, and time. Even a short note helps reproduce a successful cup.'),
      },
    ],
    takeaways: [
      text('Вода влияет и на химическую экстракцию, и на сенсорное восприятие.', 'Water affects both chemical extraction and sensory perception.'),
      text('Повторяемость начинается с стабильных входных данных.', 'Repeatability begins with stable inputs.'),
    ],
    checkpoint: {
      question: text('Что лучше сделать перед сравнением двух рецептов?', 'What should you do before comparing two recipes?'),
      options: [
        option('same-water', 'Использовать одну и ту же воду и менять один параметр', 'Use the same water and change one variable'),
        option('random-water', 'Каждый раз брать случайную воду', 'Use random water every time'),
        option('no-scale', 'Отказаться от весов', 'Avoid using a scale'),
      ],
      correctOptionId: 'same-water',
      explanation: text('Стабильные условия делают сравнение осмысленным.', 'Stable conditions make the comparison meaningful.'),
    },
  },
  {
    id: 'sensory-language',
    topic: 'sensory',
    order: 1,
    stage: 1,
    durationMinutes: 6,
    icon: '👃',
    title: text('Язык сенсорики', 'The language of sensory analysis'),
    summary: text('Аромат, вкус, кислотность, сладость, тело и послевкусие.', 'Aroma, flavor, acidity, sweetness, body, and aftertaste.'),
    sections: [
      {
        title: text('Разделяй ощущения', 'Separate sensations'),
        body: text('Аромат связан прежде всего с летучими соединениями и обонянием. Базовые вкусы воспринимаются во рту. Тело описывает тактильную плотность и текстуру, а послевкусие — ощущения после глотка.', 'Aroma is primarily linked to volatile compounds and smell. Basic tastes are perceived in the mouth. Body describes tactile weight and texture, while aftertaste describes sensations that remain after swallowing.'),
      },
      {
        title: text('Кислотность не равна дефекту', 'Acidity is not the same as a defect'),
        body: text('Приятная кислотность может напоминать цитрусы, ягоды или косточковые фрукты. Её оценивают по качеству, характеру и балансу, а не только по интенсивности.', 'Pleasant acidity can resemble citrus, berries, or stone fruit. Evaluate its quality, character, and balance, not intensity alone.'),
      },
      {
        title: text('Дескриптор — сравнение', 'A descriptor is a comparison'),
        body: text('«Черника» не означает наличие черники в кофе. Это общая ссылка на похожее сенсорное впечатление, которая помогает людям точнее обсуждать чашку.', '“Blueberry” does not mean blueberry was added to the coffee. It is a shared reference to a similar sensory impression that helps people discuss the cup more precisely.'),
      },
    ],
    takeaways: [
      text('Сенсорный словарь становится точнее через реальные эталоны и сравнение.', 'Sensory vocabulary becomes more precise through real references and comparison.'),
      text('Интенсивность и качество ощущения — разные вопросы.', 'Intensity and quality are different questions.'),
    ],
    checkpoint: {
      question: text('Что описывает тело кофе?', 'What does coffee body describe?'),
      options: [
        option('texture', 'Тактильную плотность и текстуру напитка', 'The tactile weight and texture of the beverage'),
        option('color', 'Только цвет', 'Only color'),
        option('caffeine', 'Точное количество кофеина', 'The exact caffeine content'),
      ],
      correctOptionId: 'texture',
      explanation: text('Тело относится к осязанию во рту: чайное, сливочное, сиропистое и так далее.', 'Body is a mouthfeel attribute: tea-like, creamy, syrupy, and so on.'),
    },
  },
  {
    id: 'sensory-cva',
    topic: 'sensory',
    order: 2,
    stage: 1,
    durationMinutes: 7,
    icon: '🧭',
    title: text('Coffee Value Assessment', 'Coffee Value Assessment'),
    summary: text('Почему современная оценка разделяет описание, впечатление и внешний контекст.', 'Why modern evaluation separates description, preference, and external context.'),
    sections: [
      {
        title: text('Высокое разрешение вместо одной цифры', 'High resolution instead of one number'),
        body: text('Coffee Value Assessment рассматривает кофе через несколько перспектив. Это помогает не сводить сложную чашку к одному итоговому баллу.', 'The Coffee Value Assessment looks at coffee through multiple perspectives. This helps avoid reducing a complex cup to one final score.'),
      },
      {
        title: text('Описательное и аффективное', 'Descriptive and affective'),
        body: text('Описательная оценка фиксирует воспринимаемые атрибуты и их интенсивность. Аффективная оценка отражает впечатление о качестве. Эти задачи разделены, чтобы наблюдение не смешивалось с предпочтением.', 'Descriptive assessment records perceived attributes and their intensity. Affective assessment records impressions of quality. The tasks are separated so observation is not confused with preference.'),
      },
      {
        title: text('Физическое и внешнее', 'Physical and extrinsic'),
        body: text('Физическая оценка рассматривает состояние зелёного кофе. Внешняя оценка фиксирует информацию о происхождении, устойчивости, истории и других характеристиках вне самой чашки.', 'Physical assessment considers the condition of green coffee. Extrinsic assessment records origin, sustainability, story, and other information outside the cup itself.'),
      },
    ],
    takeaways: [
      text('Описание того, что ты чувствуешь, и оценка того, нравится ли это, — разные операции.', 'Describing what you perceive and judging whether you value it are different operations.'),
      text('Ценность кофе шире одной сенсорной цифры.', 'Coffee value is broader than one sensory number.'),
    ],
    checkpoint: {
      question: text('Зачем разделять описательную и аффективную оценку?', 'Why separate descriptive and affective assessment?'),
      options: [
        option('observe-preference', 'Чтобы не смешивать наблюдение с впечатлением о качестве', 'To avoid mixing observation with an impression of quality'),
        option('faster', 'Только чтобы быстрее закончить', 'Only to finish faster'),
        option('hide', 'Чтобы скрыть происхождение', 'To hide origin information'),
      ],
      correctOptionId: 'observe-preference',
      explanation: text('Разделение делает коммуникацию о кофе точнее и прозрачнее.', 'The separation makes communication about coffee more precise and transparent.'),
    },
  },
  {
    id: 'sensory-calibration',
    topic: 'sensory',
    order: 3,
    stage: 2,
    durationMinutes: 6,
    icon: '🎯',
    title: text('Калибровка и практика', 'Calibration and practice'),
    summary: text('Как тренировать восприятие без самообмана и гонки за сложными словами.', 'How to train perception without self-deception or chasing complicated words.'),
    sections: [
      {
        title: text('Сравнение сильнее памяти', 'Comparison beats memory'),
        body: text('Одновременное сравнение двух или трёх чашек помогает заметить различия точнее, чем попытка вспомнить вкус кофе недельной давности.', 'Comparing two or three cups side by side reveals differences more reliably than trying to remember a coffee from a week ago.'),
      },
      {
        title: text('Эталоны', 'References'),
        body: text('Пробуй реальные фрукты, специи, шоколад, орехи и растворы базовых вкусов. Запоминай не слово, а конкретное ощущение.', 'Taste real fruit, spices, chocolate, nuts, and basic-taste solutions. Remember the sensation, not just the word.'),
      },
      {
        title: text('Калибровка группы', 'Group calibration'),
        body: text('Цель обсуждения — не заставить всех назвать один дескриптор, а понять, где наблюдения совпадают, где расходятся и почему.', 'The goal of discussion is not to force everyone to use one descriptor, but to identify where observations align, differ, and why.'),
      },
    ],
    takeaways: [
      text('Сначала называй широкую категорию, затем уточняй.', 'Name a broad category first, then become more specific.'),
      text('Уверенное «не знаю» полезнее случайного сложного дескриптора.', 'A confident “I’m not sure” is more useful than a random sophisticated descriptor.'),
    ],
    checkpoint: {
      question: text('Что лучше развивает сенсорную точность?', 'What best improves sensory accuracy?'),
      options: [
        option('comparison', 'Слепое сравнение чашек и работа с эталонами', 'Blind cup comparisons and reference materials'),
        option('words', 'Заучивание самых редких слов', 'Memorizing the rarest words'),
        option('score-only', 'Оценка только одной итоговой цифрой', 'Using only one final score'),
      ],
      correctOptionId: 'comparison',
      explanation: text('Практика с контролируемыми сравнениями связывает слова с реальными ощущениями.', 'Controlled comparison practice connects words to real sensations.'),
    },
  },

  {
    id: 'origins-traceability-lots',
    topic: 'origins',
    order: 4,
    stage: 2,
    durationMinutes: 7,
    icon: '🧭',
    title: text('Прослеживаемость и лоты', 'Traceability and coffee lots'),
    summary: text('Как читать путь кофе от производителя до конкретной партии.', 'How to read a coffee’s path from producer to a specific lot.'),
    sections: [
      {
        title: text('Что такое лот', 'What a lot is'),
        body: text('Лот — это партия кофе, объединённая происхождением и условиями производства. Он может представлять одну ферму, участок, разновидность, день сбора или смесь от нескольких мелких производителей.', 'A lot is a batch of coffee grouped by origin and production conditions. It may represent one farm, plot, variety, harvest day, or a blend from several smallholders.'),
      },
      {
        title: text('Уровни прослеживаемости', 'Levels of traceability'),
        body: text('Надпись «Колумбия» даёт широкий контекст. Регион, кооператив, станция, ферма и участок постепенно повышают точность информации. Большая детализация полезна, но не является автоматической гарантией качества.', 'A label that says “Colombia” gives broad context. Region, cooperative, station, farm, and plot progressively increase precision. More detail is useful, but it is not an automatic guarantee of quality.'),
        bullets: [
          text('Прослеживаемость помогает сравнивать партии и повторять удачные покупки.', 'Traceability helps compare lots and repeat successful purchases.'),
          text('Отсутствие имени фермера не всегда означает низкое качество: структура цепочки бывает разной.', 'Missing a farmer name does not always mean low quality; supply chains differ.'),
        ],
      },
      {
        title: text('Как записывать в журнал', 'How to record it'),
        body: text('Сохраняй отдельно страну, регион, производителя, станцию и название лота. Тогда позже можно увидеть, какие уровни происхождения действительно связаны с твоими предпочтениями.', 'Record country, region, producer, station, and lot name separately. Later, you can see which origin details are actually connected to your preferences.'),
      },
    ],
    takeaways: [
      text('Лот — это конкретная партия, а не просто название страны.', 'A lot is a specific batch, not just a country name.'),
      text('Подробная прослеживаемость улучшает сравнение, но сама по себе не обещает вкус.', 'Detailed traceability improves comparison but does not promise flavor by itself.'),
    ],
    checkpoint: {
      question: text('Какое утверждение о прослеживаемости наиболее точное?', 'Which statement about traceability is most accurate?'),
      options: [
        option('quality-guarantee', 'Чем длиннее этикетка, тем кофе обязательно вкуснее', 'A longer label always means better-tasting coffee'),
        option('comparison', 'Она помогает понять происхождение и сравнивать партии', 'It helps understand origin and compare lots'),
        option('country-enough', 'Для любого кофе достаточно знать только страну', 'Knowing only the country is always enough'),
        option('roast-date', 'Она описывает только дату обжарки', 'It describes only the roast date'),
      ],
      correctOptionId: 'comparison',
      explanation: text('Прослеживаемость повышает точность контекста и полезна для анализа, но не является гарантией сенсорного качества.', 'Traceability improves contextual precision and analysis, but it is not a guarantee of sensory quality.'),
    },
  },
  {
    id: 'origins-harvest-ripeness',
    topic: 'origins',
    order: 5,
    stage: 3,
    durationMinutes: 7,
    icon: '🍒',
    title: text('Сбор урожая и зрелость ягоды', 'Harvest and cherry ripeness'),
    summary: text('Почему качество начинается ещё до обработки.', 'Why quality begins before processing starts.'),
    sections: [
      {
        title: text('Зрелость влияет на сырьё', 'Ripeness shapes the raw material'),
        body: text('По мере созревания ягоды меняются сахара, кислоты, ароматические предшественники и структура мякоти. Недозрелые и перезрелые ягоды могут давать разный набор дефектов и нежелательных ощущений.', 'As cherries ripen, sugars, acids, aroma precursors, and pulp structure change. Under-ripe and over-ripe cherries can create different defects and undesirable sensations.'),
      },
      {
        title: text('Селективный и сплошной сбор', 'Selective and strip picking'),
        body: text('Селективный сбор позволяет выбирать зрелые ягоды в несколько проходов, но требует больше труда. Сплошной сбор быстрее, однако после него особенно важна сортировка.', 'Selective picking can target ripe cherries over several passes but requires more labor. Strip picking is faster, making post-harvest sorting especially important.'),
      },
      {
        title: text('Сортировка как контроль', 'Sorting as quality control'),
        body: text('Флотация, ручная сортировка и оптические системы помогают удалить часть незрелых, повреждённых или посторонних объектов до следующих этапов обработки.', 'Flotation, hand sorting, and optical systems help remove some under-ripe, damaged, or foreign material before later processing stages.'),
      },
    ],
    takeaways: [
      text('Обработка не может полностью исправить слабое или неоднородное сырьё.', 'Processing cannot fully repair weak or inconsistent raw material.'),
      text('Способ сбора нужно оценивать вместе с качеством последующей сортировки.', 'Harvest method should be evaluated together with the quality of later sorting.'),
    ],
    checkpoint: {
      question: text('Почему после сплошного сбора особенно важна сортировка?', 'Why is sorting especially important after strip picking?'),
      options: [
        option('color', 'Чтобы изменить цвет обжарки', 'To change roast color'),
        option('water', 'Чтобы увеличить минерализацию воды', 'To increase water mineral content'),
        option('mixed-ripeness', 'В партии чаще оказываются ягоды разной зрелости и посторонние объекты', 'The batch is more likely to include mixed ripeness and foreign material'),
        option('grind', 'Чтобы зерно легче мололось', 'To make beans easier to grind'),
      ],
      correctOptionId: 'mixed-ripeness',
      explanation: text('Сплошной сбор захватывает больше неоднородного материала, поэтому сортировка становится ключевым этапом контроля.', 'Strip picking captures more heterogeneous material, so sorting becomes a key control step.'),
    },
  },
  {
    id: 'origins-climate-resilience',
    topic: 'origins',
    order: 6,
    stage: 3,
    durationMinutes: 8,
    icon: '🌦️',
    title: text('Климат и устойчивость', 'Climate and resilience'),
    summary: text('Как погода, генетическое разнообразие и агрономия меняют будущее кофе.', 'How weather, genetic diversity, and agronomy shape coffee’s future.'),
    sections: [
      {
        title: text('Погода и климат — разные масштабы', 'Weather and climate are different scales'),
        body: text('Один дождливый день — это погода. Многолетние изменения температуры и осадков — климатический контекст. Оба масштаба влияют на цветение, созревание, болезни и сроки обработки.', 'One rainy day is weather. Long-term shifts in temperature and rainfall form the climate context. Both scales affect flowering, ripening, disease pressure, and processing timing.'),
      },
      {
        title: text('Разнообразие снижает риск', 'Diversity can reduce risk'),
        body: text('Генетически и агрономически разнообразные системы не гарантируют урожай, но могут уменьшать зависимость от одной разновидности или одного сценария погоды.', 'Genetically and agronomically diverse systems do not guarantee a crop, but they can reduce dependence on one variety or one weather scenario.'),
      },
      {
        title: text('Адаптация — набор решений', 'Adaptation is a set of decisions'),
        body: text('Тень, управление почвой и водой, выбор разновидностей, обновление насаждений и точное планирование сбора работают как связанная система, а не как одна универсальная технология.', 'Shade, soil and water management, variety choice, farm renewal, and precise harvest planning work as a connected system rather than one universal technique.'),
      },
    ],
    takeaways: [
      text('Климатический риск нельзя свести к одному показателю температуры.', 'Climate risk cannot be reduced to a single temperature metric.'),
      text('Устойчивость строится из множества решений на уровне растения, фермы и цепочки поставок.', 'Resilience is built from many decisions across plant, farm, and supply-chain levels.'),
    ],
    checkpoint: {
      question: text('Что лучше всего описывает климатическую адаптацию кофейной фермы?', 'What best describes climate adaptation on a coffee farm?'),
      options: [
        option('single-fix', 'Одна универсальная технология для всех регионов', 'One universal technology for every region'),
        option('ignore', 'Игнорирование сезонных изменений', 'Ignoring seasonal changes'),
        option('roast', 'Только более тёмная обжарка', 'Only darker roasting'),
        option('system', 'Система решений по генетике, почве, воде, тени и сбору', 'A system of decisions around genetics, soil, water, shade, and harvest'),
      ],
      correctOptionId: 'system',
      explanation: text('Условия регионов различаются, поэтому устойчивость создаётся набором согласованных мер.', 'Regional conditions differ, so resilience comes from a coordinated set of measures.'),
    },
  },
  {
    id: 'processing-washed-control',
    topic: 'processing',
    order: 4,
    stage: 2,
    durationMinutes: 7,
    icon: '💧',
    title: text('Мытая обработка: точки контроля', 'Washed processing: control points'),
    summary: text('Что происходит между депульпацией и сушкой.', 'What happens between depulping and drying.'),
    sections: [
      {
        title: text('Удаление мякоти', 'Removing the pulp'),
        body: text('После депульпации на пергаменте остаётся часть слизистого слоя. Его удаляют ферментацией, механически или сочетанием методов, после чего кофе промывают.', 'After depulping, mucilage remains on the parchment. It can be removed through fermentation, mechanically, or with a combination of methods before washing.'),
      },
      {
        title: text('Контроль важнее часов', 'Control matters more than a fixed clock'),
        body: text('Продолжительность этапа зависит от температуры, количества кофе, зрелости, воды и оборудования. Одинаковое число часов не гарантирует одинаковый результат.', 'Stage duration depends on temperature, coffee mass, ripeness, water, and equipment. The same number of hours does not guarantee the same outcome.'),
      },
      {
        title: text('После промывки', 'After washing'),
        body: text('Промытый пергамент всё ещё нужно равномерно высушить и защитить от повторного увлажнения. «Мытая» не означает, что дальнейшие этапы становятся неважными.', 'Washed parchment still needs even drying and protection from rewetting. “Washed” does not make later stages unimportant.'),
      },
    ],
    takeaways: [
      text('Мытая обработка — последовательность контролируемых этапов, а не просто контакт с водой.', 'Washed processing is a sequence of controlled stages, not merely contact with water.'),
      text('Температура и состояние сырья важнее слепого следования фиксированному времени.', 'Temperature and raw-material condition matter more than blindly following a fixed time.'),
    ],
    checkpoint: {
      question: text('Почему нельзя оценивать ферментацию только по количеству часов?', 'Why can fermentation not be judged only by the number of hours?'),
      options: [
        option('variables', 'Скорость процесса зависит от температуры, массы, зрелости и других условий', 'Process speed depends on temperature, mass, ripeness, and other conditions'),
        option('clock-wrong', 'Часы никогда не работают на фермах', 'Clocks never work on farms'),
        option('water-only', 'Значение имеет только объём воды', 'Only water volume matters'),
        option('variety-only', 'Всё определяет только название разновидности', 'Only the variety name determines everything'),
      ],
      correctOptionId: 'variables',
      explanation: text('Время полезно как запись, но без контекста оно не описывает реальную динамику процесса.', 'Time is useful as a record, but without context it does not describe the actual process dynamics.'),
    },
  },
  {
    id: 'processing-natural-management',
    topic: 'processing',
    order: 5,
    stage: 3,
    durationMinutes: 7,
    icon: '☀️',
    title: text('Натуральная обработка без мифов', 'Natural processing without myths'),
    summary: text('Сушка целой ягоды, её потенциал и основные риски.', 'Drying the whole cherry, its potential, and its main risks.'),
    sections: [
      {
        title: text('Целая ягода', 'The whole cherry'),
        body: text('При натуральной обработке кофе сушат внутри ягоды. Толстый слой материала замедляет перенос влаги и требует внимательного управления толщиной слоя и перемешиванием.', 'In natural processing, coffee dries inside the cherry. The thicker material slows moisture movement and requires careful control of layer depth and turning.'),
      },
      {
        title: text('Риск неоднородности', 'Risk of unevenness'),
        body: text('Если ягоды разной зрелости, слой слишком толстый или погода нестабильна, отдельные части партии могут сохнуть с разной скоростью. Это повышает риск плесени, брожения и неоднородности.', 'If cherries differ in ripeness, layers are too thick, or weather is unstable, parts of the lot can dry at different rates. This increases the risk of mold, uncontrolled fermentation, and inconsistency.'),
      },
      {
        title: text('Вкус не предопределён', 'Flavor is not predetermined'),
        body: text('Натуральная обработка часто ассоциируется с фруктовым профилем, но итог зависит от сырья, микробиологии, сушки, хранения и обжарки. Метод не гарантирует конкретный дескриптор.', 'Natural processing is often associated with fruit-forward profiles, but the result depends on raw material, microbiology, drying, storage, and roasting. The method does not guarantee a specific descriptor.'),
      },
    ],
    takeaways: [
      text('Управление сушкой — центральная задача натуральной обработки.', 'Drying management is central to natural processing.'),
      text('Фруктовость может проявляться, но не является обязательным результатом.', 'Fruit-forward character may appear, but it is not guaranteed.'),
    ],
    checkpoint: {
      question: text('Какой риск особенно важен при сушке целой ягоды?', 'Which risk is especially important when drying whole cherries?'),
      options: [
        option('instant', 'Слишком мгновенная экстракция в чашке', 'Extraction happening too instantly in the cup'),
        option('uneven', 'Неравномерное высыхание внутри партии', 'Uneven drying within the lot'),
        option('grinder', 'Износ кофемолки на ферме', 'Grinder wear at the farm'),
        option('cup-size', 'Размер чашки покупателя', 'The buyer’s cup size'),
      ],
      correctOptionId: 'uneven',
      explanation: text('Целая ягода сохнет медленнее и требует контроля слоя, перемешивания и погоды.', 'Whole cherries dry more slowly and require control of layer depth, turning, and weather.'),
    },
  },
  {
    id: 'processing-alternative-paths',
    topic: 'processing',
    order: 6,
    stage: 3,
    durationMinutes: 8,
    icon: '🧪',
    title: text('Хани, вет-халл и экспериментальные процессы', 'Honey, wet-hulled, and experimental processes'),
    summary: text('Как разбираться в названиях, не превращая их в вкусовые обещания.', 'How to understand process names without turning them into flavor promises.'),
    sections: [
      {
        title: text('Хани как спектр', 'Honey as a spectrum'),
        body: text('В хани-обработке часть слизистого слоя остаётся на пергаменте во время сушки. Цветовые названия вроде yellow, red или black honey не имеют единого универсального стандарта между всеми производителями.', 'In honey processing, some mucilage remains on the parchment during drying. Color labels such as yellow, red, or black honey do not have one universal standard across all producers.'),
      },
      {
        title: text('Вет-халл', 'Wet-hulled'),
        body: text('При вет-халле пергамент снимают при более высокой влажности, чем в большинстве классических схем, а зерно досушивают без него. Метод исторически связан прежде всего с Индонезией и местными условиями цепочки поставок.', 'In wet-hulling, parchment is removed at a higher moisture level than in most conventional pathways, and the bean is dried further without it. The method is historically associated especially with Indonesia and local supply-chain conditions.'),
      },
      {
        title: text('Экспериментальные названия', 'Experimental labels'),
        body: text('«Анаэробный», «карбонический» или «инфьюз» описывают разные вмешательства и не всегда используются одинаково. Надёжнее уточнять сырьё, ёмкость, доступ кислорода, температуру, добавки и длительность.', '“Anaerobic,” “carbonic,” or “infused” can describe different interventions and are not always used consistently. It is more reliable to ask about raw material, vessel, oxygen exposure, temperature, additions, and duration.'),
      },
    ],
    takeaways: [
      text('Одно и то же маркетинговое название может скрывать разные протоколы.', 'The same marketing label can hide different protocols.'),
      text('Для сравнения процессов нужны детали, а не только название категории.', 'Comparing processes requires details, not only a category label.'),
    ],
    checkpoint: {
      question: text('Что лучше сделать, увидев на пачке слово «анаэробный»?', 'What is the best response to seeing “anaerobic” on a bag?'),
      options: [
        option('assume-strawberry', 'Сразу ожидать только клубнику', 'Immediately expect only strawberry'),
        option('ignore-origin', 'Не смотреть на происхождение', 'Ignore origin information'),
        option('ask-protocol', 'Уточнить протокол: сырьё, ёмкость, кислород, температуру и время', 'Ask about the protocol: raw material, vessel, oxygen, temperature, and time'),
        option('same-process', 'Считать, что у всех производителей процесс одинаков', 'Assume every producer uses the same process'),
      ],
      correctOptionId: 'ask-protocol',
      explanation: text('Термин используется широко, поэтому детали процесса дают больше информации, чем одно слово.', 'The term is used broadly, so process details provide more information than the label alone.'),
    },
  },
  {
    id: 'brewing-grind-contact-time',
    topic: 'brewing',
    order: 4,
    stage: 2,
    durationMinutes: 7,
    icon: '⚙️',
    title: text('Помол и время контакта', 'Grind size and contact time'),
    summary: text('Почему эти переменные работают вместе, а не по отдельности.', 'Why these variables work together rather than independently.'),
    sections: [
      {
        title: text('Площадь поверхности', 'Surface area'),
        body: text('Более мелкий помол увеличивает суммарную площадь поверхности частиц и обычно ускоряет перенос растворимых веществ. Но он также может повышать сопротивление потоку и риск каналов в слое кофе.', 'A finer grind increases total particle surface area and usually speeds transfer of soluble material. It can also raise flow resistance and the risk of channels through the coffee bed.'),
      },
      {
        title: text('Время — результат системы', 'Time is a system outcome'),
        body: text('В проливных методах время зависит не только от таймера, но и от помола, дозы, фильтра, геометрии, техники вливания и состояния кофемолки.', 'In percolation methods, time depends not only on the timer but also on grind, dose, filter, geometry, pouring technique, and grinder condition.'),
      },
      {
        title: text('Меняй одну переменную', 'Change one variable at a time'),
        body: text('Чтобы понять причинность, сначала зафиксируй дозу, воду и технику. Затем измени помол небольшим шагом и сравни вкус вместе со временем пролива.', 'To understand cause and effect, first hold dose, water, and technique steady. Then change grind by a small step and compare flavor together with drawdown time.'),
      },
    ],
    takeaways: [
      text('Мелкий помол обычно ускоряет экстракцию, но может замедлять поток.', 'A finer grind usually speeds extraction but may slow flow.'),
      text('Время пролива — диагностический сигнал, а не самостоятельная цель.', 'Drawdown time is a diagnostic signal, not a goal by itself.'),
    ],
    checkpoint: {
      question: text('Что лучше сделать при настройке помола?', 'What is the best approach when dialing in grind size?'),
      options: [
        option('change-all', 'Одновременно изменить помол, дозу, воду и технику', 'Change grind, dose, water, and technique at once'),
        option('timer-only', 'Ориентироваться только на таймер', 'Use only the timer'),
        option('small-step', 'Менять помол небольшими шагами при стабильных остальных переменных', 'Change grind in small steps while keeping other variables stable'),
        option('ignore-taste', 'Не учитывать вкус', 'Ignore flavor'),
      ],
      correctOptionId: 'small-step',
      explanation: text('Одна изменяемая переменная позволяет связать разницу в чашке с конкретным решением.', 'Changing one variable lets you connect cup differences to a specific decision.'),
    },
  },
  {
    id: 'brewing-strength-extraction',
    topic: 'brewing',
    order: 5,
    stage: 3,
    durationMinutes: 8,
    icon: '📐',
    title: text('Крепость и экстракция — не одно и то же', 'Strength and extraction are not the same'),
    summary: text('Как различать концентрацию напитка и долю извлечённого вещества.', 'How to separate beverage concentration from the fraction extracted.'),
    sections: [
      {
        title: text('Крепость', 'Strength'),
        body: text('Крепость описывает концентрацию растворённых веществ в готовом напитке. Она связана с соотношением кофе и воды, выходом напитка и удержанием воды в слое.', 'Strength describes the concentration of dissolved material in the final beverage. It relates to coffee-to-water ratio, beverage yield, and water retained in the coffee bed.'),
      },
      {
        title: text('Экстракция', 'Extraction'),
        body: text('Экстракция описывает, какая доля массы сухого кофе перешла в напиток. Сильный по концентрации напиток может быть извлечён как недостаточно, так и чрезмерно.', 'Extraction describes what fraction of dry coffee mass moved into the beverage. A concentrated drink can still be under- or over-extracted.'),
      },
      {
        title: text('Диагностика вкусом', 'Diagnosing through taste'),
        body: text('Не пытайся вывести всё из одной цифры. Используй рецепт и измерения как карту, а сладость, кислотность, горечь, сухость и послевкусие — как обратную связь.', 'Do not infer everything from one number. Use recipe and measurements as a map, and sweetness, acidity, bitterness, dryness, and finish as feedback.'),
      },
    ],
    takeaways: [
      text('Крепость отвечает на вопрос «насколько концентрирован напиток».', 'Strength answers “how concentrated is the beverage?”'),
      text('Экстракция отвечает на вопрос «сколько вещества мы забрали из кофе».', 'Extraction answers “how much material did we remove from the coffee?”'),
    ],
    checkpoint: {
      question: text('Может ли крепкий напиток быть недоэкстрагированным?', 'Can a strong beverage be under-extracted?'),
      options: [
        option('never', 'Нет, крепость всегда означает полную экстракцию', 'No, strength always means complete extraction'),
        option('only-espresso', 'Только в эспрессо', 'Only in espresso'),
        option('yes', 'Да, концентрация и доля извлечения — разные параметры', 'Yes, concentration and extraction fraction are different parameters'),
        option('only-dark', 'Только при тёмной обжарке', 'Only with dark roasts'),
      ],
      correctOptionId: 'yes',
      explanation: text('Можно использовать мало воды и получить концентрированный, но при этом недостаточно извлечённый напиток.', 'Using little water can produce a concentrated beverage that is still insufficiently extracted.'),
    },
  },
  {
    id: 'brewing-cup-diagnosis',
    topic: 'brewing',
    order: 6,
    stage: 3,
    durationMinutes: 8,
    icon: '🩺',
    title: text('Диагностика чашки', 'Diagnosing the cup'),
    summary: text('Как превращать ощущения в аккуратные изменения рецепта.', 'How to turn sensory feedback into careful recipe changes.'),
    sections: [
      {
        title: text('Сначала описать', 'Describe first'),
        body: text('Вместо мгновенного ярлыка «недоэкстракция» сначала опиши ощущения: резкая кислотность, пустая середина, короткое послевкусие, грубая горечь или сухость.', 'Instead of immediately labeling a cup “under-extracted,” first describe sensations: sharp acidity, a hollow middle, short finish, harsh bitterness, or dryness.'),
      },
      {
        title: text('Один симптом — несколько причин', 'One symptom, several causes'),
        body: text('Сухость может быть связана с экстракцией, каналами, качеством воды, обжаркой или сырьём. Резкая кислотность может быть частью кофе или признаком слабой экстракции. Поэтому нужна проверка гипотез.', 'Dryness may relate to extraction, channeling, water, roasting, or raw material. Sharp acidity may be inherent to the coffee or indicate weak extraction. Hypotheses need testing.'),
      },
      {
        title: text('Минимальное изменение', 'Use the smallest useful change'),
        body: text('Выбери наиболее вероятную причину и внеси одно небольшое изменение: помол, температуру, агитацию или соотношение. Затем сравни чашки рядом.', 'Choose the most likely cause and make one small change: grind, temperature, agitation, or ratio. Then compare the cups side by side.'),
      },
    ],
    takeaways: [
      text('Сенсорное описание должно предшествовать техническому диагнозу.', 'Sensory description should come before a technical diagnosis.'),
      text('Хорошая настройка — это цикл гипотеза → одно изменение → сравнение.', 'Good dialing-in is a cycle of hypothesis → one change → comparison.'),
    ],
    checkpoint: {
      question: text('Что делать первым, если чашка кажется сухой?', 'What should you do first if a cup feels dry?'),
      options: [
        option('max-temp', 'Сразу поставить максимальную температуру', 'Immediately use the maximum temperature'),
        option('describe', 'Точно описать ощущение и проверить возможные причины', 'Describe the sensation precisely and test possible causes'),
        option('discard', 'Сразу выбросить кофе', 'Immediately discard the coffee'),
        option('change-all', 'Изменить все параметры одновременно', 'Change every parameter at once'),
      ],
      correctOptionId: 'describe',
      explanation: text('Один сенсорный симптом может иметь несколько причин, поэтому сначала нужна точная формулировка и проверяемая гипотеза.', 'One sensory symptom can have several causes, so begin with precise language and a testable hypothesis.'),
    },
  },
  {
    id: 'sensory-basic-tastes-aroma',
    topic: 'sensory',
    order: 4,
    stage: 2,
    durationMinutes: 7,
    icon: '👅',
    title: text('Базовые вкусы и аромат', 'Basic tastes and aroma'),
    summary: text('Почему «вкус кофе» создаётся несколькими сенсорными каналами.', 'Why coffee flavor is built from several sensory channels.'),
    sections: [
      {
        title: text('Вкус на языке', 'Taste on the tongue'),
        body: text('Сладкое, кислое, горькое, солёное и умами воспринимаются вкусовой системой. В кофе особенно важны отношения сладости, кислотности и горечи.', 'Sweet, sour, bitter, salty, and umami are perceived by the taste system. In coffee, the relationships among sweetness, acidity, and bitterness are especially important.'),
      },
      {
        title: text('Аромат через нос', 'Aroma through the nose'),
        body: text('Большая часть того, что мы называем клубникой, жасмином или шоколадом, связана с летучими ароматическими соединениями. Они воспринимаются как при вдыхании, так и ретроназально во время глотка.', 'Much of what we call strawberry, jasmine, or chocolate relates to volatile aroma compounds. They are perceived both by sniffing and retronasally while drinking.'),
      },
      {
        title: text('Ощущение во рту', 'Mouthfeel'),
        body: text('Плотность, вязкость, сухость, кремовость и температура не являются ароматами. Они относятся к тактильной и температурной стороне восприятия.', 'Weight, viscosity, dryness, creaminess, and temperature are not aromas. They belong to tactile and thermal perception.'),
      },
    ],
    takeaways: [
      text('Дескриптор аромата и базовый вкус описывают разные каналы восприятия.', 'An aroma descriptor and a basic taste describe different sensory channels.'),
      text('Тело и сухость относятся к ощущению во рту, а не к запаху.', 'Body and dryness belong to mouthfeel, not smell.'),
    ],
    checkpoint: {
      question: text('К какому каналу прежде всего относится дескриптор «жасмин»?', 'Which channel primarily carries the descriptor “jasmine”?'),
      options: [
        option('temperature', 'Температурное ощущение', 'Temperature sensation'),
        option('basic-taste', 'Базовый вкус на языке', 'Basic taste on the tongue'),
        option('aroma', 'Ароматическое восприятие', 'Aroma perception'),
        option('texture', 'Текстура', 'Texture'),
      ],
      correctOptionId: 'aroma',
      explanation: text('Жасмин — ароматическая ассоциация, связанная прежде всего с обонянием.', 'Jasmine is an aromatic association linked primarily to olfaction.'),
    },
  },
  {
    id: 'sensory-balance-structure',
    topic: 'sensory',
    order: 5,
    stage: 3,
    durationMinutes: 8,
    icon: '⚖️',
    title: text('Баланс и структура чашки', 'Balance and cup structure'),
    summary: text('Как описывать взаимодействие сладости, кислотности, горечи и тела.', 'How to describe the interaction of sweetness, acidity, bitterness, and body.'),
    sections: [
      {
        title: text('Баланс не означает равные части', 'Balance does not mean equal parts'),
        body: text('Сбалансированная чашка не обязана иметь одинаковую интенсивность сладости, кислотности и горечи. Важно, поддерживают ли элементы друг друга и соответствует ли структура характеру кофе.', 'A balanced cup does not require equal intensity of sweetness, acidity, and bitterness. What matters is whether the elements support one another and fit the coffee’s character.'),
      },
      {
        title: text('Качество кислотности', 'Quality of acidity'),
        body: text('Кислотность можно описывать по интенсивности, характеру и интеграции: мягкая, яркая, винная, цитрусовая, сочная или резкая. Само наличие кислотности не является дефектом.', 'Acidity can be described by intensity, character, and integration: soft, bright, wine-like, citrus-like, juicy, or sharp. Acidity itself is not a defect.'),
      },
      {
        title: text('Горечь и послевкусие', 'Bitterness and finish'),
        body: text('Горечь естественна для кофе, но её качество и длительность различаются. Какао-подобная горечь может поддерживать структуру, тогда как грубая, жжёная или лекарственная может доминировать.', 'Bitterness is natural in coffee, but its quality and duration vary. Cocoa-like bitterness may support structure, while harsh, burnt, or medicinal bitterness may dominate.'),
      },
    ],
    takeaways: [
      text('Оценивай не только интенсивность, но и качество взаимодействия атрибутов.', 'Evaluate not only intensity but also how attributes interact.'),
      text('Кислотность и горечь не являются автоматически положительными или отрицательными.', 'Acidity and bitterness are not automatically positive or negative.'),
    ],
    checkpoint: {
      question: text('Что точнее всего означает «баланс» в чашке?', 'What most accurately describes balance in a cup?'),
      options: [
        option('zero-acidity', 'Полное отсутствие кислотности', 'A complete absence of acidity'),
        option('equal-numbers', 'Одинаковые числовые оценки всех атрибутов', 'Identical numeric scores for every attribute'),
        option('dark-only', 'Только тёмная обжарка', 'Only dark roasting'),
        option('integration', 'Атрибуты поддерживают друг друга и создают цельную структуру', 'Attributes support one another and create a coherent structure'),
      ],
      correctOptionId: 'integration',
      explanation: text('Баланс описывает согласованность элементов, а не математическое равенство их интенсивностей.', 'Balance describes coherence among elements, not mathematical equality of intensity.'),
    },
  },
  {
    id: 'sensory-bias-blind-tasting',
    topic: 'sensory',
    order: 6,
    stage: 3,
    durationMinutes: 8,
    icon: '🙈',
    title: text('Слепая дегустация и предубеждения', 'Blind tasting and bias'),
    summary: text('Как цена, упаковка и ожидания меняют восприятие.', 'How price, packaging, and expectations alter perception.'),
    sections: [
      {
        title: text('Ожидание влияет на внимание', 'Expectation shapes attention'),
        body: text('Информация о цене, стране, разновидности или редкости может направить внимание и повлиять на интерпретацию ощущений. Это не делает дегустатора нечестным — так работает восприятие.', 'Information about price, country, variety, or rarity can direct attention and influence interpretation. This does not make a taster dishonest; it is how perception works.'),
      },
      {
        title: text('Что даёт слепой формат', 'What blind tasting provides'),
        body: text('Кодированные чашки уменьшают влияние части внешней информации и помогают сравнивать сенсорные свойства. Но слепой формат не устраняет усталость, порядок подачи или различия температуры.', 'Coded cups reduce the influence of some external information and help compare sensory properties. Blind tasting does not remove fatigue, serving order, or temperature differences.'),
      },
      {
        title: text('Повторение и порядок', 'Replication and order'),
        body: text('Повторные чашки, случайный порядок и одинаковые условия помогают понять, насколько наблюдение устойчиво. Один уверенный ответ ещё не доказывает воспроизводимость.', 'Replicate cups, randomized order, and consistent conditions help show whether an observation is stable. One confident answer does not prove repeatability.'),
      },
    ],
    takeaways: [
      text('Слепая дегустация уменьшает часть предубеждений, но не устраняет их полностью.', 'Blind tasting reduces some biases but does not eliminate all of them.'),
      text('Повторяемость важнее уверенности в одном отдельном ответе.', 'Repeatability matters more than confidence in one isolated answer.'),
    ],
    checkpoint: {
      question: text('Что слепая дегустация делает лучше всего?', 'What does blind tasting do best?'),
      options: [
        option('perfect-objectivity', 'Гарантирует абсолютную объективность', 'Guarantees absolute objectivity'),
        option('remove-price-info', 'Снижает влияние части внешней информации, например цены и упаковки', 'Reduces the influence of some external information such as price and packaging'),
        option('remove-fatigue', 'Полностью устраняет сенсорную усталость', 'Completely removes sensory fatigue'),
        option('same-temperature', 'Автоматически делает все чашки одинаковой температуры', 'Automatically makes every cup the same temperature'),
      ],
      correctOptionId: 'remove-price-info',
      explanation: text('Кодирование уменьшает влияние известных ожиданий, но остальные источники вариативности всё ещё нужно контролировать.', 'Coding reduces the influence of known expectations, but other sources of variability still need control.'),
    },
  },

] as const;
export function getLearningLesson(id: string | undefined): LearningLesson | null {
  if (!id) return null;
  return LEARNING_LESSONS.find((lesson) => lesson.id === id) ?? null;
}

export function getLessonsForTopic(topic: ExamTopic): LearningLesson[] {
  return LEARNING_LESSONS.filter((lesson) => lesson.topic === topic).sort((a, b) => a.order - b.order);
}

export function localizeLearningText(value: LocalizedExamText, language: 'ru' | 'en'): string {
  return value[language];
}
