// jest.config.cjs (or .js)
module.exports = {
  preset: 'ts-jest', // Keep this for most defaults
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  clearMocks: true,
  // NEW WAY for ts-jest config:
  transform: {
    '^.+\\.tsx?$': [ // This regex matches .ts and .tsx files
      'ts-jest',
      {
        tsconfig: 'tsconfig.app.json', // Or your specific tsconfig file
        // You can add other ts-jest specific options here if needed
      },
    ],
  },
  // If you also have .js/.jsx files that need Babel transformation separate from ts-jest's default:
  // transform: {
  //   '^.+\\.(js|jsx)$': 'babel-jest', // Example if you use babel-jest for JS files
  //   '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.app.json' }],
  // },
};