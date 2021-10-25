import { useSpring, animated } from 'react-spring'


export const G =({children, className, onClick, ...inputProps})  => {
  const props = useSpring(inputProps);
  return (
    <animated.g className={className} onClick={onClick} {...props}>
      {children}
    </animated.g>
  )
}
export const Text =({children, onClick, className, style, ...inputProps})  => {
  const props = useSpring(inputProps);
  return (
    <animated.text className={className} onClick={onClick} style={style} {...props}>
      {children}
    </animated.text>
  )
}
export const Line = ({style, className, onClick, ...inputProps}) => {
  const props = useSpring(inputProps);
  return (
    <animated.line className={className} onClick={onClick} style={style} {...props} />
  )
}
export const Circle = ({style, className, onClick, ...inputProps}) => {
  const props = useSpring(inputProps);
  return (
    <animated.circle className={className} onClick={onClick} style={style} {...props} />
  )
}
export const Rect = ({style, className, onClick, ...inputProps}) => {
  const props = useSpring(inputProps);
  return (
    <animated.rect className={className} onClick={onClick} style={style} {...props} />
  )
}
export const Path = ({style, className, onClick, ...inputProps}) => {
  const props = useSpring(inputProps);
  return (
    <animated.path className={className} onClick={onClick} style={style} {...props} />
  )
}