import React from 'react';
import {
  useRouteMatch,
  Link
} from "react-router-dom";

import Topic from '../Topic';

const Presentation = ({match}) => (
  <div>
    <h2>Document de synthèse</h2>
    <ul>
      <li>
        <Link to={`${match.url}/axe_1`}>
          Axe 1 : Le déclin / marginalisation de la région d’Aunis-Poitou-Saintonge au sein de l’ensemble français</Link>
      </li>
      <li>
        <Link to={`${match.url}/axe_2`}>
          Axe 2 : La Rochelle : un port dominant mais pas structurant ?
        </Link>
      </li>
    </ul>
  </div>
)

const Topics = () => {
  const match = useRouteMatch();
  const {params: { axe }} = match;
  // const axe = match.params.axe;
  if (axe) {
    return <Topic axe={axe} />
  } else {
    return <Presentation match={match} />
  }
}

export default Topics;