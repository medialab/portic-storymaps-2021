
import React from 'react';
/* eslint-disable import/no-webpack-loader-syntax */
import Content from '!babel-loader!@mdx-js/loader!./content.mdx';

function Home() {
  console.log(process.env)
  return (
    <div>
      <h2>Retour à bon port</h2>
      { process.env.REACT_APP_MAPBOX_TOKEN }
      <Content />
    </div>
  )
}

// <img src={'../../../public/svg/Ports de la région Poitou, Aunis, Saintonge en 1789.svg'} />
export default Home;