import React from 'react';
import {useLocation} from 'react-router-dom';
import {NavLink as Link} from 'react-router-dom'; 

const HeaderNav = ({
  routes,
  onLangChange,
}) => {
  const location = useLocation();
  const paramsLang = location && location.match && location.match.params && location.match.params.lang;
  let lang = 'fr';
  if (paramsLang) {
    lang = paramsLang;
  } else if (location.pathname.includes('/en/')) {
    lang = 'en';
  }
  return (
    <nav>
      <ul className="primary-nav-container">
        <li className="navitem-container">
                  <Link to={'/'}>
                    {lang === 'fr' ? 'accueil': 'home'}
                  </Link>
        </li>
        {
            routes
            .filter(({routeGroup = 'primary'}) => routeGroup === 'primary')
            .map(({shortTitles, routes: inputRoute}, index) => {
              const route = `/${lang}/page/${inputRoute[lang]}`
              return (
                <li key={index} className="navitem-container">
                  <Link to={route}>
                    {shortTitles[lang]}
                  </Link>
                </li>
              )
              })
          }
      </ul>
      <ul className="secondary-nav-container">
        {
            routes
            .filter(({routeGroup = 'primary'}) => routeGroup === 'secondary')
            .map(({shortTitles, routes: inputRoute}, index) => {
              const route = `/${lang}/page/${inputRoute[lang]}`
              return (
                <li key={index} className="navitem-container">
                  <Link to={route}>
                    {shortTitles[lang]}
                  </Link>
                </li>
              )
              })
          }
          <li className="navitem-container">
            <Link to={`/${lang}/atlas`}>
              {lang === 'fr' ? 'atlas des visualisations' : 'visualizations atlas'}
            </Link>
          </li>
          <li className="navitem-container lang-toggle">
            <button 
              className={lang === 'fr' ? 'is-active': ''}
              onClick={() => onLangChange('fr')}
            >fr</button>
          </li>
          <li className="navitem-container lang-toggle">
            <button
              className={lang === 'en' ? 'is-active': ''}
              onClick={() => onLangChange('en')}
            >en</button>
          </li>
      </ul>
    </nav>
  )
}

export default HeaderNav;