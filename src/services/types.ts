
export interface Todo {
  id: string;
  title: string;
  createdAt: number;
  isCompleted: boolean;
}

export interface Settings {
  notificationFrequency: 'hourly' | '3-per-day' | 'daily' | '5-mins';
  aiTone: 'soft' | 'hard' | 'neutral';
  apiKey: string;
  model: string; // e.g., "llama3-8b-instruct"
}
