import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Lightbulb,
  RotateCcw,
  X,
} from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { useLearning } from '@/hooks/useLearning';
import {
  getLearningLesson,
  LEARNING_LESSONS,
  LEARNING_TOPICS,
  localizeLearningText,
} from '@/lib/learning';
import { fillLearningCopy, useLearningCopy } from '@/lib/learningI18n';


function shuffleOptions<T>(options: readonly T[]): T[] {
  const shuffled = [...options];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export default function LearningLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [, setLocation] = useLocation();
  const { copy, language } = useLearningCopy();
  const lesson = getLearningLesson(lessonId);
  const { completed, markOpened, completeLesson } = useLearning();
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [optionRound, setOptionRound] = useState(0);

  useEffect(() => {
    if (lesson) markOpened(lesson.id);
  }, [lesson, markOpened]);

  useEffect(() => {
    setSelectedOptionId('');
    setShowResult(false);
    setOptionRound(0);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [lessonId]);

  const isCompleted = lesson ? Boolean(completed[lesson.id]) : false;
  const isCorrect = lesson ? selectedOptionId === lesson.checkpoint.correctOptionId : false;
  const checkpointOptions = useMemo(
    () => lesson ? shuffleOptions(lesson.checkpoint.options) : [],
    [lesson, optionRound],
  );
  const nextLesson = useMemo(() => {
    if (!lesson) return null;
    const sequence = [...LEARNING_LESSONS].sort((a, b) => {
      const stageDelta = a.stage - b.stage;
      if (stageDelta !== 0) return stageDelta;
      const topicDelta = LEARNING_TOPICS.indexOf(a.topic) - LEARNING_TOPICS.indexOf(b.topic);
      return topicDelta || a.order - b.order;
    });
    const index = sequence.findIndex((item) => item.id === lesson.id);
    return sequence[index + 1] ?? null;
  }, [lesson]);

  if (!lesson) {
    return (
      <div className="min-h-full bg-background px-4 iphone-safe-top">
        <Link href="/learning">
          <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold">
            <ArrowLeft size={18} />
            {copy.backLearning}
          </span>
        </Link>
      </div>
    );
  }

  const submitCheckpoint = () => {
    if (!selectedOptionId) return;
    setShowResult(true);
  };

  const finishLesson = () => {
    if (!selectedOptionId) return;
    if (!isCorrect) {
      setSelectedOptionId('');
      setShowResult(false);
      setOptionRound((current) => current + 1);
      return;
    }
    completeLesson(lesson.id, true);
  };

  return (
    <div className="min-h-full bg-background pb-12">
      <header className="px-4 iphone-safe-top pb-5">
        <Link href="/learning">
          <motion.span
            whileTap={{ scale: 0.92 }}
            className="w-10 h-10 mb-5 rounded-full bg-card/65 border border-white/[0.07] flex items-center justify-center text-muted-foreground"
            aria-label={copy.backLearning}
          >
            <ArrowLeft size={20} />
          </motion.span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-[9px] uppercase tracking-widest font-bold text-primary">
              {copy.topics[lesson.topic].title}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <Clock3 size={12} />
              {fillLearningCopy(copy.minutes, { count: lesson.durationMinutes })}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 size={12} />
                {copy.completed}
              </span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <span className="text-4xl leading-none mt-1">{lesson.icon}</span>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/45 font-bold">{fillLearningCopy(copy.stageLabel, { stage: lesson.stage })} · {copy.lesson} {lesson.order}</p>
              <h1 className="font-serif text-[2rem] leading-[1.02] text-foreground mt-1">{localizeLearningText(lesson.title, language)}</h1>
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-muted-foreground mt-4">{localizeLearningText(lesson.summary, language)}</p>
        </motion.div>
      </header>

      <main className="px-4 space-y-4">
        {lesson.sections.map((section, index) => (
          <motion.section
            key={`${lesson.id}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-[24px] bg-card/62 border border-white/[0.06] p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center text-[11px] font-bold text-primary">{index + 1}</span>
              <h2 className="font-serif text-[1.15rem] text-foreground">{localizeLearningText(section.title, language)}</h2>
            </div>
            <p className="text-[13px] leading-[1.72] text-muted-foreground">{localizeLearningText(section.body, language)}</p>
            {section.bullets && (
              <div className="mt-4 space-y-2.5">
                {section.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-[12px] leading-relaxed text-muted-foreground">{localizeLearningText(bullet, language)}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        ))}

        <section className="rounded-[24px] bg-primary/[0.075] border border-primary/18 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={17} className="text-primary" />
            <h2 className="font-serif text-[1.15rem] text-foreground">{copy.keyTakeaways}</h2>
          </div>
          <div className="space-y-3">
            {lesson.takeaways.map((takeaway, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/12 border border-primary/20 grid place-items-center flex-shrink-0">
                  <Check size={12} className="text-primary" />
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground pt-0.5">{localizeLearningText(takeaway, language)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[26px] bg-card/75 border border-white/[0.07] p-5">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{copy.checkpoint}</p>
          <h2 className="font-serif text-[1.25rem] leading-snug text-foreground mt-2">
            {localizeLearningText(lesson.checkpoint.question, language)}
          </h2>
          <p className="text-[10px] text-muted-foreground/55 mt-1">{copy.chooseAnswer}</p>
          <p className="text-[9px] text-muted-foreground/40 mt-1">{copy.answersShuffleHint}</p>

          <div className="space-y-2.5 mt-4">
            {checkpointOptions.map((option, index) => {
              const selected = selectedOptionId === option.id;
              const correct = showResult && option.id === lesson.checkpoint.correctOptionId;
              const incorrectSelected = showResult && selected && !correct;
              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={showResult}
                  onClick={() => setSelectedOptionId(option.id)}
                  className={`w-full rounded-[18px] border px-4 py-3.5 text-left flex items-center gap-3 transition-colors ${
                    correct
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : incorrectSelected
                        ? 'bg-red-500/10 border-red-500/30'
                        : selected
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-background/45 border-white/[0.06]'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0 border ${
                    correct
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : incorrectSelected
                        ? 'bg-red-500/15 border-red-500/30 text-red-400'
                        : selected
                          ? 'bg-primary/15 border-primary/30 text-primary'
                          : 'bg-card/60 border-white/[0.07] text-muted-foreground'
                  }`}>
                    {correct ? <Check size={13} /> : incorrectSelected ? <X size={13} /> : String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[12px] leading-relaxed text-foreground/90">{localizeLearningText(option.text, language)}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-[18px] border p-4 ${isCorrect ? 'bg-emerald-500/[0.08] border-emerald-500/20' : 'bg-amber-500/[0.08] border-amber-500/20'}`}
              >
                <div className="flex items-center gap-2">
                  {isCorrect ? <CheckCircle2 size={16} className="text-emerald-400" /> : <RotateCcw size={16} className="text-amber-400" />}
                  <p className={`text-[11px] font-bold ${isCorrect ? 'text-emerald-400' : 'text-amber-400'}`}>{isCorrect ? copy.correct : copy.incorrect}</p>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground mt-2">{localizeLearningText(lesson.checkpoint.explanation, language)}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!showResult ? (
            <motion.button
              type="button"
              whileTap={selectedOptionId ? { scale: 0.98 } : undefined}
              disabled={!selectedOptionId}
              onClick={submitCheckpoint}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold mt-5 disabled:opacity-35"
            >
              {copy.checkpoint}
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={finishLesson}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold mt-5 inline-flex items-center justify-center gap-2"
            >
              {isCorrect ? <CheckCircle2 size={16} /> : <RotateCcw size={16} />}
              {isCorrect ? (isCompleted ? copy.lessonCompleted : copy.completeLesson) : copy.tryAgain}
            </motion.button>
          )}
        </section>

        {isCompleted && (
          <section className="rounded-[24px] bg-emerald-500/[0.07] border border-emerald-500/18 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center">
                <CheckCircle2 size={19} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-serif text-lg text-foreground">{copy.lessonCompleted}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{copy.topics[lesson.topic].title}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => setLocation('/learning')}
                className="h-11 rounded-2xl bg-card/65 border border-white/[0.07] text-[11px] font-semibold text-foreground"
              >
                {copy.toAcademy}
              </button>
              {nextLesson ? (
                <button
                  type="button"
                  onClick={() => setLocation(`/learning/${nextLesson.id}`)}
                  className="h-11 rounded-2xl bg-primary text-primary-foreground text-[11px] font-bold inline-flex items-center justify-center gap-1"
                >
                  {copy.nextLesson}
                  <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLocation('/exams')}
                  className="h-11 rounded-2xl bg-primary text-primary-foreground text-[11px] font-bold inline-flex items-center justify-center gap-1"
                >
                  {copy.openExam}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
