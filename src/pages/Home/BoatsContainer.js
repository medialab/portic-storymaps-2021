import React, { useState } from 'react';

import Measure from 'react-measure'

import BoatsIllustration from '../../components/BoatsIllustration';


const BoatsContainer = () => {
  const [dimensions, setDimensions] = useState({});
  return (
    <Measure 
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className="boats-container">
          <BoatsIllustration {...{...dimensions}} />
        </div>
      )}
    </Measure>
  )
}

export default BoatsContainer;