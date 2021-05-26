import {Suspense} from 'react';
import {Helmet} from "react-helmet";

const PlainPage = ({
  Content,
  contentsURL,
  title,
}) => {
  return (
    <div className="PlainPage">
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Suspense fallback={<div>Chargement</div>}>
        <Content />
      </Suspense>
  </div>
  )
}

export default PlainPage;