import { useState, useReducer, useEffect, useRef } from 'react';
import { Helmet } from "react-helmet";
import { useScrollYPosition } from 'react-use-scroll-position';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';

import VisualizationController from '../../components/VisualizationController';
import VisualizationFocus from '../../components/VisualizationFocus';
import { VisualizationControlContext } from '../../helpers/contexts';

import { buildPageTitle } from '../../helpers/misc';

import visualizations from '../../visualizationsList';

const visualizationsMap = visualizations.reduce((res, visualization) => ({
  ...res,
  [visualization.id]: visualization
}), {})

const CENTER_FRACTION = .6;

const ScrollyPage = ({
  // Content,
  ContentSync,
  title,
  lang,
}) => {
  const sectionRef = useRef(null);
  // mobile mode: focus on text or on viz
  const [focusOnViz, setFocusOnViz] = useState(false);
  // whether to open the active viz in "atlas mode"
  const [visualizationIsFullScreen, setVisualizationIsFullScreen] = useState(false);
  const [activeVisualization, setActiveVisualization] = useState(undefined);
  const [visualizations, setVisualizations] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  )
  const scrollY = useScrollYPosition();

  useEffect(() => {
    if (!activeVisualization && focusOnViz) {
      setFocusOnViz(false);
    }
  }, [activeVisualization])

  const updateCurrentVisualization = () => {
    if (visualizationIsFullScreen) {
      return;
    } 
    // const bodyPos = document.body.getBoundingClientRect();
    const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
    const y = scrollY + DISPLACE_Y;
    const visualizationEntries = Object.entries(visualizations);
    let found;
    const sectionDims = sectionRef.current && sectionRef.current.getBoundingClientRect();
    const sectionEnd = sectionDims.y + window.scrollY + sectionDims.height;
    if (y > sectionEnd) {
      if (activeVisualization) {
        setActiveVisualization(undefined);
      }
      return;
    }
    // on parcourt la liste à l'envers pour récupérer
    // la visualisation la plus haute de la page qui est
    // au-dessus du milieu de l'écran
    for (let index = visualizationEntries.length - 1; index >= 0; index--) {
      const [_id, visualization] = visualizationEntries[index];/* eslint no-unused-vars : 0 */
      const { ref } = visualization;
      if (ref.current) {
        const { y: initialVisY } = ref.current.getBoundingClientRect();
        let visY = initialVisY + window.scrollY;
        // @todo refactor this, it is dirty
        if (ref.current.parentNode.className === 'centered-part-contents') {
          visY += ref.current.parentNode.parentNode.getBoundingClientRect().y;
        }
        if (!visualization.visualizationId && scrollY + window.innerHeight * .8 > visY) {
          found = true;
          setActiveVisualization(undefined);
          break;
        } else if (y > visY) {
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
   * Reset scroll when changing page
   */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ContentSync])
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
    const { y: initialVisY } = ref.current.getBoundingClientRect();
    const visY = initialVisY + window.scrollY;
    const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
    const scrollTo = visY - DISPLACE_Y * .9;
    window.scrollTo({
      top: scrollTo,
      behavior: 'smooth'
    });
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
        <title>{buildPageTitle(title, lang)}</title>
      </Helmet>
      <div className="ScrollyPage">
        <section ref={sectionRef} className={cx({ 'is-focused': !focusOnViz })}>
          <ContentSync />
        </section>
        <aside className={cx({ 'is-focused': focusOnViz })}>
          <VisualizationController activeVisualization={activeVisualization} />
          {
            activeVisualization ?
              <div className="fullscreen-viz-toggle-container">
                <button
                  data-for="contents-tooltip"
                  data-tip="plus d'informations sur cette visualisation"
                  onClick={() => setVisualizationIsFullScreen(true)}
                >
                  <span>+</span>
                </button>
              </div>
              : null
          }
        </aside>
        <VisualizationFocus
          visualization={visualizationIsFullScreen && activeVisualization ? visualizationsMap[activeVisualization.visualizationId] : undefined}
          lang={lang}
          onClose={() => {
            setVisualizationIsFullScreen(false);
          }}
        />
        <div className={cx("vis-focus-container", {
          'is-active': focusOnViz,
          'is-visible': activeVisualization
        })}>
          <button data-for="contents-tooltip" data-effect="solid" data-tip={lang === 'fr' ? 'voir la visualisation associée' : 'see associated visualization'} onClick={() => setFocusOnViz(!focusOnViz)}>
            <span>{'˃'}</span>
          </button>
        </div>
        <ReactTooltip id="contents-tooltip" />
      </div>
    </VisualizationControlContext.Provider>
  )
}

export default ScrollyPage;