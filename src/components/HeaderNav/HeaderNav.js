import React, { useMemo, useState } from 'react';
import {useLocation} from 'react-router-dom';
import {NavLink as Link} from 'react-router-dom'; 
import { useScrollYPosition } from 'react-use-scroll-position';
import cx from 'classnames';

import metadataFr from '../../contents/fr/metadata'
import metadataEn from '../../contents/en/metadata'

import {scaleLinear} from 'd3-scale';

import colorPalettes from '../../colorPalettes'
import { useDebounce } from '../../helpers/hooks';

const metadata = {
  fr: metadataFr,
  en: metadataEn
}

const {
  ui: {
    colorText,
    // colorAccent,
    colorAccentBackground,
    colorBackgroundBlue,
    colorBackground
  }
} = colorPalettes;

const HeaderNav = ({
  routes,
  onLangChange,
}) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const location = useLocation();
  const pageType = useMemo(() => {
    if (location.pathname.includes('/page/')) {
      return 'page';
    } else if (location.pathname === '/fr/' || location.pathname === '/en/') {
      return 'home';
    }
    else return 'other-page';
  }, [location])
  const paramsLang = location && location.match && location.match.params && location.match.params.lang;
  let lang = 'fr';
  if (paramsLang) {
    lang = paramsLang;
  } else if (location.pathname.includes('/en/')) {
    lang = 'en';
  }
  const liveScrollY = useScrollYPosition();

  const scrollY = useDebounce(liveScrollY, 50)

  const pageColorScale = scaleLinear().range([colorBackgroundBlue, colorBackground]).domain([0, 1])
  const {fontColor, backgroundColor} = useMemo(() => {
    // const wrapper = document.getElementById('wrapper');
    // if (!wrapper) {
    //   return {fontColor: undefined, backgroundColor: undefined}
    // }
    // const scrollHeight = wrapper.offsetHeight;
    const screenHeight = window.innerHeight;
    switch(pageType) {
      case 'page':
        if (scrollY < screenHeight) {
          return {
            fontColor: colorText,
            backgroundColor: pageColorScale((scrollY / (screenHeight / 2))),
          }
        } else {
          return {
            backgroundColor: colorBackground
          }
        }
      case 'home':
        if (scrollY < screenHeight * .8) {
          return {
            fontColor: colorText,
            backgroundColor: colorBackgroundBlue,
          }
        } else {
          return {
            fontColor: 'white',
            backgroundColor: colorAccentBackground
          }
        }
        
      case 'other-page':
      default:
        return {
          fontColor: undefined,
          backgroundColor: undefined
        }

    }
    
  }, [scrollY, pageColorScale, pageType])

  const title = metadata[lang].titleHTML

  return (
    <>
      <nav
        style={{
          background: backgroundColor,
          color: fontColor
        }}
        className="nav nav-large"
      >
        <ul className="primary-nav-container">
          <li className="navitem-container">
            <Link exact to={`/${lang}/`}>
              {
                fontColor === 'white' ?
                <img src={`${process.env.PUBLIC_URL}/rose_des_vents_white.svg`} alt="logo" />
                :
                <img src={`${process.env.PUBLIC_URL}/rose_des_vents.svg`} alt="logo" />
              }
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
      <nav
        style={{
          // background: backgroundColor,
          // color: fontColor
        }}
        className={cx("nav nav-drawer", {'is-open': drawerIsOpen})}
      >
        <div className="drawer-background" onClick={() => setDrawerIsOpen(!drawerIsOpen)} />
        <div className="drawer-body">
        <ul className="primary-nav-container">
          <li onClick={() => setDrawerIsOpen(false)} className="navitem-container">
            <Link exact to={`/${lang}/`}>
              {lang === 'fr' ? 'accueil' : 'home'}
            </Link>
          </li>
          {
              routes
              .filter(({routeGroup = 'primary'}) => routeGroup === 'primary')
              .map(({shortTitles, routes: inputRoute}, index) => {
                const route = `/${lang}/page/${inputRoute[lang]}`
                return (
                  <li onClick={() => setDrawerIsOpen(false)} key={index} className="navitem-container">
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
                  <li onClick={() => setDrawerIsOpen(false)} key={index} className="navitem-container">
                    <Link to={route}>
                      {shortTitles[lang]}
                    </Link>
                  </li>
                )
                })
            }
            <li onClick={() => setDrawerIsOpen(false)} className="navitem-container">
              <Link to={`/${lang}/atlas`}>
                {lang === 'fr' ? 'atlas des visualisations' : 'visualizations atlas'}
              </Link>
            </li>
            <li className="navitem-container lang-toggle">
              <ul className="lang-toggle-container">
                <li>
                  <button 
                    className={lang === 'fr' ? 'is-active': ''}
                    onClick={() => onLangChange('fr')}
                  >fr</button>
                </li>
                <li>
                  <button
                    className={lang === 'en' ? 'is-active': ''}
                    onClick={() => onLangChange('en')}
                  >en</button>
                </li>
              </ul>
              
            </li>
            
        </ul>
        </div>
        <div className="drawer-header">
          <button onClick={() => setDrawerIsOpen(!drawerIsOpen)} className={cx('drawer-button')}>
            {
              fontColor === 'white' || drawerIsOpen ?
              <img style={{background: drawerIsOpen ? undefined: backgroundColor}} src={`${process.env.PUBLIC_URL}/rose_des_vents_white.svg`} alt="logo" />
              :
              <img style={{background: drawerIsOpen ? undefined: backgroundColor}} src={`${process.env.PUBLIC_URL}/rose_des_vents.svg`} alt="logo" />
            }
          </button>
          <Link exact to={`/${lang}/`}>
            <h1 style={{
              color: drawerIsOpen ? undefined : fontColor,
              background: drawerIsOpen ? undefined : backgroundColor,
              }} dangerouslySetInnerHTML={{__html: title}} />
          </Link>
        </div>
      </nav>
    </>
  )
}

export default HeaderNav;