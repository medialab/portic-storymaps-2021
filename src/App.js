
/* import external libraries */
import React, { useState, useEffect } from "react";
import {
  // HashRouter as Router,
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
  Link,
} from "react-router-dom";
import {homepage} from '../package.json'

import uniq from 'lodash/uniq';
import { csvParse, tsvParse } from 'd3-dsv';


import axios from 'axios';
import visualizationsList from './visualizationsList';

/* import pages */
import Home from './pages/Home';
import Atlas from "./pages/Atlas";
import StandaloneVisualization from "./pages/StandaloneVisualization";

/* import components */
import HeaderNav from './components/HeaderNav';
import Loader from './components/Loader/Loader';

import PlainPage from './pages/PlainPage';

import { DatasetsContext } from './helpers/contexts';

/* import other assets */
import './App.scss';

import routes from './summary'
import Footer from "./components/Footer";

const LANGUAGES = ['fr', 'en'];

function App() {

  const history = useHistory();
  const location = useLocation();
  const [datasets, setDatasets] = useState({})
  const [loadingFraction, setLoadingFraction] = useState(0);

  /**
   * loading all datasets
   */
  useEffect(() => {
    // loading all datasets from the atlas
    // @todo do this on a page-to-page basis if datasets happens to be to big/numerous
    const datasetsNames = uniq(visualizationsList.filter(d => d.datasets).reduce((res, d) => [...res, ...d.datasets.split(',').map(d => d.trim())], []));
    datasetsNames.reduce((cur, datasetName, datasetIndex) => {
      return cur.then((res) => new Promise((resolve, reject) => {
        const url = datasetName ? `${process.env.PUBLIC_URL}/data/${datasetName}` : undefined;
        if (url) {
          axios.get(url, {
            onDownloadProgress: progressEvent => {
              const status = progressEvent.loaded / progressEvent.total;
              const globalFraction = datasetIndex / datasetsNames.length;
              setLoadingFraction(globalFraction + status / routes.length);
            }
          })
            .then(({ data: inputData }) => {
              setTimeout(() => {
                let loadedData = inputData;
                if (url.split('.').pop() === 'csv') {
                  loadedData = csvParse(inputData);
                } else if (url.split('.').pop() === 'tsv') {
                  loadedData = tsvParse(inputData);
                }
                resolve({ ...res, [datasetName]: loadedData })
              })
            })
            // make get errors non-blocking
            .catch(err => {
              console.error(err);
              return resolve(res);
            })
        } else return resolve(res);

      }))
    }, Promise.resolve({}))
      .then(newDatasets => {
        setLoadingFraction(1);
        setDatasets(newDatasets)
      })
      .catch(console.log)
  }, [])

  const onLangChange = (ln) => {
    const otherLang = ln === 'fr' ? 'en' : 'fr';

    const { pathname } = location;
    if (pathname.includes('atlas')) {
      const visualizationId = pathname.split('/atlas/').pop();
      history.push(`/${ln}/atlas/${visualizationId || ''}`);
    } else {
      const pathOtherLang = history.location.pathname.split('/').pop();
      const routeItem = routes.find(route => {
        return route.routes[otherLang] === pathOtherLang;
      });
      if (routeItem) {
        history.push(`/${ln}/page/${routeItem.routes[ln]}`);
      } else {
        history.push(`/${ln}/`);
      }
    }
  }
  const renderRoute = ({
    Content,
    ContentSync,
    ThatComponent = PlainPage,
    title,
  }) => (
    <>
      <ThatComponent
        {
        ...{
          Content,
          ContentSync,
          title
        }
        }
      />
    </>

  );
  return (
    <DatasetsContext.Provider value={datasets}>
      <div id="wrapper">
        <header>
          <HeaderNav {...{ onLangChange, routes }} />
        </header>
        <main>
          <Switch>
            {
              LANGUAGES.map(lang => {
                return routes
                .map(({
                  titles,
                  routes: inputRoute,
                  contents,
                  Component: ThatComponent,
                  contentsProcessed
                }, index) => {
                  const route = `/${lang}/page/${inputRoute[lang]}`
                  const title = titles[lang];
                  const Content = React.lazy(() => import(`!babel-loader!mdx-loader!./contents/${contents[lang]}`));
                  const ContentSync = contentsProcessed[lang];
                  return (
                    <Route key={index} path={route} exact>
                      {renderRoute({ Content, ThatComponent, title, ContentSync })}
                    </Route>
                  )
                })
              })
            }
            {
              LANGUAGES.map(lang => {
                return visualizationsList
                .map(({
                  id
                }, index) => {
                  const route = `/${lang}/visualization/${id}`;
                  return (
                    <Route key={index} path={route} exact component={() => <StandaloneVisualization {...{id, lang}} />} />
                  )
                })
              })
            }
            <Route path="/:lang/atlas/:visualizationId?" component={Atlas} />
            <Route path="/:lang" exact component={Home} />
            <Redirect to={`/fr/`} />
          </Switch>
          {
            datasets ?
              null :
              <Loader percentsLoaded={loadingFraction * 100} />
          }
        </main>
        <Footer
          lang={'fr'}
        />


      </div>
      <React.Fragment>
        {
          LANGUAGES.map(lang => {
            return routes
            // @todo this is dirty and should be removed at some point
            .filter(({routes}) => routes[lang] && !routes[lang].includes('test'))
            .map(({
              titles,
              routes: inputRoute,
              contents,
              Component: ThatComponent,
              contentsProcessed
            }, index) => {
              const route = `/${lang}/page/${inputRoute[lang]}`;
              return (
                <Link to={route} exact />
              )
            })
          })
        }
      </React.Fragment>
    </DatasetsContext.Provider>
  );
}

const BASE_NAME =
  process.env.NODE_ENV === 'development'
  // navigator.userAgent === "ReactSnap"
    ? undefined
    : `/${homepage.split('/').pop()}`;


export default function Wrapper() {
  return (
    <Router basename={BASE_NAME}>
      <App />
    </Router>
  )
}