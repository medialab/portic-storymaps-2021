import { NavLink as Link } from 'react-router-dom';


function HomeSummary({ lang, summary }) {
  const messages = {
    intro: {
      fr: 'découvrir les 3 chapitres de l’étude de cas',
      en: 'discover the 3 chapters of the case study'
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
      <div className="contents">
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
    </div>
  )
}

export default HomeSummary;