import cx from 'classnames';
const Loader = ({ percentsLoaded = 0 }) => {
  return (
    <div className={cx("loader-container", {'is-complete': percentsLoaded === 100})}>
      <div className="loader">
        <div className="loading-bar" style={{ width: percentsLoaded + '%' }} />
      </div>
    </div>
  )
}

export default Loader;