import React from 'react';
/* eslint-disable import/no-webpack-loader-syntax */
import Content from '!babel-loader!@mdx-js/loader!./content.mdx';

function About() { // but à terme : passer params quelle fonction, et quels params dans les params du component
  return (
  <div>
    <h2>À propos de ce document de synthèse</h2>
    <Content />
  </div>
  );
}

export default About;