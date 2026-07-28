import { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  maxWorkers: '50%',
  coverageReporters: ['json-summary', 'text', 'lcov'],
  testTimeout: 60000,
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^core/(.*)$': '<rootDir>/core/$1',
    '^global/(.*)$': '<rootDir>/global/$1',
    '^src/(.*)$': '<rootDir>/$1',
    '^i18n/(.*)$': '<rootDir>/i18n/$1',
  },
  transform: {
    // Point ts-jest at tsconfig.jest.json (isolatedModules: true) so each worker
    // transpiles instead of type-checking. `yarn build:test` still type-checks the
    // project, so nothing is lost — but workers no longer hold a TS program in memory.
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.jest.json' }],
  },
  testMatch: ['<rootDir>/**/*.(spec|test).ts'],
  testPathIgnorePatterns: ['/node_modules/', '\\.skip\\.ts$'],
  transformIgnorePatterns: ['<rootDir>/../node_modules/(?!@octokit)'],
};

export default config;
