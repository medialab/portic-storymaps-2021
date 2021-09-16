import React from 'react';
import Slider/*, { SliderTooltip }*/ from 'rc-slider';
import 'rc-slider/assets/index.css';

const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range);

const SliderRange = ({ title, min, max, value, onChange }) => {
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