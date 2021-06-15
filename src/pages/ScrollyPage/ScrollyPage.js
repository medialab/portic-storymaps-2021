import {useState, useReducer, useEffect} from 'react';
import {Helmet} from "react-helmet";
import {useScrollYPosition } from 'react-use-scroll-position';

import VisualizationController from '../../components/VisualizationController';
import {VisualizationControlContext} from '../../helpers/contexts';


const CENTER_FRACTION = .6;

const ScrollyPage = ({
  // Content,
  ContentSync,
  title,
  lang,
}) => {

  const [activeVisualization, setActiveVisualization] = useState(undefined);
  const [visualizations, setVisualizations] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  )
  const scrollY = useScrollYPosition();

  const updateCurrentVisualization = () => {
    // const bodyPos = document.body.getBoundingClientRect();
      const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
      const y = scrollY + DISPLACE_Y;
      const visualizationEntries = Object.entries(visualizations);
      let found;
      // on parcourt la liste à l'envers pour récupérer
      // la visualisation la plus haute de la page qui est
      // au-dessus du milieu de l'écran
      for (let index = visualizationEntries.length - 1; index >= 0; index--) {
        const [_id, visualization] = visualizationEntries[index];/* eslint no-unused-vars : 0 */
        const { ref } = visualization;
        if (ref.current) {
          const { y: initialVisY } = ref.current.getBoundingClientRect();
          const visY = initialVisY + window.scrollY;
          if (y > visY) {
            found = true;
            if (visualization.visualizationId) {
              setActiveVisualization(visualization);
            } else {
              setActiveVisualization(undefined);
            }
            break;
          }
        }
      }
      if (scrollY === 0 && visualizationEntries.length) {
        setActiveVisualization(visualizationEntries[0][1])
      }
      else if (!found && activeVisualization) {
        setActiveVisualization(undefined);
      }
  }

  /**
   * Scrollytelling management
   */
  useEffect(updateCurrentVisualization, [scrollY, visualizations]) /* eslint react-hooks/exhaustive-deps : 0 */

  const onRegisterVisualization = (params) => {
    const finalParams = {
      ...params,
      // data
    }
    setVisualizations({ ...visualizations, [params.id]: finalParams });
  }
  const onUnregisterVisualization = id => {
    const newVis = Object.entries(visualizations).reduce((res, [thatId, payload]) => {
      if (thatId === id) {
        return res;
      }
      return {
        ...res,
        [thatId]: payload
      }
    }, {})
    setVisualizations(newVis)
  }
  const onBlockClick = (id, ref) => {
    console.log('on block click', {id, ref})
  }
  return (
    <VisualizationControlContext.Provider
      value={{
        activeVisualization,
        onBlockClick,
        onRegisterVisualization,
        onUnregisterVisualization,
      }}
    >
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="ScrollyPage">
          <section>
            <ContentSync />
          </section>
          <aside>
            <VisualizationController activeVisualization={activeVisualization} />
          </aside>
      </div>
    </VisualizationControlContext.Provider>
  )
}

export default ScrollyPage;