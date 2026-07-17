import { useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  ExamDifficulty,
  ExamQuestionView,
  getCurrentExamWeekKey,
  getExamDifficulty,
} from '@/lib/exams';

export const EXAMS_STORAGE_KEY = 'coffeemind_exams_v1';

export interface ExamAnswerRecord {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  correct: boolean;
}

export interface ExamAttemptRecord {
  id: string;
  weekKey: string;
  difficulty: ExamDifficulty;
  startedAt: string;
  completedAt: string;
  questionIds: string[];
  answers: ExamAnswerRecord[];
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
  passed: boolean;
  rewardPoints: number;
  rewarded: boolean;
}

interface ExamStore {
  version: 1;
  attempts: ExamAttemptRecord[];
}

const EMPTY_STORE: ExamStore = {
  version: 1,
  attempts: [],
};

function createAttemptId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export interface SubmitExamInput {
  difficulty: ExamDifficulty;
  startedAt: string;
  questions: ExamQuestionView[];
  selectedAnswers: Record<string, string>;
}

export function useExams() {
  const [store, setStore] = useLocalStorage<ExamStore>(EXAMS_STORAGE_KEY, EMPTY_STORE);
  const weekKey = getCurrentExamWeekKey();

  const attempts = useMemo(
    () => [...store.attempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [store.attempts],
  );

  const submitAttempt = useCallback((input: SubmitExamInput): ExamAttemptRecord => {
    const difficulty = getExamDifficulty(input.difficulty);
    const completedAt = new Date().toISOString();
    const currentWeekKey = getCurrentExamWeekKey(new Date(completedAt));
    const answers: ExamAnswerRecord[] = input.questions.map((question) => {
      const selectedOptionId = input.selectedAnswers[question.id] ?? '';
      return {
        questionId: question.id,
        selectedOptionId,
        correctOptionId: question.correctOptionId,
        correct: selectedOptionId === question.correctOptionId,
      };
    });
    const correctCount = answers.filter((answer) => answer.correct).length;
    const totalQuestions = answers.length;
    const scorePercent = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercent >= difficulty.passPercent;
    const rewardAlreadyEarned = store.attempts.some(
      (attempt) => attempt.weekKey === currentWeekKey && attempt.rewarded,
    );
    const rewarded = passed && !rewardAlreadyEarned;

    const record: ExamAttemptRecord = {
      id: createAttemptId(),
      weekKey: currentWeekKey,
      difficulty: input.difficulty,
      startedAt: input.startedAt,
      completedAt,
      questionIds: input.questions.map((question) => question.id),
      answers,
      correctCount,
      totalQuestions,
      scorePercent,
      passed,
      rewardPoints: rewarded ? difficulty.rewardPoints : 0,
      rewarded,
    };

    setStore((current) => ({
      version: 1,
      attempts: [record, ...current.attempts].slice(0, 50),
    }));

    return record;
  }, [setStore, store.attempts]);

  const currentWeekAttempts = attempts.filter((attempt) => attempt.weekKey === weekKey);
  const currentWeekBest = currentWeekAttempts.length
    ? Math.max(...currentWeekAttempts.map((attempt) => attempt.scorePercent))
    : null;
  const currentWeekPassed = currentWeekAttempts.some((attempt) => attempt.passed);
  const currentWeekRewarded = currentWeekAttempts.some((attempt) => attempt.rewarded);
  const totalPoints = attempts.reduce((sum, attempt) => sum + attempt.rewardPoints, 0);
  const passedCount = attempts.filter((attempt) => attempt.passed).length;
  const perfectCount = attempts.filter((attempt) => attempt.scorePercent === 100).length;
  const bestScore = attempts.length ? Math.max(...attempts.map((attempt) => attempt.scorePercent)) : null;

  return {
    attempts,
    currentWeekAttempts,
    currentWeekBest,
    currentWeekPassed,
    currentWeekRewarded,
    totalPoints,
    passedCount,
    perfectCount,
    bestScore,
    submitAttempt,
  };
}
