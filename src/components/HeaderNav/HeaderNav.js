import React from 'react';
import {NavLink as Link} from 'react-router-dom'; 

const HeaderNav = ({
  routes,
  lang,
  onLangChange,
}) => {
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
              const route = `/page/${lang}/${inputRoute[lang]}`
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
            <Link to={'/atlas'}>
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