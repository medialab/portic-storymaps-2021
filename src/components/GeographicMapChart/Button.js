import { useEffect, useState } from "react"

const Button = ({
    children,
    onMouseDown,
    ...props
  }) => {
    const [isMouseDown, setState] = useState(false)
  
    useEffect(() => {
      let interval
      if (isMouseDown) {
        console.log("setInterval")
        interval = setInterval(onMouseDown, 100)
      }
      return () => {
        console.log("clearInterval")
        clearInterval(interval)
      }
    }, [isMouseDown, onMouseDown])
  
    return <button
      {...props}
      onMouseDown={() => {
        setState(true)
      }}
      onMouseUp={() => {
        setState(false)
      }}
      style={{ background: isMouseDown ? 'red' : undefined }}
    >
      {children}
    </button>
  }

  export default Button ;