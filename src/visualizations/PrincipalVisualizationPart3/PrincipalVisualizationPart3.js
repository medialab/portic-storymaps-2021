
import cx from 'classnames';

import SigmaComponent from '../../components/SigmaComponent';

import './PrincipalVisualizationPart3.scss';

const PrincipalVisualizationPart3 = ({step}) => {
  return (
    <div className="PrincipalVisualizationPart3">
      <div className={cx('step', {'is-visible': step === 1})}>
        <img src={`${process.env.PUBLIC_URL}/maquettes/VIZ_3.1.svg`} />
      </div>
      <div className={cx('step', {'is-visible': step === 2})}>
        <SigmaComponent 
          data="toflit_aggregate_1789_only_out.gexf" 
          nodeColor={`admiralty`}
          nodeSize={`inside_degree`}
          labelDensity={0.5}
        />
        <img src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-0.png`} />
        <img src={`${process.env.PUBLIC_URL}/maquettes/comparaison_centralite-1.png`} />

      </div>
      <div className={cx('step', {'is-visible': step === 3})}>
      <div>Proto-légende</div>
       <ul>
         <li>cercles : part des produits exportés originaires de la région vs non-originaires (toflit18)</li>
         <li>triangle : part des voyages vers la région vs hors de la région (navigo)</li>
         <li>gros objets : bureaux de ferme + somme des ports</li>
         <li>petits objets : ports individuels, en 3 classes</li>
       </ul>
        <img src={`${process.env.PUBLIC_URL}/maquettes/VIZ_3.3.svg`} />
      </div>
    </div>
  )
}

export default PrincipalVisualizationPart3;