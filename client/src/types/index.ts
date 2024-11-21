export type Status = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type RecurrencePattern = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}
