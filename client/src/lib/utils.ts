import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('token');
}
