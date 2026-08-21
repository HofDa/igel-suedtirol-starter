import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

/** Klassen zusammenführen; spätere Tailwind-Utilities gewinnen. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
