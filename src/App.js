
/* import external libraries */
import React, { useState } from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from "react-router-dom";

import { LanguageContext } from './helpers/contexts';

/* import pages */
import Home from './pages/Home';
// import About from './pages/About';
// import Topics from './pages/Topics';

/* import components */
import HeaderNav from './components/HeaderNav';
import PlainPage from './pages/PlainPage';

/* import other assets */
import './App.css';

import routes from './summary'
import Atlas from "./pages/Atlas";

const LANGUAGES = ['fr', 'en'];

function App() {

  const history = useHistory();
  const location = useLocation();
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
    ThatComponent = PlainPage,
    title,
  }) => (
    <>
      <ThatComponent
        {
        ...{
          Content,
          title
        }
        }
      />
    </>

  );
  return (
    <LanguageContext.Provider value={{ lang: undefined }}>
      <div id="wrapper">
        <header>
          <HeaderNav {...{ onLangChange, routes }} />
        </header>
        <main>
          <Switch>
            {
              LANGUAGES.map(lang => {
                return routes.map(({
                  titles,
                  routes: inputRoute,
                  contents,
                  Component: ThatComponent
                }, index) => {
                  const route = `/${lang}/page/${inputRoute[lang]}`
                  const title = titles[lang];
                  const Content = React.lazy(() => import(`!babel-loader!mdx-loader!./contents/${contents[lang]}`))
                  return (
                    <Route key={index} path={route} exact>
                      {renderRoute({ Content, ThatComponent, title })}
                    </Route>
                  )
                })
              })
            }
            <Route path="/:lang/atlas/:visualizationId?" component={Atlas} />
            <Route path="/:lang" exact component={props => <Home {...props} />} />
            <Redirect to={`/fr/`} />
          </Switch>
        </main>
        <footer></footer>
      </div>
    </LanguageContext.Provider>
  );
}


export default function Wrapper() {
  return (
    <Router>
      <App />
    </Router>
  )
}