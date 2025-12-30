import { useMemo } from 'react';
import { useProgressStore } from '../stores/progressStore';
import { useUserStore } from '../stores/userStore';

interface StreakMilestone {
  days: number;
  label: string;
  emoji: string;
  reached: boolean;
}

interface UseStreakReturn {
  currentStreak: number;
  longestStreak: number;
  nextMilestone: StreakMilestone | null;
  milestones: StreakMilestone[];
  streakMessage: string;
  isAtRisk: boolean; // Haven't cooked today
}

const MILESTONES = [
  { days: 3, label: 'Getting started', emoji: '🌱' },
  { days: 7, label: 'One week warrior', emoji: '🔥' },
  { days: 14, label: 'Two week champion', emoji: '⭐' },
  { days: 30, label: 'Monthly master', emoji: '🏆' },
  { days: 60, label: 'Sixty day legend', emoji: '👑' },
  { days: 90, label: 'Quarter year hero', emoji: '💎' },
  { days: 180, label: 'Half year titan', emoji: '🌟' },
  { days: 365, label: 'Full year legend', emoji: '🎯' },
];

export function useStreak(): UseStreakReturn {
  const { progress } = useProgressStore();
  const { monthlyStats } = useUserStore();

  const milestones = useMemo<StreakMilestone[]>(() => {
    return MILESTONES.map((m) => ({
      ...m,
      reached: progress.streak >= m.days,
    }));
  }, [progress.streak]);

  const nextMilestone = useMemo<StreakMilestone | null>(() => {
    return milestones.find((m) => !m.reached) ?? null;
  }, [milestones]);

  const streakMessage = useMemo(() => {
    const streak = progress.streak;

    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "One day down! Keep it going!";
    if (streak < 7) return `${streak} days! You're building momentum!`;
    if (streak < 14) return `${streak} days! You're on fire!`;
    if (streak < 30) return `${streak} days! Incredible dedication!`;
    if (streak >= progress.longestStreak && streak > 1) {
      return `${streak} days! Your longest streak yet!`;
    }
    return `${streak}-day streak! You're unstoppable!`;
  }, [progress.streak, progress.longestStreak]);

  // Simple heuristic - if no meals cooked today, streak is at risk
  // In real app, this would check actual meal log
  const isAtRisk = useMemo(() => {
    // TODO: Check if user has logged a meal today
    return false;
  }, []);

  return {
    currentStreak: progress.streak,
    longestStreak: progress.longestStreak,
    nextMilestone,
    milestones,
    streakMessage,
    isAtRisk,
  };
}
