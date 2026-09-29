// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT
import { createRequire } from 'node:module';

describe('Transitive dependency security and compatibility', () => {
  it('Serializes nullable comma arrays through the request client dependency', () => {
    // Resolve from the consumer: a patched top-level copy alone is insufficient.
    const requestRequire = createRequire(require.resolve('@cypress/request'));
    const qs = requestRequire('qs') as typeof import('qs');

    expect(
      qs.stringify(
        { items: [null, undefined, 'a value'] },
        { arrayFormat: 'comma', encodeValuesOnly: true }
      )
    ).toBe('items=,,a%20value');
    expect(qs.parse('filter[status]=open&filter[owner]=me')).toEqual({
      filter: { status: 'open', owner: 'me' },
    });
  });

  describe('Cookie dependency used by react-use', () => {
    const cookieRequire = createRequire(require.resolve('react-use/lib/useCookie'));
    const cookies = cookieRequire('js-cookie') as typeof import('js-cookie');
    let written: string;
    let originalDocument: PropertyDescriptor | undefined;

    beforeEach(() => {
      written = '';
      originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
      Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
          get cookie() {
            return written;
          },
          set cookie(value: string) {
            written = value;
          },
        },
      });
    });

    afterEach(() => {
      if (originalDocument) {
        Object.defineProperty(globalThis, 'document', originalDocument);
      } else {
        Reflect.deleteProperty(globalThis, 'document');
      }
    });

    it('Preserves the string get, set and remove API used by the hook', () => {
      cookies.set('session', 'a value', { sameSite: 'Strict' });
      expect(cookies.get('session')).toBe('a value');
      expect(written).toContain('sameSite=Strict');
      cookies.remove('session');
      expect(written).toMatch(/^session=;.*expires=/);
      expect(cookies.get('session')).toBe('');
    });

    it('Does not turn an inherited cookie attribute into a domain directive', () => {
      cookies.set(
        'session',
        'value',
        JSON.parse('{"__proto__":{"domain":"untrusted.example"}}')
      );
      expect(written).toBe('session=value; path=/');
    });
  });
});
