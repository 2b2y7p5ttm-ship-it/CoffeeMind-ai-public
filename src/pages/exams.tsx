import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Coins,
  History,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import { Link } from 'wouter';
import { fillSectionCopy, useSectionCopy } from '@/lib/sectionI18n';
import {
  createExamSession,
  ExamDifficulty,
  ExamQuestionView,
  EXAM_DIFFICULTIES,
  getExamDifficulty,
  getExamQuestion,
  localizeExamText,
} from '@/lib/exams';
import { ExamAttemptRecord, useExams } from '@/hooks/useExams';
import { useLearning } from '@/hooks/useLearning';
import { localizeLearningText } from '@/lib/learning';
import { useLearningCopy } from '@/lib/learningI18n';

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

type Screen = 'overview' | 'quiz' | 'result';

function formatAttemptDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function Exams() {
  const { copy, language, locale } = useSectionCopy();
  const c = copy.exams;
  const { copy: learningCopy } = useLearningCopy();
  const {
    attempts,
    currentWeekAttempts,
    currentWeekBest,
    currentWeekRewarded,
    totalPoints,
    submitAttempt,
  } = useExams();
  const { recommendedLesson, completedCount: learningCompleted, totalCount: learningTotal } = useLearning();

  const [screen, setScreen] = useState<Screen>('overview');
  const [difficulty, setDifficulty] = useState<ExamDifficulty>('beginner');
  const [questions, setQuestions] = useState<ExamQuestionView[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [startedAt, setStartedAt] = useState('');
  const [result, setResult] = useState<ExamAttemptRecord | null>(null);
  const [reviewOpen, setReviewOpen] = useState(true);

  const currentQuestion = questions[questionIndex] ?? null;
  const currentSelected = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const currentAnswered = Boolean(currentSelected);
  const currentCorrect = currentQuestion && currentSelected === currentQuestion.correctOptionId;
  const progress = questions.length ? ((questionIndex + (currentAnswered ? 1 : 0)) / questions.length) * 100 : 0;

  const beginExam = (nextDifficulty: ExamDifficulty) => {
    const seed = `${Date.now()}:${Math.random()}`;
    setDifficulty(nextDifficulty);
    setQuestions(createExamSession(nextDifficulty, seed));
    setQuestionIndex(0);
    setSelectedAnswers({});
    setStartedAt(new Date().toISOString());
    setResult(null);
    setReviewOpen(true);
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const leaveExam = () => {
    setScreen('overview');
    setQuestions([]);
    setSelectedAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chooseAnswer = (optionId: string) => {
    if (!currentQuestion || currentAnswered) return;
    setSelectedAnswers((current) => ({ ...current, [currentQuestion.id]: optionId }));
  };

  const completeExam = () => {
    const attempt = submitAttempt({ difficulty, startedAt, questions, selectedAnswers });
    setResult(attempt);
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextQuestion = () => {
    if (!currentAnswered) return;
    if (questionIndex >= questions.length - 1) {
      completeExam();
      return;
    }
    setQuestionIndex((index) => index + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAttempt = (attempt: ExamAttemptRecord) => {
    setDifficulty(attempt.difficulty);
    setResult(attempt);
    setReviewOpen(true);
    setScreen('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reviewItems = useMemo(() => {
    if (!result) return [];
    return result.answers.map((answer) => {
      const question = getExamQuestion(answer.questionId);
      if (!question) return null;
      return { question, answer };
    }).filter(Boolean) as Array<{
      question: NonNullable<ReturnType<typeof getExamQuestion>>;
      answer: ExamAttemptRecord['answers'][number];
    }>;
  }, [result]);

  if (screen === 'quiz' && currentQuestion) {
    return (
      <div className="min-h-full px-4 iphone-safe-top pb-12">
        <header className="flex items-center justify-between gap-3 mb-5">
          <button
            type="button"
            onClick={leaveExam}
            aria-label={c.exit}
            className="w-10 h-10 rounded-full bg-card/70 border border-white/[0.07] grid place-items-center text-muted-foreground"
          >
            <X size={18} />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary">{c.quizTitle}</p>
            <p className="font-serif text-lg text-foreground">{c.difficulty[difficulty].title}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 grid place-items-center text-primary">
            <CircleHelp size={18} />
          </div>
        </header>

        <div className="mb-5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
            <span>{fillSectionCopy(c.questionOf, { current: questionIndex + 1, total: questions.length })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary/65 to-primary"
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            />
          </div>
        </div>

        <motion.section
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden rounded-[28px] border border-primary/18 bg-gradient-to-br from-primary/[0.1] via-card/90 to-card/70 p-5 mb-4"
        >
          <div className="absolute -right-5 -top-8 text-[90px] opacity-[0.05]">☕</div>
          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/18 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
              {c.topics[currentQuestion.topic]}
            </span>
            <h1 className="font-serif text-[1.65rem] leading-tight text-foreground mt-4">
              {localizeExamText(currentQuestion.question, language)}
            </h1>
          </div>
        </motion.section>

        <div className="space-y-3">
          {currentQuestion.shuffledOptions.map((item, index) => {
            const selected = item.id === currentSelected;
            const correct = item.id === currentQuestion.correctOptionId;
            const revealedCorrect = currentAnswered && correct;
            const revealedWrong = currentAnswered && selected && !correct;

            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={!currentAnswered ? { scale: 0.985 } : undefined}
                onClick={() => chooseAnswer(item.id)}
                disabled={currentAnswered}
                className={`w-full min-h-[64px] rounded-[22px] border px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  revealedCorrect
                    ? 'bg-emerald-500/10 border-emerald-500/35'
                    : revealedWrong
                      ? 'bg-red-500/10 border-red-500/35'
                      : selected
                        ? 'bg-primary/10 border-primary/35'
                        : 'bg-card/65 border-white/[0.06]'
                }`}
              >
                <span className={`w-9 h-9 rounded-xl grid place-items-center text-[12px] font-bold flex-shrink-0 ${
                  revealedCorrect
                    ? 'bg-emerald-500/16 text-emerald-400'
                    : revealedWrong
                      ? 'bg-red-500/16 text-red-400'
                      : 'bg-background/65 text-muted-foreground'
                }`}>
                  {revealedCorrect ? <Check size={16} /> : revealedWrong ? <X size={16} /> : ANSWER_LABELS[index]}
                </span>
                <span className="text-[14px] leading-snug text-foreground">
                  {localizeExamText(item.text, language)}
                </span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {currentAnswered && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 rounded-[22px] border p-4 ${
                currentCorrect
                  ? 'bg-emerald-500/[0.07] border-emerald-500/25'
                  : 'bg-red-500/[0.06] border-red-500/22'
              }`}
            >
              <div className="flex items-center gap-2">
                {currentCorrect
                  ? <CheckCircle2 size={17} className="text-emerald-400" />
                  : <XCircle size={17} className="text-red-400" />}
                <p className={`text-[12px] font-bold ${currentCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {currentCorrect ? c.correct : c.incorrect}
                </p>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground/55 font-bold mt-3 mb-1.5">{c.explanation}</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {localizeExamText(currentQuestion.explanation, language)}
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileTap={currentAnswered ? { scale: 0.98 } : undefined}
          onClick={nextQuestion}
          disabled={!currentAnswered}
          className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-[13px] mt-5 disabled:opacity-35 inline-flex items-center justify-center gap-2"
        >
          {questionIndex === questions.length - 1 ? c.finish : c.next}
          <ChevronRight size={16} />
        </motion.button>
      </div>
    );
  }

  if (screen === 'result' && result) {
    const difficultyDefinition = getExamDifficulty(result.difficulty);
    return (
      <div className="min-h-full px-4 iphone-safe-top pb-12">
        <header className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={leaveExam}
            aria-label={c.back}
            className="w-10 h-10 rounded-full bg-card/70 border border-white/[0.07] grid place-items-center text-muted-foreground"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary">{c.resultScore}</p>
            <h1 className="font-serif text-3xl font-medium text-foreground leading-tight">
              {result.passed ? c.resultPassed : c.resultFailed}
            </h1>
          </div>
        </header>

        <section className={`relative overflow-hidden rounded-[30px] border p-6 mb-5 text-center ${
          result.passed
            ? 'bg-gradient-to-br from-emerald-500/[0.12] via-card/90 to-card/70 border-emerald-500/25'
            : 'bg-gradient-to-br from-primary/[0.1] via-card/90 to-card/70 border-primary/18'
        }`}>
          <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.055]">{result.passed ? '🏆' : '📚'}</div>
          <div className="relative">
            <div className={`w-20 h-20 rounded-full mx-auto grid place-items-center border ${
              result.passed
                ? 'bg-emerald-500/12 border-emerald-500/28 text-emerald-400'
                : 'bg-primary/10 border-primary/22 text-primary'
            }`}>
              {result.passed ? <Trophy size={34} /> : <BookOpenCheck size={34} />}
            </div>
            <div className="font-serif text-6xl leading-none text-foreground mt-5">{result.scorePercent}%</div>
            <p className="text-[12px] text-muted-foreground mt-2">
              {fillSectionCopy(c.resultCorrect, { correct: result.correctCount, total: result.totalQuestions })}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mt-2">
              {c.difficulty[result.difficulty].title} · {fillSectionCopy(c.passMark, { count: difficultyDefinition.passPercent })}
            </p>

            {result.rewarded ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 border border-primary/22 px-4 py-2 text-primary mt-5">
                <Coins size={15} />
                <span className="text-[12px] font-bold">{fillSectionCopy(c.rewardEarned, { count: result.rewardPoints })}</span>
              </div>
            ) : result.passed ? (
              <p className="text-[11px] text-muted-foreground mt-5">{c.rewardAlready}</p>
            ) : (
              <p className="text-[11px] leading-relaxed text-muted-foreground mt-5">{c.improve}</p>
            )}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => beginExam(result.difficulty)}
            className="h-12 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold inline-flex items-center justify-center gap-2"
          >
            <RotateCcw size={15} />
            {c.retry}
          </motion.button>
          <button
            type="button"
            onClick={leaveExam}
            className="h-12 rounded-2xl bg-card/70 border border-white/[0.07] text-foreground text-[12px] font-semibold"
          >
            {c.back}
          </button>
        </div>

        <section>
          <button
            type="button"
            onClick={() => setReviewOpen((value) => !value)}
            className="w-full flex items-center justify-between gap-3 mb-3 px-1"
          >
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground/65">
              <BookOpenCheck size={15} className="text-primary" />
              {c.reviewTitle}
            </span>
            <ChevronRight size={15} className={`text-muted-foreground transition-transform ${reviewOpen ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {reviewOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {reviewItems.map(({ question, answer }, index) => {
                  const selectedOption = question.options.find((item) => item.id === answer.selectedOptionId);
                  const correctOption = question.options.find((item) => item.id === answer.correctOptionId);
                  return (
                    <article
                      key={`${result.id}-${question.id}`}
                      className={`rounded-[22px] border p-4 ${
                        answer.correct
                          ? 'bg-emerald-500/[0.045] border-emerald-500/18'
                          : 'bg-card/60 border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl grid place-items-center text-[11px] font-bold flex-shrink-0 ${
                          answer.correct ? 'bg-emerald-500/14 text-emerald-400' : 'bg-red-500/12 text-red-400'
                        }`}>
                          {answer.correct ? <Check size={14} /> : index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] leading-snug text-foreground font-medium">
                            {localizeExamText(question.question, language)}
                          </p>
                          <div className="mt-3 space-y-2 text-[11px] leading-relaxed">
                            <p className={answer.correct ? 'text-emerald-400' : 'text-red-400'}>
                              <span className="text-muted-foreground">{c.yourAnswer}: </span>
                              {selectedOption ? localizeExamText(selectedOption.text, language) : '—'}
                            </p>
                            {!answer.correct && correctOption && (
                              <p className="text-emerald-400">
                                <span className="text-muted-foreground">{c.correctAnswer}: </span>
                                {localizeExamText(correctOption.text, language)}
                              </p>
                            )}
                            <p className="text-muted-foreground pt-1">
                              {localizeExamText(question.explanation, language)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-full px-4 iphone-safe-top pb-12">
      <header className="flex items-center gap-3 mb-5">
        <Link href="/profile">
          <motion.button
            whileTap={{ scale: 0.9 }}
            aria-label={c.back}
            className="w-10 h-10 rounded-full bg-card/70 border border-white/[0.07] grid place-items-center text-muted-foreground"
          >
            <ArrowLeft size={18} />
          </motion.button>
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-primary">{c.eyebrow}</p>
          <h1 className="font-serif text-3xl font-medium text-foreground leading-tight">{c.title}</h1>
        </div>
      </header>

      <p className="text-[13px] leading-relaxed text-muted-foreground mb-5">{c.subtitle}</p>

      {recommendedLesson && (
        <Link href={`/learning/${recommendedLesson.id}`}>
          <motion.section
            whileTap={{ scale: 0.99 }}
            className="rounded-[24px] bg-sky-500/[0.07] border border-sky-500/18 p-4 mb-5 flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 grid place-items-center flex-shrink-0">
              <BookOpenCheck size={18} className="text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-widest text-sky-400 font-bold">{learningCopy.recommendation}</p>
              <p className="text-[13px] font-medium text-foreground mt-1 truncate">{localizeLearningText(recommendedLesson.title, language)}</p>
              <p className="text-[9px] text-muted-foreground mt-1">{learningCompleted}/{learningTotal} · {learningCopy.basedOnExam}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
          </motion.section>
        </Link>
      )}

      <section className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-gradient-to-br from-primary/[0.14] via-card/90 to-card/70 p-5 mb-6 shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="absolute -right-8 -top-10 text-[120px] opacity-[0.06]">📝</div>
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles size={15} />
                <span className="text-[10px] uppercase tracking-[0.16em] font-extrabold">{c.weeklyTitle}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground mt-2 max-w-[250px]">{c.weeklyDescription}</p>
            </div>
            <div className={`rounded-full border px-3 py-2 text-[10px] font-bold flex-shrink-0 ${
              currentWeekRewarded
                ? 'bg-emerald-500/10 border-emerald-500/22 text-emerald-400'
                : 'bg-primary/10 border-primary/20 text-primary'
            }`}>
              {currentWeekRewarded ? c.rewardClaimed : c.rewardAvailable}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="rounded-[18px] bg-background/50 border border-white/[0.05] p-3">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50">{c.attempts}</p>
              <p className="font-serif text-2xl text-foreground mt-1">{currentWeekAttempts.length}</p>
            </div>
            <div className="rounded-[18px] bg-background/50 border border-white/[0.05] p-3">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50">{c.bestScore}</p>
              <p className="font-serif text-2xl text-foreground mt-1">{currentWeekBest === null ? '—' : `${currentWeekBest}%`}</p>
            </div>
            <div className="rounded-[18px] bg-background/50 border border-white/[0.05] p-3">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50">{c.points}</p>
              <p className="font-serif text-2xl text-primary mt-1">{totalPoints}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Award size={15} className="text-primary" />
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground/65">{c.chooseDifficulty}</p>
        </div>
        <div className="space-y-3">
          {EXAM_DIFFICULTIES.map((item, index) => {
            const itemCopy = c.difficulty[item.id];
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative overflow-hidden rounded-[24px] bg-card/65 border border-white/[0.06] p-4"
              >
                <div className="absolute -right-5 -top-7 text-[82px] opacity-[0.05]">{item.icon}</div>
                <div className="relative flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 grid place-items-center text-2xl flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-xl font-semibold text-foreground">{itemCopy.title}</h2>
                    <p className="text-[11px] leading-relaxed text-muted-foreground mt-1">{itemCopy.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="rounded-full bg-background/60 border border-white/[0.05] px-2.5 py-1 text-[9px] text-muted-foreground">
                        {fillSectionCopy(c.passMark, { count: item.passPercent })}
                      </span>
                      <span className="rounded-full bg-primary/10 border border-primary/16 px-2.5 py-1 text-[9px] text-primary">
                        {fillSectionCopy(c.reward, { count: item.rewardPoints })}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => beginExam(item.id)}
                  className="relative w-full h-11 rounded-2xl bg-primary text-primary-foreground font-bold text-[12px] mt-4 inline-flex items-center justify-center gap-2"
                >
                  {c.start}
                  <ChevronRight size={15} />
                </motion.button>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <History size={15} className="text-primary" />
          <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground/65">{c.historyTitle}</p>
        </div>
        {attempts.length ? (
          <div className="space-y-3">
            {attempts.slice(0, 12).map((attempt) => (
              <button
                key={attempt.id}
                type="button"
                onClick={() => openAttempt(attempt)}
                className="w-full rounded-[20px] bg-card/55 border border-white/[0.06] px-4 py-3 flex items-center gap-3 text-left"
              >
                <div className={`w-10 h-10 rounded-2xl grid place-items-center flex-shrink-0 ${
                  attempt.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {attempt.passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[13px] text-foreground">{c.difficulty[attempt.difficulty].title}</p>
                    <span className={`text-[9px] font-bold ${attempt.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      {attempt.passed ? c.passed : c.failed}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatAttemptDate(attempt.completedAt, locale)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-serif text-xl text-primary">{attempt.scorePercent}%</p>
                  {attempt.rewarded && (
                    <p className="text-[9px] text-muted-foreground inline-flex items-center gap-1">
                      <Coins size={10} className="text-primary" />+{attempt.rewardPoints}
                    </p>
                  )}
                </div>
                <ChevronRight size={15} className="text-muted-foreground/35 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[22px] bg-card/45 border border-dashed border-white/[0.08] p-5 text-center">
            <History size={22} className="text-muted-foreground/35 mx-auto mb-2" />
            <p className="text-[12px] text-muted-foreground">{c.historyEmpty}</p>
          </div>
        )}
      </section>
    </div>
  );
}
