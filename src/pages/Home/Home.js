
import React, { useMemo, useState, useReducer, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { NavLink as Link } from 'react-router-dom';
/* eslint-disable import/no-webpack-loader-syntax */

import metadataFr from '../../contents/fr/metadata'
import metadataEn from '../../contents/en/metadata'

import ContentsFr from '!babel-loader!mdx-loader!../../contents/fr/introduction.mdx'
import ContentsEn from '!babel-loader!mdx-loader!../../contents/en/introduction.mdx'

import BoatsIllustration from '../../components/BoatsIllustration';

import { useScrollYPosition } from 'react-use-scroll-position';

import VisualizationController from '../../components/VisualizationController';
import { VisualizationControlContext } from '../../helpers/contexts';
import summary from '../../summary';

const CENTER_FRACTION = .6;

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
      <ul>
        {
          summary
            .filter(item => item.routeGroup === 'primary')
            .map((item, itemIndex) => {
              const title = item.titles[lang];
              const route = `/${lang}/page/${item.routes[lang]}`;
              return (
                <li key={itemIndex}>
                  <Link to={route}>
                    {title}
                  </Link>
                </li>
              )
            })
        }
      </ul>
      <div className="atlas-link-container">
        <Link to={`/${lang}/atlas`}>
          {messages.atlas[lang]}
        </Link>
      </div>
    </div>
  )
}

function Home({ match: {
  params: { lang }
} }) {
  const title = metadata[lang].title
  const subtitle = metadata[lang].title
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
    console.log('on block click', { id, ref })
  }
  return (
    <div className="Home">
      <Helmet>
        <title>{metadata[lang].title}</title>
      </Helmet>
      <header>
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
        <BoatsIllustration />
      </header>
      <main>
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
      </main>
      <div>
        <HomeSummary lang={lang} />
      </div>

    </div>
  )
}

export default Home;