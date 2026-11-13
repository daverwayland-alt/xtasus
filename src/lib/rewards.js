import { DARE_STREAK_GOAL, drawTool } from '@/data/tools';

/* Racha de retos: cada DARE_STREAK_GOAL retos cumplidos seguidos regala un cóctel al azar (sin tope). */
export function awardDareStreak(streaks, tools, pid) {
  const next = (streaks[pid] || 0) + 1;
  if (next < DARE_STREAK_GOAL) return { streaks: { ...streaks, [pid]: next }, tools, reward: null };
  const reward = drawTool();
  return {
    streaks: { ...streaks, [pid]: 0 },
    tools: { ...tools, [pid]: [...(tools[pid] || []), reward] },
    reward,
  };
}

export function resetDareStreak(streaks, pid) {
  return streaks[pid] ? { ...streaks, [pid]: 0 } : streaks;
}
