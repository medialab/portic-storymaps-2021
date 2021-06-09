const Loader = ({ percentsLoaded = 0 }) => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="loading-bar" style={{ width: percentsLoaded + '%' }} />
      </div>
    </div>
  )
}

export default Loader;