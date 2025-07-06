
export interface Todo {
  id: string;
  title: string;
  createdAt: number;
  isCompleted: boolean;
}

export interface Settings {
  notificationFrequency: 'hourly' | '3-per-day' | 'daily' | '1-min' | 'custom';
  customNotificationTime?: string; // HH:MM format
  aiTone: 'soft' | 'hard' | 'neutral';
  apiKey: string;
  model: string; // e.g., "llama3-8b-instruct"
  notificationsEnabled: boolean;
}
