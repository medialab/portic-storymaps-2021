import React from 'react';
import Slider/*, { SliderTooltip }*/ from 'rc-slider';
import 'rc-slider/assets/index.css';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

/**
 * Displays an interactive slider
 * @param {string} title
 * @param {number} min
 * @param {number} max
 * @param {number} value
 * @param {function} onChange
 * @returns {React.ReactElement} - React component
 */
const SliderRange = ({ 
  title, 
  min, 
  max, 
  value, 
  onChange 
}) => {
  const style = { width: 300, margin: 50 };

  return (
    <div style={style}>
      <p>{title}</p>
      <Range
        allowCross={false}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default SliderRange;