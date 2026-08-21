import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';

import {routing} from './routing';

function collectKeys(value: unknown, prefix = '', result: string[] = []) {
  if (value && typeof value === 'object' && !Array.isArray(value)) for (const [key, child] of Object.entries(value)) {
    const path = `${prefix}${key}`; result.push(path); collectKeys(child, `${path}.`, result);
  }
  return result.sort();
}

describe('translations', () => {
  it('contains identical German and Italian key sets', () => {
    const de = JSON.parse(readFileSync(resolve('messages/de.json'), 'utf8'));
    const it = JSON.parse(readFileSync(resolve('messages/it.json'), 'utf8'));
    expect(collectKeys(de)).toEqual(collectKeys(it));
  });

  it('defines compact and accessible language switcher strings for all locales', () => {
    const de = JSON.parse(readFileSync(resolve('messages/de.json'), 'utf8'));
    const it = JSON.parse(readFileSync(resolve('messages/it.json'), 'utf8'));

    for (const locale of routing.locales) {
      expect(typeof de.navigation?.languageCompact?.[locale]).toBe('string');
      expect(de.navigation.languageCompact[locale].trim()).not.toBe('');
      expect(typeof de.navigation?.languageAria?.[locale]).toBe('string');
      expect(de.navigation.languageAria[locale].trim()).not.toBe('');

      expect(typeof it.navigation?.languageCompact?.[locale]).toBe('string');
      expect(it.navigation.languageCompact[locale].trim()).not.toBe('');
      expect(typeof it.navigation?.languageAria?.[locale]).toBe('string');
      expect(it.navigation.languageAria[locale].trim()).not.toBe('');
    }
  });
});
