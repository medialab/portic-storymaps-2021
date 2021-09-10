import React from "react";

const RadioButton = ({ type, id, name, label, checked, onChange }) => {
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
