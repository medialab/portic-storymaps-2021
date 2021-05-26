
import React from 'react';
import {Helmet} from 'react-helmet';
/* eslint-disable import/no-webpack-loader-syntax */
import Content from '!babel-loader!@mdx-js/loader!./content.mdx';

function Home({lang}) {
  return (
    <div>
      <Helmet>
        <title>{lang === 'fr' ? 'Commerce multi-échelle dans la région de La Rochelle' : 'Multi-scale trade in La Rochelle region'}</title>
      </Helmet>
      <Content />
    </div>
  )
}

// <img src={'../../../public/svg/Ports de la région Poitou, Aunis, Saintonge en 1789.svg'} />
export default Home;