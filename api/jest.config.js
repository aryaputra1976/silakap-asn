module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/*.module.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>', '<rootDir>/../'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
  maxWorkers: 1,
};
