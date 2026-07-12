import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Coffee, Dna, Moon, Sun, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { useBooks } from '@/hooks/useBooks';
import { useProfile } from '@/hooks/useProfile';
import { useTastings } from '@/hooks/useTastings';
import { useTheme } from '@/contexts/ThemeContext';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Доброй ночи';
  if (hour < 12) return 'Доброе утро';
  if (hour < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function descriptors(tasting?: ReturnType<typeof useTastings>['tastings'][number]) {
  if (!tasting) return [];
  return [...(tasting.topThreeDescriptors || []), ...(tasting.additionalDescriptors || [])].filter(Boolean).slice(0, 3);
}

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.22 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  const { profile } = useProfile();
  const { tastings } = useTastings();
  const { books } = useBooks();
  const { resolvedTheme, toggleTheme } = useTheme();
  const latest = tastings[0];
  const reading = books.find((book) => book.status === 'reading') || books[0];
  const tags = descriptors(latest);

  return (
    <main className="cm-home min-h-full pb-32">
      <section className="px-5 iphone-safe-top pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">CoffeeMind</p>
            <h1 className="mt-3 font-serif text-[2.15rem] leading-[1.05] text-foreground">
              {greeting()},<br />{profile.name}.
            </h1>
            <p className="mt-3 max-w-[290px] text-[14px] leading-6 text-muted-foreground">
              Сегодня отличный день для новой истории вкуса.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.88, rotate: 8 }}
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="cm-icon-button"
          >
            <motion.span
              key={resolvedTheme}
              initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
            >
              {resolvedTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </motion.span>
          </motion.button>
        </div>
      </section>

      <motion.section {...reveal} className="px-4 mt-7">
        <Link href={latest ? `/tasting/${latest.id}` : '/add'}>
          <motion.article
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -2 }}
            className="cm-hero-card group"
          >
            <div className="cm-hero-art" aria-hidden="true">
              <svg viewBox="0 0 420 310" className="h-full w-full" role="img">
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#0A2134" />
                    <stop offset="1" stopColor="#162C3D" />
                  </linearGradient>
                  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#FF6A3D" />
                    <stop offset="1" stopColor="#FF3E1D" />
                  </linearGradient>
                </defs>
                <rect width="420" height="310" rx="32" fill="url(#bg)" />
                <circle cx="326" cy="76" r="68" fill="url(#accent)" opacity=".92" />
                <path d="M28 246C92 180 136 226 188 155s94-82 204-44v199H28Z" fill="#071522" opacity=".72" />
                <path d="M290 69c21-29 34-31 49-45-3 24-13 42-29 55" fill="none" stroke="#173C31" strokeWidth="10" strokeLinecap="round" />
                <ellipse cx="204" cy="184" rx="67" ry="18" fill="#06111A" opacity=".7" />
                <path d="M147 123h106l-13 76c-3 19-19 34-39 34h-2c-20 0-36-15-39-34Z" fill="#D6D7D7" />
                <path d="M154 139h92l-5 25h-82Z" fill="#F3F1EA" />
                <path d="M157 164h84l-7 39c-3 14-16 25-31 25h-6c-15 0-28-11-31-25Z" fill="#4A2E22" />
                <path d="M254 147c31 0 45 13 45 31s-14 31-43 31" fill="none" stroke="#D6D7D7" strokeWidth="13" strokeLinecap="round" />
                <circle cx="72" cy="230" r="30" fill="#FF5A2E" />
                <path d="M67 230h14m-7-7 7 7-7 7" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#07111a]/95 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="cm-kicker-dark">Последняя дегустация</span>
              <h2 className="mt-3 font-serif text-[1.85rem] leading-tight">
                {latest?.coffeeName || 'Сохрани первую чашку'}
              </h2>
              <p className="mt-2 text-[13px] text-white/67">
                {latest ? [latest.country, latest.processing || latest.process].filter(Boolean).join(' · ') : 'Новая глава начинается здесь'}
              </p>
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => <span key={tag} className="cm-dark-chip">{tag}</span>)}
                </div>
              )}
            </div>
          </motion.article>
        </Link>
      </motion.section>

      <motion.section {...reveal} className="px-4 mt-4 grid grid-cols-2 gap-3">
        <Link href="/stats">
          <motion.article whileTap={{ scale: 0.97 }} className="cm-feature-card cm-feature-card-accent">
            <div className="flex items-center justify-between">
              <div className="cm-feature-icon"><Dna size={19} /></div>
              <ArrowRight size={17} className="opacity-60" />
            </div>
            <p className="mt-7 text-[11px] uppercase tracking-[0.16em] opacity-65">Coffee DNA</p>
            <h3 className="mt-2 text-[17px] font-semibold leading-snug">Твой вкус становится точнее</h3>
            <div className="mt-5 cm-pulse-orbit"><span /></div>
          </motion.article>
        </Link>

        <Link href="/books">
          <motion.article whileTap={{ scale: 0.97 }} className="cm-feature-card">
            <div className="flex items-center justify-between">
              <div className="cm-feature-icon"><BookOpen size={19} /></div>
              <ArrowRight size={17} className="text-muted-foreground" />
            </div>
            <p className="mt-7 text-[11px] uppercase tracking-[0.16em] text-primary">Продолжить чтение</p>
            <h3 className="mt-2 text-[17px] font-semibold leading-snug text-foreground">
              {reading?.title || 'Добавь книгу к своей истории'}
            </h3>
            <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-muted-foreground">{reading?.author || 'Кофе и книги могут хранить один момент вместе.'}</p>
          </motion.article>
        </Link>
      </motion.section>

      <motion.section {...reveal} className="px-4 mt-4">
        <article className="cm-insight-card">
          <div className="flex items-start gap-4">
            <div className="cm-insight-symbol"><Sparkles size={19} /></div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-primary">Совет дня</p>
              <h3 className="mt-2 font-serif text-[1.42rem] leading-snug text-foreground">
                Сегодня попробуй обратить внимание только на сладость.
              </h3>
              <p className="mt-3 text-[13px] leading-6 text-muted-foreground">Маленькое наблюдение — большой рост.</p>
            </div>
          </div>
        </article>
      </motion.section>

      <motion.section {...reveal} className="px-4 mt-4">
        <Link href="/add">
          <motion.button whileTap={{ scale: 0.98 }} className="cm-primary-action w-full">
            <Coffee size={19} />
            <span>Новая дегустация</span>
            <ArrowRight size={19} className="ml-auto" />
          </motion.button>
        </Link>
      </motion.section>
    </main>
  );
}
