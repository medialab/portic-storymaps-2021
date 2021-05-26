

function SvgComponent ({path}) {
    return <img alt={path} src={`${process.env.PUBLIC_URL}${path}`} />
} 

export default SvgComponent;