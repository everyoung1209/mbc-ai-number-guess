
export type GameStatus = 'playing' | 'won' | 'lost';

export interface GuessRecord {
  value: number;
  result: 'too-high' | 'too-low' | 'correct';
  timestamp: number;
}

export interface AiFeedback {
  commentary: string;
  advice: string;
  mood: 'happy' | 'sarcastic' | 'encouraging' | 'impressed';
}
