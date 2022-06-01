import React from "react";
import "./Toggle.scss";
function Toggle(props) {
  return (
    <div className="switch">
      <span>
        <input
          type="checkbox"
          id="toggleInput"
          checked={props.checked}
          onChange={(e) => props.onChange(e.target.checked)}
        />
        <button
          className="slider"
          type="button"
          onClick={() => props.onChange(!props.checked)}
        ></button>
      </span>
      <label htmlFor="toggleInput">{props.title}</label>
    </div>
  );
}
export default Toggle;
