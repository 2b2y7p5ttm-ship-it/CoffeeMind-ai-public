import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, Coffee, Database, Plus, ShieldCheck, Smartphone, Sparkles, Users } from 'lucide-react';
import { Link, useLocation } from 'wouter';

function Step({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="rounded-[24px] bg-card/65 border border-white/[0.07] p-4 flex gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center flex-shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [, setLocation] = useLocation();

  const start = () => {
    localStorage.setItem('coffeemind_welcome_seen', 'true');
    setLocation('/add');
  };

  return (
    <div className="min-h-full bg-background pb-10">
      <header className="px-4 iphone-safe-top pb-5">
        <button
          onClick={() => setLocation('/')}
          className="w-10 h-10 mb-5 rounded-full bg-card/60 border border-white/[0.08] flex items-center justify-center text-muted-foreground"
          aria-label="Назад"
        >
          <ChevronLeft size={20} />
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 mb-4">
            <Sparkles size={14} />
            <span className="text-[10px] uppercase tracking-widest font-bold">Public Launch</span>
          </div>
          <h1 className="font-serif text-[2.55rem] leading-[0.93] text-foreground mb-4">CoffeeMind для каждого дегустатора</h1>
          <p className="text-muted-foreground text-[14px] leading-relaxed">
            Это личное приложение для кофе, книг и развития вкуса. Ты можешь поделиться ссылкой — у каждого человека будет свой отдельный журнал на его устройстве.
          </p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        <section className="rounded-[30px] bg-primary/[0.085] border border-primary/20 p-5">
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-[20px] bg-background/50 border border-white/[0.06] p-4 text-center">
              <Coffee size={22} className="text-primary mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Кофе</p>
            </div>
            <div className="rounded-[20px] bg-background/50 border border-white/[0.06] p-4 text-center">
              <BookOpen size={22} className="text-primary mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">Книги</p>
            </div>
            <div className="rounded-[20px] bg-background/50 border border-white/[0.06] p-4 text-center">
              <Sparkles size={22} className="text-primary mx-auto mb-2" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">AI Coach</p>
            </div>
          </div>
          <p className="text-[14px] text-foreground leading-relaxed">
            В публичной версии нет сценариев для роликов. Только журнал дегустаций, книжные оценки, Taste DNA и персональные заметки.
          </p>
        </section>

        <Step icon={Users} title="У каждого свой журнал" text="CoffeeMind хранит записи в браузере конкретного пользователя. Твои данные не видят другие люди, которым ты отправишь ссылку." />
        <Step icon={Database} title="Локальное хранение" text="Дегустации, книги и профиль сохраняются на устройстве. Для переноса данных есть Data Vault: экспорт и импорт JSON." />
        <Step icon={ShieldCheck} title="Без аккаунта на старте" text="Версия 2.2 готова к публичной ссылке. Аккаунты и облачная синхронизация станут следующим большим этапом." />
        <Step icon={Smartphone} title="Установка на iPhone" text="Через Safari пользователь может добавить CoffeeMind на экран Домой и открыть его как отдельное приложение." />

        <div className="grid grid-cols-1 gap-3 pt-2">
          <button
            onClick={start}
            className="h-14 rounded-full bg-primary text-primary-foreground text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_16px_36px_rgba(217,163,95,0.28)]"
          >
            <Plus size={18} />
            Начать с первой дегустации
          </button>
          <Link href="/books">
            <button className="w-full h-12 rounded-full bg-white/[0.06] border border-white/[0.08] text-foreground text-[13px] font-semibold flex items-center justify-center gap-2">
              <BookOpen size={16} />
              Открыть книжный журнал
            </button>
          </Link>
          <Link href="/share">
            <button className="w-full h-12 rounded-full bg-white/[0.035] border border-white/[0.07] text-muted-foreground text-[13px] font-semibold">
              Поделиться приложением
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
