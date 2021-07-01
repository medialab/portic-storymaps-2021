import {Suspense} from 'react';
import {Helmet} from "react-helmet";

import {buildPageTitle} from '../../helpers/misc';

const PlainPage = ({
  Content,
  contentsURL,
  title,
  lang = 'fr'
}) => {
  return (
    <div className="PlainPage secondary-page">
      <Helmet>
        <title>{buildPageTitle(title, lang)}</title>
      </Helmet>
      <div className="centered-contents">
        <Suspense fallback={<div>Chargement</div>}>
          <Content />
        </Suspense>
      </div>
  </div>
  )
}

export default PlainPage;