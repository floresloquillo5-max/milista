import es from './es';
import type { Translations } from './es';

let current: Translations = es;

export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  let value: unknown = current;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  if (typeof value !== 'string') return path;
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
  }
  return value;
}

export function getTranslations(): Translations {
  return current;
}

export function setTranslations(lang: Translations): void {
  current = lang;
}
