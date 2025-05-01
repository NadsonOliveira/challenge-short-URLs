import { v4 as uuidv4 } from 'uuid';

export function generateShortCode(): string {
  return uuidv4().split('-')[0].slice(0, 6); 
}
