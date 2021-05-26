import {useRef, useEffect} from 'react';
// import Graph from 'graphology-types';


export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

