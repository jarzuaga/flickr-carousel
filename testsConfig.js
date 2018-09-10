/* eslint-disable import/prefer-default-export */

process.env.NODE_ENV = 'test';

/**
 * Any utilites that help bootstrap jest tests
 */

global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};

if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener() {},
      removeListener() {}
    };
  };

  window.scrollTo = jest.fn();
}

/**
 * mockEvent - methods commonly required for testing event-driven methods with jest
 * @type {Object}
 */
export const mockEvent = {
  preventDefault: jest.fn(),
  target: {},
};
