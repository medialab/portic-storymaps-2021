

function SvgComponent ({pathToSvg}) {
    return <img src= {`${process.env.PUBLIC_URL}${pathToSvg}`} />
} 

export default SvgComponent;