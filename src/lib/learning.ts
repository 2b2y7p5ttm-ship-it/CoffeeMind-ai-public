import type { ExamTopic, LocalizedExamText } from '@/lib/exams';

export type LearningLevel = 'foundation' | 'developing' | 'confident' | 'advanced';

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
