import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useExams } from '@/hooks/useExams';
import { EXAM_QUESTIONS, type ExamTopic } from '@/lib/exams';
import {
  getLessonsForTopic,
  LEARNING_LESSONS,
  LEARNING_TOPICS,
  type LearningLesson,
  type LearningLevel,
} from '@/lib/learning';

export const LEARNING_STORAGE_KEY = 'coffeemind_learning_v1';

export interface LearningCompletionRecord {
  completedAt: string;
  checkpointCorrect: boolean;
}

interface LearningStore {
  version: 1;
  completed: Record<string, LearningCompletionRecord>;
  lastOpenedLessonId: string | null;
}

const EMPTY_STORE: LearningStore = {
  version: 1,
  completed: {},
  lastOpenedLessonId: null,
};

export interface TopicLearningProgress {
  topic: ExamTopic;
  completed: number;
  total: number;
  ratio: number;
  examCorrect: number;
  examTotal: number;
  examAccuracy: number | null;
  score: number;
  level: LearningLevel;
}

function levelFromScore(score: number): LearningLevel {
  if (score >= 85) return 'advanced';
  if (score >= 65) return 'confident';
  if (score >= 35) return 'developing';
  return 'foundation';
}

export function useLearning() {
  const { attempts } = useExams();
  const [store, setStore] = useLocalStorage<LearningStore>(LEARNING_STORAGE_KEY, EMPTY_STORE);

  const markOpened = useCallback((lessonId: string) => {
    setStore((current) => current.lastOpenedLessonId === lessonId
      ? current
      : { ...current, version: 1, lastOpenedLessonId: lessonId });
  }, [setStore]);

  const completeLesson = useCallback((lessonId: string, checkpointCorrect: boolean) => {
    setStore((current) => ({
      ...current,
      version: 1,
      lastOpenedLessonId: lessonId,
      completed: {
        ...current.completed,
        [lessonId]: current.completed[lessonId] ?? {
          completedAt: new Date().toISOString(),
          checkpointCorrect,
        },
      },
    }));
  }, [setStore]);

  const topicProgress = useMemo<TopicLearningProgress[]>(() => LEARNING_TOPICS.map((topic) => {
    const lessons = getLessonsForTopic(topic);
    const completed = lessons.filter((lesson) => store.completed[lesson.id]).length;
    const questionTopic = new Map(EXAM_QUESTIONS.map((question) => [question.id, question.topic]));
    const topicAnswers = attempts.flatMap((attempt) => attempt.answers)
      .filter((answer) => questionTopic.get(answer.questionId) === topic);
    const examCorrect = topicAnswers.filter((answer) => answer.correct).length;
    const examTotal = topicAnswers.length;
    const examAccuracy = examTotal ? examCorrect / examTotal : null;
    const lessonRatio = lessons.length ? completed / lessons.length : 0;
    const examRatio = examAccuracy ?? lessonRatio;
    const score = Math.round((lessonRatio * 65 + examRatio * 35) * 100);
    return {
      topic,
      completed,
      total: lessons.length,
      ratio: lessonRatio,
      examCorrect,
      examTotal,
      examAccuracy,
      score,
      level: levelFromScore(score),
    };
  }), [attempts, store.completed]);

  const completedCount = Object.keys(store.completed).filter((id) => LEARNING_LESSONS.some((lesson) => lesson.id === id)).length;
  const totalCount = LEARNING_LESSONS.length;
  const progressRatio = totalCount ? completedCount / totalCount : 0;

  const weakTopic = useMemo<ExamTopic>(() => {
    const withExamData = topicProgress.filter((item) => item.examTotal > 0);
    if (withExamData.length) {
      return [...withExamData].sort((a, b) => {
        const accuracyDelta = (a.examAccuracy ?? 0) - (b.examAccuracy ?? 0);
        if (accuracyDelta !== 0) return accuracyDelta;
        return a.ratio - b.ratio;
      })[0].topic;
    }
    return [...topicProgress].sort((a, b) => a.ratio - b.ratio)[0]?.topic ?? 'origins';
  }, [topicProgress]);

  const recommendedLesson = useMemo<LearningLesson | null>(() => {
    const weakLesson = getLessonsForTopic(weakTopic).find((lesson) => !store.completed[lesson.id]);
    if (weakLesson) return weakLesson;
    if (store.lastOpenedLessonId && !store.completed[store.lastOpenedLessonId]) {
      return LEARNING_LESSONS.find((lesson) => lesson.id === store.lastOpenedLessonId) ?? null;
    }
    return LEARNING_LESSONS.find((lesson) => !store.completed[lesson.id]) ?? LEARNING_LESSONS[0] ?? null;
  }, [store.completed, store.lastOpenedLessonId, weakTopic]);

  const overallScore = topicProgress.length
    ? Math.round(topicProgress.reduce((sum, item) => sum + item.score, 0) / topicProgress.length)
    : 0;

  return {
    completed: store.completed,
    completedCount,
    totalCount,
    progressRatio,
    overallScore,
    overallLevel: levelFromScore(overallScore),
    topicProgress,
    weakTopic,
    recommendedLesson,
    lastOpenedLessonId: store.lastOpenedLessonId,
    markOpened,
    completeLesson,
    isCompleted: (lessonId: string) => Boolean(store.completed[lessonId]),
  };
}
