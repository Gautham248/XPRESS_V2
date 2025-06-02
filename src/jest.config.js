module.exports = {
  testEnvironment: 'jsdom', // or 'jsdom-fifteen' if using Jest 24 or lower
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};