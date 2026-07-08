export type User = {
  telegram_id: number;
  display_name: string;
  rank_score: number;
  wallet_balance: number;
  created_at: string;
};

export type Question = {
  id: number;
  text: string;
  options: string[];
  correct_index: number;
  category: string;
  difficulty: string;
};

export type Match = {
  id: string;
  player_a_id: number;
  player_b_id: number | null;
  status: 'waiting' | 'active' | 'complete';
  question_set: number[];
  winner_id: number | null;
  created_at: string;
  updated_at: string;
};

export type MatchAnswer = {
  id: string;
  match_id: string;
  user_id: number;
  question_id: number;
  selected_index: number;
  correct: boolean;
  answer_time_ms: number;
  created_at: string;
};

export function getRankTier(score: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' {
  if (score >= 1500) return 'Diamond';
  if (score >= 1000) return 'Gold';
  if (score >= 500) return 'Silver';
  return 'Bronze';
}
