
import React, { useRef, useState, useReducer, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import cx from 'classnames';
import ReactTooltip from 'react-tooltip';

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

import './Home.scss';

const CENTER_FRACTION = 0.5;
// const CENTER_FRACTION = .6;

const metadata = {
  fr: metadataFr,
  en: metadataEn
}

function Home({ match: {
  params: { lang = 'fr' }
} }) {
  const introRef = useRef(null);
  const [focusOnViz, setFocusOnViz] = useState(false);
  const [inVis, setInVis] = useState(false);
  const currentMetadata = metadata[lang] || metadataFr;
  const title = currentMetadata.title;
  const titleHTML = currentMetadata.titleHTML;
  const subtitle = currentMetadata.subtitle
  const [activeVisualization, setActiveVisualization] = useState(undefined);
  const [visualizations, setVisualizations] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  )
  const scrollY = useScrollYPosition();

  const updateCurrentVisualization = () => {
    // const bodyPos = document.body.getBoundingClientRect();
    const DISPLACE_Y = window.innerHeight * CENTER_FRACTION;
    const visualizationEntries = Object.entries(visualizations);
    let found;
    let newActiveVisualization;
    // on parcourt la liste à l'envers pour récupérer
    // la visualisation la plus haute de la page qui est
    // au-dessus du milieu de l'écran
    let firstOneY = Infinity;
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
        if (visY < firstOneY) {
          firstOneY = visY;
        }
        if (index === 0 && y < visY) {
          found = true;
          newActiveVisualization = visualization;
        } /*else if (!visualization.visualizationId && scrollY + window.innerHeight * .8 > visY) {
          found = true;
          newActiveVisualization = undefined;
          break;
        }*/ else if (y > visY) {
          found = true;
          if (visualization.visualizationId) {
            newActiveVisualization = visualization;
          } else {
            newActiveVisualization = undefined;
          }
          break;
        }
      } else {
        // console.error('cant find ref for', visualizationEntries[index])
      }
    }

    if (scrollY > window.innerHeight * .9 && !inVis) {
      setInVis(true);
    } else if (scrollY < window.innerHeight * .9 && inVis) {
      setInVis(false);
    }

    if (!found && scrollY < firstOneY && visualizationEntries.length) {
      newActiveVisualization = visualizationEntries[0][1]
    }
    if (!found && activeVisualization) {
      newActiveVisualization = undefined;
    }
    if (activeVisualization !== !newActiveVisualization) {
      setActiveVisualization(newActiveVisualization)
    } else if ((!activeVisualization && newActiveVisualization) || activeVisualization.id !== newActiveVisualization.id) {
      setActiveVisualization(newActiveVisualization)
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

  useEffect(() => {
    if (!activeVisualization && focusOnViz) {
      setFocusOnViz(false);
    }
  }, [activeVisualization])

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
            
            <section className={cx({'is-focused': !focusOnViz})}>
              {lang === 'fr' ? <ContentsFr /> : <ContentsEn />}
            </section>
            <aside className={cx({'is-focused': focusOnViz, 'is-fixed': inVis})}>
              <VisualizationController activeVisualization={activeVisualization} />
            </aside>
            
          </div>
        </VisualizationControlContext.Provider>
        <HomeSummary lang={lang} summary={summary} />
        <div className={cx("vis-focus-container", {
          'is-active': focusOnViz,
          'is-visible': activeVisualization
          })}>
          <button data-for="contents-tooltip" data-effect="solid" data-tip={lang === 'fr' ? 'voir la visualisation associée' : 'see associated visualization'} onClick={() => setFocusOnViz(!focusOnViz)}>
            <span>{'˃'}</span>
          </button>
        </div>
      </main>
      <ReactTooltip id="contents-tooltip" />
    </div>
  )
}

export default Home;