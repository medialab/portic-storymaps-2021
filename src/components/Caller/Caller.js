
import {useContext, useEffect, useRef, useState} from 'react';
import cx from 'classnames';
import {v4 as genId} from 'uuid';

import {VisualizationControlContext} from '../../helpers/contexts';

/**
 * Visulization caller to place in contents
 * @param {string} id - visualization id used by visualization context to map caller with a specific vis
 * @param {object} props - visualization parameters passed as payload to visualization context
 * @returns  {React.ReactElement} - React component
 */
const Caller = ({id: visualizationId, lang = 'fr', ...props}) => {
  const ref = useRef(null);
  // we differentiate caller id and visualization id as their rel can theoretically be n-1
  const [id] = useState(genId());
  const {
    // used to define whether caller is active
    activeVisualization,
    onBlockClick,
    // callbacks used to register/unregister visualization data & HTML ref in upstream state
    onRegisterVisualization,
    onUnregisterVisualization,
  } = useContext(VisualizationControlContext);

  // register vis on caller's mount, unregister it on unmount
  useEffect(() => {
    // we wrap callback in a setTimeout in order to have a non-null ref to the HTML element
    setTimeout(() => {
      let payload = {...props};
      payload = {
        ...payload,
        ref,
        visualizationId,
        id
      }
      onRegisterVisualization(payload)
    })
    return onUnregisterVisualization(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onClick = e => {
    if (typeof onBlockClick === 'function') {
      onBlockClick(id, ref);
    }
  }
  return (
    <div
      ref={ref}
      onClick={onClick} 
      className={cx("Caller", {
        'is-active': activeVisualization && id === activeVisualization.id, 
        'is-clearfix': !visualizationId,
        // currently is-hidden and is-devmode are logically symetrical, but this can be useful to differentiate the 2 in dev
        'is-hidden': process.env.NODE_ENV !== 'development',
        'is-devmode': process.env.NODE_ENV === 'development',
      })}
    >
      {
        process.env.NODE_ENV === 'development' ?
        <>
          {
          visualizationId ?
          <span>caller pour la visualisation <code>{visualizationId}</code> </span>
          :
          <span>caller sans id (agit comme un clearfix)</span>
        }{
          Object.keys(props).length ? 
            <span>avec les paramètres {JSON.stringify(props)}</span>
          : null
        }
        </>
        :
        null
      }
      
    </div>
  );
}

export default Caller;