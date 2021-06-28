
import React, { useRef, useState, useReducer, useEffect } from 'react';
import { Helmet } from 'react-helmet';
/* eslint-disable import/no-webpack-loader-syntax */

import metadataFr from '../../contents/fr/metadata'
import metadataEn from '../../contents/en/metadata'

import ContentsFr from '!babel-loader!mdx-loader!../../contents/fr/introduction.mdx'
import ContentsEn from '!babel-loader!mdx-loader!../../contents/en/introduction.mdx'

import { useScrollYPosition } from 'react-use-scroll-position';

import VisualizationController from '../../components/VisualizationController';
import { VisualizationControlContext } from '../../helpers/contexts';
import summary from '../../summary';

import BoatsContainer from './BoatsContainer';
import HomeSummary from './HomeSummary';

const CENTER_FRACTION = 0.5;
// const CENTER_FRACTION = .6;

const metadata = {
  fr: metadataFr,
  en: metadataEn
}

function Home({ match: {
  params: { lang }
} }) {
  const introRef = useRef(null);
  const title = metadata[lang].title
  const titleHTML = metadata[lang].titleHTML;
  const subtitle = metadata[lang].subtitle
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
      const y = index === 0 ? scrollY + window.innerHeight * .2 : scrollY + DISPLACE_Y;
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
      } else {
        console.error('cant find ref for', visualizationEntries[index])
      }
    }
    
    if (!found && activeVisualization) {
      setActiveVisualization(undefined);
    }
  }

  /**
   * Scroll to top on mount
   */
   useEffect(() => {
    window.scrollTo(0, 0);
  }, [])
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
    console.log('on block click', { id, ref })
  }
  const onClickOnStart = () => {
    if (introRef && introRef.current) {
      const intro = introRef.current;
      const top = intro.offsetTop - (window.innerHeight / 15);
      window.scrollTo({
        top,
        behavior: 'smooth'
      })
    }
    
  }
  return (
    <div className="Home">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="header">
        <div className="titles-container">
          <h1 dangerouslySetInnerHTML={{__html: titleHTML}}/>
          <h2>{subtitle}</h2>
          <button onClick={onClickOnStart} className="go-to-start">
          <span>⌄</span>
          </button>
        </div>
        
        <BoatsContainer />
      </div>
      <main ref={introRef} className="intro-container">
        <VisualizationControlContext.Provider
          value={{
            activeVisualization,
            onBlockClick,
            onRegisterVisualization,
            onUnregisterVisualization,
          }}
        >
          <div className="Contents">
            <section>
              {lang === 'fr' ? <ContentsFr /> : <ContentsEn />}
            </section>
            <aside>
              <VisualizationController activeVisualization={activeVisualization} />
            </aside>
          </div>
        </VisualizationControlContext.Provider>
        <HomeSummary lang={lang} summary={summary} />
      </main>
    </div>
  )
}

export default Home;