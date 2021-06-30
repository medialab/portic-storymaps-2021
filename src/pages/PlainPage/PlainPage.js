import {Suspense} from 'react';
import {Helmet} from "react-helmet";

const PlainPage = ({
  Content,
  contentsURL,
  title,
}) => {
  return (
    <div className="PlainPage secondary-page">
      <Helmet>
        <title>{title}</title>
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