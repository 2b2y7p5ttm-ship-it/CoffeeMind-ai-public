import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'wouter';
import { useLearning } from '@/hooks/useLearning';
import { LEARNING_LESSONS, LEARNING_TOPICS, localizeLearningText } from '@/lib/learning';
import { fillLearningCopy, useLearningCopy } from '@/lib/learningI18n';

export default function Learning() {
  const { copy, language } = useLearningCopy();
  const {
    completed,
    completedCount,
    totalCount,
    progressRatio,
    overallScore,
    overallLevel,
    topicProgress,
    weakTopic,
    recommendedLesson,
  } = useLearning();

  const recommendedCompleted = recommendedLesson ? Boolean(completed[recommendedLesson.id]) : false;

  return (
    <div className="min-h-full bg-background pb-12">
      <header className="px-4 iphone-safe-top pb-5">
        <Link href="/profile">
          <motion.span
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 mb-5 rounded-full bg-card/65 border border-white/[0.07] flex items-center justify-center text-muted-foreground"
            aria-label={copy.backProfile}
          >
            <ArrowLeft size={20} />
          </motion.span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-primary mb-4">
            <GraduationCap size={14} />
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold">{copy.eyebrow}</span>
          </div>
          <h1 className="font-serif text-[2.35rem] leading-[0.95] text-foreground">{copy.title}</h1>
          <p className="text-[13px] leading-relaxed text-muted-foreground mt-3 max-w-[360px]">{copy.subtitle}</p>
        </motion.div>
      </header>

      <main className="px-4 space-y-5">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/[0.13] via-card/80 to-card/60 border border-primary/18 p-5"
        >
          <div className="absolute -right-8 -top-10 text-[110px] opacity-[0.045]">🎓</div>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/55 font-bold">{copy.progressTitle}</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="font-serif text-[2.5rem] leading-none text-primary">{completedCount}</span>
                <span className="text-sm text-muted-foreground mb-1">/ {totalCount}</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">{copy.completedLessons}</p>
            </div>
            <div className="text-right">
              <span className="font-serif text-[2rem] leading-none text-foreground">{overallScore}</span>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mt-1">{copy.knowledgeScore}</p>
              <span className="inline-flex mt-2 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[10px] font-bold text-primary">
                {copy.levels[overallLevel]}
              </span>
            </div>
          </div>
          <div className="relative mt-5 h-2.5 rounded-full bg-black/10 dark:bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/65 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progressRatio * 100}%` }}
              transition={{ type: 'spring', stiffness: 150, damping: 24 }}
            />
          </div>
        </motion.section>

        {recommendedLesson && (
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold">{copy.recommendation}</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold">
                <Target size={12} />
                {fillLearningCopy(copy.weakTopic, { topic: copy.topics[weakTopic].title })}
              </span>
            </div>
            <Link href={`/learning/${recommendedLesson.id}`}>
              <motion.div
                whileTap={{ scale: 0.985 }}
                className="relative overflow-hidden rounded-[26px] bg-card/70 border border-white/[0.07] p-5"
              >
                <div className="absolute right-4 top-3 text-6xl opacity-[0.08]">{recommendedLesson.icon}</div>
                <div className="relative pr-12">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                    <Sparkles size={13} />
                    {copy.topics[recommendedLesson.topic].title}
                  </div>
                  <h2 className="font-serif text-[1.45rem] leading-tight text-foreground mt-2">
                    {localizeLearningText(recommendedLesson.title, language)}
                  </h2>
                  <p className="text-[12px] leading-relaxed text-muted-foreground mt-2">
                    {localizeLearningText(recommendedLesson.summary, language)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/55 mt-3">{copy.basedOnExam}</p>
                </div>
                <div className="relative flex items-center justify-between mt-5 pt-4 border-t border-white/[0.05]">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock3 size={13} />
                    {fillLearningCopy(copy.minutes, { count: recommendedLesson.durationMinutes })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary">
                    {recommendedCompleted ? copy.repeatLesson : copy.startLesson}
                    <ChevronRight size={15} />
                  </span>
                </div>
              </motion.div>
            </Link>
          </section>
        )}

        <section>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-3 px-1">{copy.topicsTitle}</p>
          <div className="grid grid-cols-2 gap-3">
            {LEARNING_TOPICS.map((topic, index) => {
              const progress = topicProgress.find((item) => item.topic === topic)!;
              const topicCopy = copy.topics[topic];
              return (
                <motion.div
                  key={topic}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.04 }}
                  className="rounded-[22px] bg-card/65 border border-white/[0.06] p-4 min-h-[160px] flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{topicCopy.icon}</span>
                    <span className="rounded-full bg-primary/[0.08] border border-primary/15 px-2 py-1 text-[9px] font-bold text-primary">
                      {copy.levels[progress.level]}
                    </span>
                  </div>
                  <h3 className="font-serif text-[1.05rem] text-foreground mt-3">{topicCopy.title}</h3>
                  <p className="text-[10px] leading-relaxed text-muted-foreground mt-1 flex-1">{topicCopy.description}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[9px] text-muted-foreground/55 mb-1.5">
                      <span>{fillLearningCopy(copy.lessonCount, { completed: progress.completed, total: progress.total })}</span>
                      <span>{Math.round(progress.ratio * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/10 dark:bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.ratio * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-bold mb-3 px-1">{copy.lessonsTitle}</p>
          <div className="space-y-3">
            {LEARNING_LESSONS.map((lesson, index) => {
              const done = Boolean(completed[lesson.id]);
              return (
                <Link key={lesson.id} href={`/learning/${lesson.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.025, 0.22) }}
                    whileTap={{ scale: 0.99 }}
                    className="rounded-[22px] bg-card/55 border border-white/[0.055] p-4 flex items-center gap-3"
                  >
                    <div className={`w-11 h-11 rounded-2xl grid place-items-center flex-shrink-0 border ${done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-primary/[0.07] border-primary/14'}`}>
                      {done ? <CheckCircle2 size={19} className="text-emerald-400" /> : <span className="text-xl">{lesson.icon}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-widest text-primary font-bold">{copy.topics[lesson.topic].title}</span>
                        {done && <span className="text-[9px] text-emerald-400 font-semibold">{copy.completed}</span>}
                      </div>
                      <p className="font-medium text-[13px] text-foreground mt-1 truncate">{localizeLearningText(lesson.title, language)}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 inline-flex items-center gap-1">
                        <Clock3 size={11} />
                        {fillLearningCopy(copy.minutes, { count: lesson.durationMinutes })}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground/35 flex-shrink-0" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        <Link href="/exams">
          <motion.section
            whileTap={{ scale: 0.99 }}
            className="rounded-[26px] bg-gradient-to-br from-emerald-500/[0.09] via-card/70 to-card/55 border border-emerald-500/16 p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center flex-shrink-0">
                <BookOpenCheck size={19} className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg text-foreground">{copy.examCtaTitle}</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">{copy.examCtaDescription}</p>
                <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-bold text-primary">
                  {copy.openExam}
                  <ChevronRight size={14} />
                </span>
              </div>
            </div>
          </motion.section>
        </Link>

        <div className="rounded-[20px] bg-card/35 border border-white/[0.04] p-4 flex items-start gap-3">
          <Brain size={16} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-muted-foreground/55">{copy.disclaimer}</p>
        </div>
      </main>
    </div>
  );
}
