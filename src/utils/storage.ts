import { Lancamento } from '../types';

export const STORAGE_KEY = 'container_lancamentos';
export const CONFIG_KEY = 'container_config_v2';

let localStorageAvailable = false;
try {
  localStorage.setItem('_test_', '1');
  localStorage.removeItem('_test_');
  localStorageAvailable = true;
} catch (e) {
  localStorageAvailable = false;
}

export function getData(): Lancamento[] {
  if (!localStorageAvailable) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

export function saveData(arr: Lancamento[]) {
  if (localStorageAvailable) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }
}

export function loadConfigUrl(): string {
  if (localStorageAvailable) {
    try {
      const storedUrl = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}').url;
      if (storedUrl) return storedUrl;
    } catch (e) {}
  }
  return 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
}

export function saveConfigUrl(url: string) {
  if (localStorageAvailable) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({ url }));
    } catch (e) {}
  }
}
