import React from 'react';
import RadarChart from 'react-svg-radar-chart';
import 'react-svg-radar-chart/build/css/index.css'
//import { groupBy } from 'lodash';
 

const RadarPlot= ({
  data,
  captions,
  size : initialSize = 100,
  //margins: inputMargins = {},
}) => {

  return (
       <RadarChart
        captions={captions}
        data={data}
        size={initialSize}
  />
  )
}

export default RadarPlot;
