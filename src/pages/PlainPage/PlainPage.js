import { Suspense } from 'react';
import { Helmet } from "react-helmet";

import { buildPageTitle } from '../../helpers/misc';

import './PlainPage.scss';

const PlainPage = ({
  Content,
  ContentSync,
  title,
  lang = 'fr',
}) => {
  return (
    <div className="PlainPage secondary-page">
      <Helmet>
        <title>{buildPageTitle(title, lang)}</title>
      </Helmet>
      <div className="centered-contents">
        {
          ContentSync ?
            <ContentSync />
            :
            <Suspense fallback={<div>Chargement</div>}>
              <Content />
            </Suspense>
        }
      </div>
    </div>
  )
}

export default PlainPage;