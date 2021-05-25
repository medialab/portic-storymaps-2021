import React from 'react';
import {Link} from 'react-router-dom';

/* eslint-disable import/no-webpack-loader-syntax */
import Axe1 from '!babel-loader!@mdx-js/loader!./axe_1.mdx';
import Axe2 from '!babel-loader!@mdx-js/loader!./axe_2.mdx';

const Topic = ({axe}) => {
  const otherAxe = axe === 'axe_1' ? 'axe_2' : 'axe_1';
  // ternaire, équivalent à :
  // let otherAxe;
  // if (axe === 'axe_1') {
  //   otherAxe = 'axe_2'
  // } else {
  //   otherAxe = 'axe_2'
  // }

  // string literals
  // ça : `/topics/${otherAxe}`
  // équivaut à ça : "/topics/" + otherAxe

  return (
    <div>
      <h3>Axe choisi : {axe}</h3> 

      <section>
        {
          axe === 'axe_1' ?
          <Axe1 />
          :
          <Axe2 />
        }
      </section>

      <footer>
        <ul>
          <li>
            <Link to="/">Retour à bon port</Link>
          </li>
          <li>
            <Link to={`/topics/${otherAxe}`}>
              {otherAxe === 'axe_1' ? 'Axe 1' : 'Axe 2'}
            </Link>
          </li>
        </ul>
      </footer>
      
      
    </div>
    );
}

export default Topic;