import cx from 'classnames';

import './Loader.scss';

const Loader = ({ percentsLoaded = 0 }) => {
  return (
    <div className={cx("Loader", {'is-complete': percentsLoaded === 100})}>
      <div className="loader-container">
        <div className="loading-bar" style={{ width: percentsLoaded + '%' }} />
      </div>
    </div>
  )
}

export default Loader;