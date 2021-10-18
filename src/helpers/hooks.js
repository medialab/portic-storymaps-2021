import { useEffect, useRef, useState } from 'react';

/**
 * Runs a given function each {delay} miliseconds
 * @param {function} callback
 * @param {number} delay - in ms
 * @returns {void}
 */
export function useInterval(callback, delay = 100) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

/**
 * Debounces the update of a value given a certain delay
 * @param {any} value
 * @param {number} delay - in ms
 * @returns {any} - returned value
 */
export function useDebounce(value, delay = 100) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cancel the timeout if value changes
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay]
  );

  return debouncedValue;
}

/**
 * Records the previous value of a given value
 * @param {any} value
 * @returns {any} previous value
 */
export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}