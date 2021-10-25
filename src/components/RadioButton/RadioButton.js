import React from "react";

/**
 * Displays a plain radio button
 * @param {string} type
 * @param {string} id
 * @param {string} name
 * @param {string} label
 * @param {boolean} checked
 * @param {function} onChange
 * @returns {React.ReactElement} - React component
 */
const RadioButton = ({ 
  type = 'radio',
  id, 
  name, 
  label, 
  checked, 
  onChange 
}) => {
  return (
    <>
      <input
        type={type}
        id={id}
        value={id}
        name={name}
        aria-label={label}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={id}>{label}</label>
    </>
  );
};

export default RadioButton;
