// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

describe('Catalogue entry point', () => {
  afterEach(() => {
    jest.dontMock('jest');
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it('Loads without the optional test runner', () => {
    jest.doMock('jest', () => {
      throw new Error('Jest is not installed in a production deployment');
    });
    jest.isolateModules(() => {
      const entry = require('../index') as typeof import('../index');
      expect(entry.actionsCatalogue).toBeDefined();
      expect(entry.qtester.run).toBeInstanceOf(Function);
    });
  });

  it('Loads and invokes the test runner when tests are explicitly requested', async () => {
    const runCLI = jest.fn().mockResolvedValue({ results: { success: true } });
    jest.doMock('jest', () => ({ runCLI }));
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const { qtester } = require('../index') as typeof import('../index');
    const api = { createConnection: jest.fn(), execAppAction: jest.fn() };
    const originalApi = Object.getOwnPropertyDescriptor(globalThis, 'testApi');
    try {
      await qtester.run(api);
      expect(runCLI).toHaveBeenCalledWith(
        expect.objectContaining({ runInBand: true, testMatch: ['**/?(*.)+(qtest).[tj]s?(x)'] }),
        [process.cwd()]
      );
      expect(Reflect.get(globalThis, 'testApi')).toBe(api);
    } finally {
      if (originalApi) {
        Object.defineProperty(globalThis, 'testApi', originalApi);
      } else {
        Reflect.deleteProperty(globalThis, 'testApi');
      }
    }
  });
});
