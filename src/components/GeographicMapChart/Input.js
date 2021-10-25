import { useState, useEffect } from "react";


/**
 * A plain input for debug mode
 * @param {string} value
 * @param {function} onBlur
 * @param {object} props
 * @returns {React.ReactElement} - React component 
 */
const Input = ({
  value: inputValue,
  onBlur,
  ...props
}) => {
  const [value, setValue] = useState(inputValue)
  useEffect(() => {
    setValue(inputValue)
  }, [inputValue])

  return <input
    value={value}
    onChange={(e) => {
      setValue(e.target.value)
    }}
    onBlur={(e) => {
      onBlur(e.target.value)
    }}
  />
}

export default Input;