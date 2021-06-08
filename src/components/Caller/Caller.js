
import {useContext, useEffect, useRef, useState} from 'react';
import cx from 'classnames';
import {v4 as genId} from 'uuid';

import {VisualizationControlContext} from '../../helpers/contexts';

const Caller = ({id: visualizationId, ...props}) => {
  const ref = useRef(null);
  const [id] = useState(genId());
  const {
    activeVisualization,
    onBlockClick,
    onRegisterVisualization,
    onUnregisterVisualization,
  } = useContext(VisualizationControlContext);

  useEffect(() => {
    // on wrappe dans un setTimeout pour avoir une ref non-nulle vers le composant
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
      className={cx("Caller", {'is-active': activeVisualization && id === activeVisualization.id})}
    >
      {
        visualizationId ?
        <>caller pour la visualisation <code>{visualizationId}</code> </>
        :
        <>caller sans id (agit comme un clearfix)</>
      }{
        Object.keys(props).length ? 
          <span>avec les paramètres {JSON.stringify(props)}</span>
        : null
      }
    </div>
  );
}

export default Caller;