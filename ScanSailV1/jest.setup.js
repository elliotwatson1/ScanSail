// jest.setup.js
import { jest } from '@jest/globals';

// setting up jest for testing

jest.spyOn(console, 'warn').mockImplementation((...args) => {
  if (!args[0].includes('Math.random is not cryptographically secure')) {
    console.warn(...args);
  }
});
