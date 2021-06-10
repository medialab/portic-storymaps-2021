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
      <ul>
          <li className="navitem-container">
                  <Link to={'/'}>
                    {lang === 'fr' ? 'Accueil': 'Home'}
                  </Link>
          </li>
          {
            routes.map(({titles, routes: inputRoute}, index) => {
              const route = `/${lang}/page/${inputRoute[lang]}`
              return (
                <li key={index} className="navitem-container">
                  <Link to={route}>
                    {titles[lang]}
                  </Link>
                </li>
              )
              })
          }
          <li className="navitem-container">
            <Link to={`/${lang}/atlas`}>
              Atlas
            </Link>
          </li>
          <li className="lang-toggle">
            <button 
              className={lang === 'fr' ? 'is-active': ''}
              onClick={() => onLangChange('fr')}
            >fr</button>
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