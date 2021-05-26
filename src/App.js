
/* import external libraries */
import React, {useState} from "react";
import {
  HashRouter as Router,
  Switch,
  Route,
  NavLink as Link,
  Redirect,
  useHistory,
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

const LANGUAGES = ['fr', 'en'];


function App() {

  const history = useHistory();
  const [lang, setLang] = useState('fr');
  const onLangChange = (ln) => {
    if (ln !== lang) {
      const otherLang = lang;
      const pathOtherLang = history.location.pathname.split('/').pop();
      const routeItem = routes.find(route => {
        return route.routes[otherLang] === pathOtherLang;
      });
      setLang(ln);
      if (routeItem) {
        history.push(`/page/${ln}/${routeItem.routes[ln]}`);

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
    <LanguageContext.Provider value={{lang}}>
      <div id="wrapper">
        <header>
          <HeaderNav {...{lang, onLangChange, routes}} />
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
                const route = `/page/${lang}/${inputRoute[lang]}`
                const title = titles[lang];
                const Content = React.lazy(() => import(`!babel-loader!mdx-loader!./contents/${contents[lang]}`))
                return (
                  <Route key={index} path={route}>
                    {renderRoute({Content, ThatComponent, title})}
                  </Route>
                )
              } )
            })
          }
          <Route path="/">
            <Home lang={lang} />
          </Route>
          <Redirect to={`/`} />

            {/*
            <Route path="/about">
              <About />
            </Route>
            <Route path="/topics/:axe?">
              <Topics />
            </Route>
            <Route path="/">
              <Home />
            </Route>
            */}
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