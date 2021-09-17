import React from 'react';
import cx from 'classnames';


export default function GraphControls({
  rescale, 
  zoomIn, 
  zoomOut, 
}) {
  return (
    <ul className={cx("VisControls GraphControls")}>
      <li className="vis-controls-item camera">
      
      <button onClick={zoomOut}>
        -
      </button>
      <button onClick={zoomIn}>
        +
      </button>
      <button onClick={rescale}>
        Recentrer
      </button>
      </li>
    </ul>
  );
}