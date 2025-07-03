import { Todo, Settings } from '../services/types';

export const buildMotivationPrompt = (todos: Todo[], settings: Settings): string => {
  let systemPrompt = '';
  switch (settings.aiTone) {
    case 'soft':
      systemPrompt = "You're a kind and supportive motivator. Help the user overcome their resistance with empathy.";
      break;
    case 'hard':
      systemPrompt = "You're a strict AI coach. Remind the user of discipline and consequences for not acting.";
      break;
    case 'neutral':
      systemPrompt = "You're a rational and helpful AI buddy. Offer motivating logic to help the user get things done.";
      break;
    default:
      systemPrompt = "You're a helpful AI assistant.";
  }

  const pendingTasks = todos.filter(todo => !todo.isCompleted).map(todo => `- ${todo.title}`).join('\n');

  const userPrompt = `User has the following pending tasks:\n${pendingTasks}\n\nGenerate a motivational message in ${settings.aiTone} tone that nudges them to take action.`;

  return `${systemPrompt}\n\n${userPrompt}`;
};