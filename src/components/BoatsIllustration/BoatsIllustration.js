import { useState, useEffect, useMemo, useReducer } from "react";
import { useSpring, animated } from "react-spring";
import {v4 as genId} from 'uuid';

import {useInterval} from '../../helpers/hooks';
import { fixSvgDimension } from "../../helpers/misc";

import './BoatsIllustration.scss';

const PASS_DURATION = 100000;
const UPDATE_RATE = 4000;

/**
 * Returns a boat hull shape
 * @param {number} width
 * @param {number} height
 * @returns  {React.ReactElement} - React component
 */
const Hull = ({
  width,
  height,
}) => {
  const bottomRightX = width * .7;
  const bottomLeftX = width * .05;
  return (
    <path
      className="hull"
      d={`M 0 0 L ${width / 3} ${0} L ${width / 3} ${height / 4} L ${width * .6} ${height / 4} L ${width * .6} 0 L ${width} 0 L ${bottomRightX} ${height} L ${bottomLeftX} ${height} Z`}
    />
  )

}

/**
 * Returns a boat sail shape
 * @param {number} width
 * @param {number} height
 * @param {number} sailSpeed - period in miliseconds
 * @param {number} distance - factor in [0,1]
 * @returns  {React.ReactElement} - React component
 */
const Sail = ({
  width,
  height,
  sailSpeed,
  distance = 1
}) => {

  const randomFactor = useMemo(() => Math.random() * .4 + 1, [])
  
  const minRightX = width;
  const minLeftX = 0;
  const maxLeftX = 5 * distance;
  const maxRightX = width + 5 * distance;

  const step1 = {
    points: `0,${height * .1} ${width},${0} ${maxRightX},${height / 2} ${width},${height * .9} 0,${height} ${maxLeftX} ${height / 2}`
  }
  const step2 = {
    points: `0,${height * .1} ${width},${0} ${minRightX},${height / 2} ${width},${height * .9} 0,${height} ${minLeftX} ${height / 2}`
  }

  const {points} = useSpring({
    loop: true,
    to: [step1, step2, step1],
    from: step1,
    config: { duration: 500 * sailSpeed * randomFactor }
  });
  return (
    <>
      <animated.polygon
        points={points}
        className="sail"
      />
    </>
  )
}

/**
 * Returns a boat matt shape
 * @param {number} width
 * @param {number} height
 * @param {number} sailSpeed - period in miliseconds
 * @param {number} distance - factor in [0,1]
 * @returns  {React.ReactElement} - React component
 */
const Matt = ({
  width,
  height,
  sailSpeed,
  distance
}) => {
  const secondWidth = width * .7;
  return (
    <>
      <g transform={`translate(${width/2 - secondWidth/2}, ${height * .1})`}>
        <Sail sailSpeed={sailSpeed} distance={distance} width={secondWidth} height={height /4} />
      </g>
      <g transform={`translate(0, ${height * .4})`}>
        <Sail sailSpeed={sailSpeed} distance={distance} width={width} height={height * .45} />
      </g>
      <line
        x1={width / 2}
        x2={width / 2}
        y1={0}
        y2={height * 1.1}
      />
    </>
  )
}

/**
 * Returns a boat shape
 * @param {number} x
 * @param {number} height
 * @param {number} distance - factor in [0,1]
 * @returns  {React.ReactElement} - React component
 */
const Boat = ({
  x,
  height,
  distance
}) => {
  const [hullHeightRatio, setHullHeightRatio] = useState(.2);
  const [mattNumber, setMattNumber] = useState(1);
  const matts = useMemo(() => {
    let m = [];
    for (let i = 0; i < mattNumber; i++) {
      m.push({ heightRatio: 1 })
    }
    return m;
  }, [mattNumber])

  const step1 = {
    transform: `skewX(-3)`
  }
  const step2 = {
    transform: `skewX(3)`
  }
  const {transform} = useSpring({
    loop: true,
    to: [step1, step2, step1],
    from: step1,
    config: { duration: 3000 }
  });


  useEffect(() => {
    const nOfMatts = Math.round(Math.random() * 2) + 1;
    const newHullHeightRatio = .1 + Math.random() * .1;
    setMattNumber(nOfMatts)
    setHullHeightRatio(newHullHeightRatio);
  }, []);
  const randomFactor = useMemo(() => Math.random(), [])


  const boatWidth = height;

  return (
    <animated.g
      className="boat"
      transform={transform}
    >
      {
        matts.map((matt, mattIndex) => {
          const displace = (boatWidth * .9);
          const x = ((mattIndex) / (matts.length)) * displace;
          const width = (boatWidth / matts.length) * .8;
          return (
            <g key={mattIndex} className="matt" transform={`translate(${x}, 0)`}>
              <Matt
                width={width}
                height={height - height * hullHeightRatio}
                sailSpeed={randomFactor * .5 + 1}
                distance={distance}
              />
            </g>
          )
        })
      }
      <g transform={`translate(0, ${height - height * hullHeightRatio})`}>
        <Hull
          width={boatWidth}
          height={height * hullHeightRatio}
        />
      </g>
    </animated.g>
  )
}

/**
 * Returns a bird shape
 * @param {number} boatHeight
 * @param {number} containerHeight
 * @param {number} distance - factor in [0,1]
 * @returns  {React.ReactElement} - React component
 */
const Bird = ({
  boatHeight,
  containerHeight,
  distance
}) => {
  
  const dimension = containerHeight / 20 * (distance / 2);
  const step1 = {
    points: `0,${0}, ${dimension/2},${dimension/3} ${dimension},${0} ${dimension/2} ${dimension / 2}`
  }
  const step2 = {
    points: `0,${dimension}, ${dimension/2},${0} ${dimension},${dimension} ${dimension/2} ${dimension / 3}`
  }

  const moveSteps = useMemo(() => {
    const steps = []
    for (let i = 0 ; i < 30 ; i++) {
      const y = Math.random() * boatHeight * 1.3 + containerHeight - boatHeight * 1.5;
      const x = Math.random() * boatHeight * 2 - boatHeight;
      const scale = Math.random() + .5
      steps.push({
        transform: `translate(${x}, ${y})scale(${scale})`
      })
    }
    return steps;
  }, [boatHeight, containerHeight])

  const {points} = useSpring({
    loop: true,
    to: [step1, step2, step1],
    from: step1,
    config: { duration: 300 }
  });
  const {transform} = useSpring({
    loop: true,
    to: [...moveSteps, moveSteps[0]],
    from: moveSteps[0],
    config: { duration: 900 }
  });
  return (
    <animated.g className="bird" transform={transform}>
      <animated.polygon
        points={points}
      />
    </animated.g>
  )
}

/**
 * Returns a moving boat + optional birds
 * @param {number} containerHeight
 * @param {number} containerWidth
 * @param {boolean} rightToLeft
 * @param {number} startAt - starting point in pixels
 * @param {number} size - factor for defining height relative to container height
 * @param {number} distance - factor in [0,1]
 * @returns  {React.ReactElement} - React component
 */
const MovingBoat = ({
  containerHeight,
  containerWidth,
  rightToLeft,
  startAt,
  size,
  distance = 1
}) => {
  const birds = useMemo(() => {
    if (distance > .5 && Math.random() > .5) {
      const numberOfBirds = 1 + Math.round(Math.random() * 20);
      let b = [];
      for (let i = 0 ; i < numberOfBirds ; i++) {
        b.push(i);
      }
      return b;
    } else {
      return [];
    }
  }, [distance])
  const start = -containerWidth * 0.3; 
  const end = containerWidth * 1.3;
  const step1 = {
    transform: `translate(${rightToLeft ? end : start}, 0)`
  }
  const step2 = {
    transform: `translate(${rightToLeft ? start : end}, 0)`
  }
  if (startAt) {
    step1.transform =  `translate(${startAt}, 0)`
  }
  const randomFactor = useMemo(() => Math.random(), [])
  const {transform} = useSpring({
    from: step1,
    to: step2,
    config: { duration: PASS_DURATION * (2 - distance * (1 + randomFactor / 10)) }
  });
  const height = containerHeight * 0.2 * size * distance;
  return (
    <animated.g
      transform={transform}
    >
      <g style={{opacity: distance}} transform={rightToLeft ? 'scale(-1, 1)' : ''}>
        <g transform={`translate(0, ${containerHeight - height})`}>
          <Boat
            x={0}
            height={height}
            distance={distance}
          />
        </g>
        {
          birds.map(index => (
            <Bird
              containerHeight={containerHeight}
              boatHeight={height}
              distance={distance}
              key={index}
            />
          ))
        }
        
      </g>
    </animated.g>
  )
}


/**
 * Returns moving boats
 * @param {number} width
 * @param {number} height
 * @returns  {React.ReactElement} - React component
 */
const BoatsIllustration = ({
  width: inputWidth = 1200,
  height: inputHeight = 100,
}) => {
  const width = fixSvgDimension(inputWidth);
  const height = fixSvgDimension(inputHeight);
  const createBoat = (payload = {}) => {
    const {startAt = 0} = payload;
    const id = genId();
    const distance = Math.random() * .8 + .2;
    const rightToLeft = Math.random() >= .5;
    const size = Math.round(Math.random() * 3) + 1;
    return {
      id,
      distance, 
      rightToLeft,
      size,
      createdAt: new Date().getTime(),
      startAt
    }
  }
  const [boats, updateBoats] = useReducer((b, action) => {
    switch(action.type) {
      case 'removeBoat':
        return Object.entries(b).reduce((res, [id, boat]) => {
          if (id !== action.payload) {
            return {
              ...res,
              [id]: boat
            }
          } else {
            return res;
          }
        }, {});
      case 'createBoat':
      default:
        const boat = createBoat(action.payload);
        return {
          ...b,
          [boat.id]: boat
        }
    }
  }, {});

  useEffect(() => {
    // add boats regularly
    const timeout = setTimeout(() => {
      // add boat
      updateBoats({type: 'createBoat'})
    }, PASS_DURATION / 10)
    return () => clearTimeout(timeout)
  }, [boats, updateBoats])

  useInterval(() => {
    const now = new Date();
    Object.entries(boats).reduce((res, [id, boat]) => {
      if (now.getTime() < boat.createdAt + PASS_DURATION * 1.3) {
        return {
          ...res,
          [id]: boat
        }
      } else {
        updateBoats({type: 'removeBoat', payload: id})
        return res;
      }
    }, {})
  }, UPDATE_RATE)

  useEffect(() => {
    for (let i = 0 ; i < 5 ; i++) {
      updateBoats({type: 'createBoat', payload: {startAt: width * Math.random()}})
    }
  }, []);/* eslint react-hooks/exhaustive-deps : 0 */

  return (
    <svg className="BoatsIllustration" width={width} height={height}>
      {
        Object.entries(boats).map(([id, {
          distance, 
          rightToLeft, 
          size,
          startAt
        }]) => (
          <MovingBoat 
            key={id} 
            distance={distance} 
            size={size} 
            rightToLeft={rightToLeft} 
            containerHeight={height} 
            containerWidth={width} 
            startAt={startAt}
          />
        ))
      }
    </svg>
  )
}

export default BoatsIllustration;