export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  due_date: string;
  created_at: string;
}

export interface Habit {
  id: number;
  name: string;
  frequency: string;
  completions: string[];
}

export interface FocusSession {
  id: number;
  duration_minutes: number;
  started_at: string;
}

export interface Stats {
  tasksCompleted: number;
  focusTimeMinutes: number;
  habitsTracked: number;
}
