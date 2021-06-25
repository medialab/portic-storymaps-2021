
import React, { useRef, useState, useReducer, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { NavLink as Link } from 'react-router-dom';
/* eslint-disable import/no-webpack-loader-syntax */
import Measure from 'react-measure'

import metadataFr from '../../contents/fr/metadata'
import metadataEn from '../../contents/en/metadata'

import ContentsFr from '!babel-loader!mdx-loader!../../contents/fr/introduction.mdx'
import ContentsEn from '!babel-loader!mdx-loader!../../contents/en/introduction.mdx'

import BoatsIllustration from '../../components/BoatsIllustration';

import { useScrollYPosition } from 'react-use-scroll-position';

import VisualizationController from '../../components/VisualizationController';
import { VisualizationControlContext } from '../../helpers/contexts';
import summary from '../../summary';

const CENTER_FRACTION = 0.3;
// const CENTER_FRACTION = .6;

const metadata = {
  fr: metadataFr,
  en: metadataEn
}

function HomeSummary({ lang }) {
  const messages = {
    intro: {
      fr: 'découvrir les 3 temps de l’étude de cas',
      en: 'discover the 3 steps of the case study'
    },
    atlas: {
      fr: 'Accéder à l\'atlas de toutes les visualisations',
      en: 'Access all visualizations\' atlas'
    },
    chapter: {
      fr: 'Chapitre',
      en: 'Chapter'
    }
  }
  return (
    <div className="HomeSummary">
      <div className="intro">
        {messages.intro[lang]}
      </div>
      <ul className="chapters-links-container">
        {
          summary
            .filter(item => item.routeGroup === 'primary')
            .map((item, itemIndex) => {
              const title = item.titles[lang];
              const route = `/${lang}/page/${item.routes[lang]}`;
              return (
                <li key={itemIndex}>
                  <Link to={route}>
                    <h4 className="pretitle">{messages.chapter[lang]} {itemIndex + 1}</h4>
                    <h3 className="title">{title}</h3>
                  </Link>
                </li>
              )
            })
        }
      </ul>
      <div className="atlas-link-container">
        <Link to={`/${lang}/atlas`}>
          <h3 className="title">{messages.atlas[lang]}</h3>
        </Link>
      </div>
    </div>
  )
}

const BoatsContainer = () => {
  const [dimensions, setDimensions] = useState({});

  return (
    <Measure 
      bounds
      onResize={contentRect => {
        setDimensions(contentRect.bounds)
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} className="boats-container">
          <BoatsIllustration {...{...dimensions}} />
        </div>
      )}
    </Measure>
  )
}

function Home({ match: {
  params: { lang }
} }) {
  const introRef = useRef(null);
  const title = metadata[lang].title
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
    
    if (!found && activeVisualization) {
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
    console.log('on block click', { id, ref })
  }
  const onClickOnStart = () => {
    if (introRef && introRef.current) {
      const intro = introRef.current;
      const top = intro.offsetTop - (window.innerHeight / 10);
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
          <h1>{title}</h1>
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
        <HomeSummary lang={lang} />
      </main>
    </div>
  )
}

export default Home;